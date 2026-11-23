import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbox, type LightboxItem } from '../components/Lightbox.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useApp } from '../context/AppContext.tsx';
import type { GalleryCategory } from '../types/domain.ts';

const CATEGORIES: Array<'All' | GalleryCategory> = [
  'All',
  'Houses',
  'Plots',
  'Commercial',
  'Projects',
];

export function GalleryPage() {
  const { galleryImages, siteSettings } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'All' | GalleryCategory>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return galleryImages;
    return galleryImages.filter((img) => img.category === selectedCategory);
  }, [galleryImages, selectedCategory]);

  const lightboxItems: LightboxItem[] = useMemo(
    () =>
      filtered.map((item) => ({
        url: item.url,
        alt: item.altText || item.title,
        title: item.title,
        caption: item.caption,
        propertySlug: item.propertySlug || undefined,
      })),
    [filtered]
  );

  return (
    <>
      <SeoHead
        title={`Architecture & Project Gallery — ${siteSettings.businessName}`}
        description="Explore residential homes, plots, commercial facades, and completed project photography in Sahiwal."
      />

      <section className="bg-[#0F2A24] text-[#F6F7F4] py-14 border-b border-[#B38B52]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#B38B52] font-medium mb-2">Visual archive</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">
            Property &amp; project gallery
          </h1>
          <p className="text-sm sm:text-base text-[#F6F7F4]/75 max-w-2xl mt-3">
            Architectural elevations, interior spaces, and residential avenues curated across our
            portfolio.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 bg-[#F6F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <div
            role="tablist"
            aria-label="Filter gallery by category"
            className="flex flex-wrap items-center gap-2 pb-8 border-b border-[#0F2A24]/10 mb-10"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap min-h-[40px] ${
                  selectedCategory === cat
                    ? 'bg-[#0F2A24] text-[#F6F7F4]'
                    : 'bg-white border border-[#0F2A24]/15 text-[#51625C] hover:text-[#0F2A24]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-[#0F2A24]/12 p-12 text-center">
              <p className="font-display text-2xl text-[#0F2A24]">
                No photos in this category yet.
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {filtered.map((item, idx) => (
                <figure
                  key={item.id}
                  className="break-inside-avoid bg-white border border-[#0F2A24]/12 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="block w-full overflow-hidden cursor-zoom-in bg-[#0F2A24]/5"
                  >
                    <img
                      src={item.url}
                      alt={item.altText || item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                    />
                  </button>
                  <figcaption className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#51625C]">
                      <span>{item.category}</span>
                      {item.propertySlug && (
                        <Link
                          to={`/properties/${item.propertySlug}`}
                          className="text-[#B38B52] font-medium hover:underline underline-offset-4"
                        >
                          View property
                        </Link>
                      )}
                    </div>
                    <p className="font-display text-xl font-semibold text-[#0F2A24]">
                      {item.title}
                    </p>
                    {item.caption && (
                      <p className="text-xs text-[#51625C] leading-relaxed">{item.caption}</p>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}
    </>
  );
}
