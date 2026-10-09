package com.tryitcafe.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tryitcafe.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Centralized Production Media Service for TryIt Cafe & Kitchen.
 * Handles authenticated server-side Cloudinary uploads, replacements, deletions,
 * file validation, and controlled local development fallback.
 */
@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);
    private final Cloudinary cloudinary;
    private final boolean allowLocalFallback;

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    private static final Set<String> ALLOWED_FOLDERS = Set.of(
            "menu", "categories", "gallery", "general", "dishes", "offers", "hero", "profile"
    );

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif", "image/bmp"
    );

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "webp", "gif", "avif", "heic", "heif", "bmp"
    );

    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm", "video/quicktime", "video/x-m4v", "video/x-matroska"
    );

    private static final Set<String> ALLOWED_VIDEO_EXTENSIONS = Set.of(
            "mp4", "webm", "mov", "m4v", "mkv"
    );

    private static final java.util.regex.Pattern LOCAL_PUBLIC_ID_PATTERN =
            java.util.regex.Pattern.compile("^([a-zA-Z0-9_-]+)/([a-zA-Z0-9._-]+)$");

    @Autowired
    public CloudinaryService(
            Cloudinary cloudinary,
            @Value("${app.media.allow-local-fallback:false}") boolean allowLocalFallback
    ) {
        this.cloudinary = cloudinary;
        this.allowLocalFallback = allowLocalFallback;
    }

    public CloudinaryService(Cloudinary cloudinary) {
        this(cloudinary, true);
    }

    public void validateMediaFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid media file to upload.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BadRequestException("Uploaded file must have a valid filename.");
        }

        // Check for path traversal or dangerous characters in filename
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")
                || originalFilename.contains("\0") || originalFilename.contains("%")) {
            throw new BadRequestException("Filename contains invalid or dangerous characters.");
        }

        // Extract and validate extension
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == originalFilename.length() - 1) {
            throw new BadRequestException("Uploaded file must have a valid extension.");
        }
        String extension = originalFilename.substring(lastDotIndex + 1).toLowerCase();

        boolean isImageExt = ALLOWED_IMAGE_EXTENSIONS.contains(extension);
        boolean isVideoExt = ALLOWED_VIDEO_EXTENSIONS.contains(extension);

        if (!isImageExt && !isVideoExt) {
            throw new BadRequestException("Unsupported file extension: ." + extension + ". Allowed formats: JPG, PNG, WEBP, GIF, AVIF, HEIC, MP4, WEBM, MOV.");
        }

        // Inspect header bytes (first 32 bytes)
        byte[] header = new byte[32];
        int readBytes;
        try (java.io.InputStream is = file.getInputStream()) {
            readBytes = is.read(header);
        } catch (Exception e) {
            log.warn("Failed to read media header bytes: {}", e.getMessage());
            throw new BadRequestException("Unable to read uploaded file.");
        }

        if (readBytes < 4) {
            throw new BadRequestException("File is corrupted or too small to be a valid media file.");
        }

        // Validate authenticity: determine whether it matches authentic image or video signatures
        boolean isAuthenticImage = isImageSignature(header);
        boolean isAuthenticVideo = isVideoSignature(header);

        // Fallback check for images readable by Java ImageIO if raw header was ambiguous
        if (!isAuthenticImage && !isAuthenticVideo && isImageExt) {
            try (java.io.InputStream testIs = file.getInputStream()) {
                if (javax.imageio.ImageIO.read(testIs) != null) {
                    isAuthenticImage = true;
                }
            } catch (Exception ignored) {
            }
        }

        if (!isAuthenticImage && !isAuthenticVideo) {
            log.warn("Security Alert: Media file failed authenticity verification for {}", originalFilename);
            throw new BadRequestException("Uploaded file does not match a valid image (JPG, PNG, WebP, GIF, AVIF, HEIC) or video (MP4, WebM, MOV) signature.");
        }

        // Validate File Size (10MB for images, 50MB for videos)
        if (isAuthenticImage || isImageExt) {
            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new BadRequestException("Image file size exceeds maximum limit of 10MB.");
            }
        } else {
            if (file.getSize() > MAX_VIDEO_SIZE) {
                throw new BadRequestException("Video file size exceeds maximum limit of 50MB.");
            }
        }
    }

    private boolean isImageSignature(byte[] header) {
        if (header == null || header.length < 2) return false;

        // JPEG: FF D8 (SOI marker)
        if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8) {
            return true;
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (header.length >= 8 &&
                (header[0] & 0xFF) == 0x89 && header[1] == 'P' && header[2] == 'N' && header[3] == 'G' &&
                header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A) {
            return true;
        }

        // GIF: GIF87a or GIF89a
        if (header.length >= 6 && header[0] == 'G' && header[1] == 'I' && header[2] == 'F' && header[3] == '8'
                && (header[4] == '7' || header[4] == '9') && header[5] == 'a') {
            return true;
        }

        // WebP: RIFF....WEBP
        if (header.length >= 12 &&
                header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F' &&
                header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') {
            return true;
        }

        // BMP: BM
        if (header[0] == 'B' && header[1] == 'M') {
            return true;
        }

        // AVIF / HEIC container check: contains 'ftyp' with avif, avis, heic, heix, mif1, msf1
        String headerStr = new String(header, java.nio.charset.StandardCharsets.ISO_8859_1);
        if (headerStr.contains("ftyp")) {
            int ftypIdx = headerStr.indexOf("ftyp");
            if (ftypIdx + 8 <= headerStr.length()) {
                String brand = headerStr.substring(ftypIdx + 4, ftypIdx + 8).toLowerCase();
                if (brand.contains("avif") || brand.contains("avis") || brand.contains("heic")
                        || brand.contains("heix") || brand.contains("mif1") || brand.contains("msf1")) {
                    return true;
                }
            }
        }

        return false;
    }

    private boolean isVideoSignature(byte[] header) {
        if (header == null || header.length < 4) return false;

        // WebM / MKV: 1A 45 DF A3 (EBML ID)
        if ((header[0] & 0xFF) == 0x1A && (header[1] & 0xFF) == 0x45 && (header[2] & 0xFF) == 0xDF && (header[3] & 0xFF) == 0xA3) {
            return true;
        }

        // ISO Base Media File Format: MP4 / MOV / M4V (contains 'ftyp', 'moov', 'mdat')
        String headerStr = new String(header, java.nio.charset.StandardCharsets.ISO_8859_1);
        if (headerStr.contains("ftyp")) {
            int ftypIdx = headerStr.indexOf("ftyp");
            if (ftypIdx + 8 <= headerStr.length()) {
                String brand = headerStr.substring(ftypIdx + 4, ftypIdx + 8).toLowerCase();
                // If it's specifically an AVIF or HEIC image brand, let isImageSignature handle it
                if (brand.contains("avif") || brand.contains("avis") || brand.contains("heic")
                        || brand.contains("heix") || brand.contains("mif1") || brand.contains("msf1")) {
                    return false;
                }
            }
            return true;
        }

        return headerStr.contains("moov") || headerStr.contains("mdat");
    }

    public Map<String, Object> uploadFile(MultipartFile file, String folder) throws IOException {
        String cleanFolder = folder != null ? folder.trim().toLowerCase() : "general";
        if (!ALLOWED_FOLDERS.contains(cleanFolder)) {
            log.warn("Security Alert: Attempted upload to disallowed folder: {}", folder);
            throw new BadRequestException("Invalid upload folder destination: " + folder);
        }

        validateMediaFile(file);

        if (isMockCredentials()) {
            if (!allowLocalFallback) {
                log.error("Cloudinary credentials not configured and local fallback is disabled in this environment.");
                throw new BadRequestException("Cloudinary media storage is not configured. Please contact administrator.");
            }
            log.info("Mock Cloudinary credentials detected, saving to local development storage.");
            return saveLocalFile(file, cleanFolder);
        }

        try {
            Map result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "tryit_cafe/" + cleanFolder,
                            "resource_type", "auto",
                            "quality", "auto",
                            "fetch_format", "auto"
                    )
            );
            log.info("Successfully uploaded media to Cloudinary in folder tryit_cafe/{}", cleanFolder);
            return result;
        } catch (Exception e) {
            log.warn("Cloudinary upload failed: {}", e.getMessage());
            if (allowLocalFallback) {
                log.warn("Falling back to local development persistent storage: {}", e.getMessage());
                return saveLocalFile(file, cleanFolder);
            } else {
                throw new BadRequestException("Cloudinary upload failed: " + sanitizeCloudinaryError(e.getMessage()));
            }
        }
    }

    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        return uploadFile(file, folder);
    }

    public Map<String, Object> uploadVideo(MultipartFile file, String folder) throws IOException {
        return uploadFile(file, folder);
    }

    public Map<String, Object> replaceMedia(String oldPublicId, MultipartFile newFile, String folder) throws IOException {
        // 1. Upload new file first
        Map<String, Object> uploadResult = uploadFile(newFile, folder);

        // 2. Only delete old asset if new upload succeeded and old asset exists
        if (oldPublicId != null && !oldPublicId.isBlank()) {
            try {
                deleteFile(oldPublicId);
            } catch (Exception e) {
                log.warn("Non-fatal: Failed to delete previous media asset {}: {}", oldPublicId, e.getMessage());
            }
        }

        return uploadResult;
    }

    private Map<String, Object> saveLocalFile(MultipartFile file, String folder) throws IOException {
        if (!ALLOWED_FOLDERS.contains(folder)) {
            throw new BadRequestException("Invalid media folder: " + folder);
        }

        Path baseUploads = Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize();
        Path uploadDir = baseUploads.resolve(folder).normalize();

        if (!uploadDir.startsWith(baseUploads)) {
            log.warn("Security Alert: Path traversal detected while resolving local upload folder: {}", folder);
            throw new BadRequestException("Invalid upload path");
        }

        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg";
        String cleanName = originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
        String savedFilename = UUID.randomUUID() + "_" + cleanName;

        Path targetPath = uploadDir.resolve(savedFilename).normalize();
        if (!targetPath.startsWith(uploadDir)) {
            log.warn("Security Alert: Target file path escaped directory: {}", targetPath);
            throw new BadRequestException("Invalid filename or target path");
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl;
        try {
            fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/v1/public/media/")
                    .path(folder)
                    .path("/")
                    .path(savedFilename)
                    .toUriString();
        } catch (Exception e) {
            fileUrl = "http://localhost:8088/api/v1/public/media/" + folder + "/" + savedFilename;
        }

        String publicId = "local:" + folder + "/" + savedFilename;
        Map<String, Object> result = new HashMap<>();
        result.put("public_id", publicId);
        result.put("secure_url", fileUrl);
        result.put("url", fileUrl);
        result.put("format", file.getContentType());
        log.info("Saved local media file to {} with public URL {}", targetPath, fileUrl);
        return result;
    }

    public boolean deleteFile(String publicId) {
        if (publicId == null || publicId.isBlank()) return true;

        if (publicId.startsWith("local:")) {
            String rawPath = publicId.substring(6).trim();
            java.util.regex.Matcher matcher = LOCAL_PUBLIC_ID_PATTERN.matcher(rawPath);
            if (!matcher.matches()) {
                log.warn("Security Alert: Rejected deletion for invalid local publicId format: {}", publicId);
                return false;
            }

            String targetFolder = matcher.group(1).toLowerCase();
            String targetFilename = matcher.group(2);

            if (!ALLOWED_FOLDERS.contains(targetFolder)) {
                log.warn("Security Alert: Rejected deletion for unauthorized folder in publicId: {}", targetFolder);
                return false;
            }

            if (targetFilename.contains("..") || targetFilename.contains("/") || targetFilename.contains("\\")) {
                log.warn("Security Alert: Traversal sequence in publicId filename: {}", targetFilename);
                return false;
            }

            try {
                List<Path> candidateRoots = List.of(
                        Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize(),
                        Paths.get(System.getProperty("user.dir"), "backend", "uploads").toAbsolutePath().normalize()
                );

                boolean foundAndDeleted = false;
                for (Path root : candidateRoots) {
                    Path filePath = root.resolve(targetFolder).resolve(targetFilename).normalize();
                    if (!filePath.startsWith(root)) {
                        log.warn("Security Alert: Path traversal in deleteFile: {}", filePath);
                        return false;
                    }
                    if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
                        Files.delete(filePath);
                        log.info("Successfully deleted local media file: {}", targetFilename);
                        foundAndDeleted = true;
                        break;
                    }
                }
                return foundAndDeleted;
            } catch (Exception e) {
                log.warn("Failed to delete local file: {}", e.getMessage());
                return false;
            }
        }
        try {
            if (isMockCredentials()) {
                log.info("Simulated Cloudinary deletion for publicId: {}", publicId);
                return true;
            }

            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
        } catch (Exception e) {
            log.warn("Cloudinary asset deletion returned: {}", e.getMessage());
            return true;
        }
    }

    public boolean isMockCredentials() {
        String cloudName = cloudinary.config.cloudName;
        String apiKey = cloudinary.config.apiKey;
        String apiSecret = cloudinary.config.apiSecret;

        return cloudName == null || cloudName.isBlank()
                || "demo".equalsIgnoreCase(cloudName) || "demo_cloud".equalsIgnoreCase(cloudName)
                || cloudName.toLowerCase().contains("test")
                || apiKey == null || apiKey.isBlank() || "demo_key".equalsIgnoreCase(apiKey)
                || "123456789012345".equals(apiKey)
                || "your_cloudinary_api_key".equalsIgnoreCase(apiKey) || apiKey.length() < 10
                || apiSecret == null || apiSecret.isBlank() || "your_cloudinary_api_secret".equalsIgnoreCase(apiSecret)
                || apiSecret.toLowerCase().contains("demo") || apiSecret.toLowerCase().contains("test")
                || "abcdefghijklmnopqrstuvwxyz1".equals(apiSecret);
    }

    public boolean testConnection() {
        try {
            String apiKey = cloudinary.config.apiKey;
            String apiSecret = cloudinary.config.apiSecret;
            if (apiKey == null || apiKey.isBlank() || apiSecret == null || apiSecret.isBlank()) {
                log.warn("Cloudinary connectivity check: Credentials not configured.");
                return false;
            }
            Map result = cloudinary.api().ping(ObjectUtils.emptyMap());
            log.info("Cloudinary connectivity verified successfully: {}", result.get("status"));
            return true;
        } catch (Exception e) {
            log.warn("Cloudinary connectivity check failed: {}", sanitizeCloudinaryError(e.getMessage()));
            return false;
        }
    }

    public String sanitizeCloudinaryError(String rawMessage) {
        if (rawMessage == null) return "Storage communication error.";
        String sanitized = rawMessage.replaceAll("(?i)(api_secret|api_key|secret|password)=[^&\\s]+", "$1=***");
        if (sanitized.contains("Invalid cloud_name")) {
            return "Invalid Cloudinary cloud_name. Please check your CLOUDINARY_CLOUD_NAME setting.";
        }
        if (sanitized.contains("Invalid Signature") || sanitized.contains("Must supply api_key")) {
            return "Invalid Cloudinary credentials. Please check your API Key and Secret.";
        }
        return sanitized;
    }

    public static String getOptimizedMenuCardUrl(String originalUrl) {
        if (originalUrl == null || !originalUrl.contains("cloudinary.com")) return originalUrl;
        return originalUrl.replace("/upload/", "/upload/f_auto,q_auto,w_600,c_fill/");
    }

    public static String getOptimizedHeroUrl(String originalUrl) {
        if (originalUrl == null || !originalUrl.contains("cloudinary.com")) return originalUrl;
        return originalUrl.replace("/upload/", "/upload/f_auto,q_auto,w_1920,c_fill/");
    }
}
