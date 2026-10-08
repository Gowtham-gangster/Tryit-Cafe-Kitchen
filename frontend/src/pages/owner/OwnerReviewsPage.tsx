import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, EyeOff, Trash2, Clock, Check } from 'lucide-react';
import { Review, ReviewStatus } from '../../types';
import { ownerApi } from '../../api/ownerApi';
import { StarRating } from '../../components/common/StarRating';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToastStore } from '../../store/useToastStore';
import { useMenuStore } from '../../store/useMenuStore';

export const OwnerReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'HIDDEN'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const { success, error: toastError } = useToastStore();
  const { fetchAllPublicData } = useMenuStore();

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await ownerApi.getReviews();
      setReviews(data);
    } catch (e) {
      console.error(e);
      toastError('Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ReviewStatus) => {
    try {
      await ownerApi.updateReviewStatus(id, newStatus);
      success(`Review status changed to ${newStatus}.`);
      await loadReviews();
      fetchAllPublicData(true); // Instant sync on customer site
    } catch (e) {
      toastError('Failed to update review status.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await ownerApi.deleteReview(deleteTargetId);
      success('Review deleted successfully.');
      setDeleteTargetId(null);
      await loadReviews();
      fetchAllPublicData(true);
    } catch (e) {
      toastError('Failed to delete review.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReviews =
    activeTab === 'ALL' ? reviews : reviews.filter((r) => r.status === activeTab);

  const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;
  const approvedCount = reviews.filter((r) => r.status === 'APPROVED').length;
  const hiddenCount = reviews.filter((r) => r.status === 'HIDDEN').length;

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Header with Title and Rating Stats Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1408] font-serif">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5C4A] mt-1">
            Review customer feedback. Approve verified positive reviews to instantly showcase them on the website.
          </p>
        </div>

        {/* Stats Pill Widget */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-2xs self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <Star size={16} className="fill-[#FE8E2A] text-[#FE8E2A]" />
            <span className="font-extrabold text-sm text-[#2B1408]">{averageRating}</span>
            <span className="text-xs text-[#7A5C4A] font-medium">/ 5.0</span>
          </div>
          <span className="w-px h-4 bg-[#EEDDCC]" />
          <span className="text-xs font-bold text-[#7A5C4A]">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#EEDDCC] pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-[#2B1408] text-white shadow-xs'
              : 'bg-[#FFFBF7] text-[#7A5C4A] hover:bg-[#FDF6EE] hover:text-[#2B1408] border border-[#EEDDCC]'
          }`}
        >
          All Reviews ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative min-h-[38px] cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-[#FE8E2A] text-white shadow-xs'
              : 'bg-[#FFFBF7] text-[#7A5C4A] hover:bg-[#FDF6EE] hover:text-[#2B1408] border border-[#EEDDCC]'
          }`}
        >
          <span>Pending Review</span>
          {pendingCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white text-[#2B1408] text-[10px] font-black">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[#FFFBF7] text-[#7A5C4A] hover:bg-[#FDF6EE] hover:text-[#2B1408] border border-[#EEDDCC]'
          }`}
        >
          <span>Approved ({approvedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('HIDDEN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
            activeTab === 'HIDDEN'
              ? 'bg-[#7A5C4A] text-white shadow-xs'
              : 'bg-[#FFFBF7] text-[#7A5C4A] hover:bg-[#FDF6EE] hover:text-[#2B1408] border border-[#EEDDCC]'
          }`}
        >
          <span>Hidden ({hiddenCount})</span>
        </button>
      </div>

      {/* Review Cards Grid: Responsive 1-col on mobile, 2-col on tablet, 3-col on laptop/desktop, 4-col on large desktop */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#7A5C4A]">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-16 bg-[#FFFBF7] rounded-3xl border border-[#EEDDCC] text-center p-6 space-y-2">
          <Star size={24} className="mx-auto text-[#FE8E2A]/50" />
          <p className="text-sm font-bold text-[#2B1408]">No reviews found in this filter.</p>
          <p className="text-xs text-[#7A5C4A]">Switch filter tabs to view other review statuses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-[1380px]:grid-cols-4 gap-4 sm:gap-4.5 lg:gap-5">
          {filteredReviews.map((rev) => {
            const initial = rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'C';
            const formattedDate = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={rev.id}
                className="p-5 rounded-2xl sm:rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-xs hover:shadow-md hover:border-[#FE8E2A]/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Avatar + Customer Name + Status Badge */}
                  <div className="flex items-start justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FE8E2A]/20 to-[#E67616]/10 text-[#FE8E2A] border border-[#FE8E2A]/30 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[#2B1408] font-serif truncate leading-tight">
                          {rev.customerName || 'Anonymous Customer'}
                        </h4>
                        <span className="text-[10.5px] text-[#8C6D58] font-medium flex items-center gap-1 mt-0.5">
                          <CheckCircle size={10} className="text-emerald-600 shrink-0" />
                          <span>Verified Customer</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rev.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {rev.status === 'APPROVED' && '● Approved'}
                      {rev.status === 'PENDING' && '⏱ Pending'}
                      {rev.status === 'HIDDEN' && '⊘ Hidden'}
                    </span>
                  </div>

                  {/* Rating Stars & Numeric Value */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <StarRating rating={rev.rating} size={13} />
                    <span className="text-[11px] font-extrabold text-[#FE8E2A] leading-none">
                      {rev.rating}.0
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-[13px] text-[#3E2214] leading-relaxed italic line-clamp-4 min-h-[50px] mb-3">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Card Footer: Date & Moderation Buttons */}
                <div className="pt-3 border-t border-[#EEDDCC]/70 flex items-center justify-between gap-2 mt-auto">
                  <span className="text-[11px] text-[#8C6D58] font-medium flex items-center gap-1">
                    <Clock size={11} className="text-[#A89284]" />
                    <span>{formattedDate}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {rev.status !== 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(rev.id, 'APPROVED')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors min-h-[34px] cursor-pointer shadow-2xs border border-emerald-200/60"
                        title="Approve Review"
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                    )}

                    {rev.status !== 'HIDDEN' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(rev.id, 'HIDDEN')}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FDF6EE] hover:bg-[#FBEFE1] text-[#7A5C4A] hover:text-[#2B1408] border border-[#EEDDCC] text-xs font-bold flex items-center gap-1 transition-colors min-h-[34px] cursor-pointer"
                        title="Hide Review"
                      >
                        <EyeOff size={13} />
                        <span>Hide</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(rev.id)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer"
                      title="Delete Review"
                      aria-label="Delete review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Customer Review"
        message="Are you sure you want to permanently delete this customer review? This action cannot be undone."
        confirmText="Delete Review"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
