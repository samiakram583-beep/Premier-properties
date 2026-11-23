import { useMemo, useState } from 'react';
import { Download, MessageCircle, Phone, Trash2, X } from 'lucide-react';
import { deleteInquiryById, updateInquiryStatusAndNotes } from '../../lib/firestoreRepo.ts';
import { buildWhatsAppLink, formatTimestamp, sanitizeSafeHref, toDateObj } from '../../lib/formatters.ts';
import type { Inquiry, InquiryStatus, Property } from '../../types/domain.ts';

interface InquiriesTabProps {
  inquiries: Inquiry[];
  properties: Property[];
  onRefresh: () => Promise<void>;
}

export function InquiriesTab({ inquiries, properties, onRefresh }: InquiriesTabProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<InquiryStatus>('new');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const now = Date.now();
    return inquiries.filter((inq) => {
      if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
      if (propertyFilter !== 'all' && inq.propertyId !== propertyFilter) return false;
      if (dateFilter !== 'all') {
        const d = toDateObj(inq.createdAt);
        if (d) {
          const ageDays = (now - d.getTime()) / (1000 * 60 * 60 * 24);
          if (dateFilter === '7d' && ageDays > 7) return false;
          if (dateFilter === '30d' && ageDays > 30) return false;
        }
      }
      return true;
    });
  }, [inquiries, statusFilter, propertyFilter, dateFilter]);

  const openDetail = (inq: Inquiry) => {
    setSelected(inq);
    setNotesDraft(inq.privateNotes || '');
    setStatusDraft(inq.status);
  };

  const handleSaveDetail = async (nextStatus?: InquiryStatus) => {
    if (!selected) return;
    const targetStatus = nextStatus || statusDraft;
    setSaving(true);
    try {
      await updateInquiryStatusAndNotes(selected.id, targetStatus, notesDraft);
      await onRefresh();
      setSelected((prev) =>
        prev ? { ...prev, status: targetStatus, privateNotes: notesDraft } : null
      );
      setStatusDraft(targetStatus);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    await deleteInquiryById(id);
    if (selected?.id === id) setSelected(null);
    await onRefresh();
  };

  const exportCsv = () => {
    const headers = ['Date', 'Name', 'Phone', 'Email', 'Property', 'Source', 'Status', 'Message', 'Private Notes'];
    const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
    const rows = filtered.map((inq) =>
      [
        formatTimestamp(inq.createdAt),
        inq.name,
        inq.phone,
        inq.email,
        inq.propertyTitle || 'General Inquiry',
        inq.sourcePage,
        inq.status,
        inq.message,
        inq.privateNotes,
      ]
        .map(escape)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `premier-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | InquiryStatus)}
            aria-label="Filter inquiries by status"
            className="px-3 py-2 bg-white border border-[#0F2A24]/20 text-xs"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            aria-label="Filter inquiries by property"
            className="px-3 py-2 bg-white border border-[#0F2A24]/20 text-xs max-w-[240px]"
          >
            <option value="all">All properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'all' | '7d' | '30d')}
            aria-label="Filter inquiries by date"
            className="px-3 py-2 bg-white border border-[#0F2A24]/20 text-xs"
          >
            <option value="all">All dates</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#0F2A24]/25 bg-white text-xs font-medium text-[#0F2A24] hover:border-[#0F2A24]"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white border border-[#0F2A24]/12 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#0F2A24]/12 text-[#51625C] bg-[#F6F7F4]">
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Client</th>
              <th className="py-3 px-4 font-medium">Phone</th>
              <th className="py-3 px-4 font-medium">Property</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0F2A24]/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#51625C]">
                  No inquiries match your current filters.
                </td>
              </tr>
            ) : (
              filtered.map((inq) => (
                <tr key={inq.id} className="hover:bg-[#F6F7F4]/60">
                  <td className="py-3 px-4 tabular-nums text-[#51625C] whitespace-nowrap">
                    {formatTimestamp(inq.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#0F2A24]">{inq.name}</td>
                  <td className="py-3 px-4 tabular-nums text-[#0F2A24]">{inq.phone}</td>
                  <td className="py-3 px-4 text-[#51625C] max-w-[220px] truncate">
                    {inq.propertyTitle || 'General Inquiry'}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-medium ${
                        inq.status === 'new'
                          ? 'bg-[#B38B52]/20 text-[#0F2A24]'
                          : inq.status === 'contacted'
                            ? 'bg-[#0F2A24]/10 text-[#0F2A24]'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openDetail(inq)}
                      className="text-[#0F2A24] font-medium underline underline-offset-4 mr-3"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(inq.id)}
                      aria-label={`Delete inquiry from ${inq.name}`}
                      className="text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Inquiry from ${selected.name}`}
          className="fixed inset-0 z-50 bg-[#0A1E19]/75 flex items-center justify-end"
        >
          <div className="bg-[#F6F7F4] w-full max-w-lg h-full overflow-y-auto p-6 sm:p-8 border-l border-[#0F2A24]/20 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#0F2A24]/12">
                <div>
                  <p className="text-xs text-[#51625C]">
                    Received {formatTimestamp(selected.createdAt)} · {selected.sourcePage}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-[#0F2A24] mt-1">
                    {selected.name}
                  </h3>
                  <p className="text-sm text-[#0F2A24] tabular-nums mt-0.5">{selected.phone}</p>
                  {selected.email && (
                    <p className="text-xs text-[#51625C] mt-0.5">{selected.email}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close inquiry drawer"
                  className="p-2 border border-[#0F2A24]/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={sanitizeSafeHref(`tel:${selected.phone.replace(/\s+/g, '')}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B38B52]" aria-hidden="true" />
                  <span>Call client</span>
                </a>
                <a
                  href={sanitizeSafeHref(
                    buildWhatsAppLink(
                      `https://wa.me/${selected.phone.replace(/[^0-9]/g, '').replace(/^0/, '92')}`,
                      `Assalam-o-Alaikum ${selected.name}, this is Premier Property Management & Development regarding ${selected.propertyTitle || 'your inquiry'}.`
                    )
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#0F2A24]/25 bg-white text-[#0F2A24] text-xs font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#B38B52]" aria-hidden="true" />
                  <span>WhatsApp reply</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleSaveDetail('contacted')}
                  disabled={saving}
                  className="px-4 py-2 border border-[#0F2A24]/25 bg-white text-xs font-medium text-[#0F2A24]"
                >
                  Mark as contacted
                </button>
              </div>

              <div className="bg-white border border-[#0F2A24]/12 p-4 space-y-2">
                <p className="text-xs font-medium text-[#51625C]">
                  Property: {selected.propertyTitle || 'General inquiry'}
                </p>
                <p className="text-sm text-[#0F2A24] whitespace-pre-line leading-relaxed">
                  {selected.message}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F2A24] mb-1">Status</label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value as InquiryStatus)}
                    className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-xs"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F2A24] mb-1">
                    Private staff notes
                  </label>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Record call outcomes, viewing schedule, or follow-up notes..."
                    className="w-full px-3 py-2 bg-white border border-[#0F2A24]/20 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#0F2A24]/12 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDelete(selected.id)}
                className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Delete inquiry</span>
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveDetail()}
                className="px-5 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
