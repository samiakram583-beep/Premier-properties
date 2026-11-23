import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxItem {
  url: string;
  alt: string;
  title?: string;
  caption?: string;
  propertySlug?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onChangeIndex: (newIndex: number) => void;
}

export function Lightbox({ items, index, onClose, onChangeIndex }: LightboxProps) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChangeIndex((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onChangeIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, items.length, onClose, onChangeIndex]);

  const current = items[index];
  if (!current) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (delta > 50) {
      onChangeIndex((index - 1 + items.length) % items.length);
    } else if (delta < -50) {
      onChangeIndex((index + 1) % items.length);
    }
    touchStartX.current = null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-50 bg-[#0A1E19]/95 text-[#F6F7F4] flex flex-col justify-between p-4 sm:p-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-[#F6F7F4]/70 tabular-nums">
          {index + 1} / {items.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="w-11 h-11 inline-flex items-center justify-center border border-white/20 hover:border-[#B38B52] text-[#F6F7F4]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center my-4 min-h-0">
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((index - 1 + items.length) % items.length)}
            aria-label="Previous photo"
            className="hidden sm:inline-flex items-center justify-center w-11 h-11 border border-white/20 hover:border-[#B38B52] mr-4 shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <img
          src={current.url}
          alt={current.alt}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain select-none"
        />

        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((index + 1) % items.length)}
            aria-label="Next photo"
            className="hidden sm:inline-flex items-center justify-center w-11 h-11 border border-white/20 hover:border-[#B38B52] ml-4 shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/15 pt-4">
        <div>
          {current.title && <p className="font-display text-lg text-white">{current.title}</p>}
          {current.caption && <p className="text-xs text-[#F6F7F4]/75 mt-0.5">{current.caption}</p>}
        </div>
        {current.propertySlug && (
          <Link
            to={`/properties/${current.propertySlug}`}
            onClick={onClose}
            className="text-xs font-medium text-[#B38B52] hover:underline underline-offset-4 whitespace-nowrap"
          >
            View attached property
          </Link>
        )}
      </div>
    </div>
  );
}
