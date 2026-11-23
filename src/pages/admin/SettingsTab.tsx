import React, { useEffect, useState } from 'react';
import {
  fetchAllProfilesForAdmin,
  saveSiteSettings,
  updateProfileRole,
} from '../../lib/firestoreRepo.ts';
import { siteSettingsSchema } from '../../lib/validation.ts';
import type { SiteSettings, StaffRole, UserProfile } from '../../types/domain.ts';

interface SettingsTabProps {
  currentSettings: SiteSettings;
  onRefresh: () => Promise<void>;
}

export function SettingsTab({ currentSettings, onRefresh }: SettingsTabProps) {
  const [form, setForm] = useState<Omit<SiteSettings, 'updatedAt'>>({
    businessName: currentSettings.businessName,
    address: currentSettings.address,
    phoneDisplay: currentSettings.phoneDisplay,
    phoneInternational: currentSettings.phoneInternational,
    whatsappUrl: currentSettings.whatsappUrl,
    email: currentSettings.email,
    workingHours: currentSettings.workingHours,
    googleRating: currentSettings.googleRating,
    googleReviewCount: currentSettings.googleReviewCount,
    googleMapsUrl: currentSettings.googleMapsUrl,
    heroHeadline: currentSettings.heroHeadline,
    heroSubheadline: currentSettings.heroSubheadline,
    facebookUrl: currentSettings.facebookUrl,
    instagramUrl: currentSettings.instagramUrl,
    linkedinUrl: currentSettings.linkedinUrl,
  });

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAllProfilesForAdmin()
      .then(setProfiles)
      .catch(() => undefined);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');

    const parsed = siteSettingsSchema.safeParse({
      ...form,
      googleRating: Number(form.googleRating),
      googleReviewCount: Number(form.googleReviewCount),
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || 'Check site settings fields.');
      return;
    }

    setSaving(true);
    try {
      await saveSiteSettings(parsed.data);
      await onRefresh();
      setStatusMsg('Site settings saved and applied to the public site.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save site settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (profile: UserProfile, newRole: StaffRole) => {
    await updateProfileRole(profile.uid, newRole, profile.displayName);
    setProfiles((prev) =>
      prev.map((p) => (p.uid === profile.uid ? { ...p, role: newRole } : p))
    );
  };

  return (
    <div className="space-y-10">
      <form onSubmit={handleSave} className="bg-white border border-[#0F2A24]/12 p-6 space-y-5">
        <div>
          <h3 className="font-display text-2xl font-semibold text-[#0F2A24]">Site settings</h3>
          <p className="text-xs text-[#51625C] mt-0.5">
            Update business contact details, working hours, Google rating, and hero copy without
            editing code.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Business name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Phone display</label>
            <input
              type="text"
              value={form.phoneDisplay}
              onChange={(e) => setForm((f) => ({ ...f, phoneDisplay: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">
              Phone international
            </label>
            <input
              type="text"
              value={form.phoneInternational}
              onChange={(e) => setForm((f) => ({ ...f, phoneInternational: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">WhatsApp URL</label>
            <input
              type="url"
              value={form.whatsappUrl}
              onChange={(e) => setForm((f) => ({ ...f, whatsappUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Working hours</label>
            <input
              type="text"
              value={form.workingHours}
              onChange={(e) => setForm((f) => ({ ...f, workingHours: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">
              Google Maps URL
            </label>
            <input
              type="url"
              value={form.googleMapsUrl}
              onChange={(e) => setForm((f) => ({ ...f, googleMapsUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Google rating</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={5}
              value={form.googleRating}
              onChange={(e) => setForm((f) => ({ ...f, googleRating: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">
              Google review count
            </label>
            <input
              type="number"
              min={0}
              value={form.googleReviewCount}
              onChange={(e) =>
                setForm((f) => ({ ...f, googleReviewCount: Number(e.target.value) }))
              }
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs tabular-nums"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Hero headline</label>
            <input
              type="text"
              value={form.heroHeadline}
              onChange={(e) => setForm((f) => ({ ...f, heroHeadline: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">
              Hero supporting copy
            </label>
            <textarea
              rows={2}
              value={form.heroSubheadline}
              onChange={(e) => setForm((f) => ({ ...f, heroSubheadline: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Facebook URL</label>
            <input
              type="url"
              value={form.facebookUrl}
              onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F2A24] mb-1">Instagram URL</label>
            <input
              type="url"
              value={form.instagramUrl}
              onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-[#0F2A24]/20 text-xs"
            />
          </div>
        </div>

        {statusMsg && <p className="text-xs text-[#0F2A24] bg-[#0F2A24]/10 px-3 py-2">{statusMsg}</p>}
        {errorMsg && <p className="text-xs text-red-700 bg-red-50 px-3 py-2">{errorMsg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium disabled:opacity-50"
        >
          {saving ? 'Saving settings...' : 'Save site settings'}
        </button>
      </form>

      {/* Team RBAC Roles */}
      <div className="bg-white border border-[#0F2A24]/12 p-6 space-y-4">
        <div>
          <h3 className="font-display text-2xl font-semibold text-[#0F2A24]">Staff roles</h3>
          <p className="text-xs text-[#51625C] mt-0.5">
            Assign <strong>admin</strong> (full access) or <strong>editor</strong> (properties,
            gallery, and inquiries) to signed-in users.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#0F2A24]/12 text-[#51625C]">
                <th className="py-2.5 px-3 font-medium">Name</th>
                <th className="py-2.5 px-3 font-medium">Email</th>
                <th className="py-2.5 px-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F2A24]/10">
              {profiles.map((prof) => (
                <tr key={prof.uid}>
                  <td className="py-2.5 px-3 font-medium text-[#0F2A24]">{prof.displayName}</td>
                  <td className="py-2.5 px-3 text-[#51625C]">{prof.email}</td>
                  <td className="py-2.5 px-3">
                    <select
                      value={prof.role}
                      onChange={(e) => handleRoleChange(prof, e.target.value as StaffRole)}
                      className="px-2.5 py-1 border border-[#0F2A24]/20 bg-white text-xs"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer (no admin access)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
