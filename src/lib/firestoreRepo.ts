import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase.ts';
import { handleFirestoreError, OperationType } from './firestoreError.ts';
import { DEFAULT_SITE_SETTINGS, SAMPLE_GALLERY, SAMPLE_PROPERTIES } from './seedData.ts';
import type {
  GalleryImage,
  Inquiry,
  InquiryStatus,
  Property,
  PropertyImage,
  SiteSettings,
  StaffRole,
  UserProfile,
} from '../types/domain.ts';

function newDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${rand}`;
}

// --- Public Queries ---

export async function fetchPublishedProperties(): Promise<Property[]> {
  try {
    const q = query(collection(db, 'properties'), where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) {
      return SAMPLE_PROPERTIES as Property[];
    }
    return snap.docs.map((d) => ({ ...(d.data() as Property), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'properties');
  }
}

export async function fetchAllPropertiesForStaff(): Promise<Property[]> {
  try {
    const snap = await getDocs(collection(db, 'properties'));
    return snap.docs.map((d) => ({ ...(d.data() as Property), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'properties');
  }
}

export async function fetchPropertyImages(propertyId: string): Promise<PropertyImage[]> {
  try {
    const q = query(collection(db, 'property_images'), where('propertyId', '==', propertyId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ ...(d.data() as Omit<PropertyImage, 'id'>), id: d.id }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'property_images');
  }
}

export async function fetchPublishedGalleryImages(): Promise<GalleryImage[]> {
  try {
    const q = query(collection(db, 'gallery_images'), where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) {
      return SAMPLE_GALLERY as GalleryImage[];
    }
    return snap.docs
      .map((d) => ({ ...(d.data() as Omit<GalleryImage, 'id'>), id: d.id }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'gallery_images');
  }
}

export async function fetchAllGalleryImagesForStaff(): Promise<GalleryImage[]> {
  try {
    const snap = await getDocs(collection(db, 'gallery_images'));
    return snap.docs
      .map((d) => ({ ...(d.data() as Omit<GalleryImage, 'id'>), id: d.id }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'gallery_images');
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, 'site_settings', 'main'));
    if (!snap.exists()) {
      return DEFAULT_SITE_SETTINGS;
    }
    return snap.data() as SiteSettings;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'site_settings/main');
  }
}

// --- Public Inquiry Creation ---

export async function createInquiryInFirestore(data: {
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyId: string;
  propertyTitle: string;
  sourcePage: string;
}): Promise<string> {
  const id = newDocId('inq');
  // Only pass propertyId if it actually exists in Firestore (otherwise empty string)
  let validPropertyId = '';
  if (data.propertyId) {
    try {
      const propSnap = await getDoc(doc(db, 'properties', data.propertyId));
      if (propSnap.exists()) {
        validPropertyId = data.propertyId;
      }
    } catch {
      validPropertyId = '';
    }
  }

  try {
    await setDoc(doc(db, 'inquiries', id), {
      name: data.name.slice(0, 120),
      phone: data.phone.slice(0, 30),
      email: data.email.slice(0, 160),
      message: data.message.slice(0, 2500),
      propertyId: validPropertyId,
      propertyTitle: data.propertyTitle.slice(0, 180),
      sourcePage: data.sourcePage.slice(0, 120),
      status: 'new',
      privateNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `inquiries/${id}`);
  }
}

// --- Staff Operations (Admin / Editor) ---

export async function saveProperty(
  property: Omit<Property, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');

  const id = existingId || newDocId('prop');
  const payload = {
    id,
    slug: property.slug,
    title: property.title,
    description: property.description,
    purpose: property.purpose,
    type: property.type,
    pricePkr: Number(property.pricePkr),
    areaSize: Number(property.areaSize),
    areaUnit: property.areaUnit,
    bedrooms: Math.round(Number(property.bedrooms)),
    bathrooms: Math.round(Number(property.bathrooms)),
    parking: Math.round(Number(property.parking)),
    furnished: Boolean(property.furnished),
    yearBuilt: property.yearBuilt ? Math.round(Number(property.yearBuilt)) : null,
    addressArea: property.addressArea,
    latitude: property.latitude !== null && property.latitude !== undefined ? Number(property.latitude) : null,
    longitude: property.longitude !== null && property.longitude !== undefined ? Number(property.longitude) : null,
    amenities: property.amenities.slice(0, 30),
    status: property.status,
    featured: Boolean(property.featured),
    published: Boolean(property.published),
    isSample: Boolean(property.isSample),
    coverImageUrl: property.coverImageUrl,
    coverImageAlt: property.coverImageAlt,
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId) {
      await updateDoc(doc(db, 'properties', existingId), payload);
    } else {
      await setDoc(doc(db, 'properties', id), {
        ...payload,
        createdBy: uid,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (err) {
    handleFirestoreError(
      err,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      `properties/${id}`
    );
  }
}

export async function deletePropertyById(propertyId: string): Promise<void> {
  try {
    // Also clean up attached property_images
    const imgsSnap = await getDocs(
      query(collection(db, 'property_images'), where('propertyId', '==', propertyId))
    );
    const batch = writeBatch(db);
    imgsSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, 'properties', propertyId));
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `properties/${propertyId}`);
  }
}

export async function syncPropertyImages(
  propertyId: string,
  images: Array<{ id?: string; url: string; altText: string; sortOrder: number; isCover: boolean }>
): Promise<void> {
  try {
    const existingSnap = await getDocs(
      query(collection(db, 'property_images'), where('propertyId', '==', propertyId))
    );
    const existingMap = new Map(existingSnap.docs.map((d) => [d.id, d]));
    const keepIds = new Set<string>();

    const batch = writeBatch(db);
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const imgId = img.id && existingMap.has(img.id) ? img.id : newDocId('pimg');
      keepIds.add(imgId);
      const ref = doc(db, 'property_images', imgId);
      if (existingMap.has(imgId)) {
        batch.update(ref, {
          url: img.url.slice(0, 1000),
          altText: (img.altText || 'Property photograph').slice(0, 240),
          sortOrder: i,
          isCover: Boolean(img.isCover),
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(ref, {
          propertyId,
          url: img.url.slice(0, 1000),
          altText: (img.altText || 'Property photograph').slice(0, 240),
          sortOrder: i,
          isCover: Boolean(img.isCover),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    existingSnap.docs.forEach((d) => {
      if (!keepIds.has(d.id)) {
        batch.delete(d.ref);
      }
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `property_images/${propertyId}`);
  }
}

export async function saveGalleryImage(
  item: Omit<GalleryImage, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || newDocId('gal');
  const payload = {
    title: item.title.slice(0, 160),
    caption: item.caption.slice(0, 500),
    category: item.category,
    url: item.url.slice(0, 1000),
    altText: item.altText.slice(0, 240),
    propertyId: item.propertyId.slice(0, 128),
    propertySlug: item.propertySlug.slice(0, 140),
    sortOrder: Math.round(item.sortOrder),
    published: Boolean(item.published),
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId) {
      await updateDoc(doc(db, 'gallery_images', existingId), payload);
    } else {
      await setDoc(doc(db, 'gallery_images', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (err) {
    handleFirestoreError(
      err,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      `gallery_images/${id}`
    );
  }
}

export async function deleteGalleryImageById(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'gallery_images', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `gallery_images/${id}`);
  }
}

export async function fetchInquiriesForStaff(): Promise<Inquiry[]> {
  try {
    const q = query(
      collection(db, 'inquiries'),
      where('status', 'in', ['new', 'contacted', 'closed']),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Omit<Inquiry, 'id'>), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'inquiries');
  }
}

export async function updateInquiryStatusAndNotes(
  id: string,
  status: InquiryStatus,
  privateNotes: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'inquiries', id), {
      status,
      privateNotes: privateNotes.slice(0, 2000),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
  }
}

export async function deleteInquiryById(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'inquiries', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
  }
}

export async function saveSiteSettings(settings: Omit<SiteSettings, 'updatedAt'>): Promise<void> {
  try {
    await setDoc(doc(db, 'site_settings', 'main'), {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_settings/main');
  }
}

export async function ensureUserProfile(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}): Promise<UserProfile> {
  const ref = doc(db, 'profiles', user.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    const isPrimaryAdmin =
      user.emailVerified && user.email?.toLowerCase() === 'sa3840213@gmail.com';
    const role: StaffRole = isPrimaryAdmin ? 'admin' : 'viewer';
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || 'user@example.com',
      displayName: user.displayName || user.email || 'Staff Member',
      role,
    };
    await setDoc(ref, {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `profiles/${user.uid}`);
  }
}

export async function fetchAllProfilesForAdmin(): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, 'profiles'),
      where('role', 'in', ['admin', 'editor', 'viewer'])
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'profiles');
  }
}

export async function updateProfileRole(uid: string, role: StaffRole, displayName: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'profiles', uid), {
      role,
      displayName: displayName.slice(0, 120),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `profiles/${uid}`);
  }
}

export async function seedInitialFirestoreData(): Promise<{ seededProperties: number; seededGallery: number }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Must be signed in to seed data.');

  let seededProperties = 0;
  let seededGallery = 0;

  const existingProps = await getDocs(collection(db, 'properties'));
  if (existingProps.empty) {
    const batch = writeBatch(db);
    for (const p of SAMPLE_PROPERTIES) {
      batch.set(doc(db, 'properties', p.id), {
        ...p,
        createdBy: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      seededProperties++;
    }
    await batch.commit();
  }

  const existingGal = await getDocs(collection(db, 'gallery_images'));
  if (existingGal.empty) {
    const batch = writeBatch(db);
    for (const g of SAMPLE_GALLERY) {
      batch.set(doc(db, 'gallery_images', g.id), {
        ...g,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      seededGallery++;
    }
    await batch.commit();
  }

  const settingsSnap = await getDoc(doc(db, 'site_settings', 'main'));
  if (!settingsSnap.exists()) {
    await saveSiteSettings(DEFAULT_SITE_SETTINGS);
  }

  return { seededProperties, seededGallery };
}
