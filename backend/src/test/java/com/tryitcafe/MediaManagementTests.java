package com.tryitcafe;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.service.CloudinaryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
public class MediaManagementTests {

    @Autowired
    private CloudinaryService cloudinaryService;

    private static final byte[] VALID_JPEG_HEADER = new byte[]{
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00
    };

    private static final byte[] VALID_PNG_HEADER = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D
    };

    private static final byte[] VALID_WEBP_HEADER = new byte[]{
            0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50
    };

    private static final byte[] VALID_MP4_HEADER = new byte[]{
            0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D
    };

    @Test
    @DisplayName("Should successfully process valid image file upload")
    void testValidImageUpload() throws Exception {
        MockMultipartFile imageFile = new MockMultipartFile(
                "file",
                "food.jpg",
                "image/jpeg",
                VALID_JPEG_HEADER
        );

        Map result = cloudinaryService.uploadFile(imageFile, "dishes");
        assertNotNull(result);
        assertNotNull(result.get("public_id"));
        assertNotNull(result.get("secure_url"));
    }

    @Test
    @DisplayName("Should successfully process valid PNG and WebP upload")
    void testValidPngAndWebpUpload() throws Exception {
        MockMultipartFile pngFile = new MockMultipartFile(
                "file",
                "icon.png",
                "image/png",
                VALID_PNG_HEADER
        );
        Map pngResult = cloudinaryService.uploadFile(pngFile, "gallery");
        assertNotNull(pngResult);

        MockMultipartFile webpFile = new MockMultipartFile(
                "file",
                "hero.webp",
                "image/webp",
                VALID_WEBP_HEADER
        );
        Map webpResult = cloudinaryService.uploadFile(webpFile, "gallery");
        assertNotNull(webpResult);
    }

    @Test
    @DisplayName("Should successfully process valid video file upload")
    void testValidVideoUpload() throws Exception {
        MockMultipartFile videoFile = new MockMultipartFile(
                "file",
                "ambience.mp4",
                "video/mp4",
                VALID_MP4_HEADER
        );

        Map result = cloudinaryService.uploadFile(videoFile, "gallery");
        assertNotNull(result);
        assertNotNull(result.get("public_id"));
    }

    @Test
    @DisplayName("Should reject unsupported file formats (e.g. PDF or Executables)")
    void testRejectInvalidFileType() {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "pdf-data".getBytes()
        );

        assertThrows(BadRequestException.class, () -> cloudinaryService.uploadFile(pdfFile, "dishes"));
    }

    @Test
    @DisplayName("Should reject executable disguised as image")
    void testRejectDisguisedExecutable() {
        MockMultipartFile fakeJpg = new MockMultipartFile(
                "file",
                "malicious.jpg",
                "image/jpeg",
                "MZ\0\0\0executable_binary_content".getBytes()
        );

        assertThrows(BadRequestException.class, () -> cloudinaryService.uploadFile(fakeJpg, "dishes"));
    }

    @Test
    @DisplayName("Should reject upload with invalid or traversed folder")
    void testRejectInvalidUploadFolder() {
        MockMultipartFile imageFile = new MockMultipartFile(
                "file",
                "food.jpg",
                "image/jpeg",
                VALID_JPEG_HEADER
        );

        assertThrows(BadRequestException.class, () -> cloudinaryService.uploadFile(imageFile, "../sensitive"));
        assertThrows(BadRequestException.class, () -> cloudinaryService.uploadFile(imageFile, "unauthorized_folder"));
    }

    @Test
    @DisplayName("Should reject deletion attempts with path traversal sequences")
    void testRejectTraversalFileDeletion() {
        assertFalse(cloudinaryService.deleteFile("local:../../application.yml"));
        assertFalse(cloudinaryService.deleteFile("local:..\\..\\windows_secret.txt"));
        assertFalse(cloudinaryService.deleteFile("local:gallery/../../root_file.txt"));
        assertFalse(cloudinaryService.deleteFile("local:invalid_folder/file.jpg"));
    }

    @Test
    @DisplayName("Should delete media asset safely by publicId")
    void testDeleteMedia() {
        boolean deleted = cloudinaryService.deleteFile("tryit_cafe/dishes/sample_public_id");
        assertTrue(deleted);
    }
}
