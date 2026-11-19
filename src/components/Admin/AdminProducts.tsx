import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  X,
  AlertCircle,
  UploadCloud,
  Star,
  ImagePlus,
  Loader2,
  Flame,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Product } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';
import { compressImageFile } from '../../utils/imageUtils.js';

export const AdminProducts: React.FC = () => {
  const { products, categories, storeLoading, formatPrice, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sanitizeNumberField = (raw: string): string => {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits === '') return '';
    return digits.replace(/^0+(?=\d)/, '');
  };

  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    description: '',
    price: '1500',
    discountPrice: '1200',
    stock: '25',
    sku: '',
    category: 'Gadgets & Tech',
    brand: 'Offer Flow',
    images: [] as string[],
    tagsText: '',
    colorsText: '',
    isFeatured: false,
    isFlashSale: false,
    isNewArrival: true,
    status: 'active' as 'active' | 'inactive',
    specsText: 'Warranty: 1 Year Official\nAuthenticity: 100% Genuine',
  });

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImages(true);
    try {
      const validFiles = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, Math.max(0, 8 - formData.images.length));

      if (validFiles.length === 0) {
        showToast(
          formData.images.length >= 8
            ? 'Maximum 8 photos allowed per product'
            : 'Please select valid image files (JPG, PNG, WebP)'
        );
        return;
      }

      // Compress cleanly to ~120-200KB per image so Firestore saves smoothly without lag
      const processedImages = await Promise.all(
        validFiles.map((f) => compressImageFile(f, 640, 0.76, 180000))
      );
      const filtered = processedImages.filter(Boolean);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...filtered].slice(0, 8),
      }));
      showToast(`${filtered.length} photo(s) compressed & attached!`);
    } catch {
      showToast('Error processing images');
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetMainImage = (indexToMain: number) => {
    if (indexToMain === 0) return;
    setFormData((prev) => {
      const copy = [...prev.images];
      const [selected] = copy.splice(indexToMain, 1);
      return {
        ...prev,
        images: [selected, ...copy],
      };
    });
    showToast('Cover photo updated');
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      nameBn: '',
      description: '',
      price: '',
      discountPrice: '',
      stock: '25',
      sku: `OF-${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0]?.name || 'Gadgets & Tech',
      brand: 'Offer Flow',
      images: [],
      tagsText: 'gadgets, best seller, offer flow',
      colorsText: '',
      isFeatured: true,
      isFlashSale: false,
      isNewArrival: true,
      status: 'active',
      specsText: 'Warranty: 1 Year Official\nQuality: 100% Genuine Inspected',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    const specsStr = Array.isArray(p.specifications)
      ? p.specifications.map((s) => `${s.label}: ${s.value}`).join('\n')
      : '';

    setFormData({
      name: p.name,
      nameBn: p.nameBn || '',
      description: p.description,
      price: String(p.price ?? ''),
      discountPrice: String(p.discountPrice ?? ''),
      stock: String(p.stock ?? 0),
      sku: p.sku,
      category: p.category,
      brand: p.brand,
      images: Array.isArray(p.images) ? [...p.images] : [],
      tagsText: (p.tags || []).join(', '),
      colorsText: (p.colors || []).join(', '),
      isFeatured: !!p.isFeatured,
      isFlashSale: !!p.isFlashSale,
      isNewArrival: !!p.isNewArrival,
      status: p.status === 'inactive' ? 'inactive' : 'active',
      specsText: specsStr,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      showToast('Please upload at least 1 product photo from your files');
      return;
    }

    const totalSize = formData.images.reduce((acc, s) => acc + s.length, 0);
    if (totalSize > 850000) {
      showToast('Too many large images attached. Please keep up to 4-6 photos.');
      return;
    }

    setSaving(true);
    const tags = formData.tagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const colors = Array.from(
      new Set(
        formData.colorsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    ).slice(0, 20);

    const specsList: { label: string; value: string }[] = [];
    formData.specsText.split('\n').forEach((line) => {
      if (line.includes(':')) {
        const [k, ...rest] = line.split(':');
        specsList.push({ label: k.trim(), value: rest.join(':').trim() });
      }
    });

    const parsedPrice = Math.max(0, Number(formData.price) || 0);
    const parsedDiscount =
      formData.discountPrice.trim() !== ''
        ? Math.max(0, Number(formData.discountPrice) || 0)
        : parsedPrice;

    const payload: Partial<Product> = {
      name: formData.name.trim(),
      nameBn: formData.nameBn.trim(),
      description: formData.description.trim(),
      price: parsedPrice,
      discountPrice: parsedDiscount,
      stock: Math.max(0, Number(formData.stock) || 0),
      sku: formData.sku.trim(),
      category: formData.category,
      brand: formData.brand.trim() || 'Offer Flow',
      images: formData.images,
      tags,
      colors,
      specifications: specsList,
      isFeatured: formData.isFeatured,
      isFlashSale: formData.isFlashSale,
      isNewArrival: formData.isNewArrival,
      status: formData.status,
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast('Product updated & saved to Cloud Firestore!');
      } else {
        await api.createProduct(payload);
        showToast('New product added & published live!');
      }
      setIsModalOpen(false);
    } catch {
      showToast('Error saving product to database');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggle = async (
    p: Product,
    field: 'isFeatured' | 'isFlashSale' | 'status'
  ) => {
    setTogglingId(`${p.id}-${field}`);
    try {
      if (field === 'status') {
        const nextStatus = p.status === 'active' ? 'inactive' : 'active';
        await api.updateProduct(p.id, { status: nextStatus });
        showToast(`Product ${nextStatus === 'active' ? 'activated' : 'hidden'}`);
      } else {
        await api.updateProduct(p.id, { [field]: !p[field] });
        showToast('Product updated');
      }
    } catch {
      showToast('Failed to update product');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateProduct(id);
      showToast('Product duplicated successfully');
    } catch {
      showToast('Error duplicating product');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setDeleteConfirmId(null);
      showToast('Product permanently deleted');
    } catch {
      showToast('Error deleting product');
    }
  };

  const filtered = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (stockFilter === 'in' && p.stock <= 0) return false;
    if (stockFilter === 'low' && (p.stock <= 0 || p.stock > 5)) return false;
    if (stockFilter === 'out' && p.stock > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Products Catalog</h1>
          <p className="text-xs text-slate-500">
            Total {products.length} products • Instant cloud persistence & multi-photo upload
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, brand, SKU..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Stock Levels</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock (1-5)</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {storeLoading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading catalog...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400">No products match your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category / SKU</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Quick Toggles</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      p.status === 'inactive' ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-bold text-slate-900 truncate" title={p.name}>
                            {p.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {p.brand} • {p.images.length} photo(s)
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-700 block">{p.category}</span>
                      <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-rose-600 block">
                        {formatPrice(p.discountPrice)}
                      </span>
                      {p.price > p.discountPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {p.stock > 5 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          {p.stock} in stock
                        </span>
                      ) : p.stock > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                          Low: {p.stock} left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold">
                          Out of stock
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={togglingId === `${p.id}-isFlashSale`}
                          onClick={() => handleQuickToggle(p, 'isFlashSale')}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                            p.isFlashSale
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                          }`}
                          title="Toggle Flash Sale"
                        >
                          <Flame className="w-2.5 h-2.5" />
                          <span>Flash</span>
                        </button>

                        <button
                          type="button"
                          disabled={togglingId === `${p.id}-isFeatured`}
                          onClick={() => handleQuickToggle(p, 'isFeatured')}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                            p.isFeatured
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className="w-2.5 h-2.5" />
                          <span>Featured</span>
                        </button>

                        <button
                          type="button"
                          disabled={togglingId === `${p.id}-status`}
                          onClick={() => handleQuickToggle(p, 'status')}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                            p.status !== 'inactive'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                          title="Toggle Storefront Visibility"
                        >
                          {p.status !== 'inactive' ? (
                            <>
                              <Eye className="w-2.5 h-2.5" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-2.5 h-2.5" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete this Product?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to permanently remove this product from Offer Flow?
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="py-2 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Product Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bengali Title (বাংলা)</label>
                  <input
                    type="text"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Original Price (৳ BDT) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 1500"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: sanitizeNumberField(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Offer / Discount Price (৳ BDT) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 1200"
                    value={formData.discountPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPrice: sanitizeNumberField(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Inventory Stock Count *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 25"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: sanitizeNumberField(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tagsText}
                    onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Available Colors / রঙের অপশন (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.colorsText}
                    onChange={(e) => setFormData({ ...formData, colorsText: e.target.value })}
                    placeholder="e.g. Black, White, Blue, Red, Silver"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['Black', 'White', 'Blue', 'Red', 'Green', 'Silver', 'Gold', 'Pink'].map((preset) => {
                      const current = formData.colorsText
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const isAdded = current.some((c) => c.toLowerCase() === preset.toLowerCase());
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            const updated = isAdded
                              ? current.filter((c) => c.toLowerCase() !== preset.toLowerCase())
                              : [...current, preset];
                            setFormData({ ...formData, colorsText: updated.join(', ') });
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            isAdded
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
                          }`}
                        >
                          {isAdded ? `✓ ${preset}` : `+ ${preset}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Multiple Image File Upload Area */}
              <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-black text-slate-800 text-xs">
                      Product Photos / ছবিসমূহ (From Files) *
                    </label>
                    <p className="text-[11px] text-slate-500">
                      আপনার ফোন বা কম্পিউটার ফাইল থেকে একাধিক ছবি নির্বাচন করুন (স্বয়ংক্রিয়ভাবে দ্রুত লোডের জন্য অপটিমাইজ হবে)
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {formData.images.length} / 8
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 ${
                    isDragOver
                      ? 'border-rose-500 bg-rose-50/80 scale-[1.01]'
                      : 'border-slate-300 hover:border-rose-400 hover:bg-rose-50/30 bg-white'
                  }`}
                >
                  {isUploadingImages ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                      <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                      <p className="font-bold text-xs text-slate-700">
                        Optimizing & compressing images...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800">
                          Click to select photos or drag & drop files here
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Select multiple images at once (JPG, PNG, WebP)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="mt-1 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>Choose Photos from Device</span>
                      </button>
                    </div>
                  )}
                </div>

                {formData.images.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold text-slate-600">
                      Uploaded Photos (First photo is Main Cover):
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 group shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMainImage(idx);
                              }}
                              className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md hover:bg-rose-600 transition-all"
                            >
                              Make Cover
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {formData.images.length < 8 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/50 flex flex-col items-center justify-center text-slate-500 hover:text-rose-600 transition-all"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-[10px] font-bold mt-1">Add More</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>No image uploaded yet. Please add at least 1 photo from your files.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Specifications (Format: Label: Value per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.specsText}
                  onChange={(e) => setFormData({ ...formData, specsText: e.target.value })}
                  placeholder="Battery: 5000mAh&#10;Warranty: 1 Year"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-rose-600 w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-slate-800">Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFlashSale}
                    onChange={(e) => setFormData({ ...formData, isFlashSale: e.target.checked })}
                    className="accent-rose-600 w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-slate-800">Include in Flash Sale</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="accent-rose-600 w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-slate-800">New Arrival</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || isUploadingImages}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{saving ? 'Saving to Cloud...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
