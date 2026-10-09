import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  Video,
  Image as ImageIcon,
  MoreVertical,
  Edit2,
  RefreshCw,
  X,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';
import { GalleryItem, MediaType } from '../../types';
import { ownerApi } from '../../api/ownerApi';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToastStore } from '../../store/useToastStore';
import { useMenuStore } from '../../store/useMenuStore';
import { normalizeImageUrl, getOptimizedImageUrl } from '../../utils/imageUrl';

interface SelectedFileMeta {
  name: string;
  size: string;
  type: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const OwnerGalleryPage: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { success, error: toastError } = useToastStore();
  const { fetchAllPublicData } = useMenuStore();

  // Dialog & Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [actionMenuItem, setActionMenuItem] = useState<GalleryItem | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Direct Replace State (from card or action menu)
  const [directReplaceTarget, setDirectReplaceTarget] = useState<GalleryItem | null>(null);
  const directReplaceInputRef = useRef<HTMLInputElement>(null);

  // Form State (Upload-Only Flow, No URLs)
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [categoryTag, setCategoryTag] = useState('AMBIENCE');
  const [mediaType, setMediaType] = useState<MediaType>('IMAGE');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaPublicId, setMediaPublicId] = useState('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<SelectedFileMeta | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const data = await ownerApi.getGalleryItems();
      setGallery(data);
    } catch (e) {
      console.error(e);
      toastError('Failed to load gallery items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCaption('');
    setCategoryTag('AMBIENCE');
    setMediaType('IMAGE');
    setMediaUrl('');
    setMediaPublicId('');
    setLocalPreviewUrl(null);
    setFileMeta(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setCaption(item.caption || '');
    setCategoryTag(item.categoryTag || 'AMBIENCE');
    setMediaType(item.mediaType || 'IMAGE');
    setMediaUrl(item.mediaUrl || '');
    setMediaPublicId(item.mediaPublicId || '');
    setLocalPreviewUrl(null);
    setFileMeta(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // File Upload Handler (Dropzone & File Input)
  const handleFileSelection = async (file?: File) => {
    if (!file) return;
    setUploadError(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'mkv'].includes(ext);
    const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic', 'bmp'].includes(ext);

    if (!isImage && !isVideo) {
      setUploadError('Unsupported file type. Please select a JPG, PNG, WebP, GIF image or MP4, WebM, MOV video.');
      return;
    }

    const maxSizeBytes = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(
        isVideo
          ? 'Video file must be smaller than 50 MB.'
          : 'Image file must be smaller than 10 MB.'
      );
      return;
    }

    // Set immediate local preview and metadata
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setFileMeta({
      name: file.name,
      size: formatFileSize(file.size),
      type: isVideo ? 'Video' : 'Image',
    });
    setMediaType(isVideo ? 'VIDEO' : 'IMAGE');

    setIsUploading(true);
    try {
      const uploadRes = await ownerApi.uploadMedia(file, 'gallery');
      // Store permanent storage reference returned by backend
      setMediaUrl(uploadRes.url);
      setMediaPublicId(uploadRes.publicId);
      success(`${isVideo ? 'Video' : 'Image'} uploaded successfully!`);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload media. Please try again.');
      setLocalPreviewUrl(null);
      setFileMeta(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl('');
    setMediaPublicId('');
    setLocalPreviewUrl(null);
    setFileMeta(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Direct Quick Replace Handler (from Card Hover or Mobile Action Menu)
  const triggerDirectReplace = (item: GalleryItem) => {
    setDirectReplaceTarget(item);
    if (directReplaceInputRef.current) {
      directReplaceInputRef.current.value = '';
      directReplaceInputRef.current.click();
    }
  };

  const handleDirectReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !directReplaceTarget) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'mkv'].includes(ext);
    const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic', 'bmp'].includes(ext);

    if (!isImage && !isVideo) {
      toastError('Unsupported file type. Allowed: JPG, PNG, WebP, GIF, MP4, WebM, MOV.');
      return;
    }

    const maxSizeBytes = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toastError(isVideo ? 'Video must be smaller than 50 MB.' : 'Image must be smaller than 10 MB.');
      return;
    }

    try {
      success('Uploading replacement media...');
      const uploadRes = await ownerApi.uploadMedia(file, 'gallery');
      const updatedMediaType: MediaType = isVideo ? 'VIDEO' : 'IMAGE';

      await ownerApi.updateGalleryItem(directReplaceTarget.id, {
        mediaUrl: uploadRes.url,
        mediaPublicId: uploadRes.publicId,
        mediaType: updatedMediaType,
      });

      success('Gallery media replaced successfully!');
      setDirectReplaceTarget(null);
      await loadGallery();
      fetchAllPublicData(true);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to replace media asset.');
    }
  };

  // Form Submit Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim() && !localPreviewUrl) {
      setUploadError('Please choose a media file to upload.');
      return;
    }

    if (isUploading) {
      toastError('Please wait for media upload to finish.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<GalleryItem> = {
        title: title.trim() || undefined,
        caption: caption.trim() || undefined,
        categoryTag: categoryTag.toUpperCase(),
        mediaUrl: mediaUrl.trim(),
        mediaPublicId: mediaPublicId || undefined,
        mediaType,
        active: true,
        displayOrder: editingItem ? editingItem.displayOrder : gallery.length + 1,
      };

      if (editingItem) {
        await ownerApi.updateGalleryItem(editingItem.id, payload);
        success('Gallery item updated successfully!');
      } else {
        await ownerApi.addGalleryItem(payload);
        success('Media asset published to gallery!');
      }

      setIsModalOpen(false);
      await loadGallery();
      fetchAllPublicData(true);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to save gallery item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetItem) return;
    setIsDeleting(true);
    try {
      await ownerApi.deleteGalleryItem(deleteTargetItem.id);
      success('Media asset removed from gallery.');
      setDeleteTargetItem(null);
      await loadGallery();
      fetchAllPublicData(true);
    } catch (e) {
      toastError('Failed to delete media item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden input for direct card replace */}
      <input
        type="file"
        ref={directReplaceInputRef}
        onChange={handleDirectReplaceFileChange}
        accept="image/*,video/*,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.mp4,.webm,.mov"
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1408] font-serif">
            Cafe Gallery & Media
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5C4A] mt-1">
            Showcase your seating, cafe vibe, drinks, kitchen hygiene, and signature dishes.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all self-start sm:self-auto min-h-[44px] cursor-pointer"
        >
          <Plus size={16} />
          <span>Upload Media</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#7A5C4A]">Loading gallery...</div>
      ) : gallery.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FE8E2A]/10 text-[#FE8E2A] flex items-center justify-center">
            <ImageIcon size={26} />
          </div>
          <h3 className="font-serif font-bold text-base text-[#2B1408]">No gallery media yet</h3>
          <p className="text-xs text-[#7A5C4A] max-w-sm mx-auto">
            Upload high-resolution photos and videos of your cafe ambiance, dishes, and staff.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>Add First Item</span>
          </button>
        </div>
      ) : (
        /* Gallery Cards Grid: Responsive 1-col on mobile, 2-col on tablet, 3-col on desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-[#FBEFE1] shadow-xs border border-[#EEDDCC] hover:shadow-md transition-all select-none"
            >
              {/* Media Element (Image or Video) */}
              {item.mediaType === 'VIDEO' ? (
                <video
                  src={normalizeImageUrl(item.mediaUrl)}
                  className="w-full h-full object-cover cursor-pointer"
                  controls={false}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onClick={() => setLightboxItem(item)}
                />
              ) : (
                <img
                  src={getOptimizedImageUrl(item.mediaUrl, 'ownerThumbnail')}
                  alt={item.title || 'Cafe photo'}
                  className="w-full h-full object-cover cursor-pointer"
                  loading="lazy"
                  decoding="async"
                  onClick={() => setLightboxItem(item)}
                />
              )}

              {/* Category Pill Tag (Always visible top-left) */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-[#2B1408]/85 text-[#FFFBF7] text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-xs">
                  {item.categoryTag}
                </span>
                {item.mediaType === 'VIDEO' && (
                  <span className="p-1 rounded-full bg-[#2B1408]/85 text-[#FE8E2A] backdrop-blur-md border border-white/10">
                    <Video size={12} />
                  </span>
                )}
              </div>

              {/* Mobile Only: 3-Dots Action Button (Hidden on Desktop) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActionMenuItem(item);
                }}
                className="sm:hidden absolute top-2.5 right-2.5 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]"
                aria-label={`Gallery actions for ${item.title || 'item'}`}
                title="More Actions"
              >
                <MoreVertical size={18} />
              </button>

              {/* Desktop Hover Overlay (Reveals Controls, Title & Caption smoothly on hover) */}
              <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-[#2B1408]/92 via-[#2B1408]/55 to-[#2B1408]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex-col justify-between text-white backdrop-blur-[2px] pointer-events-none">
                {/* Top Row: Clean Top-Right Action Controls */}
                <div className="flex items-center justify-end pointer-events-auto">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(item);
                      }}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white/35 active:scale-95 text-white transition-all cursor-pointer shadow-xs"
                      aria-label="Edit gallery item"
                      title="Edit Item"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerDirectReplace(item);
                      }}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white/35 active:scale-95 text-white transition-all cursor-pointer shadow-xs"
                      aria-label="Replace media"
                      title="Replace Media"
                    >
                      <RefreshCw size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetItem(item);
                      }}
                      className="p-2.5 rounded-xl bg-red-600/85 hover:bg-red-600 active:scale-95 text-white transition-all cursor-pointer shadow-xs"
                      aria-label="Delete gallery item"
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => setLightboxItem(item)}
                >
                  <h4 className="font-bold text-sm font-serif text-white line-clamp-1">
                    {item.title || 'Untitled Asset'}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-white/80 mt-1 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile Card Bottom Caption Overlay (Legible on mobile without hover) */}
              <div className="sm:hidden absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 pt-6 pointer-events-none">
                <h4 className="font-bold text-xs font-serif text-white line-clamp-1">
                  {item.title || 'Untitled Asset'}
                </h4>
                {item.caption && (
                  <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* MOBILE ACTION MENU (Touch-friendly Bottom Sheet / Modal)     */}
      {/* ============================================================ */}
      <Modal
        isOpen={!!actionMenuItem}
        onClose={() => setActionMenuItem(null)}
        maxWidth="sm"
        title="Gallery Actions"
      >
        {actionMenuItem && (
          <div className="space-y-4">
            {/* Item Thumbnail & Summary */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC]">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#2B1408] shrink-0 border border-[#EEDDCC]">
                {actionMenuItem.mediaType === 'VIDEO' ? (
                  <video
                    src={normalizeImageUrl(actionMenuItem.mediaUrl)}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={normalizeImageUrl(actionMenuItem.mediaUrl)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="px-2 py-0.5 rounded-full bg-[#FE8E2A]/15 text-[#FE8E2A] text-[10px] font-extrabold uppercase">
                  {actionMenuItem.categoryTag}
                </span>
                <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2B1408] truncate mt-1">
                  {actionMenuItem.title || 'Untitled Gallery Asset'}
                </h4>
                {actionMenuItem.caption && (
                  <p className="text-[11px] text-[#7A5C4A] truncate">
                    {actionMenuItem.caption}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons with comfortable touch targets (>=44px) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  const target = actionMenuItem;
                  setActionMenuItem(null);
                  openEditModal(target);
                }}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-white hover:bg-[#FBEFE1] active:bg-[#F6EADB] border border-[#EEDDCC] text-xs font-bold text-[#2B1408] flex items-center justify-between transition-colors cursor-pointer"
                aria-label="Edit gallery item"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FE8E2A]/10 text-[#FE8E2A] flex items-center justify-center shrink-0">
                    <Edit2 size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#2B1408]">Edit Details</div>
                    <div className="text-[11px] text-[#7A5C4A] font-normal">Change title, caption, category tag</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = actionMenuItem;
                  setActionMenuItem(null);
                  triggerDirectReplace(target);
                }}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-white hover:bg-[#FBEFE1] active:bg-[#F6EADB] border border-[#EEDDCC] text-xs font-bold text-[#2B1408] flex items-center justify-between transition-colors cursor-pointer"
                aria-label="Replace gallery media"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                    <RefreshCw size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#2B1408]">Replace Media</div>
                    <div className="text-[11px] text-[#7A5C4A] font-normal">Upload a new photo or video for this slot</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = actionMenuItem;
                  setActionMenuItem(null);
                  setDeleteTargetItem(target);
                }}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 active:bg-red-200/80 border border-red-200 text-xs font-bold text-red-600 flex items-center justify-between transition-colors cursor-pointer"
                aria-label="Delete gallery item"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Trash2 size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-red-700">Delete Asset</div>
                    <div className="text-[11px] text-red-500 font-normal">Permanently remove from cafe gallery</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setActionMenuItem(null)}
                className="w-full min-h-[44px] py-2.5 rounded-xl text-xs font-bold text-[#7A5C4A] hover:text-[#2B1408] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* ADD / EDIT GALLERY ITEM MODAL (Upload-Only Flow, No URLs)     */}
      {/* ============================================================ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">Category</label>
              <select
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A]"
              >
                <option value="AMBIENCE">Ambience</option>
                <option value="FOOD">Food</option>
                <option value="CAFE">Cafe</option>
                <option value="DRINKS">Drinks</option>
                <option value="EVENTS">Events</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">Media Type</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as MediaType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A]"
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Cozy Evening Ambience, Special Latte Art"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">Caption</label>
            <textarea
              rows={2}
              placeholder="Short description of the photo, atmosphere, or ingredients..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A] resize-none"
            />
          </div>

          {/* UPLOAD-ONLY MEDIA SECTION (No raw URL inputs) */}
          <div className="pt-2 border-t border-[#EEDDCC]/70">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#2B1408]">
                Media File *
              </label>
              <span className="text-[11px] text-[#7A5C4A]">
                {mediaType === 'VIDEO' ? 'MP4, WebM or MOV · Max 50MB' : 'JPG, PNG, WebP or GIF · Max 10MB'}
              </span>
            </div>

            {mediaUrl || localPreviewUrl ? (
              /* Preview Mode */
              <div className="space-y-2.5">
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#EEDDCC] bg-[#1E0D05] shadow-xs group">
                  {mediaType === 'VIDEO' ? (
                    <video
                      src={localPreviewUrl || normalizeImageUrl(mediaUrl)}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={localPreviewUrl || normalizeImageUrl(mediaUrl)}
                      alt="Gallery Preview"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Remove Button Overlay */}
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove media file"
                    aria-label="Remove media file"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Metadata & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC]">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2B1408] truncate">
                      {fileMeta?.name || (editingItem ? 'Current Media Asset' : 'Uploaded Media File')}
                    </p>
                    <p className="text-[11px] text-[#7A5C4A]">
                      {fileMeta?.size ? `${fileMeta.size} · ` : ''}{mediaType === 'VIDEO' ? 'Video Asset' : 'Image Asset'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FBEFE1] border border-[#EEDDCC] text-xs font-bold text-[#2B1408] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[38px]"
                    >
                      <RefreshCw size={13} className={isUploading ? 'animate-spin' : ''} />
                      <span>{isUploading ? 'Uploading...' : 'Replace File'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      disabled={isUploading}
                      className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[38px]"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Dropzone Mode */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelection(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                  isDragging
                    ? 'border-[#FE8E2A] bg-[#FE8E2A]/5'
                    : 'border-[#EEDDCC] bg-[#FFFBF7] hover:border-[#FE8E2A]/50 hover:bg-[#FDF6EE]'
                } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FE8E2A]/10 text-[#FE8E2A] flex items-center justify-center mb-2 shadow-2xs">
                  {isUploading ? (
                    <RefreshCw size={22} className="animate-spin text-[#FE8E2A]" />
                  ) : (
                    <Upload size={22} />
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-[#2B1408]">
                  {isUploading
                    ? 'Uploading media to storage...'
                    : mediaType === 'VIDEO'
                      ? 'Upload Cafe Video'
                      : 'Upload Cafe Image'}
                </p>
                <p className="text-[11px] text-[#7A5C4A] mt-0.5">
                  Click to select file or drag and drop media here
                </p>
                <p className="text-[10px] text-[#A89284] mt-1 font-mono">
                  {mediaType === 'VIDEO' ? 'MP4, WebM, MOV · Max 50MB' : 'JPG, PNG, WebP or GIF · Max 10MB'}
                </p>
              </div>
            )}

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelection(file);
              }}
              accept="image/*,video/*,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.mp4,.webm,.mov"
              className="hidden"
            />

            {uploadError && (
              <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{uploadError}</span>
              </p>
            )}
          </div>

          {/* Modal Sticky Footer */}
          <div className="pt-4 border-t border-[#EEDDCC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[#7A5C4A] hover:text-[#2B1408] text-xs font-bold min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || (!mediaUrl && !localPreviewUrl)}
              className="px-6 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all disabled:opacity-50 min-h-[44px] cursor-pointer"
            >
              {isSubmitting
                ? 'Saving...'
                : isUploading
                  ? 'Uploading...'
                  : editingItem
                    ? 'Save Changes'
                    : 'Add to Gallery'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* LIGHTBOX PREVIEW MODAL (Tap to view high-res without editing) */}
      {/* ============================================================ */}
      <Modal
        isOpen={!!lightboxItem}
        onClose={() => setLightboxItem(null)}
        maxWidth="3xl"
        title={lightboxItem?.title || 'Gallery Preview'}
      >
        {lightboxItem && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-black aspect-video max-h-[70vh] flex items-center justify-center">
              {lightboxItem.mediaType === 'VIDEO' ? (
                <video
                  src={normalizeImageUrl(lightboxItem.mediaUrl)}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={getOptimizedImageUrl(lightboxItem.mediaUrl, 'galleryLightbox')}
                  alt={lightboxItem.title || 'Cafe photo'}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FE8E2A]/15 text-[#FE8E2A] text-[10px] font-extrabold uppercase">
                  {lightboxItem.categoryTag}
                </span>
                {lightboxItem.caption && (
                  <p className="text-xs text-[#7A5C4A] mt-1 leading-relaxed">
                    {lightboxItem.caption}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const target = lightboxItem;
                    setLightboxItem(null);
                    openEditModal(target);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#FDF6EE] hover:bg-[#FBEFE1] text-[#2B1408] border border-[#EEDDCC] text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = lightboxItem;
                    setLightboxItem(null);
                    setDeleteTargetItem(target);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION DIALOG                                    */}
      {/* ============================================================ */}
      <ConfirmDialog
        isOpen={!!deleteTargetItem}
        title="Delete Gallery Asset"
        message={`Are you sure you want to delete ${
          deleteTargetItem?.title ? `"${deleteTargetItem.title}"` : 'this media asset'
        } from the cafe gallery? This cannot be undone.`}
        confirmText="Delete Asset"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTargetItem(null)}
      />
    </div>
  );
};
