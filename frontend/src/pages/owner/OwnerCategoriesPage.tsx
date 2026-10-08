import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Category } from '../../types';
import { ownerApi } from '../../api/ownerApi';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToastStore } from '../../store/useToastStore';
import { useMenuStore } from '../../store/useMenuStore';

export const OwnerCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { success, error: toastError } = useToastStore();
  const { fetchAllPublicData } = useMenuStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete target state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await ownerApi.getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
      toastError('Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setDisplayOrder(categories.length + 1);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setDisplayOrder(cat.displayOrder);
    setActive(cat.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder),
        active,
      };

      if (editingCategory) {
        await ownerApi.updateCategory(editingCategory.id, payload);
        success(`"${name}" category updated!`);
      } else {
        await ownerApi.createCategory(payload);
        success(`"${name}" category created!`);
      }

      setIsModalOpen(false);
      await loadCategories();
      fetchAllPublicData(true);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ownerApi.deleteCategory(deleteTarget.id);
      success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await loadCategories();
      fetchAllPublicData(true);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Cannot delete category containing dishes.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header: Optimized vertically for mobile, untouched on desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1408] font-serif leading-tight">
            Menu Categories
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5C4A] mt-1 leading-relaxed">
            Organize dishes into logical groups (e.g. Starters, Pastas, Rolls, Shakes).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all min-h-[48px] md:min-h-[44px] cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Mobile Category Summary: Only visible below md */}
      {!isLoading && categories.length > 0 && (
        <div className="flex items-center justify-between text-xs font-semibold text-[#7A5C4A] px-1 md:hidden pt-1">
          <span className="font-bold text-[#2B1408]">Categories</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FBEFE1] text-[#FE8E2A] font-bold text-[11px] border border-[#EEDDCC]">
            {categories.length} total
          </span>
        </div>
      )}

      {/* Loading States */}
      {isLoading ? (
        <>
          {/* Desktop Loading */}
          <div className="hidden md:block py-16 text-center text-xs text-[#7A5C4A]">
            Loading categories...
          </div>

          {/* Mobile Skeleton Loading */}
          <div className="space-y-2.5 md:hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-[#FFFBF7] border border-[#EEDDCC] animate-pulse space-y-3"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 flex-1">
                    <div className="w-6 h-6 rounded-full bg-amber-200/50 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-36 h-4 rounded-md bg-amber-200/50" />
                      <div className="w-24 h-3 rounded-md bg-amber-200/30" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-9 h-9 rounded-xl bg-amber-200/30" />
                    <div className="w-9 h-9 rounded-xl bg-amber-200/30" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-[#EEDDCC]/60">
                  <div className="w-16 h-5 rounded-full bg-amber-200/40" />
                  <div className="w-16 h-5 rounded-full bg-amber-200/40" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : categories.length === 0 ? (
        /* Empty State */
        <div className="p-8 text-center rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FE8E2A]/10 text-[#FE8E2A] flex items-center justify-center">
            <Plus size={24} />
          </div>
          <h3 className="font-serif font-bold text-base text-[#2B1408]">No Categories Yet</h3>
          <p className="text-xs text-[#7A5C4A] max-w-sm mx-auto leading-relaxed">
            Create your first category to organize your menu dishes.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Add New Category</span>
          </button>
        </div>
      ) : (
        <>
          {/* ============================================================== */}
          {/* DESKTOP TABLE PRESENTATION (md and above - UNTOUCHED)           */}
          {/* ============================================================== */}
          <div className="hidden md:block bg-[#FFFBF7] rounded-3xl border border-[#EEDDCC] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FDF6EE] border-b border-[#EEDDCC] text-[#2B1408] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Category Name</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Dishes Count</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEDDCC] font-medium text-[#7A5C4A]">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FDF6EE] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#2B1408]">#{cat.displayOrder}</td>
                      <td className="px-6 py-4 font-bold text-[#2B1408]">{cat.name}</td>
                      <td className="px-6 py-4 text-[#7A5C4A] font-mono">{cat.slug}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#FBEFE1] text-[#FE8E2A] font-bold border border-[#EEDDCC]">
                          {cat.itemCount || 0} items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            cat.active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {cat.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 rounded-xl text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#F2E5D6] transition-colors cursor-pointer"
                            aria-label={`Edit category ${cat.name}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            aria-label={`Delete category ${cat.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================== */}
          {/* MOBILE CARDS PRESENTATION (below md - COMPACT & DENSE)          */}
          {/* ============================================================== */}
          <div className="block md:hidden space-y-2.5">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="bg-[#FFFBF7] rounded-2xl border border-[#EEDDCC] p-3.5 sm:p-4 shadow-[0_1px_3px_rgba(43,20,8,0.03)] hover:border-amber-300/80 transition-all active:scale-[0.99]"
                style={{
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                {/* Top Row: Order Badge + Category Name + Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    {/* Compact Order Badge */}
                    <div
                      className="w-6 h-6 rounded-full bg-[#FE8E2A]/15 text-[#FE8E2A] text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 border border-[#FE8E2A]/25"
                      title={`Display order #${cat.displayOrder}`}
                    >
                      #{cat.displayOrder}
                    </div>

                    {/* Title & Slug */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-bold text-[17px] text-[#2B1408] leading-tight break-words">
                        {cat.name}
                      </h3>
                      <div className="text-[12px] text-[#7A5C4A]/80 font-mono mt-0.5 break-all">
                        {cat.slug}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete with >= 44x44px touch hit areas */}
                  <div className="flex items-center shrink-0 -mr-1 -mt-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#F2E5D6] active:bg-[#EBDBC9] transition-colors cursor-pointer"
                      aria-label={`Edit category ${cat.name}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer"
                      aria-label={`Delete category ${cat.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Description (if provided) */}
                {cat.description ? (
                  <p className="text-xs text-[#7A5C4A] line-clamp-2 mt-2 leading-relaxed pl-8.5">
                    {cat.description}
                  </p>
                ) : null}

                {/* Bottom Metadata Row: Dish Count & Active Status */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#EEDDCC]/70">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FBEFE1] text-[#FE8E2A] text-xs font-bold border border-[#EEDDCC]">
                    {cat.itemCount || 0} {cat.itemCount === 1 ? 'dish' : 'dishes'}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${
                      cat.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : 'bg-stone-100 text-stone-500 border-stone-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cat.active ? 'bg-emerald-500' : 'bg-stone-400'
                      }`}
                    />
                    {cat.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. Sizzlers & Platters"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">Display Order</label>
            <input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief summary of what this category contains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2B1408] pt-1">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#FE8E2A] focus:ring-[#FE8E2A]"
            />
            <span>Active (Visible on public menu)</span>
          </label>

          <div className="pt-4 border-t border-[#EEDDCC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[#7A5C4A] hover:bg-[#F2E5D6] text-xs font-bold cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? You can only delete empty categories.`}
        confirmText="Delete Category"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDeleteCategory}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
