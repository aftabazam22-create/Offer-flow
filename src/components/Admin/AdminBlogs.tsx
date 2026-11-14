import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { BlogPost } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';
import { compressImageFile } from '../../utils/imageUtils.js';

export const AdminBlogs: React.FC = () => {
  const { blogs, showToast } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: 'Guides',
    author: 'A.Y HEJAJ',
    tagsText: 'gadgets, bangladesh, shopping',
    isPublished: true,
  });

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file, 720, 0.78, 280000);
      setFormData((prev) => ({ ...prev, featuredImage: dataUrl }));
      showToast('Article cover compressed & attached');
    } catch {
      showToast('Error processing image');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85',
      category: 'Guides',
      author: 'A.Y HEJAJ',
      tagsText: 'gadgets, shopping tips',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BlogPost) => {
    setEditingBlog(b);
    setFormData({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      featuredImage: b.featuredImage || '',
      category: b.category,
      author: b.author,
      tagsText: (b.tags || []).join(', '),
      isPublished: b.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const slug =
      formData.slug.trim() ||
      formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      `blog-${Date.now()}`;
    const tags = formData.tagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingBlog) {
        await api.updateBlog(editingBlog.id, {
          ...formData,
          slug,
          tags,
          publishedAt: editingBlog.publishedAt || new Date().toISOString(),
        });
        showToast('Blog post updated');
      } else {
        await api.createBlog({
          ...formData,
          slug,
          tags,
          publishedAt: new Date().toISOString(),
        });
        showToast('Blog post published live!');
      }
      setIsModalOpen(false);
    } catch {
      showToast('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBlog(id);
      setDeleteId(null);
      showToast('Article deleted');
    } catch {
      showToast('Error deleting article');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Blog Posts & Articles</h1>
          <p className="text-xs text-slate-500">Publish guides, product reviews, and shopping advice</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blogs.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex gap-3">
              <img
                src={b.featuredImage}
                alt={b.title}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">
                  {b.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                  {b.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{b.excerpt}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">By {b.author}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(b.id)}
                  className="p-1.5 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete this Article?</h3>
            <p className="text-xs text-slate-500">This blog post will be permanently deleted.</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="py-2 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-100 my-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingBlog ? 'Edit Article' : 'Write New Article'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Excerpt (Summary) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Featured Image</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{uploadingImage ? 'Compressing...' : 'Upload from Files'}</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                </div>
                <input
                  type="text"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="Or paste image URL..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Article Content (Markdown / Text) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
