import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider, testConnection } from '../lib/firebase.ts';
import {
  createInquiryInFirestore,
  ensureUserProfile,
  fetchPublishedGalleryImages,
  fetchPublishedProperties,
  fetchSiteSettings,
  seedInitialFirestoreData,
} from '../lib/firestoreRepo.ts';
import { DEFAULT_SITE_SETTINGS, SAMPLE_GALLERY, SAMPLE_PROPERTIES } from '../lib/seedData.ts';
import type { GalleryImage, Property, SiteSettings, UserProfile } from '../types/domain.ts';

interface AppContextValue {
  user: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  siteSettings: SiteSettings;
  properties: Property[];
  galleryImages: GalleryImage[];
  loadingPublicData: boolean;
  refreshPublicData: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  submitInquiry: (input: {
    name: string;
    phone: string;
    email: string;
    message: string;
    propertyId?: string;
    propertyTitle?: string;
    sourcePage: string;
    website?: string;
  }) => Promise<{ ok: boolean; emailSent: boolean }>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [properties, setProperties] = useState<Property[]>(SAMPLE_PROPERTIES as Property[]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(SAMPLE_GALLERY as GalleryImage[]);
  const [loadingPublicData, setLoadingPublicData] = useState(true);

  const refreshPublicData = useCallback(async () => {
    setLoadingPublicData(true);
    try {
      const [settings, props, gallery] = await Promise.all([
        fetchSiteSettings(),
        fetchPublishedProperties(),
        fetchPublishedGalleryImages(),
      ]);
      setSiteSettings(settings);
      setProperties(props);
      setGalleryImages(gallery);
    } catch (err) {
      console.error('Public data fetch fallback active:', err);
    } finally {
      setLoadingPublicData(false);
    }
  }, []);

  useEffect(() => {
    testConnection();
    refreshPublicData();
  }, [refreshPublicData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const prof = await ensureUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
          });
          setProfile(prof);
          if (prof.role === 'admin' || prof.role === 'editor') {
            await seedInitialFirestoreData().catch(() => undefined);
            refreshPublicData();
          }
        } catch (err) {
          console.error('Profile sync error:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [refreshPublicData]);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  const submitInquiry = useCallback(
    async (input: {
      name: string;
      phone: string;
      email: string;
      message: string;
      propertyId?: string;
      propertyTitle?: string;
      sourcePage: string;
      website?: string;
    }) => {
      const notifyRes = await fetch('/api/inquiries/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          phone: input.phone,
          email: input.email,
          message: input.message,
          propertyId: input.propertyId || '',
          propertyTitle: input.propertyTitle || '',
          sourcePage: input.sourcePage,
          website: input.website || '',
        }),
      });

      const notifyData = await notifyRes.json();
      if (!notifyRes.ok) {
        throw new Error(notifyData?.error || 'Could not validate inquiry.');
      }

      if (notifyData?.trapped) {
        return { ok: true, emailSent: false };
      }

      await createInquiryInFirestore({
        name: input.name,
        phone: input.phone,
        email: input.email,
        message: input.message,
        propertyId: input.propertyId || '',
        propertyTitle: input.propertyTitle || '',
        sourcePage: input.sourcePage,
      });

      return { ok: true, emailSent: Boolean(notifyData?.email?.sent) };
    },
    []
  );

  const isAdmin =
    Boolean(user?.emailVerified && user.email?.toLowerCase() === 'sa3840213@gmail.com') ||
    profile?.role === 'admin';
  const isStaff = isAdmin || profile?.role === 'editor';

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        authReady,
        isAdmin,
        isStaff,
        siteSettings,
        properties,
        galleryImages,
        loadingPublicData,
        refreshPublicData,
        signInWithGoogle,
        signOutUser,
        submitInquiry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
