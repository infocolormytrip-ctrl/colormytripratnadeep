import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, isPlaceholder } from '../lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot
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
  BlogPost,
  Review,
  VideoTestimonial,
  OfferMarqueeItem
} from '../types';
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
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface DataContextType {
  packages: TravelPackage[];
  blogs: BlogPost[];
  enquiries: Enquiry[];
  reviews: Review[];
  videoTestimonials: VideoTestimonial[];
  offers: OfferMarqueeItem[];
  adminUser: User | null;
  isAdminLoggedIn: boolean;
  isFirebaseActive: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  localAdminBypass: () => void;
  logout: () => Promise<void>;

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


  addEnquiry: (enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => Promise<Enquiry>;
  updateEnquiryStatus: (id: string, status: 'pending' | 'responded' | 'closed') => Promise<void>;
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [reviews] = useState<Review[]>(initialReviews);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>(initialVideoTestimonials);
  const [offers, setOffers] = useState<OfferMarqueeItem[]>([]);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [bypassAdmin, setBypassAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [footerSettings, setFooterSettings] = useState<SiteFooterSettings>({});
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>({});
  const [contactSettings, setContactSettings] = useState<ContactSettings>({});

  const [siteBrandSettings, setSiteBrandSettings] = useState<SiteBrandSettings>({});
  const [netaTagsSettings, setNetaTagsSettings] = useState<NetaTagsSettings>({});


  const isFirebaseActive = !isPlaceholder;

  // 1. Sync Authentication
  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAdminUser(user);
        setLoading(false);
      });
      return unsubscribe;
    }
    setLoading(false);
  }, [isFirebaseActive]);

  useEffect(() => {
    const stored = localStorage.getItem('cmt_offers');
    if (stored) {
      setOffers(JSON.parse(stored));
    } else {
      localStorage.setItem('cmt_offers', JSON.stringify(initialOffers));
      setOffers(initialOffers);
    }
  }, []);

  // 2. Fetch Packages & Blogs
  useEffect(() => {
    const fetchInitialData = async () => {
      if (isFirebaseActive && db) {
        try {
          const pkgsCol = collection(db, 'packages');
          const snapshot = await getDocs(pkgsCol);
          if (snapshot.empty) {
            for (const p of initialPackages) {
              const { id, ...data } = p;
              await addDoc(collection(db, 'packages'), { ...data, createdAt: new Date().toISOString() });
            }
            const updatedSnap = await getDocs(pkgsCol);
            const list = updatedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TravelPackage));
            setPackages(list);
          } else {
            const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TravelPackage));
            setPackages(list);
          }
        } catch (error) {
          console.error('Firestore packages fetch error, falling back to local storage:', error);
          loadPackagesLocal();
        }

        try {
          const blogsCol = collection(db, 'blogs');
          const snapshot = await getDocs(blogsCol);
          if (snapshot.empty) {
            for (const b of initialBlogs) {
              const { id, ...data } = b;
              await addDoc(collection(db, 'blogs'), { ...data });
            }
            const updatedSnap = await getDocs(blogsCol);
            const list = updatedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BlogPost));
            setBlogs(list);
          } else {
            const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BlogPost));
            setBlogs(list);
          }
        } catch (error) {
          console.error('Firestore blogs fetch error, falling back to local storage:', error);
          loadBlogsLocal();
        }
      } else {
        loadPackagesLocal();
        loadBlogsLocal();
      }
    };

    fetchInitialData();
  }, [isFirebaseActive]);

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

  const isAdminLoggedIn = Boolean(bypassAdmin || (isFirebaseActive && adminUser && adminUser.email === 'info.colormytrip@gmail.com'));

  useEffect(() => {
    if (isAdminLoggedIn) {
      if (isFirebaseActive && db) {
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

      const stored = localStorage.getItem('cmt_enquiries');
      if (stored) setEnquiries(JSON.parse(stored));
    }
  }, [isAdminLoggedIn, isFirebaseActive]);

  // Google Login
  const loginWithGoogle = async () => {
    if (isFirebaseActive && auth) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        if (user && user.email !== 'info.colormytrip@gmail.com') {
          alert('Access Denied: Only info.colormytrip@gmail.com is authorized to log in.');
          await signOut(auth);
        }
      } catch (error) {
        console.error('Google Sign In error:', error);
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

  // Logout
  const logout = async () => {
    if (isFirebaseActive && auth) {
      await signOut(auth);
    }
    setBypassAdmin(false);
  };

  // 4. CRUD operations: Enquiry Create
  const addEnquiry = async (
    enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'status'>
  ): Promise<Enquiry> => {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      status: 'pending',
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
          createdAt: newEnquiry.createdAt,
          packageId: newEnquiry.packageId || '',
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

    try {
      await fetch('/api/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnquiry),
      });
    } catch (err) {
      console.warn('Backend email notification log request failed (it will still be saved to the database!):', err);
    }

    return newEnquiry;
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

  // Package Management (Admin)
  const createPackage = async (pkgData: Omit<TravelPackage, 'id'>): Promise<TravelPackage> => {
    const newPkg: TravelPackage = {
      ...pkgData,
      id: Math.random().toString(36).substring(2, 9),
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
        });
        newPkg.id = docRef.id;
        setPackages((prev) => [newPkg, ...prev]);
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
        setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)));
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
        setPackages((prev) => prev.filter((p) => p.id !== id));
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
        setBlogs((prev) => [newPost, ...prev]);
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
        setBlogs((prev) => prev.filter((b) => b.id !== id));
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
        setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b)));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `blogs/${id}`);
      }
    } else {
      const list = blogs.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
      localStorage.setItem('cmt_blogs', JSON.stringify(list));
      setBlogs(list);
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
        isFirebaseActive,
        loading,
        loginWithGoogle,
        localAdminBypass,
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
        createPackage,
        updatePackage,
        deletePackage,
        createBlog,
        updateBlog,
        deleteBlog,
        addVideoTestimonial: async (video: Omit<VideoTestimonial, 'id' | 'createdAt'>) => {
          const newVideo: VideoTestimonial = {
            ...video,
            id: `vid-${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0],
          };
          setVideoTestimonials((prev) => [...prev, newVideo]);
          return newVideo;
        },
        deleteVideoTestimonial: async (id: string) => {
          setVideoTestimonials((prev) => prev.filter((v) => v.id !== id));
        },
        createOffer,
        updateOffer,
        deleteOffer,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

