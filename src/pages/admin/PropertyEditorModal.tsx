import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { fetchPropertyImages, saveProperty, syncPropertyImages } from '../../lib/firestoreRepo.ts';
import { slugify } from '../../lib/formatters.ts';
import { compressAndUploadImage } from '../../lib/imageProcessor.ts';
import { propertySchema } from '../../lib/validation.ts';
import type {
  AreaUnit,
  Property,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from '../../types/domain.ts';

interface EditableImage {
  id?: string;
  url: string;
  altText: string;
  isCover: boolean;
}

interface PropertyEditorModalProps {
  property: Property | null; // null = create new
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const COMMON_AMENITIES = [
  'Corner plot',
  'Park facing',
  'Underground utilities',
  '24/7 gated security',
  'Solar hybrid wiring',
  'Double-glazed windows',
  'Servant quarter',
  'Backup generator / UPS',
  'Underground water tank',
  'Lawn & courtyard',
  'Covered parking',
  'Elevator access',
];

export function PropertyEditorModal({ property, onClose, onSaved }: PropertyEditorModalProps) {
  const [title, setTitle] = useState(property?.title || '');
  const [slug, setSlug] = useState(property?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(property));
  const [description, setDescription] = useState(property?.description || '');
  const [purpose, setPurpose] = useState<PropertyPurpose>(property?.purpose || 'sale');
  const [type, setType] = useState<PropertyType>(property?.type || 'house');
  const [pricePkr, setPricePkr] = useState(property ? String(property.pricePkr) : '');
  const [areaSize, setAreaSize] = useState(property ? String(property.areaSize) : '10');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>(property?.areaUnit || 'marla');
  const [bedrooms, setBedrooms] = useState(property ? String(property.bedrooms) : '0');
  const [bathrooms, setBathrooms] = useState(property ? String(property.bathrooms) : '0');
  const [parking, setParking] = useState(property ? String(property.parking) : '0');
  const [furnished, setFurnished] = useState(property?.furnished || false);
  const [yearBuilt, setYearBuilt] = useState(
    property?.yearBuilt ? String(property.yearBuilt) : ''
  );
  const [addressArea, setAddressArea] = useState(
    property?.addressArea || 'Pak Avenue Housing Scheme, Sahiwal'
  );
  const [latitude, setLatitude] = useState(
    property?.latitude !== null && property?.latitude !== undefined ? String(property.latitude) : ''
  );
  const [longitude, setLongitude] = useState(
    property?.longitude !== null && property?.longitude !== undefined
      ? String(property.longitude)
      : ''
  );
  const [amenities, setAmenities] = useState<string[]>(property?.amenities || []);
  const [customAmenity, setCustomAmenity] = useState('');
  const [status, setStatus] = useState<PropertyStatus>(property?.status || 'for_sale');
  const [featured, setFeatured] = useState(property?.featured ?? false);
  const [published, setPublished] = useState(property?.published ?? true);
  const [isSample, setIsSample] = useState(property?.isSample ?? false);

  const [images, setImages] = useState<EditableImage[]>(() =>
    property?.coverImageUrl
      ? [
          {
            url: property.coverImageUrl,
            altText: property.coverImageAlt || property.title,
            isCover: true,
          },
        ]
      : []
  );
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // AI Image Studio state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!property) return;
    fetchPropertyImages(property.id)
      .then((imgs) => {
        if (imgs.length > 0) {
          setImages(
            imgs.map((img) => ({
              id: img.id,
              url: img.url,
              altText: img.altText,
              isCover: img.isCover,
            }))
          );
        }
      })
      .catch(() => undefined);
  }, [property]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugTouched) {
      setSlug(slugify(val));
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    for (const file of Array.from(files)) {
      try {
        setUploadProgress(5);
        const { url } = await compressAndUploadImage(file, (pct) => setUploadProgress(pct));
        setImages((prev) => [
          ...prev,
          {
            url,
            altText: title || file.name.replace(/\.[^/.]+$/, ''),
            isCover: prev.length === 0,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Image upload failed.');
      } finally {
        setUploadProgress(null);
      }
    }
  };

  const handleGenerateAiImage = async () => {
    if (aiPrompt.trim().length < 5) {
      setAiError('Enter an architectural prompt (at least 5 characters).');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Could not generate architectural image.');
      }
      setImages((prev) => [
        ...prev,
        {
          url: json.url,
          altText: aiPrompt.trim().slice(0, 120),
          isCover: prev.length === 0,
        },
      ]);
      setAiPrompt('');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Image generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const setCoverImage = (idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isCover: i === idx })));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((i) => i.isCover)) {
        next[0] = { ...next[0], isCover: true };
      }
      return next;
    });
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const addCustomAmenity = () => {
    const val = customAmenity.trim();
    if (!val || amenities.includes(val) || amenities.length >= 30) return;
    setAmenities((prev) => [...prev, val]);
    setCustomAmenity('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const coverImg = images.find((i) => i.isCover) || images[0];

    const payload = {
      title,
      slug: slug || slugify(title),
      description,
      purpose,
      type,
      pricePkr: Number(pricePkr || 0),
      areaSize: Number(areaSize || 0),
      areaUnit,
      bedrooms: Number(bedrooms || 0),
      bathrooms: Number(bathrooms || 0),
      parking: Number(parking || 0),
      furnished,
      yearBuilt: yearBuilt ? Number(yearBuilt) : null,
      addressArea,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      amenities,
      status,
      featured,
      published,
      isSample,
      coverImageUrl: coverImg?.url || '',
      coverImageAlt: coverImg?.altText || title,
    };

    const parsed = propertySchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Please review property fields.');
      return;
    }

    setSaving(true);
    try {
      const savedId = await saveProperty(parsed.data, property?.id);
      await syncPropertyImages(
        savedId,
        images.map((img, i) => ({
          id: img.id,
          url: img.url,
          altText: img.altText || title,
          sortOrder: i,
          isCover: img.isCover,
        }))
      );
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save property.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={property ? 'Edit property' : 'Add property'}
      className="fixed inset-0 z-50 bg-[#0A1E19]/75 flex items-center justify-center p-4"
    >
      <div className="bg-[#F6F7F4] border border-[#0F2A24]/20 max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#0F2A24]/15 mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#0F2A24]">
              {property ? 'Edit property' : 'Add new property'}
            </h2>
            <p className="text-xs text-[#51625C] mt-0.5">
              All fields validate against the live Firestore blueprint.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close property editor"
            className="w-10 h-10 inline-flex items-center justify-center border border-[#0F2A24]/20 text-[#0F2A24]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="10 Marla Modern Residence in Pak Avenue"
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm outline-none focus:border-[#0F2A24]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-xs font-mono outline-none focus:border-[#0F2A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">Purpose *</label>
              <select
                value={purpose}
                onChange={(e) => {
                  const p = e.target.value as PropertyPurpose;
                  setPurpose(p);
                  if (!property) {
                    setStatus(p === 'rent' ? 'for_rent' : 'for_sale');
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm outline-none"
              >
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">
                Property type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm outline-none"
              >
                <option value="house">House</option>
                <option value="plot">Plot</option>
                <option value="apartment">Apartment</option>
                <option value="shop">Shop</option>
                <option value="office">Office</option>
                <option value="agricultural_land">Agricultural land</option>
                <option value="commercial_building">Commercial building</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">
                Price (PKR) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={pricePkr}
                onChange={(e) => setPricePkr(e.target.value)}
                placeholder="34500000"
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm tabular-nums outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#0F2A24] mb-1">
                  Area size *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={0.1}
                  value={areaSize}
                  onChange={(e) => setAreaSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm tabular-nums outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F2A24] mb-1">Unit *</label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                  className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm outline-none"
                >
                  <option value="marla">Marla</option>
                  <option value="kanal">Kanal</option>
                  <option value="sq_ft">Sq ft</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div>
                <label className="block text-xs font-medium text-[#0F2A24] mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm tabular-nums outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F2A24] mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm tabular-nums outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F2A24] mb-1">Parking</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm tabular-nums outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">
                Address / Area *
              </label>
              <input
                type="text"
                required
                value={addressArea}
                onChange={(e) => setAddressArea(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">Year built</label>
              <input
                type="number"
                min={1950}
                max={2035}
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
                placeholder="2024"
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm tabular-nums outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">
                Latitude (optional)
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="30.6682"
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm tabular-nums outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">
                Longitude (optional)
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="73.1114"
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm tabular-nums outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">
                Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-sm outline-none"
              />
            </div>
          </div>

          {/* Status & Flags */}
          <div className="bg-white border border-[#0F2A24]/12 p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-[#0F2A24] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className="w-full px-2.5 py-2 border border-[#0F2A24]/20 text-xs bg-white"
              >
                <option value="for_sale">For sale</option>
                <option value="for_rent">For rent</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#0F2A24] cursor-pointer">
              <input
                type="checkbox"
                checked={furnished}
                onChange={(e) => setFurnished(e.target.checked)}
              />
              <span>Furnished</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#0F2A24] cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <span>Featured on Home</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#0F2A24] cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <span>Published</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#51625C] cursor-pointer sm:col-span-4">
              <input
                type="checkbox"
                checked={isSample}
                onChange={(e) => setIsSample(e.target.checked)}
              />
              <span>Mark as sample placeholder listing</span>
            </label>
          </div>

          {/* Amenities */}
          <div className="bg-white border border-[#0F2A24]/12 p-4 space-y-3">
            <p className="text-xs font-medium text-[#0F2A24]">Features &amp; amenities</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((item) => {
                const active = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      active
                        ? 'bg-[#0F2A24] text-[#F6F7F4] border-[#0F2A24]'
                        : 'bg-[#F6F7F4] text-[#51625C] border-[#0F2A24]/15'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                placeholder="Add custom feature (e.g. Dual kitchen)..."
                className="flex-1 px-3 py-1.5 border border-[#0F2A24]/20 text-xs outline-none"
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="px-3 py-1.5 border border-[#0F2A24]/20 text-xs font-medium text-[#0F2A24]"
              >
                Add feature
              </button>
            </div>
          </div>

          {/* Multi-Image Upload, Reorder & AI Studio */}
          <div className="bg-white border border-[#0F2A24]/12 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-[#0F2A24]">Property photographs</p>
                <p className="text-[11px] text-[#51625C]">
                  JPG, PNG, or WebP up to 15 MB. Automatically resized &amp; compressed. Drag rows
                  or use arrows to reorder.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5 text-[#B38B52]" aria-hidden="true" />
                <span>Upload photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFilesSelected(e.dataTransfer.files);
              }}
              className={`border border-dashed p-5 text-center text-xs transition-colors ${
                dragOver
                  ? 'border-[#B38B52] bg-[#B38B52]/10 text-[#0F2A24]'
                  : 'border-[#0F2A24]/25 text-[#51625C]'
              }`}
            >
              <ImagePlus className="w-5 h-5 mx-auto mb-1.5 text-[#B38B52]" aria-hidden="true" />
              Drag and drop property photos here
              {uploadProgress !== null && (
                <div className="mt-3 max-w-xs mx-auto">
                  <div className="h-1.5 bg-[#0F2A24]/10 overflow-hidden">
                    <div
                      className="h-full bg-[#B38B52] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] mt-1 tabular-nums">Processing... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* AI Architectural Concept Studio */}
            <div className="border-t border-[#0F2A24]/10 pt-4 space-y-2">
              <p className="text-xs font-medium text-[#0F2A24] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B38B52]" aria-hidden="true" />
                <span>AI Architectural Visualization (gemini-nano-banana-2.1)</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe an architectural render or room staging..."
                  className="flex-1 px-3 py-2 border border-[#0F2A24]/20 text-xs outline-none"
                />
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleGenerateAiImage}
                  className="px-4 py-2 border border-[#0F2A24]/25 text-xs font-medium text-[#0F2A24] hover:border-[#B38B52] disabled:opacity-50 whitespace-nowrap"
                >
                  {aiLoading ? 'Generating...' : 'Generate visual'}
                </button>
              </div>
              {aiError && <p className="text-xs text-amber-800 bg-amber-50 px-3 py-2">{aiError}</p>}
            </div>

            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={`${img.url}-${idx}`}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== idx) {
                        moveImage(dragIndex, idx);
                      }
                      setDragIndex(null);
                    }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-2.5 border border-[#0F2A24]/12 bg-[#F6F7F4]"
                  >
                    <img
                      src={img.url}
                      alt={img.altText || 'Preview'}
                      className="w-24 h-18 object-cover shrink-0 bg-white"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={img.altText}
                        onChange={(e) =>
                          setImages((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, altText: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Descriptive alt text for accessibility and SEO"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#0F2A24]/15 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCoverImage(idx)}
                        className={`px-2.5 py-1.5 text-xs border inline-flex items-center gap-1 ${
                          img.isCover
                            ? 'bg-[#0F2A24] text-[#F6F7F4] border-[#0F2A24]'
                            : 'bg-white text-[#51625C] border-[#0F2A24]/20'
                        }`}
                      >
                        <Star className="w-3 h-3" aria-hidden="true" />
                        <span>{img.isCover ? 'Cover' : 'Set cover'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx - 1)}
                        disabled={idx === 0}
                        aria-label="Move photo up"
                        className="p-1.5 border border-[#0F2A24]/15 bg-white disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx + 1)}
                        disabled={idx === images.length - 1}
                        aria-label="Move photo down"
                        className="p-1.5 border border-[#0F2A24]/15 bg-white disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        aria-label="Delete photo"
                        className="p-1.5 border border-red-200 bg-white text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F2A24]/12">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-[#0F2A24]/20 text-xs font-medium text-[#0F2A24]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium hover:bg-[#0A1E19] disabled:opacity-60"
            >
              {saving ? 'Saving property...' : 'Save property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
