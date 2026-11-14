import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  X,
  Layers,
  Check,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Category } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';
import { compressImageFile } from '../../utils/imageUtils.js';

export const AdminCategories: React.FC = () => {
  const { categories, showToast } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    slug: '',
    image: '',
    order: 1,
    isActive: true,
  });

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const base64Data = await compressImageFile(file, 480, 0.78, 220000);
      setFormData((prev) => ({ ...prev, image: base64Data }));
      showToast('Category picture optimized & attached!');
    } catch {
      showToast('Failed to process image file');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      nameBn: '',
      slug: '',
      image: '',
      order: categories.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      nameBn: cat.nameBn || '',
      slug: cat.slug,
      image: cat.image || '',
      order: cat.order,
      isActive: cat.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter category name');
      return;
    }

    setSaving(true);
    const slug =
      formData.slug.trim() ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      `cat-${Date.now()}`;

    const image =
      formData.image.trim() ||
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80';

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          nameBn: formData.nameBn.trim(),
          slug,
          image,
          order: Number(formData.order) || 1,
          isActive: formData.isActive,
        });
        showToast('Category updated in Cloud Firestore');
      } else {
        await api.createCategory({
          name: formData.name.trim(),
          nameBn: formData.nameBn.trim(),
          slug,
          image,
          order: Number(formData.order) || categories.length + 1,
          isActive: true,
        });
        showToast('New category added & synced live!');
      }
      setIsModalOpen(false);
    } catch {
      showToast('Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteCategory(deleteTarget.id);
      showToast(`Category "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch {
      showToast('Error deleting category');
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      (cat.nameBn && cat.nameBn.toLowerCase().includes(q)) ||
      cat.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-rose-600" />
            <span>Categories Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {categories.length} categories • Add departments with custom images from your files
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category by English name, Bengali name, or slug..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-slate-400 hover:text-slate-600 p-1 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-slate-200 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <span className="absolute bottom-0 right-0 bg-black/60 text-white font-mono text-[9px] px-1 rounded-tl font-bold">
                  #{cat.order}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 truncate" title={cat.name}>
                  {cat.name}
                </h3>
                {cat.nameBn && (
                  <p className="text-xs text-rose-600 font-medium truncate">{cat.nameBn}</p>
                )}
                <span className="text-[10px] font-mono text-slate-400 block truncate mt-0.5">
                  slug: /{cat.slug}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                className="flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inline Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete "{deleteTarget.name}"?</h3>
            <p className="text-xs text-slate-500">
              This category will be removed from the storefront and 3-dot catalog menu.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-2 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Upload category picture from your computer or phone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Category Picture (ফাইল থেকে ছবি নির্বাচন করুন) *</span>
                  {formData.image && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Photo Attached
                    </span>
                  )}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelected}
                  className="hidden"
                />

                {formData.image ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <img
                      src={formData.image}
                      alt="Category Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Selected Image</p>
                      <p className="text-[10px] text-slate-500">Compressed & ready for Cloud</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white text-slate-400 group-hover:text-rose-600 group-hover:scale-110 flex items-center justify-center mx-auto shadow-xs border border-slate-100 transition-all">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-2">
                      {uploadingImage
                        ? 'Processing image...'
                        : 'Click to select picture from file / gallery'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP • Automatically resized & optimized
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name: val,
                        slug:
                          prev.slug ||
                          val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      }));
                    }}
                    placeholder="e.g. Smart Watches"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bengali Name (বাংলা নাম)
                  </label>
                  <input
                    type="text"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="যেমন: স্মার্ট ওয়াচ"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    URL Slug (Identifier)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    placeholder="e.g. smart-watches"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px] focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Display Order (১, ২, ৩...)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || saving}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingCategory ? 'Update Category' : 'Add Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
