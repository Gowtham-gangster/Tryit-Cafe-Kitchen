import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useMenuStore } from '../../store/useMenuStore';
import { useAuthStore } from '../../store/useAuthStore';
import { customerApi } from '../../api/customerApi';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';

export const ReviewModal: React.FC = () => {
  const { isReviewModalOpen, setIsReviewModalOpen, openAuthModal, fetchAllPublicData } = useMenuStore();
  const { isAuthenticated, user } = useAuthStore();

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync user's name when authenticated
  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write your review.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    if (!isAuthenticated) {
      setIsReviewModalOpen(false);
      openAuthModal('login', 'Please sign in to share your verified review with Tryit Cafe.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await customerApi.submitReview({ rating, comment });
      setSuccess(true);
      fetchAllPublicData().catch(() => {});
      setTimeout(() => {
        setSuccess(false);
        setComment('');
        setRating(5);
        setHoveredRating(null);
        setIsReviewModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isReviewModalOpen}
      onClose={() => setIsReviewModalOpen(false)}
      maxWidth="md"
      title="Write a Review"
    >
      {success ? (
        <div className="text-center py-6 space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h4 className="font-display font-bold text-base sm:text-lg text-[#2B1408]">
            Thank you for sharing your experience!
          </h4>
          <p className="text-xs text-[#7A5C4A] max-w-xs mx-auto">
            Your review has been submitted and will appear on the cafe page shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Name */}
          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs sm:text-sm font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/40"
              required
            />
          </div>

          {/* 2. Review */}
          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">
              Your Review
            </label>
            <textarea
              rows={4}
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-white border border-[#EEDDCC] text-xs sm:text-sm font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/40"
              required
            />
          </div>

          {/* 3. Star Rating */}
          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1.5">
              Your Rating
            </label>
            <div
              className="flex items-center gap-1.5 p-2 bg-[#FDF6EE] rounded-xl border border-[#EEDDCC] w-fit"
              onMouseLeave={() => setHoveredRating(null)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoveredRating !== null ? hoveredRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95 focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={24}
                      className={`${
                        isFilled
                          ? 'fill-[#FE8E2A] text-[#FE8E2A]'
                          : 'fill-transparent text-[#EEDDCC]'
                      } transition-colors`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </Modal>
  );
};
