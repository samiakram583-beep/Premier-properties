import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Copy,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import {
  deletePropertyById,
  fetchAllGalleryImagesForStaff,
  fetchAllPropertiesForStaff,
  fetchInquiriesForStaff,
  saveProperty,
} from '../../lib/firestoreRepo.ts';
import { formatPkr, formatPropertyStatus, formatTimestamp, toDateObj } from '../../lib/formatters.ts';
import type { GalleryImage, Inquiry, Property, PropertyStatus } from '../../types/domain.ts';
import { GalleryTab } from './GalleryTab.tsx';
import { InquiriesTab } from './InquiriesTab.tsx';
import { PropertyEditorModal } from './PropertyEditorModal.tsx';
import { SettingsTab } from './SettingsTab.tsx';

type AdminTab = 'dashboard' | 'properties' | 'gallery' | 'inquiries' | 'settings';

export function AdminPage() {
  const {
    user,
    profile,
    authReady,
    isAdmin,
    isStaff,
    siteSettings,
    signInWithGoogle,
    signOutUser,
    refreshPublicData,
  } = useApp();

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [staffProperties, setStaffProperties] = useState<Property[]>([]);
  const [staffGallery, setStaffGallery] = useState<GalleryImage[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);

  // Properties table filters
  const [propSearch, setPropSearch] = useState('');
  const [propStatusFilter, setPropStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [propPage, setPropPage] = useState(1);
  const [editingProperty, setEditingProperty] = useState<Property | null | 'new'>(null);

  const loadAdminData = useCallback(async () => {
    if (!isStaff) return;
    setLoading(true);
    try {
      const [props, gals, inqs] = await Promise.all([
        fetchAllPropertiesForStaff(),
        fetchAllGalleryImagesForStaff(),
        fetchInquiriesForStaff(),
      ]);
      setStaffProperties(props);
      setStaffGallery(gals);
      setInquiries(inqs);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleRefreshAll = async () => {
    await Promise.all([loadAdminData(), refreshPublicData()]);
  };

  // Dashboard counts
  const dashboardStats = useMemo(() => {
    const totalProps = staffProperties.length;
    const availableProps = staffProperties.filter(
      (p) => p.status === 'for_sale' || p.status === 'for_rent'
    ).length;
    const closedProps = staffProperties.filter(
      (p) => p.status === 'sold' || p.status === 'rented'
    ).length;
    const newInquiries = inquiries.filter((i) => i.status === 'new').length;
    const now = new Date();
    const inquiriesThisMonth = inquiries.filter((i) => {
      const d = toDateObj(i.createdAt);
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { totalProps, availableProps, closedProps, newInquiries, inquiriesThisMonth };
  }, [staffProperties, inquiries]);

  const filteredProperties = useMemo(() => {
    const q = propSearch.trim().toLowerCase();
    return staffProperties.filter((p) => {
      if (propStatusFilter !== 'all' && p.status !== propStatusFilter) return false;
      if (q && !`${p.title} ${p.addressArea} ${p.slug}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [staffProperties, propSearch, propStatusFilter]);

  const pagedProperties = filteredProperties.slice((propPage - 1) * 10, propPage * 10);

  const handleQuickStatusChange = async (prop: Property, newStatus: PropertyStatus) => {
    await saveProperty(
      {
        slug: prop.slug,
        title: prop.title,
        description: prop.description,
        purpose: prop.purpose,
        type: prop.type,
        pricePkr: prop.pricePkr,
        areaSize: prop.areaSize,
        areaUnit: prop.areaUnit,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        parking: prop.parking,
        furnished: prop.furnished,
        yearBuilt: prop.yearBuilt ?? null,
        addressArea: prop.addressArea,
        latitude: prop.latitude ?? null,
        longitude: prop.longitude ?? null,
        amenities: prop.amenities,
        status: newStatus,
        featured: prop.featured,
        published: prop.published,
        isSample: prop.isSample,
        coverImageUrl: prop.coverImageUrl,
        coverImageAlt: prop.coverImageAlt,
      },
      prop.id
    );
    await handleRefreshAll();
  };

  const handleDuplicateProperty = async (prop: Property) => {
    await saveProperty({
      slug: `${prop.slug}-copy-${Date.now().toString().slice(-4)}`,
      title: `${prop.title} (Copy)`,
      description: prop.description,
      purpose: prop.purpose,
      type: prop.type,
      pricePkr: prop.pricePkr,
      areaSize: prop.areaSize,
      areaUnit: prop.areaUnit,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      parking: prop.parking,
      furnished: prop.furnished,
      yearBuilt: prop.yearBuilt ?? null,
      addressArea: prop.addressArea,
      latitude: prop.latitude ?? null,
      longitude: prop.longitude ?? null,
      amenities: prop.amenities,
      status: prop.status,
      featured: false,
      published: false,
      isSample: prop.isSample,
      coverImageUrl: prop.coverImageUrl,
      coverImageAlt: prop.coverImageAlt,
    });
    await handleRefreshAll();
  };

  const handleDeleteProperty = async (prop: Property) => {
    if (!window.confirm(`Delete "${prop.title}" permanently?`)) return;
    await deletePropertyById(prop.id);
    await handleRefreshAll();
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F6F7F4] flex items-center justify-center text-sm text-[#51625C]">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F2A24] text-[#F6F7F4] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#F6F7F4] text-[#0F2A24] p-8 border border-[#B38B52]/40 space-y-6">
          <div>
            <p className="text-xs text-[#B38B52] font-medium">Staff portal</p>
            <h1 className="font-display text-3xl font-semibold mt-1">
              Premier Property Admin
            </h1>
            <p className="text-xs text-[#51625C] mt-2 leading-relaxed">
              Sign in with your authorized Google account to manage listings, gallery photographs,
              client inquiries, and site settings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full py-3 bg-[#0F2A24] text-[#F6F7F4] text-sm font-medium hover:bg-[#0A1E19] transition-colors"
          >
            Sign in with Google
          </button>

          <div className="pt-2 border-t border-[#0F2A24]/10 flex justify-between text-xs text-[#51625C]">
            <Link to="/" className="hover:text-[#0F2A24] underline underline-offset-4">
              Return to public site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-[#F6F7F4] text-[#0F2A24] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#0F2A24]/15 p-8 space-y-5">
          <h1 className="font-display text-3xl font-semibold">Access pending approval</h1>
          <p className="text-sm text-[#51625C] leading-relaxed">
            Signed in as <strong>{user.email}</strong> (role: <strong>{profile?.role || 'viewer'}</strong>).
            An administrator must assign you the <strong>editor</strong> or <strong>admin</strong> role before you can access the workspace.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => signOutUser()}
              className="px-4 py-2 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium"
            >
              Sign out
            </button>
            <Link to="/" className="text-xs text-[#51625C] underline underline-offset-4">
              Return to public site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'settings', label: 'Settings & Team', icon: Settings, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-[#0F2A24] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-[#0F2A24] text-[#F6F7F4] shrink-0 flex flex-col justify-between p-5 border-r border-[#B38B52]/20">
        <div className="space-y-6">
          <div className="pb-4 border-b border-white/10">
            <Link to="/" className="font-display text-xl font-semibold text-white block">
              Premier Property
            </Link>
            <p className="text-[11px] text-[#B38B52] mt-1">
              {isAdmin ? 'Administrator' : 'Editor'} · {user.email}
            </p>
          </div>

          <nav className="space-y-1">
            {navItems
              .filter((n) => !n.adminOnly || isAdmin)
              .map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-colors text-left ${
                      active
                        ? 'bg-[#B38B52] text-[#0F2A24]'
                        : 'text-[#F6F7F4]/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        <div className="pt-6 mt-6 border-t border-white/10 space-y-2 text-xs">
          <Link
            to="/"
            className="block px-3 py-2 text-[#F6F7F4]/75 hover:text-white"
          >
            View public website
          </Link>
          <button
            type="button"
            onClick={() => signOutUser()}
            className="w-full flex items-center gap-2 px-3 py-2 text-[#F6F7F4]/75 hover:text-white text-left"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 min-w-0">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#0F2A24]/12">
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#0F2A24] capitalize">
                {tab === 'settings' ? 'Site settings & team' : tab}
              </h1>
              <p className="text-xs text-[#51625C] mt-0.5">{siteSettings.businessName}</p>
            </div>
            {(tab === 'dashboard' || tab === 'properties') && (
              <button
                type="button"
                onClick={() => setEditingProperty('new')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F2A24] text-[#F6F7F4] text-xs font-medium hover:bg-[#0A1E19] whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-[#B38B52]" aria-hidden="true" />
                <span>Add property</span>
              </button>
            )}
          </div>

          {loading && (
            <p className="text-xs text-[#51625C]">Refreshing records...</p>
          )}

          {tab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-[#0F2A24]/12 p-4">
                  <p className="text-xs text-[#51625C]">Total properties</p>
                  <p className="font-display text-3xl font-semibold text-[#0F2A24] mt-1 tabular-nums">
                    {dashboardStats.totalProps}
                  </p>
                </div>
                <div className="bg-white border border-[#0F2A24]/12 p-4">
                  <p className="text-xs text-[#51625C]">Available</p>
                  <p className="font-display text-3xl font-semibold text-[#0F2A24] mt-1 tabular-nums">
                    {dashboardStats.availableProps}
                  </p>
                </div>
                <div className="bg-white border border-[#0F2A24]/12 p-4">
                  <p className="text-xs text-[#51625C]">Sold / rented</p>
                  <p className="font-display text-3xl font-semibold text-[#0F2A24] mt-1 tabular-nums">
                    {dashboardStats.closedProps}
                  </p>
                </div>
                <div className="bg-white border border-[#0F2A24]/12 p-4">
                  <p className="text-xs text-[#51625C]">New inquiries</p>
                  <p className="font-display text-3xl font-semibold text-[#B38B52] mt-1 tabular-nums">
                    {dashboardStats.newInquiries}
                  </p>
                </div>
                <div className="bg-white border border-[#0F2A24]/12 p-4">
                  <p className="text-xs text-[#51625C]">Inquiries this month</p>
                  <p className="font-display text-3xl font-semibold text-[#0F2A24] mt-1 tabular-nums">
                    {dashboardStats.inquiriesThisMonth}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#0F2A24]/12">
                <div className="px-5 py-4 border-b border-[#0F2A24]/10 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-[#0F2A24]">
                    5 most recent inquiries
                  </h2>
                  <button
                    type="button"
                    onClick={() => setTab('inquiries')}
                    className="text-xs font-medium text-[#B38B52] hover:underline"
                  >
                    Manage all inquiries
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#0F2A24]/10 text-[#51625C] bg-[#F6F7F4]">
                        <th className="py-2.5 px-4 font-medium">Date</th>
                        <th className="py-2.5 px-4 font-medium">Name</th>
                        <th className="py-2.5 px-4 font-medium">Phone</th>
                        <th className="py-2.5 px-4 font-medium">Property</th>
                        <th className="py-2.5 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0F2A24]/10">
                      {inquiries.slice(0, 5).map((inq) => (
                        <tr key={inq.id}>
                          <td className="py-2.5 px-4 tabular-nums text-[#51625C]">
                            {formatTimestamp(inq.createdAt)}
                          </td>
                          <td className="py-2.5 px-4 font-medium">{inq.name}</td>
                          <td className="py-2.5 px-4 tabular-nums">{inq.phone}</td>
                          <td className="py-2.5 px-4 text-[#51625C]">
                            {inq.propertyTitle || 'General Inquiry'}
                          </td>
                          <td className="py-2.5 px-4 capitalize">{inq.status}</td>
                        </tr>
                      ))}
                      {inquiries.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[#51625C]">
                            No inquiries received yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'properties' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={propSearch}
                  onChange={(e) => {
                    setPropSearch(e.target.value);
                    setPropPage(1);
                  }}
                  placeholder="Search properties by title or area..."
                  className="px-3 py-2 bg-white border border-[#0F2A24]/20 text-xs w-full sm:w-72"
                />
                <select
                  value={propStatusFilter}
                  onChange={(e) => {
                    setPropStatusFilter(e.target.value as 'all' | PropertyStatus);
                    setPropPage(1);
                  }}
                  className="px-3 py-2 bg-white border border-[#0F2A24]/20 text-xs"
                >
                  <option value="all">All statuses</option>
                  <option value="for_sale">For sale</option>
                  <option value="for_rent">For rent</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>

              <div className="bg-white border border-[#0F2A24]/12 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#0F2A24]/12 bg-[#F6F7F4] text-[#51625C]">
                      <th className="py-3 px-4 font-medium">Property</th>
                      <th className="py-3 px-4 font-medium">Price</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium">Visibility</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0F2A24]/10">
                    {pagedProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-[#F6F7F4]/50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-[#0F2A24]">
                            {prop.title}{' '}
                            {prop.isSample && (
                              <span className="text-[11px] text-[#B38B52]">(Sample)</span>
                            )}
                          </p>
                          <p className="text-[11px] text-[#51625C]">{prop.addressArea}</p>
                        </td>
                        <td className="py-3 px-4 tabular-nums whitespace-nowrap">
                          {formatPkr(prop.pricePkr, prop.purpose)}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={prop.status}
                            aria-label={`Change status for ${prop.title}`}
                            onChange={(e) =>
                              handleQuickStatusChange(prop, e.target.value as PropertyStatus)
                            }
                            className="px-2 py-1 border border-[#0F2A24]/20 bg-white text-xs"
                          >
                            <option value="for_sale">{formatPropertyStatus('for_sale')}</option>
                            <option value="for_rent">{formatPropertyStatus('for_rent')}</option>
                            <option value="sold">{formatPropertyStatus('sold')}</option>
                            <option value="rented">{formatPropertyStatus('rented')}</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-[#51625C]">
                          {prop.published ? 'Published' : 'Draft'}
                          {prop.featured ? ' · Featured' : ''}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-3">
                          <button
                            type="button"
                            onClick={() => setEditingProperty(prop)}
                            className="text-[#0F2A24] font-medium hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateProperty(prop)}
                            title="Duplicate"
                            className="text-[#51625C] hover:text-[#0F2A24] inline-flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" aria-hidden="true" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProperty(prop)}
                            className="text-red-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" aria-hidden="true" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'gallery' && (
            <GalleryTab
              gallery={staffGallery}
              properties={staffProperties}
              onRefresh={handleRefreshAll}
            />
          )}

          {tab === 'inquiries' && (
            <InquiriesTab
              inquiries={inquiries}
              properties={staffProperties}
              onRefresh={handleRefreshAll}
            />
          )}

          {tab === 'settings' && isAdmin && (
            <SettingsTab currentSettings={siteSettings} onRefresh={handleRefreshAll} />
          )}
        </div>
      </main>

      {editingProperty !== null && (
        <PropertyEditorModal
          property={editingProperty === 'new' ? null : editingProperty}
          onClose={() => setEditingProperty(null)}
          onSaved={handleRefreshAll}
        />
      )}
    </div>
  );
}
