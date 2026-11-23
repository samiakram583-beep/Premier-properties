import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { inquirySchema } from '../lib/validation.ts';

interface InquiryFormProps {
  propertyId?: string;
  propertyTitle?: string;
  sourcePage: string;
  onSuccess?: () => void;
}

export function InquiryForm({
  propertyId = '',
  propertyTitle = '',
  sourcePage,
  onSuccess,
}: InquiryFormProps) {
  const { submitInquiry } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    propertyTitle
      ? `I would like more information and viewing availability for "${propertyTitle}".`
      : ''
  );
  const [website, setWebsite] = useState(''); // Honeypot
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const parsed = inquirySchema.safeParse({
      name,
      phone,
      email,
      message,
      propertyId,
      propertyTitle,
      sourcePage,
      website,
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || 'Please check the form fields.');
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry({
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        message: parsed.data.message,
        propertyId: parsed.data.propertyId,
        propertyTitle: parsed.data.propertyTitle,
        sourcePage: parsed.data.sourcePage,
        website: parsed.data.website,
      });
      setSuccessMsg(
        'Your inquiry has been received. Our team will reach out shortly via phone or WhatsApp.'
      );
      setName('');
      setPhone('');
      setEmail('');
      if (!propertyTitle) setMessage('');
      onSuccess?.();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to send your inquiry right now. Please call 0300 0061397.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div className="bg-[#0F2A24]/5 border border-[#0F2A24]/15 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#0F2A24] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium text-[#0F2A24]">Inquiry recorded</p>
            <p className="text-sm text-[#51625C] mt-1">{successMsg}</p>
            <button
              type="button"
              onClick={() => setSuccessMsg('')}
              className="mt-4 text-xs font-medium text-[#0F2A24] underline underline-offset-4"
            >
              Send another inquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {propertyTitle && (
        <div className="text-xs text-[#51625C] pb-2 border-b border-[#0F2A24]/10">
          Regarding: <span className="font-medium text-[#0F2A24]">{propertyTitle}</span>
        </div>
      )}

      {/* Honeypot anti-spam field */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`website-${sourcePage}`}>Website</label>
        <input
          id={`website-${sourcePage}`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`inq-name-${sourcePage}`} className="block text-xs font-medium text-[#0F2A24] mb-1.5">
            Full name *
          </label>
          <input
            id={`inq-name-${sourcePage}`}
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tariq Mahmood"
            className="w-full px-3.5 py-2.5 bg-white border border-[#0F2A24]/20 text-sm text-[#0F2A24] placeholder:text-[#51625C]/60 focus:border-[#0F2A24] outline-none"
          />
        </div>

        <div>
          <label htmlFor={`inq-phone-${sourcePage}`} className="block text-xs font-medium text-[#0F2A24] mb-1.5">
            Phone / WhatsApp *
          </label>
          <input
            id={`inq-phone-${sourcePage}`}
            type="tel"
            required
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300 0000000"
            className="w-full px-3.5 py-2.5 bg-white border border-[#0F2A24]/20 text-sm text-[#0F2A24] placeholder:text-[#51625C]/60 focus:border-[#0F2A24] outline-none tabular-nums"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`inq-email-${sourcePage}`} className="block text-xs font-medium text-[#0F2A24] mb-1.5">
          Email address (optional)
        </label>
        <input
          id={`inq-email-${sourcePage}`}
          type="email"
          maxLength={160}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full px-3.5 py-2.5 bg-white border border-[#0F2A24]/20 text-sm text-[#0F2A24] placeholder:text-[#51625C]/60 focus:border-[#0F2A24] outline-none"
        />
      </div>

      <div>
        <label htmlFor={`inq-message-${sourcePage}`} className="block text-xs font-medium text-[#0F2A24] mb-1.5">
          Message *
        </label>
        <textarea
          id={`inq-message-${sourcePage}`}
          required
          rows={4}
          maxLength={2500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your requirements, preferred viewing time, or questions."
          className="w-full px-3.5 py-2.5 bg-white border border-[#0F2A24]/20 text-sm text-[#0F2A24] placeholder:text-[#51625C]/60 focus:border-[#0F2A24] outline-none resize-y"
        />
      </div>

      {errorMsg && (
        <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-6 py-3 bg-[#0F2A24] text-[#F6F7F4] text-sm font-medium hover:bg-[#0A1E19] disabled:opacity-60 transition-colors min-h-[44px]"
      >
        {submitting
          ? 'Sending inquiry...'
          : propertyTitle
            ? 'Inquire about this property'
            : 'Send inquiry'}
      </button>
    </form>
  );
}
