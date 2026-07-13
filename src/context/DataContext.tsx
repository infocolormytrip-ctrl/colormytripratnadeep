import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth, isPlaceholder } from '../lib/firebase';
import { isAuthorizedAdminEmail, isAuthorizedAffiliateEmail, resolveRoleByUid, AUTHORIZED_AFFILIATE_EMAILS } from '../lib/role';
import { isPromoValid, calculateCommission } from '../lib/affiliate';
import { Role } from '../types/affiliate';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  limit,
  setDoc
} from 'firebase/firestore';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  TravelPackage,
  Enquiry,
  Booking,
  BlogPost,
  Review,
  VideoTestimonial,
  OfferMarqueeItem,
  CustomTemplate,
  ScheduledEmail,
  VendorPayment,
  MasterVendor
} from '../types';
import { Affiliate, AffiliateStatus, ActivityLogEntry, PromoCode, CommissionRecord, NotificationItem } from '../types/affiliate';
import {
  initialPackages,
  initialBlogs,
  initialReviews,
  initialVideoTestimonials,
  initialOffers
} from '../initialData';

import {
  SiteFooterSettings,
  AboutSettings,
  ContactSettings,
  SiteBrandSettings,
  NetaTagsSettings,
} from '../types/siteSettings';
import { ToastContainer } from '../components/SlickToast';
// Firestore Error Logging Requirements
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: (auth?.currentUser?.emailVerified ?? null) as boolean | null,
      isAnonymous: (auth?.currentUser?.isAnonymous ?? null) as boolean | null,
    },
    operationType,
    path,
  };
  // For real-time listeners (list operations), only warn — never throw.
  // Throwing inside onSnapshot error callbacks kills the listener permanently
  // and prevents Firestore from retrying after auth propagation settles.
  if (operationType === OperationType.LIST) {
    console.warn('Firestore listener permission error (will retry):', JSON.stringify(errInfo));
    return;
  }
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface DataContextType {
  packages: TravelPackage[];
  blogs: BlogPost[];
  enquiries: Enquiry[];
  bookings: Booking[];
  commissions: CommissionRecord[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: (userType: 'admin' | 'affiliate', affId?: string) => Promise<void>;
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  deleteReview: (id: string) => Promise<void>;
  videoTestimonials: VideoTestimonial[];
  offers: OfferMarqueeItem[];
  customTemplates: CustomTemplate[];
  scheduledEmails: ScheduledEmail[];
  saveCustomTemplate: (template: Omit<CustomTemplate, 'id' | 'createdAt'>) => Promise<CustomTemplate>;
  deleteCustomTemplate: (id: string) => Promise<void>;
  scheduleEmail: (email: Omit<ScheduledEmail, 'id' | 'createdAt' | 'status'>) => Promise<ScheduledEmail>;
  deleteScheduledEmail: (id: string) => Promise<void>;
  updateScheduledEmailStatus: (id: string, status: 'sent' | 'failed', error?: string) => Promise<void>;
  adminUser: User | null;
  isAdminLoggedIn: boolean;
  role: Role;
  affiliateId?: string;
  affiliateProfile: Affiliate | null;

  isFirebaseActive: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  localAdminBypass: () => void;
  localAffiliateBypass: () => void;
  logout: () => Promise<void>;

  validatePromoCode: (
    code: string,
    packageId?: string
  ) => Promise<
    | {
      valid: true;
      promo: {
        code: string;
        affiliateId?: string;
        affiliateEmail?: string;
        affiliateName?: string;
        commissionType?: 'Percentage' | 'Fixed Amount' | string;
        commissionValue?: number;
      };
    }
    | { valid: false; reason?: string }
  >;

  // CMS - siteSettings (loaded from Firestore, with local fallback)
  footerSettings: SiteFooterSettings;
  aboutSettings: AboutSettings;
  contactSettings: ContactSettings;
  siteBrandSettings: SiteBrandSettings;
  netaTagsSettings: NetaTagsSettings;

  updateFooterSettings: (data: SiteFooterSettings) => Promise<void>;
  updateAboutSettings: (data: AboutSettings) => Promise<void>;
  updateContactSettings: (data: ContactSettings) => Promise<void>;
  updateSiteBrandSettings: (data: SiteBrandSettings) => Promise<void>;
  updateNetaTagsSettings: (data: NetaTagsSettings) => Promise<void>;


  addEnquiry: (enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'> & { estimatedBookingAmount?: number; status?: string; bookingStatus?: string }) => Promise<Enquiry>;
  updateEnquiryStatus: (id: string, status: 'pending' | 'responded' | 'closed') => Promise<void>;
  updateEnquiryFields: (id: string, updates: Partial<Enquiry>) => Promise<void>;

  // Phase 3 booking workflow
  convertEnquiryToBooking: (
    enquiryId: string,
    payload: {
      bookingAmount: number;
      bookingDate: string;
      travelDate?: string;
      paymentStatus?: 'Unpaid' | 'Paid';
      remarks?: string;
      bookingStatus?: NonNullable<Enquiry['bookingStatus']>;
      // optional override commission
      commissionAmount?: number;
    }
  ) => Promise<void>;
  updateBookingStatus: (
    enquiryId: string,
    payload: {
      bookingAmount?: number;
      bookingDate?: string;
      travelDate?: string;
      paymentStatus?: 'Unpaid' | 'Paid';
      remarks?: string;
      bookingStatus?: NonNullable<Enquiry['bookingStatus']>;
      commissionAmount?: number;
    }
  ) => Promise<void>;
  appendNotification: (
    title: string,
    message: string,
    type?: 'info' | 'warning' | 'success' | 'error',
    affiliateId?: string,
    userUid?: string
  ) => Promise<void>;

  deleteEnquiry: (id: string) => Promise<void>;
  createPackage: (pkg: Omit<TravelPackage, 'id'>) => Promise<TravelPackage>;
  updatePackage: (id: string, pkg: Partial<TravelPackage>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  createBlog: (post: Omit<BlogPost, 'id' | 'createdAt'>) => Promise<BlogPost>;
  updateBlog: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addVideoTestimonial: (
    video: Omit<VideoTestimonial, 'id' | 'createdAt'>
  ) => Promise<VideoTestimonial>;
  deleteVideoTestimonial: (id: string) => Promise<void>;
  createOffer: (offer: Omit<OfferMarqueeItem, 'id'>) => Promise<OfferMarqueeItem>;
  updateOffer: (id: string, offer: Partial<OfferMarqueeItem>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;

  affiliates: Affiliate[];
  promoCodes: PromoCode[];
  createPromoCode: (payload: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<PromoCode>;
  updatePromoCode: (id: string, payload: Partial<PromoCode>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  createAffiliate: (payload: Partial<Affiliate> & { fullName: string; email: string; phone: string }) => Promise<Affiliate>;
  updateAffiliate: (id: string, payload: Partial<Affiliate>) => Promise<void>;
  deleteAffiliate: (id: string) => Promise<void>;
  toggleAffiliateStatus: (id: string, status: AffiliateStatus) => Promise<void>;

  vendorPayments: VendorPayment[];
  masterVendors: MasterVendor[];
  addBookingDirect: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  addBookingsBulk: (bookings: Omit<Booking, 'id' | 'createdAt'>[]) => Promise<Booking[]>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  updateBookingsBulk: (updates: { id: string; data: Partial<Booking> }[]) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  addVendorPayment: (payment: Omit<VendorPayment, 'id' | 'createdAt'>) => Promise<VendorPayment>;
  updateVendorPayment: (id: string, updates: Partial<VendorPayment>) => Promise<void>;
  deleteVendorPayment: (id: string) => Promise<void>;
  addMasterVendor: (vendor: Omit<MasterVendor, 'id' | 'createdAt'>) => Promise<MasterVendor>;
  updateMasterVendor: (id: string, updates: Partial<MasterVendor>) => Promise<void>;
  deleteMasterVendor: (id: string) => Promise<void>;

  toasts: ToastItem[];
  showToast: (
    type: 'success' | 'error' | 'info' | 'warning' | 'copy',
    message: string,
    subMessage?: string,
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => void;
  removeToast: (id: string) => void;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'copy';
  message: string;
  subMessage?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const cleanPayload = (obj: any): any => {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([]);
  const [masterVendors, setMasterVendors] = useState<MasterVendor[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [offers, setOffers] = useState<OfferMarqueeItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [bypassAdmin, setBypassAdmin] = useState<boolean>(false);
  const [role, setRole] = useState<Role>('public');
  const [affiliateId, setAffiliateId] = useState<string | undefined>(undefined);
  const [affiliateProfile, setAffiliateProfile] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((
    type: 'success' | 'error' | 'info' | 'warning' | 'copy',
    message: string,
    subMessage?: string,
    duration = 4000,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, message, subMessage, duration, action };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [footerSettings, setFooterSettings] = useState<SiteFooterSettings>({});
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>({});
  const [contactSettings, setContactSettings] = useState<ContactSettings>({});

  const [siteBrandSettings, setSiteBrandSettings] = useState<SiteBrandSettings>({});
  const [netaTagsSettings, setNetaTagsSettings] = useState<NetaTagsSettings>({});


  const isFirebaseActive = !isPlaceholder;

  // 1. Sync Authentication + resolve role from Firestore users/{uid}
  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {

        setAdminUser(user);

        if (!user) {
          setRole('public');
          setAffiliateId(undefined);
          setAffiliateProfile(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          let resolved = await resolveRoleByUid(user.uid, user.email);

          // First-time Google sign-in: bootstrap a user profile so role resolution works
          if (user.email) {
            const { setDoc, getDocs, query, collection, where } = await import('firebase/firestore');
            const userRef = doc(db!, 'users', user.uid);

            let targetRole: Role = 'public';
            let targetAffiliateId: string | undefined = undefined;

            if (isAuthorizedAdminEmail(user.email)) {
              targetRole = 'admin';
            } else {
              // Dynamic check in affiliates collection
              try {
                const trimmed = user.email.trim();
                const affQ = query(collection(db!, 'affiliates'), where('email', '==', trimmed));
                const affSnap = await getDocs(affQ);
                if (!affSnap.empty) {
                  targetRole = 'affiliate';
                  targetAffiliateId = affSnap.docs[0].id;
                } else {
                  const affQ2 = query(collection(db!, 'affiliates'), where('email', '==', trimmed.toLowerCase()));
                  const affSnap2 = await getDocs(affQ2);
                  if (!affSnap2.empty) {
                    targetRole = 'affiliate';
                    targetAffiliateId = affSnap2.docs[0].id;
                  }
                }
              } catch (affErr) {
                console.warn('Could not query affiliates during bootstrap:', affErr);
              }
            }

            // Fallback to hardcoded list
            if (targetRole === 'public' && isAuthorizedAffiliateEmail(user.email)) {
              targetRole = 'affiliate';
              targetAffiliateId = 'test-affiliate';
            }

            const userData: Record<string, unknown> = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              role: targetRole,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };

            if (targetRole === 'affiliate' && targetAffiliateId) {
              userData.affiliateId = targetAffiliateId;
            }

            await setDoc(userRef, userData, { merge: true });

            resolved = {
              role: targetRole,
              affiliateId: targetAffiliateId,
            } as any;
          }

          // Keep lastLoginAt fresh on every auth-state change for existing users
          if (resolved.role !== 'public' && user.email) {
            try {
              const { updateDoc, serverTimestamp } = await import('firebase/firestore');
              const userRef = doc(db!, 'users', user.uid);
              await updateDoc(userRef, {
                lastLoginAt: serverTimestamp(),
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
              });
            } catch (e) {
              console.warn('Failed to update lastLoginAt:', e);
            }
          }

          setRole(resolved.role);
          // affiliateId only exists for affiliate role
          setAffiliateId((resolved as any).affiliateId);
          if (resolved.role !== 'affiliate') {
            setAffiliateProfile(null);
          }
        } catch (e) {
          console.error('Failed to resolve role:', e);
          setRole('public');
          setAffiliateId(undefined);
          setAffiliateProfile(null);
        }

        setLoading(false);
      });
      return unsubscribe;
    }
    setLoading(false);
  }, [isFirebaseActive, role, bypassAdmin]);


  useEffect(() => {
    const stored = localStorage.getItem('cmt_offers');
    if (stored) {
      setOffers(JSON.parse(stored));
    } else {
      localStorage.setItem('cmt_offers', JSON.stringify(initialOffers));
      setOffers(initialOffers);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseActive || !db) {
      const stored = localStorage.getItem('cmt_affiliates');
      if (stored) {
        setAffiliates(JSON.parse(stored));
      } else {
        setAffiliates([]);
      }
      return;
    }

    const loadAffiliates = async () => {
      try {
        // Only attempt server list when running as admin (or local bypass). Public users will use local cache.
        if (!(role === 'admin' || bypassAdmin)) {
          const stored = localStorage.getItem('cmt_affiliates');
          if (stored) {
            setAffiliates(JSON.parse(stored));
          } else {
            setAffiliates([]);
          }
          return;
        }

        const snap = await getDocs(collection(db, 'affiliates'));
        const list = snap.docs.map((item) => ({ id: item.id, ...(item.data() as Partial<Affiliate>) } as Affiliate));
        setAffiliates(list);
        localStorage.setItem('cmt_affiliates', JSON.stringify(list));
      } catch (error) {
        console.error('Failed to load affiliates:', error);
      }
    };

    loadAffiliates();
  }, [isFirebaseActive]);

  // 2. Fetch Packages & Blogs
  useEffect(() => {
    const fetchInitialData = async () => {
      if (isFirebaseActive && db) {
        let isSeeded = false;
        try {
          const seedRef = doc(db, 'siteSettings', 'seeding_initialized');
          const seedSnap = await getDoc(seedRef);
          isSeeded = seedSnap.exists();
        } catch (e) {
          console.warn('Could not query seeding document:', e);
        }

        try {
          const pkgsCol = collection(db, 'packages');
          const snapshot = await getDocs(pkgsCol);
          if (snapshot.empty && !isSeeded && (role === 'admin' || bypassAdmin)) {
            for (const p of initialPackages) {
              const { id, ...data } = p;
              await addDoc(collection(db, 'packages'), { ...data, createdAt: new Date().toISOString() });
            }
            const updatedSnap = await getDocs(pkgsCol);
            const list = updatedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TravelPackage));
            setPackages(list);
            localStorage.setItem('cmt_packages', JSON.stringify(list));
          } else {
            const list = snapshot.empty ? [] : snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TravelPackage));
            setPackages(list);
            localStorage.setItem('cmt_packages', JSON.stringify(list));
          }
        } catch (error) {
          console.error('Firestore packages fetch error, falling back to local storage:', error);
          loadPackagesLocal();
        }

        try {
          const blogsCol = collection(db, 'blogs');
          const snapshot = await getDocs(blogsCol);
          if (snapshot.empty && !isSeeded && (role === 'admin' || bypassAdmin)) {
            for (const b of initialBlogs) {
              const { id, ...data } = b;
              await addDoc(collection(db, 'blogs'), { ...data });
            }
            const updatedSnap = await getDocs(blogsCol);
            const list = updatedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BlogPost));
            setBlogs(list);
            localStorage.setItem('cmt_blogs', JSON.stringify(list));

            // Mark database as seeded successfully
            try {
              const { setDoc } = await import('firebase/firestore');
              await setDoc(doc(db, 'siteSettings', 'seeding_initialized'), { initialized: true });
            } catch (err) {
              console.warn('Failed to save seeding_initialized status:', err);
            }
          } else {
            const list = snapshot.empty ? [] : snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BlogPost));
            setBlogs(list);
            localStorage.setItem('cmt_blogs', JSON.stringify(list));
          }
        } catch (error) {
          console.error('Firestore blogs fetch error, falling back to local storage:', error);
          loadBlogsLocal();
        }

        try {
          const videosCol = collection(db, 'videoTestimonials');
          const snapshot = await getDocs(videosCol);
          if (snapshot.empty && !isSeeded && (role === 'admin' || bypassAdmin)) {
            for (const v of initialVideoTestimonials) {
              const { id, ...data } = v;
              await addDoc(collection(db, 'videoTestimonials'), { ...data });
            }
            const updatedSnap = await getDocs(videosCol);
            const list = updatedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as VideoTestimonial));
            setVideoTestimonials(list);
            localStorage.setItem('cmt_videoTestimonials', JSON.stringify(list));
          } else {
            const list = snapshot.empty ? [] : snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as VideoTestimonial));
            setVideoTestimonials(list);
            localStorage.setItem('cmt_videoTestimonials', JSON.stringify(list));
          }
        } catch (error) {
          console.error('Firestore videoTestimonials fetch error, falling back to local storage:', error);
          loadVideosLocal();
        }

        // Reviews collection
        try {
          const reviewsCol = collection(db, 'reviews');
          const reviewsSnap = await getDocs(reviewsCol);
          if (reviewsSnap.empty && !isSeeded && (role === 'admin' || bypassAdmin)) {
            for (const r of initialReviews) {
              const { id, ...data } = r;
              await addDoc(collection(db, 'reviews'), { ...data });
            }
            const updatedSnap = await getDocs(reviewsCol);
            const list = updatedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
            setReviews(list);
            localStorage.setItem('cmt_reviews', JSON.stringify(list));
          } else {
            const list = reviewsSnap.empty ? [] : reviewsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
            setReviews(list);
            localStorage.setItem('cmt_reviews', JSON.stringify(list));
          }
        } catch (error) {
          console.error('Firestore reviews fetch error, falling back to local storage:', error);
          loadReviewsLocal();
        }

        // Custom templates collection
        try {
          const templatesCol = collection(db, 'customTemplates');
          const snap = await getDocs(templatesCol);
          const list = snap.empty ? [] : snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomTemplate));
          setCustomTemplates(list);
          localStorage.setItem('cmt_custom_templates', JSON.stringify(list));
        } catch (error) {
          console.error('Firestore customTemplates fetch error, falling back to local storage:', error);
          loadTemplatesLocal();
        }

        // Scheduled emails collection
        try {
          const scheduledCol = collection(db, 'scheduledEmails');
          const snap = await getDocs(scheduledCol);
          const list = snap.empty ? [] : snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduledEmail));
          setScheduledEmails(list);
          localStorage.setItem('cmt_scheduled_emails', JSON.stringify(list));
        } catch (error) {
          console.error('Firestore scheduledEmails fetch error, falling back to local storage:', error);
          loadScheduledLocal();
        }
      } else {
        loadPackagesLocal();
        loadBlogsLocal();
        loadVideosLocal();
        loadReviewsLocal();
        loadTemplatesLocal();
        loadScheduledLocal();
      }
    };

    fetchInitialData();
  }, [isFirebaseActive, role, bypassAdmin]);

  const loadPackagesLocal = () => {
    const stored = localStorage.getItem('cmt_packages');
    if (stored) {
      setPackages(JSON.parse(stored));
    } else {
      localStorage.setItem('cmt_packages', JSON.stringify(initialPackages));
      setPackages(initialPackages);
    }
  };

  const loadBlogsLocal = () => {
    const stored = localStorage.getItem('cmt_blogs');
    if (stored) {
      setBlogs(JSON.parse(stored));
    } else {
      localStorage.setItem('cmt_blogs', JSON.stringify(initialBlogs));
      setBlogs(initialBlogs);
    }
  };

  const loadVideosLocal = () => {
    const stored = localStorage.getItem('cmt_videoTestimonials');
    if (stored) {
      setVideoTestimonials(JSON.parse(stored));
    } else {
      localStorage.setItem('cmt_videoTestimonials', JSON.stringify(initialVideoTestimonials));
      setVideoTestimonials(initialVideoTestimonials);
    }
  };

  const loadReviewsLocal = () => {
    const stored = localStorage.getItem('cmt_reviews');
    if (stored) {
      setReviews(JSON.parse(stored));
    } else {
      localStorage.setItem('cmt_reviews', JSON.stringify(initialReviews));
      setReviews(initialReviews);
    }
  };

  const loadTemplatesLocal = () => {
    const stored = localStorage.getItem('cmt_custom_templates');
    if (stored) setCustomTemplates(JSON.parse(stored));
    else setCustomTemplates([]);
  };

  const loadScheduledLocal = () => {
    const stored = localStorage.getItem('cmt_scheduled_emails');
    if (stored) setScheduledEmails(JSON.parse(stored));
    else setScheduledEmails([]);
  };

  const isAdminLoggedIn = Boolean(bypassAdmin || role === 'admin');

  // 3. Load affiliate profile (Feature 2 - affiliates collection)
  useEffect(() => {
    const loadProfile = async () => {
      if (!isFirebaseActive || !db) return;
      if (role !== 'affiliate') {
        setAffiliateProfile(null);
        return;
      }
      if (!affiliateId) {
        setAffiliateProfile(null);
        return;
      }
      try {
        const ref = doc(db, 'affiliates', affiliateId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setAffiliateProfile(null);
          return;
        }
        const data = snap.data() as Partial<Affiliate> & { id?: string };
        setAffiliateProfile({
          id: (data.id ?? affiliateId) as string,
          fullName: String(data.fullName ?? ''),
          email: String(data.email ?? ''),
          phone: String(data.phone ?? ''),
          profileImage: String(data.profileImage ?? ''),
          status: (data.status as any) ?? 'Active',
          joinedDate: String(data.joinedDate ?? ''),
          totalBookings: Number(data.totalBookings ?? 0),
          totalCommission: Number(data.totalCommission ?? 0),
          totalPaid: Number(data.totalPaid ?? 0),
          pendingCommission: Number(data.pendingCommission ?? 0),
          totalRevenueGenerated: Number(data.totalRevenueGenerated ?? 0),
          lastLogin: String(data.lastLogin ?? ''),
          notes: String(data.notes ?? ''),
        });
      } catch (e) {
        console.error('Failed to load affiliate profile:', e);
        setAffiliateProfile(null);
      }
    };

    loadProfile();
  }, [role, affiliateId, isFirebaseActive, db]);


  // Load Promo Codes (real-time, role-based)
  useEffect(() => {
    if (!isFirebaseActive || !db) {
      const stored = localStorage.getItem('cmt_promoCodes');
      if (stored) {
        setPromoCodes(JSON.parse(stored));
      } else {
        setPromoCodes([]);
      }
      return;
    }

    let q;
    if (isAdminLoggedIn) {
      q = collection(db, 'promoCodes');
    } else if (role === 'affiliate' && affiliateId) {
      q = query(collection(db, 'promoCodes'), where('affiliateIds', 'array-contains', affiliateId));
    } else {
      q = query(collection(db, 'promoCodes'), where('active', '==', true));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PromoCode));
        setPromoCodes(list);
        localStorage.setItem('cmt_promoCodes', JSON.stringify(list));
      },
      (error) => {
        console.error('Failed to load promo codes:', error);
      }
    );

    return unsubscribe;
  }, [isFirebaseActive, db, isAdminLoggedIn, role, affiliateId]);



  // Load Enquiries (real-time, role-based)
  useEffect(() => {
    if (!isFirebaseActive || !db || !auth?.currentUser) {
      const stored = localStorage.getItem('cmt_enquiries');
      if (stored) {
        let list = JSON.parse(stored) as Enquiry[];
        if (role === 'affiliate' && affiliateId) {
          list = list.filter((e) => e.affiliateId === affiliateId);
        }
        setEnquiries(list);
      } else {
        setEnquiries([]);
      }
      return;
    }

    if (isAdminLoggedIn) {
      const enqCol = collection(db, 'enquiries');
      const unsubscribe = onSnapshot(
        enqCol,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Enquiry));
          setEnquiries(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'enquiries');
        }
      );
      return unsubscribe;
    }

    if (role === 'affiliate' && affiliateId) {
      const enqQuery = query(collection(db, 'enquiries'), where('affiliateId', '==', affiliateId));
      const unsubscribe = onSnapshot(
        enqQuery,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Enquiry));
          setEnquiries(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        },
        (error) => {
          // Non-fatal: warn only so Firestore can retry after auth propagation
          handleFirestoreError(error, OperationType.LIST, 'enquiries');
        }
      );
      return unsubscribe;
    }

    // If role is affiliate but affiliateId not yet resolved, wait — don't clear
    if (role === 'affiliate' && !affiliateId) {
      return;
    }

    setEnquiries([]);
  }, [isAdminLoggedIn, isFirebaseActive, db, role, affiliateId]);

  useEffect(() => {
    if (!isFirebaseActive || !db || !auth?.currentUser) {
      const stored = localStorage.getItem('cmt_bookings');
      if (stored) {
        let list = JSON.parse(stored) as Booking[];
        if (role === 'affiliate' && affiliateId) {
          list = list.filter((b) => b.affiliateId === affiliateId);
        }
        setBookings(list);
      } else {
        setBookings([]);
      }
      return;
    }

    if (isAdminLoggedIn) {
      const bookingCol = collection(db, 'bookings');
      const unsubscribe = onSnapshot(
        bookingCol,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
          setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'bookings');
        }
      );
      return unsubscribe;
    }

    if (role === 'affiliate' && affiliateId) {
      const bookingQuery = query(collection(db, 'bookings'), where('affiliateId', '==', affiliateId));
      const unsubscribe = onSnapshot(
        bookingQuery,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
          setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'bookings');
        }
      );
      return unsubscribe;
    }

    // If role is affiliate but affiliateId not yet resolved, wait — don't clear
    if (role === 'affiliate' && !affiliateId) {
      return;
    }

    setBookings([]);
  }, [isAdminLoggedIn, isFirebaseActive, db, role, affiliateId]);

  // Load Vendor Payments
  useEffect(() => {
    if (!isFirebaseActive || !db || !auth?.currentUser) {
      const stored = localStorage.getItem('cmt_vendor_payments');
      if (stored) {
        setVendorPayments(JSON.parse(stored) as VendorPayment[]);
      } else {
        setVendorPayments([]);
      }
      return;
    }

    if (isAdminLoggedIn) {
      const vendorCol = collection(db, 'vendorPayments');
      const unsubscribe = onSnapshot(
        vendorCol,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as VendorPayment));
          setVendorPayments(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'vendorPayments');
        }
      );
      return unsubscribe;
    }

    setVendorPayments([]);
  }, [isAdminLoggedIn, isFirebaseActive, db]);

  // Load Master Vendors
  useEffect(() => {
    if (!isFirebaseActive || !db || !auth?.currentUser) {
      const stored = localStorage.getItem('cmt_master_vendors');
      if (stored) {
        setMasterVendors(JSON.parse(stored) as MasterVendor[]);
      } else {
        setMasterVendors([]);
      }
      return;
    }

    if (isAdminLoggedIn) {
      const mvCol = collection(db, 'masterVendors');
      const unsubscribe = onSnapshot(
        mvCol,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MasterVendor));
          setMasterVendors(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'masterVendors');
        }
      );
      return unsubscribe;
    }

    setMasterVendors([]);
  }, [isAdminLoggedIn, isFirebaseActive, db]);

  useEffect(() => {
    if (!isFirebaseActive || !db || !auth?.currentUser) {
      setCommissions([]);
      setNotifications([]);
      return;
    }

    if (isAdminLoggedIn) {
      const commissionCol = collection(db, 'commissions');
      const commissionUnsub = onSnapshot(
        commissionCol,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CommissionRecord));
          setCommissions(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'commissions');
        }
      );

      const notifCol = collection(db, 'notifications');
      const notifUnsub = onSnapshot(
        notifCol,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NotificationItem));
          setNotifications(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'notifications');
        }
      );

      return () => {
        commissionUnsub();
        notifUnsub();
      };
    }

    if (role === 'affiliate' && affiliateId) {
      const commissionQuery = query(collection(db, 'commissions'), where('affiliateId', '==', affiliateId));
      const commissionUnsub = onSnapshot(
        commissionQuery,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CommissionRecord));
          setCommissions(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'commissions');
        }
      );

      const notifQuery = query(collection(db, 'notifications'), where('affiliateId', '==', affiliateId));
      const notifUnsub = onSnapshot(
        notifQuery,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NotificationItem));
          setNotifications(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'notifications');
        }
      );

      return () => {
        commissionUnsub();
        notifUnsub();
      };
    }

    // If role is affiliate but affiliateId not yet resolved, wait — don't clear
    if (role === 'affiliate' && !affiliateId) {
      return;
    }

    setCommissions([]);
    setNotifications([]);
  }, [isAdminLoggedIn, isFirebaseActive, db, role, affiliateId]);


  // Google Login — use popup for in-place auth.
  const loginWithGoogle = async () => {
    if (isFirebaseActive && auth) {
      const provider = new GoogleAuthProvider();
      try {
        setLoading(true);
        await signInWithPopup(auth, provider);
      } catch (error: any) {
        setLoading(false);
        if (error?.code !== 'auth/popup-closed-by-user') {
          console.error('Google Sign In error:', error);
        }
      }
    } else {
      setBypassAdmin(false);
    }
  };

  const localAdminBypass = () => {
    setBypassAdmin((prev) => !prev);
    const stored = localStorage.getItem('cmt_enquiries');
    if (stored) {
      setEnquiries(JSON.parse(stored));
    } else {
      setEnquiries([]);
    }
  };

  const localAffiliateBypass = () => {
    if (role === 'affiliate') {
      setRole('public');
      setAffiliateId(undefined);
      setAffiliateProfile(null);
      setAdminUser(null);
    } else {
      setRole('affiliate');
      setAffiliateId('test-affiliate');
      setAdminUser({
        email: 'ratnadeepmukherjee.banti@gmail.com',
        displayName: 'Mock Affiliate',
        uid: 'test-affiliate-uid'
      } as any);
      setAffiliateProfile({
        id: 'test-affiliate',
        fullName: 'Ratnadeep Mukherjee',
        email: 'ratnadeepmukherjee.banti@gmail.com',
        phone: '+91 98320 12345',
        profileImage: '',
        status: 'Active',
        joinedDate: '2026-07-04',
        totalBookings: 5,
        totalCommission: 15000,
        totalPaid: 10000,
        pendingCommission: 5000,
        totalRevenueGenerated: 150000,
        lastLogin: '2026-07-05',
        notes: 'Developer testing affiliate account',
      });
    }
  };

  // Logout
  const logout = async () => {
    if (isFirebaseActive && auth) {
      await signOut(auth);
    }
    setBypassAdmin(false);
  };

  // 4. CRUD operations: Enquiry Create
  const validatePromoCode = async (
    code: string,
    packageId?: string
  ): Promise<
    | {
      valid: true;
      promo: {
        code: string;
        affiliateId?: string;
        affiliateEmail?: string;
        affiliateName?: string;
        commissionType?: 'Percentage' | 'Fixed Amount' | string;
        commissionValue?: number;
      };
    }
    | { valid: false; reason?: string }
  > => {
    const trimmed = (code || '').trim();
    if (!trimmed) return { valid: false, reason: 'empty' };

    if (!(isFirebaseActive && db)) {
      const codeLower = trimmed.toLowerCase();
      const localPromos = promoCodes.length > 0 ? promoCodes : (JSON.parse(localStorage.getItem('cmt_promoCodes') || '[]') as PromoCode[]);
      const found = localPromos.find(p => (p.code || '').toLowerCase() === codeLower && !p.deleted);
      if (!found) return { valid: false, reason: 'not_found' };

      const validation = isPromoValid(found, packageId);
      if (!validation.valid) return { valid: false, reason: validation.reason };

      return {
        valid: true,
        promo: {
          code: found.code,
          affiliateId: found.affiliateId,
          affiliateEmail: found.affiliateEmail,
          affiliateName: found.affiliateName,
          commissionType: found.commissionType,
          commissionValue: found.commissionValue,
        }
      };
    }

    try {
      let promosQ;
      if (isAdminLoggedIn) {
        promosQ = query(collection(db, 'promoCodes'), where('codeLower', '==', trimmed.toLowerCase()));
      } else {
        promosQ = query(collection(db, 'promoCodes'), where('codeLower', '==', trimmed.toLowerCase()), where('active', '==', true));
      }

      let snap = await getDocs(promosQ);

      // Fallback for older promo docs without codeLower: fetch all and match client-side (Admins only)
      if (snap.empty && isAdminLoggedIn) {
        try {
          const allSnap = await getDocs(collection(db, 'promoCodes'));
          const found = allSnap.docs.find((d) => {
            const data = d.data() as any;
            const code = String(data.code || '').trim();
            return code.toLowerCase() === trimmed.toLowerCase();
          });
          if (found) {
            snap = { docs: [found] } as any;
          }
        } catch (e) {
          // ignore fallback errors and continue
        }
      }

      if (snap.empty) return { valid: false, reason: 'not_found' };
      const docSnap = snap.docs[0];
      const data = docSnap.data() as any;

      const promoObj: PromoCode = {
        id: docSnap.id,
        ...data,
      } as PromoCode;

      const validation = isPromoValid(promoObj, packageId);
      if (!validation.valid) return { valid: false, reason: validation.reason };

      const commissionType = data.commissionType ?? undefined;
      const commissionValue = data.commissionValue ?? undefined;
      const affiliateId = data.affiliateId ?? (Array.isArray(data.affiliateIds) && data.affiliateIds.length > 0 ? String(data.affiliateIds[0]) : undefined);
      const affiliateEmail = data.affiliateEmail ?? (Array.isArray(data.affiliateEmails) && data.affiliateEmails.length > 0 ? String(data.affiliateEmails[0]) : undefined);

      return {
        valid: true,
        promo: {
          code: String(data.code ?? trimmed),
          affiliateId: affiliateId ?? undefined,
          affiliateEmail: affiliateEmail ?? undefined,
          affiliateName: data.affiliateName ?? undefined,
          commissionType,
          commissionValue: commissionValue !== undefined ? Number(commissionValue) : undefined,
        },
      };
    } catch (e) {
      console.error('validatePromoCode error:', e);
      return { valid: false, reason: 'error' };
    }
  };

  const addEnquiry = async (
    enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'status'> & { estimatedBookingAmount?: number; status?: string; bookingStatus?: string }
  ): Promise<Enquiry> => {
    const defaultStatus = (enquiryData.status || 'Enquired') as any;
    const defaultBookingStatus = (enquiryData.bookingStatus || defaultStatus) as any;
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      status: defaultStatus,
      bookingStatus: defaultBookingStatus,
      estimatedBookingAmount: enquiryData.estimatedBookingAmount ?? 0,
      finalNegotiatedAmount: null,
      calculatedCommission: null,
      commissionStatus: 'Pending Confirmation',
    };

    if (isFirebaseActive && db) {
      try {
        const docRef = await addDoc(collection(db, 'enquiries'), {
          name: newEnquiry.name,
          email: newEnquiry.email,
          phone: newEnquiry.phone,
          destination: newEnquiry.destination,
          travelers: Number(newEnquiry.travelers),
          message: newEnquiry.message,
          status: newEnquiry.status,
          bookingStatus: newEnquiry.bookingStatus || '',
          createdAt: newEnquiry.createdAt,
          packageId: newEnquiry.packageId || '',
          travelDate: newEnquiry.travelDate ?? null,

          // Phase 2 promo/affiliate extensions (persist if provided)
          promoCode: newEnquiry.promoCode || '',
          affiliateId: newEnquiry.affiliateId || '',
          affiliateEmail: newEnquiry.affiliateEmail || '',
          affiliateName: newEnquiry.affiliateName || '',

          commissionType: newEnquiry.commissionType || '',
          commissionValue: newEnquiry.commissionValue ?? null,
          commissionAmount: newEnquiry.commissionAmount ?? null,

          // New Fields
          estimatedBookingAmount: newEnquiry.estimatedBookingAmount,
          finalNegotiatedAmount: newEnquiry.finalNegotiatedAmount,
          calculatedCommission: newEnquiry.calculatedCommission,
          commissionStatus: newEnquiry.commissionStatus,
        });
        newEnquiry.id = docRef.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'enquiries');
      }
    } else {
      const stored = localStorage.getItem('cmt_enquiries');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newEnquiry);
      localStorage.setItem('cmt_enquiries', JSON.stringify(list));
      setEnquiries(list);
    }

    if (newEnquiry.promoCode) {
      try {
        // Notify Affiliate
        if (newEnquiry.affiliateId) {
          await appendNotification(
            'New Enquiry Assigned',
            `A new enquiry for ${newEnquiry.destination} has been assigned to you via promo code ${newEnquiry.promoCode}.`,
            'success',
            newEnquiry.affiliateId
          );
        }

        // Notify Admin
        await appendNotification(
          'New Promo Enquiry Received',
          `A new enquiry has been received using promo code ${newEnquiry.promoCode} for package ${newEnquiry.destination}.`,
          'info',
          undefined,
          'admin'
        );

        // Increment Promo Code Usage
        if (isFirebaseActive && db) {
          const promoQuery = query(
            collection(db, 'promoCodes'),
            where('codeLower', '==', String(newEnquiry.promoCode).toLowerCase()),
            limit(1)
          );
          const promoSnap = await getDocs(promoQuery);
          if (!promoSnap.empty) {
            const promoDoc = promoSnap.docs[0];
            const currentTotalUsed = Number(promoDoc.data().totalUsed ?? 0);
            await updateDoc(doc(db, 'promoCodes', promoDoc.id), {
              totalUsed: currentTotalUsed + 1,
              currentUsage: currentTotalUsed + 1,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.warn('Failed to handle promo code post-creation actions:', e);
      }
    }

    try {
      await fetch('/api/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEnquiry,
          duration: packages.find(p => p.id === newEnquiry.packageId)?.duration || 'Custom Plan',
          logoUrl: siteBrandSettings?.site_logo_url || ''
        }),
      });
    } catch (err) {
      console.warn('Backend email notification log request failed (it will still be saved to the database!):', err);
    }

    return newEnquiry;
  };

  const calcCommissionAmount = (enq: Enquiry, bookingAmount: number, override?: number) => {
    return calculateCommission(bookingAmount, enq.commissionType, enq.commissionValue, override);
  };

  const convertEnquiryToBooking = async (
    enquiryId: string,
    payload: {
      bookingAmount: number;
      bookingDate: string;
      travelDate?: string;
      paymentStatus?: 'Unpaid' | 'Paid';
      remarks?: string;
      bookingStatus?: NonNullable<Enquiry['bookingStatus']>;
      commissionAmount?: number;
    }
  ): Promise<void> => {
    if (!(isFirebaseActive && db)) return;

    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;

    const bookingStatus = payload.bookingStatus ?? 'Confirmed';
    const paymentStatus = payload.paymentStatus ?? 'Unpaid';
    const commissionAmount = calcCommissionAmount(enq, Number(payload.bookingAmount), payload.commissionAmount);

    try {
      // create booking doc
      const bookingDoc: any = {
        id: undefined,
        enquiryId,
        bookingAmount: Number(payload.bookingAmount),
        bookingDate: payload.bookingDate,
        travelDate: payload.travelDate ?? enq.travelDate ?? null,
        paymentStatus,
        remarks: payload.remarks ?? '',
        affiliateId: enq.affiliateId ?? '',
        affiliateEmail: enq.affiliateEmail ?? '',
        affiliateName: enq.affiliateName ?? '',
        commissionType: enq.commissionType ?? '',
        commissionValue: enq.commissionValue ?? null,
        commissionAmount,
        createdAt: new Date().toISOString(),
        bookingStatus,

        // Copy required Booking fields from Enquiry
        clientName: enq.name || '',
        clientPhone: enq.phone || '',
        clientEmail: enq.email || '',
        source: enq.promoCode ? 'Affiliate' : 'Website',
        destination: enq.destination || '',
        packageName: enq.destination || '',
        travelType: 'Customized',
        noOfPax: Number(enq.travelers || 1),
        noOfRooms: 1,
        travelStartDate: payload.travelDate ?? enq.travelDate ?? '',
        travelEndDate: '',
        totalDays: 1,
        advanceReceived: paymentStatus === 'Paid' ? Number(payload.bookingAmount) : 0,
        balanceAmount: paymentStatus === 'Paid' ? 0 : Number(payload.bookingAmount),
        vendorCost: 0,
        profit: Number(payload.bookingAmount),
        voucherSent: 'No',
        ticketStatus: 'Pending',
        tripStatus: 'Upcoming',
      };

      const customId = generateNextBookingId();
      bookingDoc.id = customId;

      // create commission doc
      const commissionDoc: any = {
        id: undefined,
        enquiryId,
        bookingId: customId,
        affiliateId: enq.affiliateId ?? '',
        affiliateEmail: enq.affiliateEmail ?? '',
        affiliateName: enq.affiliateName ?? '',
        bookingAmount: Number(payload.bookingAmount),
        commissionAmount,
        commissionType: enq.commissionType ?? '',
        commissionValue: enq.commissionValue ?? null,
        status: 'approved',
        paidAt: null,
        transactionId: null,
        createdAt: new Date().toISOString(),
      };
      const commissionRef = doc(collection(db, 'commissions'));
      commissionDoc.id = commissionRef.id;

      await updateDoc(doc(db, 'enquiries', enquiryId), {
        bookingStatus,
        deleted: false,
        bookingAmount: Number(payload.bookingAmount),
        paymentStatus,
        affiliateCommissionStatus: 'approved',
        commissionAmount,
        statusHistory: [
          ...(enq.statusHistory ?? []),
          {
            fromStatus: enq.status,
            toStatus: enq.status,
            bookingStatus,
            actor: 'admin',
            at: new Date().toISOString(),
            note: 'Booking confirmed',
          },
        ],
      });

      await setDoc(doc(db, 'bookings', customId), cleanPayload(bookingDoc));
      await addDoc(collection(db, 'commissions'), commissionDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `booking/convertEnquiryToBooking/${enquiryId}`);
    }
  };

  const appendNotification = async (
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'error' = 'info',
    affiliateId?: string,
    userUid?: string
  ): Promise<void> => {
    if (!(isFirebaseActive && db)) return;
    try {
      const payload = {
        title,
        message,
        type,
        read: false,
        affiliateId: affiliateId || null,
        userUid: userUid || null,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'notifications'), payload as any);
    } catch (error) {
      console.warn('Notification insert failed:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(next);

    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch (e) {
        console.error('Failed to mark notification as read:', e);
      }
    }
  };

  const markAllNotificationsAsRead = async (userType: 'admin' | 'affiliate', affId?: string) => {
    const targetNotifications = notifications.filter(n => {
      const match = userType === 'admin'
        ? (n.userUid === 'admin' || !n.affiliateId)
        : (n.affiliateId === affId);
      return match && !n.read;
    });

    if (targetNotifications.length === 0) return;

    const next = notifications.map((n) => {
      const match = userType === 'admin'
        ? (n.userUid === 'admin' || !n.affiliateId)
        : (n.affiliateId === affId);
      return match ? { ...n, read: true } : n;
    });
    setNotifications(next);

    if (isFirebaseActive && db) {
      try {
        await Promise.all(
          targetNotifications.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true }))
        );
      } catch (e) {
        console.error('Failed to mark all notifications as read:', e);
      }
    }
  };

  const updateBookingStatus = async (
    enquiryId: string,
    payload: {
      bookingAmount?: number;
      bookingDate?: string;
      travelDate?: string;
      paymentStatus?: 'Unpaid' | 'Paid';
      remarks?: string;
      bookingStatus?: NonNullable<Enquiry['bookingStatus']>;
      commissionAmount?: number;
    }
  ): Promise<void> => {
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;

    const bookingStatus = payload.bookingStatus ?? enq.bookingStatus ?? 'New';
    const bookingAmount = payload.bookingAmount ?? Number(enq.bookingAmount ?? 0);
    const paymentStatus = payload.paymentStatus ?? enq.paymentStatus ?? 'Unpaid';
    const bookingDate = payload.bookingDate || new Date().toISOString().split('T')[0];
    const travelDate = payload.travelDate ?? enq.travelDate ?? null;
    const commissionAmount = calcCommissionAmount(enq, bookingAmount, payload.commissionAmount);
    const commissionType = enq.commissionType ?? 'Percentage';
    const commissionValue = enq.commissionValue ?? 0;

    if (!(isFirebaseActive && db)) {
      // Local/offline update
      const storedBookings = localStorage.getItem('cmt_bookings');
      let list = storedBookings ? (JSON.parse(storedBookings) as Booking[]) : [];
      const existingIdx = list.findIndex((b) => b.enquiryId === enquiryId);

      if (existingIdx !== -1) {
        list[existingIdx] = {
          ...list[existingIdx],
          bookingAmount,
          bookingDate,
          travelDate: travelDate || undefined,
          paymentStatus: paymentStatus as any,
          bookingStatus: bookingStatus as any,
          remarks: payload.remarks || list[existingIdx].remarks || '',
          commissionAmount,
          updatedAt: new Date().toISOString(),
          // Recalculate financial fields for tracker
          advanceReceived: paymentStatus === 'Paid' ? bookingAmount : list[existingIdx].advanceReceived,
          balanceAmount: paymentStatus === 'Paid' ? 0 : (bookingAmount - list[existingIdx].advanceReceived),
          profit: bookingAmount - (list[existingIdx].vendorCost || 0),
        };
      } else {
        const newBooking: Booking = {
          id: generateNextBookingId(),
          enquiryId,
          bookingAmount,
          bookingDate,
          travelDate: travelDate || undefined,
          paymentStatus: paymentStatus as any,
          bookingStatus: bookingStatus as any,
          remarks: payload.remarks || '',
          affiliateId: enq.affiliateId || '',
          affiliateEmail: enq.affiliateEmail || '',
          affiliateName: enq.affiliateName || '',
          commissionAmount,
          commissionType: enq.commissionType ?? undefined,
          commissionValue: enq.commissionValue ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Default required booking dashboard fields for local storage
          clientName: enq.name || '',
          clientPhone: enq.phone || '',
          clientEmail: enq.email || '',
          source: enq.promoCode ? 'Affiliate' : 'Website',
          destination: enq.destination || '',
          packageName: enq.destination || '',
          travelType: 'Customized',
          noOfPax: Number(enq.travelers || 1),
          noOfRooms: 1,
          travelStartDate: travelDate || '',
          travelEndDate: '',
          totalDays: 1,
          advanceReceived: paymentStatus === 'Paid' ? bookingAmount : 0,
          balanceAmount: paymentStatus === 'Paid' ? 0 : bookingAmount,
          vendorCost: 0,
          profit: bookingAmount,
          voucherSent: 'No',
          ticketStatus: 'Pending',
          tripStatus: 'Upcoming',
        };
        list.unshift(newBooking);
      }
      localStorage.setItem('cmt_bookings', JSON.stringify(list));
      setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      // Save commission local
      if (bookingStatus === 'Onboarded' || bookingStatus === 'Completed') {
        const storedComms = localStorage.getItem('cmt_commissions');
        let commList = storedComms ? JSON.parse(storedComms) : [];
        if (!commList.some((c: any) => c.enquiryId === enquiryId)) {
          commList.unshift({
            id: 'local-comm-' + Date.now(),
            enquiryId,
            affiliateId: enq.affiliateId || '',
            affiliateEmail: enq.affiliateEmail || '',
            affiliateName: enq.affiliateName || '',
            bookingAmount,
            commissionAmount,
            commissionType,
            commissionValue,
            status: 'approved',
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem('cmt_commissions', JSON.stringify(commList));
          setCommissions(commList);
        }
      }
      return;
    }

    try {
      const enqRef = doc(db, 'enquiries', enquiryId);
      const bookingQuery = query(
        collection(db, 'bookings'),
        where('enquiryId', '==', enquiryId),
        limit(1)
      );
      const bookingSnap = await getDocs(bookingQuery);
      let bookingId: string | null = null;

      if (!bookingSnap.empty) {
        const existingBook = bookingSnap.docs[0];
        bookingId = existingBook.id;
        const existingData = existingBook.data() as any;
        await updateDoc(doc(db, 'bookings', bookingId), {
          bookingAmount,
          bookingDate,
          travelDate,
          paymentStatus,
          bookingStatus,
          remarks: payload.remarks || existingData.remarks || '',
          commissionAmount,
          commissionType,
          commissionValue,
          updatedAt: new Date().toISOString(),
          // Recalculate financial fields for tracker
          advanceReceived: paymentStatus === 'Paid' ? bookingAmount : (existingData.advanceReceived ?? 0),
          balanceAmount: paymentStatus === 'Paid' ? 0 : (bookingAmount - (existingData.advanceReceived ?? 0)),
          profit: bookingAmount - (existingData.vendorCost ?? 0),
        });
      } else {
        const bookingDoc = {
          enquiryId,
          bookingAmount,
          bookingDate,
          travelDate,
          paymentStatus,
          remarks: payload.remarks || '',
          bookingStatus,
          affiliateId: enq.affiliateId || '',
          affiliateEmail: enq.affiliateEmail || '',
          affiliateName: enq.affiliateName || '',
          commissionAmount,
          commissionType,
          commissionValue,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Copy required Booking fields from Enquiry for the Tour Tracker
          clientName: enq.name || '',
          clientPhone: enq.phone || '',
          clientEmail: enq.email || '',
          source: enq.promoCode ? 'Affiliate' : 'Website',
          destination: enq.destination || '',
          packageName: enq.destination || '',
          travelType: 'Customized',
          noOfPax: Number(enq.travelers || 1),
          noOfRooms: 1,
          travelStartDate: travelDate || '',
          travelEndDate: '',
          totalDays: 1,
          advanceReceived: paymentStatus === 'Paid' ? bookingAmount : 0,
          balanceAmount: paymentStatus === 'Paid' ? 0 : bookingAmount,
          vendorCost: 0,
          profit: bookingAmount,
          voucherSent: 'No',
          ticketStatus: 'Pending',
          tripStatus: 'Upcoming',
        } as any;
        const customId = generateNextBookingId();
        bookingDoc.id = customId;
        await setDoc(doc(db, 'bookings', customId), cleanPayload(bookingDoc));
        bookingId = customId;
      }

      const enquiryUpdates: any = {
        bookingStatus,
        bookingAmount,
        paymentStatus,
        statusHistory: [
          ...(enq.statusHistory ?? []),
          {
            fromStatus: enq.bookingStatus ?? enq.status,
            toStatus: enq.bookingStatus ?? enq.status,
            bookingStatus,
            actor: adminUser?.email || auth?.currentUser?.email || 'admin',
            at: new Date().toISOString(),
            note: payload.remarks || `Booking status updated to ${bookingStatus}`,
          },
        ],
      };

      if (bookingStatus === 'Onboarded') {
        enquiryUpdates.affiliateCommissionStatus = 'approved';
        if (bookingId) {
          const commissionQuery = query(
            collection(db, 'commissions'),
            where('enquiryId', '==', enquiryId),
            limit(1)
          );
          const commissionSnap = await getDocs(commissionQuery);
          if (commissionSnap.empty) {
            await addDoc(collection(db, 'commissions'), {
              enquiryId,
              bookingId,
              affiliateId: enq.affiliateId || '',
              affiliateEmail: enq.affiliateEmail || '',
              affiliateName: enq.affiliateName || '',
              bookingAmount,
              commissionAmount,
              commissionType,
              commissionValue,
              status: 'approved',
              paidAt: null,
              transactionId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as any);
          }
        }
      } else {
        enquiryUpdates.affiliateCommissionStatus = 'pending';
      }

      await updateDoc(enqRef, enquiryUpdates);

      await appendActivityLog(
        'update',
        'enquiry',
        enquiryId,
        `Booking status updated to ${bookingStatus} with final amount ₹${bookingAmount}`
      );

      if (enq.affiliateId) {
        // Build a rich, status-specific notification for the affiliate
        const customerName = enq.name || 'A customer';
        const packageName = enq.destination || 'a package';
        const promoLabel = enq.promoCode ? ` via promo code "${enq.promoCode}"` : '';
        const travelLabel = travelDate ? ` (Travel: ${new Date(travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})` : '';
        const commLabel = commissionAmount > 0 ? ` — Commission: ₹${commissionAmount.toLocaleString('en-IN')}` : '';

        let notifTitle = 'Booking Update';
        let notifMessage = '';
        let notifType: 'info' | 'success' | 'warning' | 'error' = 'info';

        switch (bookingStatus) {
          case 'Onboarded':
            notifTitle = '🎉 Booking Onboarded!';
            notifMessage = `${customerName}'s booking for "${packageName}"${promoLabel}${travelLabel} has been confirmed & onboarded.${commLabel}`;
            notifType = 'success';
            break;
          case 'Completed':
            notifTitle = '✅ Booking Completed!';
            notifMessage = `${customerName}'s trip to "${packageName}"${promoLabel}${travelLabel} is marked completed.${commLabel} Your commission is being processed.`;
            notifType = 'success';
            break;
          case 'Cancelled':
            notifTitle = '❌ Booking Cancelled';
            notifMessage = `${customerName}'s booking for "${packageName}"${promoLabel}${travelLabel} has been cancelled. Commission will not be applicable.`;
            notifType = 'error';
            break;
          case 'Under Processing':
            notifTitle = '⏳ Booking Under Processing';
            notifMessage = `${customerName}'s enquiry for "${packageName}"${promoLabel} is now under processing by our team.`;
            notifType = 'info';
            break;
          case 'Under Follow-up':
            notifTitle = '📞 Under Follow-up';
            notifMessage = `${customerName}'s enquiry for "${packageName}"${promoLabel} is under follow-up. Stay tuned for updates.`;
            notifType = 'info';
            break;
          default:
            notifTitle = 'Booking Status Updated';
            notifMessage = `${customerName}'s booking for "${packageName}"${promoLabel} status changed to "${bookingStatus}".`;
            notifType = 'info';
        }

        await appendNotification(notifTitle, notifMessage, notifType, enq.affiliateId);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `enquiries/${enquiryId}/updateBookingStatus`);
    }
  };

  const updateEnquiryFields = async (
    enquiryId: string,
    updates: Partial<Enquiry>
  ): Promise<void> => {
    if (!isFirebaseActive || !db) {
      const list = enquiries.map((e) => {
        if (e.id !== enquiryId) return e;
        const merged = { ...e, ...updates, updatedAt: new Date().toISOString() };
        if (updates.status) merged.bookingStatus = updates.status as any;
        else if (updates.bookingStatus) merged.status = updates.bookingStatus as any;
        return merged;
      });
      localStorage.setItem('cmt_enquiries', JSON.stringify(list));
      setEnquiries(list);

      // Trigger local booking sync if status changed
      const enq = enquiries.find((e) => e.id === enquiryId);
      if (enq) {
        const prevStatus = enq.bookingStatus || enq.status;
        const nextStatus = updates.bookingStatus || updates.status || prevStatus;
        if (nextStatus !== prevStatus && ['Onboarded', 'Completed', 'Confirmed'].includes(nextStatus)) {
          updateBookingStatus(enquiryId, {
            bookingStatus: nextStatus as any,
            bookingAmount: updates.finalNegotiatedAmount !== undefined ? Number(updates.finalNegotiatedAmount) : (enq.finalNegotiatedAmount ?? enq.estimatedBookingAmount ?? enq.bookingAmount ?? 0),
            travelDate: enq.travelDate || undefined,
            paymentStatus: updates.paymentStatus ?? enq.paymentStatus ?? 'Unpaid',
            remarks: (updates as any).remarks ?? (updates as any).specialNotes ?? (updates as any).message ?? enq.message ?? '',
          });
        }
      }
      return;
    }

    try {
      const enqRef = doc(db, 'enquiries', enquiryId);
      const enq = enquiries.find((e) => e.id === enquiryId);
      if (!enq) return;

      const actorEmail = adminUser?.email || auth?.currentUser?.email || 'admin';
      const now = new Date().toISOString();
      const finalUpdates: any = {
        ...updates,
        updatedAt: now,
        updatedBy: actorEmail,
      };

      if (updates.status) {
        finalUpdates.bookingStatus = updates.status;
      } else if (updates.bookingStatus) {
        finalUpdates.status = updates.bookingStatus;
      }

      const prevStatus = enq.bookingStatus || enq.status;
      const nextStatus = finalUpdates.bookingStatus || prevStatus;

      // 1. Check if status changed
      if (nextStatus !== prevStatus) {
        // Sync to bookings collection automatically
        if (['Onboarded', 'Completed', 'Confirmed'].includes(nextStatus)) {
          try {
            await updateBookingStatus(enquiryId, {
              bookingStatus: nextStatus as any,
              bookingAmount: finalUpdates.finalNegotiatedAmount !== undefined ? Number(finalUpdates.finalNegotiatedAmount) : (enq.finalNegotiatedAmount ?? enq.estimatedBookingAmount ?? enq.bookingAmount ?? 0),
              travelDate: enq.travelDate || undefined,
              paymentStatus: finalUpdates.paymentStatus ?? enq.paymentStatus ?? 'Unpaid',
              remarks: (finalUpdates as any).remarks ?? (finalUpdates as any).specialNotes ?? (finalUpdates as any).message ?? enq.message ?? '',
            });
          } catch (e) {
            console.error('Failed to sync booking status inside updateEnquiryFields:', e);
          }
        }

        await addDoc(collection(db, 'activityLogs'), {
          actorUid: auth?.currentUser?.uid || null,
          actorEmail,
          action: 'Booking status changed',
          entityType: 'enquiry',
          entityId: enquiryId,
          detail: `Booking status changed from ${prevStatus} to ${nextStatus}`,
          previousValue: prevStatus,
          newValue: nextStatus,
          createdAt: now,
        });

        if (enq.affiliateId) {
          await appendNotification(
            'Booking Status Updated',
            `The booking linked to promo code "${enq.promoCode || 'N/A'}" has changed status from ${prevStatus} to ${nextStatus}.`,
            'info',
            enq.affiliateId
          );
        }
      }

      // 2. Check if Final Negotiated Amount changed
      const prevFinalAmt = enq.finalNegotiatedAmount;
      const nextFinalAmt = finalUpdates.finalNegotiatedAmount !== undefined ? finalUpdates.finalNegotiatedAmount : prevFinalAmt;
      if (finalUpdates.finalNegotiatedAmount !== undefined && Number(nextFinalAmt) !== Number(prevFinalAmt)) {
        await addDoc(collection(db, 'activityLogs'), {
          actorUid: auth?.currentUser?.uid || null,
          actorEmail,
          action: 'Final Negotiated Amount updated',
          entityType: 'enquiry',
          entityId: enquiryId,
          detail: `Admin updated Final Negotiated Amount from ${prevFinalAmt != null ? '₹' + prevFinalAmt : 'None'} to ₹${nextFinalAmt}`,
          previousValue: prevFinalAmt != null ? String(prevFinalAmt) : 'None',
          newValue: String(nextFinalAmt),
          createdAt: now,
        });

        if (enq.affiliateId) {
          await appendNotification(
            'Final Negotiated Amount Updated',
            `The final negotiated amount for booking "${enquiryId}" has been updated to ₹${nextFinalAmt}.`,
            'info',
            enq.affiliateId
          );
        }
      }

      // 3. Check if Commission Status changed
      const prevCommStatus = enq.commissionStatus;
      const nextCommStatus = finalUpdates.commissionStatus !== undefined ? finalUpdates.commissionStatus : prevCommStatus;
      if (finalUpdates.commissionStatus !== undefined && nextCommStatus !== prevCommStatus) {
        await addDoc(collection(db, 'activityLogs'), {
          actorUid: auth?.currentUser?.uid || null,
          actorEmail,
          action: 'Commission Status Updated',
          entityType: 'enquiry',
          entityId: enquiryId,
          detail: `Commission status updated from ${prevCommStatus || 'None'} to ${nextCommStatus}`,
          previousValue: prevCommStatus || 'None',
          newValue: nextCommStatus || 'None',
          createdAt: now,
        });

        if (enq.affiliateId) {
          await appendNotification(
            'Commission Status Updated',
            `The commission status for booking "${enquiryId}" has changed to "${nextCommStatus}".`,
            'info',
            enq.affiliateId
          );
        }
      }

      // 4. Automatic Commission Generation Trigger
      if (nextStatus === 'Onboarded' && prevStatus !== 'Onboarded' && enq.affiliateId) {
        const currentCommStatus = nextCommStatus || prevCommStatus;
        if (currentCommStatus !== 'Generated') {
          const finalAmt = nextFinalAmt != null ? Number(nextFinalAmt) : 0;
          const commType = enq.commissionType;
          const commVal = Number(enq.commissionValue ?? 0);

          let commission = 0;
          if (commType === 'Percentage') {
            commission = Math.round(finalAmt * (commVal / 100));
          } else if (commType === 'Fixed Amount' || commType === 'Fixed') {
            commission = Math.round(commVal);
          } else {
            commission = Math.round(commVal);
          }

          finalUpdates.calculatedCommission = commission;
          finalUpdates.commissionGeneratedAt = now;
          finalUpdates.commissionStatus = 'Generated';

          await addDoc(collection(db, 'activityLogs'), {
            actorUid: auth?.currentUser?.uid || null,
            actorEmail,
            action: 'Commission Generated',
            entityType: 'enquiry',
            entityId: enquiryId,
            detail: `Commission Generated: ₹${commission} (${commType === 'Percentage' ? commVal + '%' : 'Fixed ₹' + commVal})`,
            previousValue: 'None',
            newValue: `₹${commission}`,
            createdAt: now,
          });

          await appendNotification(
            'Commission Generated',
            `A commission of ₹${commission} has been generated for booking "${enquiryId}"!`,
            'success',
            enq.affiliateId
          );

          const bookingQuery = query(
            collection(db, 'bookings'),
            where('enquiryId', '==', enquiryId),
            limit(1)
          );
          const bookingSnap = await getDocs(bookingQuery);
          let bookingId: string | null = null;
          if (!bookingSnap.empty) {
            const existingBook = bookingSnap.docs[0];
            bookingId = existingBook.id;
            await updateDoc(doc(db, 'bookings', bookingId), {
              bookingAmount: finalAmt,
              bookingStatus: 'Onboarded',
              commissionAmount: commission,
              updatedAt: now,
            });
          } else {
            const bookingRef = await addDoc(collection(db, 'bookings'), {
              enquiryId,
              bookingAmount: finalAmt,
              bookingDate: now,
              travelDate: enq.travelDate ?? null,
              paymentStatus: 'Unpaid',
              remarks: 'Generated via Onboarded status',
              bookingStatus: 'Onboarded',
              affiliateId: enq.affiliateId || '',
              affiliateEmail: enq.affiliateEmail || '',
              affiliateName: enq.affiliateName || '',
              commissionAmount: commission,
              commissionType: commType || '',
              commissionValue: commVal,
              createdAt: now,
              updatedAt: now,
            });
            bookingId = bookingRef.id;
          }

          const commissionQuery = query(
            collection(db, 'commissions'),
            where('enquiryId', '==', enquiryId),
            limit(1)
          );
          const commissionSnap = await getDocs(commissionQuery);
          if (commissionSnap.empty && bookingId) {
            await addDoc(collection(db, 'commissions'), {
              enquiryId,
              bookingId,
              affiliateId: enq.affiliateId || '',
              affiliateEmail: enq.affiliateEmail || '',
              affiliateName: enq.affiliateName || '',
              bookingAmount: finalAmt,
              commissionAmount: commission,
              commissionType: commType || '',
              commissionValue: commVal,
              status: 'approved',
              paidAt: null,
              transactionId: null,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      }

      finalUpdates.statusHistory = [
        ...(enq.statusHistory ?? []),
        {
          fromStatus: prevStatus,
          toStatus: nextStatus,
          bookingStatus: nextStatus,
          actor: actorEmail,
          at: now,
          note: `Enquiry fields updated: ${Object.keys(updates).join(', ')}`,
        },
      ];

      await updateDoc(enqRef, finalUpdates);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `enquiries/${enquiryId}/updateEnquiryFields`);
    }
  };

  const deleteEnquiry = async (id: string): Promise<void> => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'enquiries', id);
        await deleteDoc(docRef);
        setEnquiries((prev) => {
          const list = prev.filter((e) => e.id !== id);
          localStorage.setItem('cmt_enquiries', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `enquiries/${id}`);
      }
    } else {
      const list = enquiries.filter((e) => e.id !== id);
      localStorage.setItem('cmt_enquiries', JSON.stringify(list));
      setEnquiries(list);
    }
  };

  const updateEnquiryStatus = async (id: string, status: 'pending' | 'responded' | 'closed') => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'enquiries', id);
        await updateDoc(docRef, { status });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `enquiries/${id}`);
      }
    } else {
      const updatedList = enquiries.map((e) => (e.id === id ? { ...e, status } : e));
      localStorage.setItem('cmt_enquiries', JSON.stringify(updatedList));
      setEnquiries(updatedList);
    }
  };

  const createPackage = async (pkgData: Omit<TravelPackage, 'id'>): Promise<TravelPackage> => {
    const now = new Date().toISOString();
    const newPkg: TravelPackage = {
      ...pkgData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: now, // Always stamp createdAt for newest-first sorting
    };

    if (isFirebaseActive && db) {
      try {
        const docRef = await addDoc(collection(db, 'packages'), {
          title: newPkg.title,
          category: newPkg.category,
          price: Number(newPkg.price),
          duration: newPkg.duration,
          location: newPkg.location,
          image: newPkg.image,
          description: newPkg.description,
          featured: newPkg.featured || false,
          itinerary: newPkg.itinerary || [],
          inclusions: newPkg.inclusions || [],
          exclusions: newPkg.exclusions || [],
          createdAt: now, // Save to Firestore so sort persists
        });
        newPkg.id = docRef.id;
        setPackages((prev) => {
          // Insert at top — newest first
          const list = [newPkg, ...prev];
          localStorage.setItem('cmt_packages', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'packages');
      }
    } else {
      const stored = localStorage.getItem('cmt_packages');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newPkg);
      localStorage.setItem('cmt_packages', JSON.stringify(list));
      setPackages(list);
    }

    return newPkg;
  };

  const updatePackage = async (id: string, updatedFields: Partial<TravelPackage>) => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'packages', id);
        await updateDoc(docRef, updatedFields as any);
        setPackages((prev) => {
          const list = prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
          localStorage.setItem('cmt_packages', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `packages/${id}`);
      }
    } else {
      const list = packages.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      localStorage.setItem('cmt_packages', JSON.stringify(list));
      setPackages(list);
    }
  };

  const deletePackage = async (id: string) => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'packages', id);
        await deleteDoc(docRef);
        setPackages((prev) => {
          const list = prev.filter((p) => p.id !== id);
          localStorage.setItem('cmt_packages', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `packages/${id}`);
      }
    } else {
      const list = packages.filter((p) => p.id !== id);
      localStorage.setItem('cmt_packages', JSON.stringify(list));
      setPackages(list);
    }
  };

  // Blog Management
  const createBlog = async (blogData: Omit<BlogPost, 'id' | 'createdAt'>): Promise<BlogPost> => {
    const newPost: BlogPost = {
      ...blogData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseActive && db) {
      try {
        const docRef = await addDoc(collection(db, 'blogs'), {
          title: newPost.title,
          excerpt: newPost.excerpt,
          content: newPost.content,
          image: newPost.image,
          author: newPost.author,
          tags: newPost.tags || [],
          createdAt: newPost.createdAt,
        });
        newPost.id = docRef.id;
        setBlogs((prev) => {
          const list = [newPost, ...prev];
          localStorage.setItem('cmt_blogs', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'blogs');
      }
    } else {
      const stored = localStorage.getItem('cmt_blogs');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newPost);
      localStorage.setItem('cmt_blogs', JSON.stringify(list));
      setBlogs(list);
    }

    return newPost;
  };

  const deleteBlog = async (id: string) => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'blogs', id);
        await deleteDoc(docRef);
        setBlogs((prev) => {
          const list = prev.filter((b) => b.id !== id);
          localStorage.setItem('cmt_blogs', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `blogs/${id}`);
      }
    } else {
      const list = blogs.filter((b) => b.id !== id);
      localStorage.setItem('cmt_blogs', JSON.stringify(list));
      setBlogs(list);
    }
  };

  const updateBlog = async (id: string, updatedFields: Partial<BlogPost>) => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'blogs', id);
        await updateDoc(docRef, updatedFields as any);
        setBlogs((prev) => {
          const list = prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
          localStorage.setItem('cmt_blogs', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `blogs/${id}`);
      }
    } else {
      const list = blogs.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
      localStorage.setItem('cmt_blogs', JSON.stringify(list));
      setBlogs(list);
    }
  };

  const addVideoTestimonial = async (videoData: Omit<VideoTestimonial, 'id' | 'createdAt'>): Promise<VideoTestimonial> => {
    const newVideo: VideoTestimonial = {
      ...videoData,
      id: `vid-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isFirebaseActive && db) {
      try {
        const docRef = await addDoc(collection(db, 'videoTestimonials'), {
          name: newVideo.name,
          title: newVideo.title,
          location: newVideo.location,
          videoUrl: newVideo.videoUrl,
          duration: Number(newVideo.duration),
          createdAt: newVideo.createdAt,
        });
        newVideo.id = docRef.id;
        setVideoTestimonials((prev) => {
          const list = [...prev, newVideo];
          localStorage.setItem('cmt_videoTestimonials', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'videoTestimonials');
      }
    } else {
      const stored = localStorage.getItem('cmt_videoTestimonials');
      const list = stored ? JSON.parse(stored) : [];
      list.push(newVideo);
      localStorage.setItem('cmt_videoTestimonials', JSON.stringify(list));
      setVideoTestimonials(list);
    }

    return newVideo;
  };

  const deleteVideoTestimonial = async (id: string): Promise<void> => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'videoTestimonials', id);
        await deleteDoc(docRef);
        setVideoTestimonials((prev) => {
          const list = prev.filter((v) => v.id !== id);
          localStorage.setItem('cmt_videoTestimonials', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `videoTestimonials/${id}`);
      }
    } else {
      const list = videoTestimonials.filter((v) => v.id !== id);
      localStorage.setItem('cmt_videoTestimonials', JSON.stringify(list));
      setVideoTestimonials(list);
    }
  };

  // ── Reviews CRUD ──────────────────────────────────────────────
  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isFirebaseActive && db) {
      try {
        const docRef = await addDoc(collection(db, 'reviews'), {
          name: newReview.name,
          rating: newReview.rating,
          comment: newReview.comment,
          source: newReview.source,
          createdAt: newReview.createdAt,
        });
        newReview.id = docRef.id;
        setReviews((prev) => {
          const list = [newReview, ...prev];
          localStorage.setItem('cmt_reviews', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'reviews');
      }
    } else {
      const stored = localStorage.getItem('cmt_reviews');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newReview);
      localStorage.setItem('cmt_reviews', JSON.stringify(list));
      setReviews(list);
    }

    return newReview;
  };

  const deleteReview = async (id: string): Promise<void> => {
    if (isFirebaseActive && db) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
        setReviews((prev) => {
          const list = prev.filter((r) => r.id !== id);
          localStorage.setItem('cmt_reviews', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
      }
    } else {
      const list = reviews.filter((r) => r.id !== id);
      localStorage.setItem('cmt_reviews', JSON.stringify(list));
      setReviews(list);
    }
  };

  // ── Custom Templates CRUD ─────────────────────────────────────
  const saveCustomTemplate = async (templateData: Omit<CustomTemplate, 'id' | 'createdAt'>): Promise<CustomTemplate> => {
    const newTemplate: CustomTemplate = {
      ...templateData,
      id: `tmpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseActive && db) {
      try {
        const docRef = await addDoc(collection(db, 'customTemplates'), {
          name: newTemplate.name,
          subject: newTemplate.subject,
          html: newTemplate.html,
          createdAt: newTemplate.createdAt,
        });
        newTemplate.id = docRef.id;
        setCustomTemplates((prev) => {
          const list = [newTemplate, ...prev];
          localStorage.setItem('cmt_custom_templates', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'customTemplates');
      }
    } else {
      const stored = localStorage.getItem('cmt_custom_templates');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newTemplate);
      localStorage.setItem('cmt_custom_templates', JSON.stringify(list));
      setCustomTemplates(list);
    }
    return newTemplate;
  };

  const deleteCustomTemplate = async (id: string): Promise<void> => {
    if (isFirebaseActive && db) {
      try {
        await deleteDoc(doc(db, 'customTemplates', id));
        setCustomTemplates((prev) => {
          const list = prev.filter(t => t.id !== id);
          localStorage.setItem('cmt_custom_templates', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `customTemplates/${id}`);
      }
    } else {
      const list = customTemplates.filter(t => t.id !== id);
      localStorage.setItem('cmt_custom_templates', JSON.stringify(list));
      setCustomTemplates(list);
    }
  };

  // ── Scheduled Emails CRUD ──────────────────────────────────────
  const scheduleEmail = async (emailData: Omit<ScheduledEmail, 'id' | 'createdAt' | 'status'>): Promise<ScheduledEmail> => {
    const newEmail: ScheduledEmail = {
      ...emailData,
      id: `sched-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseActive && db) {
      try {
        const docRef = await addDoc(collection(db, 'scheduledEmails'), {
          to: newEmail.to,
          subject: newEmail.subject,
          html: newEmail.html,
          sendAt: newEmail.sendAt,
          status: newEmail.status,
          attachments: newEmail.attachments || [],
          createdAt: newEmail.createdAt,
        });
        newEmail.id = docRef.id;
        setScheduledEmails((prev) => {
          const list = [newEmail, ...prev];
          localStorage.setItem('cmt_scheduled_emails', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'scheduledEmails');
      }
    } else {
      const stored = localStorage.getItem('cmt_scheduled_emails');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newEmail);
      localStorage.setItem('cmt_scheduled_emails', JSON.stringify(list));
      setScheduledEmails(list);
    }
    return newEmail;
  };

  const updateScheduledEmailStatus = async (id: string, status: 'sent' | 'failed', error?: string): Promise<void> => {
    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, 'scheduledEmails', id), {
          status,
          sentAt: status === 'sent' ? new Date().toISOString() : null,
          error: error || null
        });
        setScheduledEmails((prev) => {
          const list = prev.map(e => e.id === id ? {
            ...e,
            status,
            sentAt: status === 'sent' ? new Date().toISOString() : undefined,
            error: error || undefined
          } : e);
          localStorage.setItem('cmt_scheduled_emails', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'scheduledEmails');
      }
    } else {
      setScheduledEmails((prev) => {
        const list = prev.map(e => e.id === id ? {
          ...e,
          status,
          sentAt: status === 'sent' ? new Date().toISOString() : undefined,
          error: error || undefined
        } : e);
        localStorage.setItem('cmt_scheduled_emails', JSON.stringify(list));
        return list;
      });
    }
  };

  const deleteScheduledEmail = async (id: string): Promise<void> => {
    if (isFirebaseActive && db) {
      try {
        await deleteDoc(doc(db, 'scheduledEmails', id));
        setScheduledEmails((prev) => {
          const list = prev.filter(e => e.id !== id);
          localStorage.setItem('cmt_scheduled_emails', JSON.stringify(list));
          return list;
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `scheduledEmails/${id}`);
      }
    } else {
      const list = scheduledEmails.filter(e => e.id !== id);
      localStorage.setItem('cmt_scheduled_emails', JSON.stringify(list));
      setScheduledEmails(list);
    }
  };

  const createOffer = async (offerData: Omit<OfferMarqueeItem, 'id'>): Promise<OfferMarqueeItem> => {
    const newOffer: OfferMarqueeItem = {
      ...offerData,
      id: `offer-${Date.now()}`,
    };
    const updated = [newOffer, ...offers];
    setOffers(updated);
    localStorage.setItem('cmt_offers', JSON.stringify(updated));
    return newOffer;
  };

  const updateOffer = async (id: string, updatedFields: Partial<OfferMarqueeItem>) => {
    const updated = offers.map((offer) => (offer.id === id ? { ...offer, ...updatedFields } : offer));
    setOffers(updated);
    localStorage.setItem('cmt_offers', JSON.stringify(updated));
  };

  const deleteOffer = async (id: string) => {
    const updated = offers.filter((offer) => offer.id !== id);
    setOffers(updated);
    localStorage.setItem('cmt_offers', JSON.stringify(updated));
  };

  const appendActivityLog = async (action: string, entityType: ActivityLogEntry['entityType'], entityId?: string, detail?: string) => {
    if (!(isFirebaseActive && db)) return;
    try {
      const payload = {
        actorUid: adminUser?.uid || auth?.currentUser?.uid || null,
        actorEmail: adminUser?.email || auth?.currentUser?.email || null,
        action,
        entityType,
        entityId,
        detail,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'activityLogs'), payload);
    } catch (error) {
      console.warn('Activity log write failed:', error);
    }
  };

  const createAffiliate = async (payload: Partial<Affiliate> & { fullName: string; email: string; phone: string }): Promise<Affiliate> => {
    const newAffiliate: Affiliate = {
      id: `affiliate-${Date.now()}`,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      profileImage: payload.profileImage || '',
      address: payload.address || '',
      commissionType: payload.commissionType || 'Percentage',
      defaultCommissionValue: payload.defaultCommissionValue ?? 10,
      bankDetails: payload.bankDetails || '',
      status: payload.status || 'Active',
      joinedDate: new Date().toISOString(),
      totalBookings: 0,
      totalCommission: 0,
      totalPaid: 0,
      pendingCommission: 0,
      totalRevenueGenerated: 0,
      lastLogin: '',
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Affiliate;

    if (isFirebaseActive && db) {
      try {
        const affiliatePayload = { ...newAffiliate };
        delete (affiliatePayload as any).id;

        const ref = await addDoc(collection(db, 'affiliates'), affiliatePayload as any);
        newAffiliate.id = ref.id;
        const next = [newAffiliate, ...affiliates];
        setAffiliates(next);
        localStorage.setItem('cmt_affiliates', JSON.stringify(next));
        await appendActivityLog('create', 'affiliate', ref.id, `Created affiliate ${newAffiliate.fullName}`);
      } catch (error) {
        console.error('Failed to create affiliate:', error);
      }
    } else {
      const next = [newAffiliate, ...affiliates];
      setAffiliates(next);
      localStorage.setItem('cmt_affiliates', JSON.stringify(next));
    }

    return newAffiliate;
  };

  const updateAffiliate = async (id: string, payload: Partial<Affiliate>) => {
    const existing = affiliates.find((item) => item.id === id);
    if (!existing) return;

    const next = affiliates.map((item) => item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item);
    setAffiliates(next);
    localStorage.setItem('cmt_affiliates', JSON.stringify(next));

    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, 'affiliates', id), {
          ...payload,
          updatedAt: new Date().toISOString(),
        });
        await appendActivityLog('update', 'affiliate', id, `Updated affiliate ${payload.fullName || existing.fullName}`);
      } catch (error) {
        console.error('Failed to update affiliate:', error);
      }
    }
  };

  const deleteAffiliate = async (id: string) => {
    const existing = affiliates.find((item) => item.id === id);
    if (!existing) return;

    if (isFirebaseActive && db) {
      try {
        await deleteDoc(doc(db, 'affiliates', id));
        setAffiliates((prev) => {
          const list = prev.filter((a) => a.id !== id);
          localStorage.setItem('cmt_affiliates', JSON.stringify(list));
          return list;
        });
        await appendActivityLog('delete', 'affiliate', id, `Permanently deleted affiliate ${existing.fullName}`);
      } catch (error) {
        console.error('Failed to delete affiliate:', error);
      }
    } else {
      const next = affiliates.filter((item) => item.id !== id);
      setAffiliates(next);
      localStorage.setItem('cmt_affiliates', JSON.stringify(next));
    }
  };

  const toggleAffiliateStatus = async (id: string, status: AffiliateStatus) => {
    const existing = affiliates.find((item) => item.id === id);
    if (!existing) return;

    const next = affiliates.map((item) => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item);
    setAffiliates(next);
    localStorage.setItem('cmt_affiliates', JSON.stringify(next));

    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, 'affiliates', id), { status, updatedAt: new Date().toISOString() });
        await appendActivityLog(status === 'Active' ? 'activate' : 'disable', 'affiliate', id, `${status === 'Active' ? 'Activated' : 'Disabled'} affiliate ${existing.fullName}`);
      } catch (error) {
        console.error('Failed to toggle affiliate status:', error);
      }
    }
  };

  const createPromoCode = async (payload: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<PromoCode> => {
    const linkedAff = affiliates.find((a) => a.id === payload.affiliateId);

    const newPromo: PromoCode = {
      id: `promo-${Date.now()}`,
      code: payload.code,
      // @ts-ignore - dynamic field
      codeLower: (payload.code || '').toLowerCase(),
      label: payload.label || '',
      description: payload.description || '',
      affiliateIds: payload.affiliateIds || (payload.affiliateId ? [payload.affiliateId] : []),
      affiliateEmails: payload.affiliateEmails || (linkedAff ? [linkedAff.email] : []),
      affiliateId: payload.affiliateId,
      affiliateEmail: payload.affiliateEmail || (linkedAff ? linkedAff.email : undefined),
      affiliateName: payload.affiliateName || (linkedAff ? linkedAff.fullName : undefined),
      active: payload.active ?? true,
      applicablePackages: payload.applicablePackages || [],
      expiryDate: payload.expiryDate || undefined,
      usageLimit: payload.usageLimit ?? undefined,
      totalUsed: payload.totalUsed ?? 0,
      currentUsage: payload.currentUsage ?? payload.totalUsed ?? 0,
      status: payload.active !== false ? 'Active' : 'Disabled',
      commissionType: payload.commissionType || undefined,
      commissionValue: payload.commissionValue ?? undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: adminUser?.email || auth?.currentUser?.email || '',
    } as PromoCode;

    const next = [newPromo, ...promoCodes];
    setPromoCodes(next);
    localStorage.setItem('cmt_promoCodes', JSON.stringify(next));

    if (isFirebaseActive && db) {
      try {
        const promoPayload = cleanPayload({ ...newPromo });
        delete (promoPayload as any).id;

        const ref = await addDoc(collection(db, 'promoCodes'), promoPayload as any);
        newPromo.id = ref.id;
        const updated = [newPromo, ...promoCodes];
        setPromoCodes(updated);
        localStorage.setItem('cmt_promoCodes', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to create promo code:', error);
      }
    }

    return newPromo;
  };

  const updatePromoCode = async (id: string, payload: Partial<PromoCode>) => {
    const existing = promoCodes.find((item) => item.id === id);
    if (!existing) return;

    const linkedAff = affiliates.find((a) => a.id === (payload.affiliateId !== undefined ? payload.affiliateId : existing.affiliateId));
    const toSave: any = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    if (payload.code) toSave.codeLower = String(payload.code).toLowerCase();

    if (payload.affiliateId !== undefined) {
      toSave.affiliateIds = payload.affiliateId ? [payload.affiliateId] : [];
      toSave.affiliateName = linkedAff ? linkedAff.fullName : null;
      toSave.affiliateEmail = linkedAff ? linkedAff.email : null;
      toSave.affiliateEmails = linkedAff ? [linkedAff.email] : [];
    }
    if (payload.active !== undefined) {
      toSave.status = payload.active ? 'Active' : 'Disabled';
    }

    const next = promoCodes.map((item) => item.id === id ? { ...item, ...toSave } : item);
    setPromoCodes(next);
    localStorage.setItem('cmt_promoCodes', JSON.stringify(next));

    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, 'promoCodes', id), cleanPayload(toSave));
      } catch (error) {
        console.error('Failed to update promo code:', error);
      }
    }
  };

  const deletePromoCode = async (id: string) => {
    if (isFirebaseActive && db) {
      try {
        await deleteDoc(doc(db, 'promoCodes', id));
        setPromoCodes((prev) => {
          const list = prev.filter((p) => p.id !== id);
          localStorage.setItem('cmt_promoCodes', JSON.stringify(list));
          return list;
        });
      } catch (error) {
        console.error('Failed to delete promo code:', error);
      }
    } else {
      const next = promoCodes.filter((item) => item.id !== id);
      setPromoCodes(next);
      localStorage.setItem('cmt_promoCodes', JSON.stringify(next));
    }
  };

  const loadJsonLocal = <T,>(key: string, fallback: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    // Local defaults for editable CMS docs (used while loading / when Firebase is placeholder)
    const loadLocalDefaults = () => {
      const brand = loadJsonLocal<SiteBrandSettings>(
        'cmt_site_brand',
        { site_logo_url: '', footer_logo_url: '', favicon_url: '' }
      );
      setSiteBrandSettings(brand);

      const neta = loadJsonLocal<NetaTagsSettings>('cmt_site_neta_tags', {
        neta_tags: [],
        neta_tags_text: ''
      });
      setNetaTagsSettings(neta);

      const footer = loadJsonLocal<SiteFooterSettings>('cmt_site_footer', {
        footer_description_text: '',
        headquarters_address: '',
        phone_number: '',
        email_address: '',
        copyright_text: '',
        social_links: {
          facebook_url: '',
          instagram_url: '',
          twitter_url: '',
          youtube_url: ''
        }
      });
      setFooterSettings(footer);

      const about = loadJsonLocal<AboutSettings>('cmt_site_about', {
        about_title: '',
        about_description: '',
        about_image_url: ''
      });
      setAboutSettings(about);

      const contact = loadJsonLocal<ContactSettings>('cmt_site_contact', {
        email_address: '',
        // Default WhatsApp/phone hotline requested by admin
        phone_number: '+91 9474103441'
      });
      setContactSettings(contact);

    };

    loadLocalDefaults();

    if (!isFirebaseActive || !db) return;

    // Live read from Firestore for immediate rerender after admin edits
    const unsubscribers: Array<() => void> = [];

    // const { doc, onSnapshot } = require('firebase/firestore');
    // const { doc, onSnapshot } = await import('firebase/firestore');

    const refFooter = doc(db, 'siteSettings', 'footer');
    const refAbout = doc(db, 'siteSettings', 'about');
    const refContact = doc(db, 'siteSettings', 'contact');
    const refBrand = doc(db, 'siteBrandSettings', 'brand');
    const refNeta = doc(db, 'netaTagsSettings', 'tags');

    unsubscribers.push(
      onSnapshot(refFooter, (snap: any) => {
        const data = (snap?.data?.() || {}) as Partial<SiteFooterSettings>;
        setFooterSettings({
          footer_description_text: data.footer_description_text || '',
          headquarters_address: data.headquarters_address || '',
          phone_number: data.phone_number || '',
          email_address: data.email_address || '',
          copyright_text: data.copyright_text || '',
          social_links: {
            facebook_url: data.social_links?.facebook_url || '',
            instagram_url: data.social_links?.instagram_url || '',
            twitter_url: data.social_links?.twitter_url || '',
            youtube_url: data.social_links?.youtube_url || ''
          }
        });
      })
    );

    unsubscribers.push(
      onSnapshot(refAbout, (snap: any) => {
        const data = (snap?.data?.() || {}) as Partial<AboutSettings>;
        setAboutSettings({
          about_title: data.about_title || '',
          about_description: data.about_description || '',
          about_image_url: data.about_image_url || ''
        });
      })
    );

    unsubscribers.push(
      onSnapshot(refContact, (snap: any) => {
        const data = (snap?.data?.() || {}) as Partial<ContactSettings>;
        setContactSettings({
          email_address: data.email_address || '',
          phone_number: data.phone_number || ''
        });
      })
    );

    unsubscribers.push(
      onSnapshot(refBrand, (snap: any) => {
        const data = (snap?.data?.() || {}) as Partial<SiteBrandSettings>;
        setSiteBrandSettings({
          site_logo_url: data.site_logo_url || '',
          footer_logo_url: data.footer_logo_url || '',
          favicon_url: data.favicon_url || ''
        });
      })
    );

    unsubscribers.push(
      onSnapshot(refNeta, (snap: any) => {
        const data = (snap?.data?.() || {}) as Partial<NetaTagsSettings>;
        const tagsArr = Array.isArray(data.neta_tags) ? data.neta_tags : [];
        setNetaTagsSettings({
          neta_tags: tagsArr,
          neta_tags_text: data.neta_tags_text || (tagsArr.length ? tagsArr.join(', ') : '')
        });
      })
    );

    return () => {
      unsubscribers.forEach((u) => u && u());
    };
  }, [isFirebaseActive, db]);




  const upsertSiteSettingsDoc = async (docId: 'footer' | 'about' | 'contact', data: any) => {
    if (!(isFirebaseActive && db)) {
      if (docId === 'footer') {
        localStorage.setItem('cmt_site_footer', JSON.stringify(data));
        setFooterSettings(data as SiteFooterSettings);
      } else if (docId === 'about') {
        localStorage.setItem('cmt_site_about', JSON.stringify(data));
        setAboutSettings(data as AboutSettings);
      } else {
        localStorage.setItem('cmt_site_contact', JSON.stringify(data));
        setContactSettings(data as ContactSettings);
      }
      return;
    }

    const ref = doc(db, 'siteSettings', docId);
    const { setDoc } = await import('firebase/firestore');
    await setDoc(ref, data, { merge: true } as any);
  };

  const upsertBrandDoc = async (data: SiteBrandSettings) => {
    if (!(isFirebaseActive && db)) {
      localStorage.setItem('cmt_site_brand', JSON.stringify(data));
      setSiteBrandSettings(data);
      return;
    }
    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'siteBrandSettings', 'brand'), data, { merge: true } as any);
  };

  const upsertNetaTagsDoc = async (data: NetaTagsSettings) => {
    if (!(isFirebaseActive && db)) {
      localStorage.setItem('cmt_site_neta_tags', JSON.stringify(data));
      setNetaTagsSettings(data);
      return;
    }
    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'netaTagsSettings', 'tags'), data, { merge: true } as any);
  };

  // CMS setters
  const updateFooterSettings = async (data: SiteFooterSettings) => {
    await upsertSiteSettingsDoc('footer', data);
  };

  const updateAboutSettings = async (data: AboutSettings) => {
    await upsertSiteSettingsDoc('about', data);
  };

  const updateContactSettings = async (data: ContactSettings) => {
    await upsertSiteSettingsDoc('contact', data);
  };

  const updateSiteBrandSettings = async (data: SiteBrandSettings) => {
    await upsertBrandDoc(data);
  };

  const updateNetaTagsSettings = async (data: NetaTagsSettings) => {
    await upsertNetaTagsDoc(data);
  };

  const generateNextBookingId = (currentYear?: number): string => {
    const year = currentYear || new Date().getFullYear();
    const prefix = `CMT${year}`;
    let maxSeq = 10;
    bookings.forEach((b) => {
      if (b.id && b.id.startsWith(prefix)) {
        const seqStr = b.id.substring(prefix.length);
        const seqVal = parseInt(seqStr, 10);
        if (!isNaN(seqVal) && seqVal > maxSeq) {
          maxSeq = seqVal;
        }
      }
    });
    const nextSeq = maxSeq + 1;
    const padded = String(nextSeq).padStart(3, '0');
    return `${prefix}${padded}`;
  };

  const addBookingDirect = async (bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
    const customId = generateNextBookingId();
    const newBooking: Booking = {
      ...bookingData,
      id: customId,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        await setDoc(doc(db, 'bookings', customId), cleanPayload(newBooking));
        return newBooking;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `bookings/${customId}`);
        throw err;
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_bookings');
    const list = stored ? (JSON.parse(stored) as Booking[]) : [];
    list.unshift(newBooking);
    localStorage.setItem('cmt_bookings', JSON.stringify(list));
    setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    return newBooking;
  };

  const updateBooking = async (id: string, updates: Partial<Booking>): Promise<void> => {
    const cleanUpdates = cleanPayload(updates);
    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        await updateDoc(doc(db, 'bookings', id), cleanUpdates);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
        throw err;
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_bookings');
    if (stored) {
      let list = JSON.parse(stored) as Booking[];
      list = list.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b));
      localStorage.setItem('cmt_bookings', JSON.stringify(list));
      setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const deleteBooking = async (id: string): Promise<void> => {
    if (id && isFirebaseActive && db && auth?.currentUser) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `bookings/${id}`);
        throw err;
      }
    }

    // LocalStorage fallback and state sync
    const stored = localStorage.getItem('cmt_bookings');
    if (stored) {
      let list = JSON.parse(stored) as Booking[];
      list = list.filter((b) => b.id !== id && b.id !== '');
      localStorage.setItem('cmt_bookings', JSON.stringify(list));
      setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const addBookingsBulk = async (bookingsData: Omit<Booking, 'id' | 'createdAt'>[]): Promise<Booking[]> => {
    const year = new Date().getFullYear();
    const prefix = `CMT${year}`;
    let maxSeq = 0;
    
    bookings.forEach((b) => {
      if (b.id && b.id.startsWith(prefix)) {
        const seqStr = b.id.substring(prefix.length);
        const seqVal = parseInt(seqStr, 10);
        if (!isNaN(seqVal) && seqVal > maxSeq) {
          maxSeq = seqVal;
        }
      }
    });

    const newBookings: Booking[] = bookingsData.map((bookingData) => {
      maxSeq++;
      const padded = String(maxSeq).padStart(3, '0');
      const customId = `${prefix}${padded}`;
      return {
        ...bookingData,
        id: customId,
        createdAt: new Date().toISOString(),
      };
    });

    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        const { writeBatch, doc } = await import('firebase/firestore');
        const batch = writeBatch(db);
        newBookings.forEach((nb) => {
          const docRef = doc(db, 'bookings', nb.id);
          batch.set(docRef, cleanPayload(nb));
        });
        await batch.commit();
        return newBookings;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'bookings/bulk');
        throw err;
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_bookings');
    const list = stored ? (JSON.parse(stored) as Booking[]) : [];
    list.unshift(...newBookings);
    localStorage.setItem('cmt_bookings', JSON.stringify(list));
    setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    return newBookings;
  };

  const updateBookingsBulk = async (updates: { id: string; data: Partial<Booking> }[]): Promise<void> => {
    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        const { writeBatch, doc } = await import('firebase/firestore');
        const batch = writeBatch(db);
        updates.forEach((u) => {
          const docRef = doc(db, 'bookings', u.id);
          batch.update(docRef, cleanPayload(u.data));
        });
        await batch.commit();
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'bookings/bulk');
        throw err;
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_bookings');
    if (stored) {
      let list = JSON.parse(stored) as Booking[];
      updates.forEach((u) => {
        list = list.map((b) => (b.id === u.id ? { ...b, ...u.data, updatedAt: new Date().toISOString() } : b));
      });
      localStorage.setItem('cmt_bookings', JSON.stringify(list));
      setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const addVendorPayment = async (paymentData: Omit<VendorPayment, 'id' | 'createdAt'>): Promise<VendorPayment> => {
    const newPayment: VendorPayment = {
      ...paymentData,
      id: '',
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        const docRef = await addDoc(collection(db, 'vendorPayments'), cleanPayload(newPayment));
        newPayment.id = docRef.id;
        return newPayment;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'vendorPayments');
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_vendor_payments');
    const list = stored ? (JSON.parse(stored) as VendorPayment[]) : [];
    newPayment.id = 'direct-vp-' + Math.random().toString(36).substr(2, 9);
    list.push(newPayment);
    localStorage.setItem('cmt_vendor_payments', JSON.stringify(list));
    setVendorPayments(list);
    return newPayment;
  };

  const updateVendorPayment = async (id: string, updates: Partial<VendorPayment>): Promise<void> => {
    const cleanUpdates = cleanPayload(updates);
    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        await updateDoc(doc(db, 'vendorPayments', id), cleanUpdates);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `vendorPayments/${id}`);
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_vendor_payments');
    if (stored) {
      let list = JSON.parse(stored) as VendorPayment[];
      list = list.map((vp) => (vp.id === id ? { ...vp, ...updates, updatedAt: new Date().toISOString() } : vp));
      localStorage.setItem('cmt_vendor_payments', JSON.stringify(list));
      setVendorPayments(list);
    }
  };

  const deleteVendorPayment = async (id: string): Promise<void> => {
    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        await deleteDoc(doc(db, 'vendorPayments', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `vendorPayments/${id}`);
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_vendor_payments');
    if (stored) {
      let list = JSON.parse(stored) as VendorPayment[];
      list = list.filter((vp) => vp.id !== id);
      localStorage.setItem('cmt_vendor_payments', JSON.stringify(list));
      setVendorPayments(list);
    }
  };

  const addMasterVendor = async (vendorData: Omit<MasterVendor, 'id' | 'createdAt'>): Promise<MasterVendor> => {
    const newVendor: MasterVendor = {
      ...vendorData,
      id: '',
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        const docRef = await addDoc(collection(db, 'masterVendors'), cleanPayload(newVendor));
        newVendor.id = docRef.id;
        return newVendor;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'masterVendors');
        throw err;
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_master_vendors');
    const list = stored ? (JSON.parse(stored) as MasterVendor[]) : [];
    newVendor.id = 'master-vnd-' + Math.random().toString(36).substr(2, 9);
    list.unshift(newVendor);
    localStorage.setItem('cmt_master_vendors', JSON.stringify(list));
    setMasterVendors(list);
    return newVendor;
  };

  const updateMasterVendor = async (id: string, updates: Partial<MasterVendor>): Promise<void> => {
    const cleanUpdates = cleanPayload(updates);
    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        await updateDoc(doc(db, 'masterVendors', id), cleanUpdates);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `masterVendors/${id}`);
        throw err;
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_master_vendors');
    if (stored) {
      let list = JSON.parse(stored) as MasterVendor[];
      list = list.map((v) => (v.id === id ? { ...v, ...updates } : v));
      localStorage.setItem('cmt_master_vendors', JSON.stringify(list));
      setMasterVendors(list);
    }
  };

  const deleteMasterVendor = async (id: string): Promise<void> => {
    if (isFirebaseActive && db && auth?.currentUser) {
      try {
        await deleteDoc(doc(db, 'masterVendors', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `masterVendors/${id}`);
        throw err;
      }
    }

    // LocalStorage fallback
    const stored = localStorage.getItem('cmt_master_vendors');
    if (stored) {
      let list = JSON.parse(stored) as MasterVendor[];
      list = list.filter((v) => v.id !== id);
      localStorage.setItem('cmt_master_vendors', JSON.stringify(list));
      setMasterVendors(list);
    }
  };



  return (
    <DataContext.Provider
      value={{
        packages,
        blogs,
        enquiries,
        reviews,
        videoTestimonials,
        offers,
        adminUser,
        isAdminLoggedIn,
        role,
        affiliateId,
        affiliateProfile,
        isFirebaseActive,
        loading,
        loginWithGoogle,
        localAdminBypass,
        localAffiliateBypass,
        logout,

        footerSettings,
        aboutSettings,
        contactSettings,
        siteBrandSettings,
        netaTagsSettings,
        updateFooterSettings,
        updateAboutSettings,
        updateContactSettings,
        updateSiteBrandSettings,
        updateNetaTagsSettings,


        addEnquiry,
        updateEnquiryStatus,
        convertEnquiryToBooking,
        updateBookingStatus,
        appendNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteEnquiry,
        createPackage,
        updatePackage,
        deletePackage,
        createBlog,
        updateBlog,
        deleteBlog,
        addVideoTestimonial,
        deleteVideoTestimonial,
        addReview,
        deleteReview,
        customTemplates,
        scheduledEmails,
        saveCustomTemplate,
        deleteCustomTemplate,
        scheduleEmail,
        deleteScheduledEmail,
        updateScheduledEmailStatus,
        createOffer,
        updateOffer,
        deleteOffer,
        affiliates,
        promoCodes,
        bookings,
        commissions,
        notifications,
        createPromoCode,
        updatePromoCode,
        deletePromoCode,
        createAffiliate,
        updateAffiliate,
        deleteAffiliate,
        toggleAffiliateStatus,
        updateEnquiryFields,
        validatePromoCode,

        toasts,
        showToast,
        removeToast,

        vendorPayments,
        masterVendors,
        addBookingDirect,
        addBookingsBulk,
        updateBooking,
        updateBookingsBulk,
        deleteBooking,
        addVendorPayment,
        updateVendorPayment,
        deleteVendorPayment,
        addMasterVendor,
        updateMasterVendor,
        deleteMasterVendor,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </DataContext.Provider>
  );
};
