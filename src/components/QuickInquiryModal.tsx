import { useEffect } from 'react';
import { X } from 'lucide-react';
import { InquiryForm } from './InquiryForm.tsx';
import { formatPkr } from '../lib/formatters.ts';
import type { Property } from '../types/domain.ts';

interface QuickInquiryModalProps {
  property: Property | null;
  onClose: () => void;
}

export function QuickInquiryModal({ property, onClose }: QuickInquiryModalProps) {
  useEffect(() => {
    if (!property) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [property, onClose]);

  if (!property) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Inquire about ${property.title}`}
      className="fixed inset-0 z-50 bg-[#0A1E19]/75 flex items-center justify-center p-4"
    >
      <div className="bg-[#F6F7F4] border border-[#0F2A24]/20 max-w-xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#0F2A24]/10 mb-5">
          <div>
            <p className="text-xs text-[#51625C]">Property inquiry</p>
            <h2 className="font-display text-2xl font-semibold text-[#0F2A24] mt-0.5">
              {property.title}
            </h2>
            <p className="text-sm font-medium text-[#B38B52] mt-1 tabular-nums">
              {formatPkr(property.pricePkr, property.purpose)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inquiry modal"
            className="w-10 h-10 inline-flex items-center justify-center border border-[#0F2A24]/15 text-[#0F2A24] hover:border-[#0F2A24] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <InquiryForm
          propertyId={property.id}
          propertyTitle={property.title}
          sourcePage="/properties"
        />
      </div>
    </div>
  );
}
