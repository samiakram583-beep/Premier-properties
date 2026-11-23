import React, { useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { deleteGalleryImageById, saveGalleryImage } from '../../lib/firestoreRepo.ts';
import { compressAndUploadImage } from '../../lib/imageProcessor.ts';
import type { GalleryCategory, GalleryImage, Property } from '../../types/domain.ts';

interface GalleryTabProps {
  gallery: GalleryImage[];
  properties: Property[];
  onRefresh: () => Promise<void>;
}

export function GalleryTab({ gallery, properties, onRefresh }: GalleryTabProps) {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('Houses');
  const [altText, setAltText] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { url } = await compressAndUploadImage(file);
      setImageUrl(url);
      if (!altText) setAltText(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !imageUrl) {
      setError('Please upload an image and enter a title.');
      return;
    }

    const linkedProp = properties.find((p) => p.id === propertyId);
    setSaving(true);
    try {
      await saveGalleryImage({
        title: title.trim(),
        caption: caption.trim(),
        category,
        url: imageUrl,
        altText: altText.trim() || title.trim(),
        propertyId: linkedProp ? linkedProp.id : '',
        propertySlug: linkedProp ? linkedProp.slug : '',
        sortOrder: gallery.length + 1,
        published: true,
      });
      setTitle('');
      setCaption('');
      setAltText('');
      setPropertyId('');
      setImageUrl('');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save gallery image.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this photograph from the gallery?')) return;
    await deleteGalleryImageById(id);
    await onRefresh();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-white border border-[#0F2A24]/12 p-5 sm:p-6 space-y-4">
        <h3 className="font-display text-2xl font-semibold text-[#0F2A24]">Add gallery photo</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pak Avenue Courtyard Elevation"
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryCategory)}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs bg-white"
            >
              <option value="Houses">Houses</option>
              <option value="Plots">Plots</option>
              <option value="Commercial">Commercial</option>
              <option value="Projects">Projects</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">
              Link to property (optional)
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs bg-white"
            >
              <option value="">Standalone project photo</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Alt text *</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Travertine courtyard exterior"
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Brief architectural or location note"
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#0F2A24]/25 text-xs font-medium cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#B38B52]" aria-hidden="true" />
            <span>{uploading ? 'Uploading...' : 'Select JPG/PNG/WebP'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleUpload(e.target.files?.[0])}
              className="hidden"
            />
          </label>
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="w-16 h-12 object-cover border border-[#0F2A24]/15" />
          )}
          <button
            type="submit"
            disabled={saving || uploading}
            className="ml-auto px-5 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add to gallery'}
          </button>
        </div>

        {error && <p className="text-xs text-red-700">{error}</p>}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gallery.map((item) => (
          <div key={item.id} className="bg-white border border-[#0F2A24]/12 overflow-hidden flex flex-col justify-between">
            <div>
              <img
                src={item.url}
                alt={item.altText || item.title}
                className="w-full aspect-[4/3] object-cover bg-[#0F2A24]/5"
              />
              <div className="p-4">
                <p className="text-[11px] text-[#B38B52] font-medium">{item.category}</p>
                <p className="font-display text-lg font-semibold text-[#0F2A24] mt-0.5">{item.title}</p>
                {item.caption && <p className="text-xs text-[#51625C] mt-1">{item.caption}</p>}
              </div>
            </div>
            <div className="px-4 pb-4 flex items-center justify-between text-xs border-t border-[#0F2A24]/10 pt-3">
              <span className="text-[#51625C] truncate max-w-[180px]">
                {item.propertySlug ? `Linked: ${item.propertySlug}` : 'Standalone'}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="inline-flex items-center gap-1 text-red-700 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
