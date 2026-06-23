import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, isPlaceholder } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocsFromServer,
  onSnapshot 
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { TravelPackage, Enquiry, BlogPost, Review, VideoTestimonial, OfferMarqueeItem } from '../types';
import { initialPackages, initialBlogs, initialReviews, initialVideoTestimonials, initialOffers } from '../initialData';

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
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
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
  addEnquiry: (enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => Promise<Enquiry>;
  updateEnquiryStatus: (id: string, status: 'pending' | 'responded' | 'closed') => Promise<void>;
  createPackage: (pkg: Omit<TravelPackage, 'id'>) => Promise<TravelPackage>;
  updatePackage: (id: string, pkg: Partial<TravelPackage>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  createBlog: (post: Omit<BlogPost, 'id' | 'createdAt'>) => Promise<BlogPost>;
  updateBlog: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addVideoTestimonial: (video: Omit<VideoTestimonial, 'id' | 'createdAt'>) => Promise<VideoTestimonial>;
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

  const isFirebaseActive = !isPlaceholder;

  // 1. Sync Authentication
  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAdminUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
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
      // Fetch Packages
      if (isFirebaseActive && db) {
        try {
          const pkgsCol = collection(db, 'packages');
          const snapshot = await getDocs(pkgsCol);
          if (snapshot.empty) {
            // Seed packages if DB is brand new
            for (const p of initialPackages) {
              const { id, ...data } = p;
              await addDoc(collection(db, 'packages'), { ...data, createdAt: new Date().toISOString() });
            }
            const updatedSnap = await getDocs(pkgsCol);
            const list = updatedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TravelPackage));
            setPackages(list);
          } else {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TravelPackage));
            setPackages(list);
          }
        } catch (error) {
          console.error('Firestore packages fetch error, falling back to local storage:', error);
          loadPackagesLocal();
        }

        // Fetch Blogs
        try {
          const blogsCol = collection(db, 'blogs');
          const snapshot = await getDocs(blogsCol);
          if (snapshot.empty) {
            for (const b of initialBlogs) {
              const { id, ...data } = b;
              await addDoc(collection(db, 'blogs'), { ...data });
            }
            const updatedSnap = await getDocs(blogsCol);
            const list = updatedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
            setBlogs(list);
          } else {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
            setBlogs(list);
          }
        } catch (error) {
          console.error('Firestore blogs fetch error, falling back to local storage:', error);
          loadBlogsLocal();
        }
      } else {
        // Fallback Local Sync
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

  // 3. Fetch Enquiries (Only if admin logged in or bypass enabled)
  const isAdminLoggedIn = bypassAdmin || (isFirebaseActive && adminUser && (
    adminUser.email === 'info.colormytrip@gmail.com'
  ));

  useEffect(() => {
    if (isAdminLoggedIn) {
      if (isFirebaseActive && db) {
        const enqCol = collection(db, 'enquiries');
        const unsubscribe = onSnapshot(enqCol, (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry));
          setEnquiries(list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'enquiries');
        });
        return unsubscribe;
      } else {
        const stored = localStorage.getItem('cmt_enquiries');
        if (stored) {
          setEnquiries(JSON.parse(stored));
        }
      }
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
      // Firebase not configured: do not allow sandbox/bypass login.
      setBypassAdmin(false);
    }
  };

  const localAdminBypass = () => {
    setBypassAdmin(prev => !prev);
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
  const addEnquiry = async (enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'status'>): Promise<Enquiry> => {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    // Store in Firestore if active
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
          packageId: newEnquiry.packageId || ''
        });
        newEnquiry.id = docRef.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'enquiries');
      }
    } else {
      // Local sync
      const stored = localStorage.getItem('cmt_enquiries');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newEnquiry);
      localStorage.setItem('cmt_enquiries', JSON.stringify(list));
      setEnquiries(list);
    }

    // Call full-stack Express API to trigger email logging to Info.colormytrip@gmail.com
    try {
      await fetch('/api/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnquiry)
      });
    } catch (err) {
      console.warn('Backend email notification log request failed (it will still be saved to the database!):', err);
    }

    return newEnquiry;
  };

  // Update Enquiry Status
  const updateEnquiryStatus = async (id: string, status: 'pending' | 'responded' | 'closed') => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'enquiries', id);
        await updateDoc(docRef, { status });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `enquiries/${id}`);
      }
    } else {
      const updatedList = enquiries.map(e => e.id === id ? { ...e, status } : e);
      localStorage.setItem('cmt_enquiries', JSON.stringify(updatedList));
      setEnquiries(updatedList);
    }
  };

  // Package Management (Admin)
  const createPackage = async (pkgData: Omit<TravelPackage, 'id'>): Promise<TravelPackage> => {
    const newPkg: TravelPackage = {
      ...pkgData,
      id: Math.random().toString(36).substring(2, 9)
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
          exclusions: newPkg.exclusions || []
        });
        newPkg.id = docRef.id;
        setPackages(prev => [newPkg, ...prev]);
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
        setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `packages/${id}`);
      }
    } else {
      const list = packages.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      localStorage.setItem('cmt_packages', JSON.stringify(list));
      setPackages(list);
    }
  };

  const deletePackage = async (id: string) => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'packages', id);
        await deleteDoc(docRef);
        setPackages(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `packages/${id}`);
      }
    } else {
      const list = packages.filter(p => p.id !== id);
      localStorage.setItem('cmt_packages', JSON.stringify(list));
      setPackages(list);
    }
  };

  // Blog Management
  const createBlog = async (blogData: Omit<BlogPost, 'id' | 'createdAt'>): Promise<BlogPost> => {
    const newPost: BlogPost = {
      ...blogData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
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
          createdAt: newPost.createdAt
        });
        newPost.id = docRef.id;
        setBlogs(prev => [newPost, ...prev]);
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
        setBlogs(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `blogs/${id}`);
      }
    } else {
      const list = blogs.filter(b => b.id !== id);
      localStorage.setItem('cmt_blogs', JSON.stringify(list));
      setBlogs(list);
    }
  };

  const updateBlog = async (id: string, updatedFields: Partial<BlogPost>) => {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, 'blogs', id);
        await updateDoc(docRef, updatedFields as any);
        setBlogs(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `blogs/${id}`);
      }
    } else {
      const list = blogs.map(b => b.id === id ? { ...b, ...updatedFields } : b);
      localStorage.setItem('cmt_blogs', JSON.stringify(list));
      setBlogs(list);
    }
  };

  const createOffer = async (offerData: Omit<OfferMarqueeItem, 'id'>): Promise<OfferMarqueeItem> => {
    const newOffer: OfferMarqueeItem = {
      ...offerData,
      id: `offer-${Date.now()}`
    };
    const updated = [newOffer, ...offers];
    setOffers(updated);
    localStorage.setItem('cmt_offers', JSON.stringify(updated));
    return newOffer;
  };

  const updateOffer = async (id: string, updatedFields: Partial<OfferMarqueeItem>) => {
    const updated = offers.map((offer) => offer.id === id ? { ...offer, ...updatedFields } : offer);
    setOffers(updated);
    localStorage.setItem('cmt_offers', JSON.stringify(updated));
  };

  const deleteOffer = async (id: string) => {
    const updated = offers.filter((offer) => offer.id !== id);
    setOffers(updated);
    localStorage.setItem('cmt_offers', JSON.stringify(updated));
  };

  return (
    <DataContext.Provider value={{
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
          createdAt: new Date().toISOString().split('T')[0]
        };
        setVideoTestimonials([...videoTestimonials, newVideo]);
        return newVideo;
      },
      deleteVideoTestimonial: async (id: string) => {
        setVideoTestimonials(videoTestimonials.filter(v => v.id !== id));
      },
      createOffer,
      updateOffer,
      deleteOffer
    }}>
      {children}
    </DataContext.Provider>
  );
};
