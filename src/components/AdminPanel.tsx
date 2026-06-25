import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { TravelPackage, BlogPost, OfferMarqueeItem } from '../types';
import { 
  Inbox, 
  Plus, 
  Trash2, 
  X, 
  Globe,
  Database,
  BookOpen,
  Lock,
  Sparkles,
  Video,
  Save,
  Upload,
  Pencil,
  Megaphone,
  Palette,
  Timer
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { 
    packages, 
    blogs, 
    enquiries, 
    videoTestimonials,
    offers,
    isAdminLoggedIn, 
    isFirebaseActive, 
    createPackage, 
    updatePackage,
    deletePackage,
    updateEnquiryStatus,
    logout,
    loginWithGoogle,
    localAdminBypass,
    createBlog,
    updateBlog,
    deleteBlog,
    addVideoTestimonial,
    deleteVideoTestimonial,
    createOffer,
    updateOffer,
    deleteOffer,

    // CMS settings
    footerSettings,
    contactSettings,
    siteBrandSettings,
    netaTagsSettings,
    updateFooterSettings,
    updateContactSettings,
    updateSiteBrandSettings,
    updateNetaTagsSettings
  } = useData();

  // Active view tabs
  const [panelTab, setPanelTab] = useState<'enquiries' | 'packages' | 'blogs' | 'offers' | 'videos' | 'website'>('enquiries');
  
  // Status filters for enquiries
  const [enqFilter, setEnqFilter] = useState<'all' | 'pending' | 'responded' | 'closed'>('all');

  // Modal open flags
  const [showPkgAdd, setShowPkgAdd] = useState(false);
  const [showBlogAdd, setShowBlogAdd] = useState(false);
  const [showVideoAdd, setShowVideoAdd] = useState(false);
  const [showPkgBulkAdd, setShowPkgBulkAdd] = useState(false);
  const [showOfferAdd, setShowOfferAdd] = useState(false);

  // Package submission form state
  const [pTitle, setPTitle] = useState('');
  const [pCat, setPCat] = useState<'domestic' | 'international' | 'trekking'>('domestic');
  const [pPrice, setPPrice] = useState('');
  const [pDuration, setPDuration] = useState('');
  const [pLoc, setPLoc] = useState('');
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pInclusions, setPInclusions] = useState('');
  const [pExclusions, setPExclusions] = useState('');
  const [pItinerary, setPItinerary] = useState('');
  const [pFeatured, setPFeatured] = useState(true);
  const [bulkPkgJson, setBulkPkgJson] = useState('');
  const [pkgEditingId, setPkgEditingId] = useState<string | null>(null);

  // Blog submission form state
  const [bTitle, setBTitle] = useState('');
  const [bExcerpt, setBExcerpt] = useState('');
  const [bContent, setBContent] = useState('');
  const [bImage, setBImage] = useState('');
  const [bAuthor, setBAuthor] = useState('');
  const [bTags, setBTags] = useState('');
  const [blogEditingId, setBlogEditingId] = useState<string | null>(null);

  // Video testimonial form state
  const [vName, setVName] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vLocation, setVLocation] = useState('');
  const [vVideoUrl, setVVideoUrl] = useState('');
  const [vDuration, setVDuration] = useState('');
  const [offerText, setOfferText] = useState('');
  const [offerActive, setOfferActive] = useState(true);
  const [offerSpeed, setOfferSpeed] = useState('28');
  const [offerBackground, setOfferBackground] = useState('#eef6ff');
  const [offerTextColor, setOfferTextColor] = useState('#334155');
  const [offerEditingId, setOfferEditingId] = useState<string | null>(null);

  const resetPackageForm = () => {
    setPTitle('');
    setPCat('domestic');
    setPPrice('');
    setPDuration('');
    setPLoc('');
    setPImage('');
    setPDesc('');
    setPInclusions('');
    setPExclusions('');
    setPItinerary('');
    setPFeatured(true);
    setPkgEditingId(null);
  };

  const resetBlogForm = () => {
    setBTitle('');
    setBExcerpt('');
    setBContent('');
    setBImage('');
    setBAuthor('');
    setBTags('');
    setBlogEditingId(null);
  };

  const openPackageEditor = (pkg: TravelPackage) => {
    setPkgEditingId(pkg.id);
    setPTitle(pkg.title);
    setPCat(pkg.category);
    setPPrice(String(pkg.price));
    setPDuration(pkg.duration);
    setPLoc(pkg.location);
    setPImage(pkg.image);
    setPDesc(pkg.description);
    setPInclusions(pkg.inclusions.join('\n'));
    setPExclusions(pkg.exclusions.join('\n'));
    setPItinerary(pkg.itinerary.join('\n'));
    setPFeatured(pkg.featured);
    setShowPkgAdd(true);
  };

  const openBlogEditor = (post: BlogPost) => {
    setBlogEditingId(post.id);
    setBTitle(post.title);
    setBExcerpt(post.excerpt);
    setBContent(post.content);
    setBImage(post.image);
    setBAuthor(post.author);
    setBTags(post.tags.join(', '));
    setShowBlogAdd(true);
  };

  const resetOfferForm = () => {
    setOfferText('');
    setOfferActive(true);
    setOfferSpeed('28');
    setOfferBackground('#eef6ff');
    setOfferTextColor('#334155');
    setOfferEditingId(null);
  };

  // CMS form state
  const [siteLogoUrl, setSiteLogoUrl] = useState('');
  const [footerLogoUrl, setFooterLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  const [footerDescriptionText, setFooterDescriptionText] = useState('');
  const [footerHeadquartersAddress, setFooterHeadquartersAddress] = useState('');
  const [footerPhoneNumber, setFooterPhoneNumber] = useState('');
  const [footerEmailAddress, setFooterEmailAddress] = useState('');
  const [footerCopyrightText, setFooterCopyrightText] = useState('');

  const [contactEmailAddress, setContactEmailAddress] = useState('');
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');

  const [socialFacebookUrl, setSocialFacebookUrl] = useState('');
  const [socialInstagramUrl, setSocialInstagramUrl] = useState('');
  const [socialTwitterUrl, setSocialTwitterUrl] = useState('');
  const [socialYoutubeUrl, setSocialYoutubeUrl] = useState('');

  const [netaTagsText, setNetaTagsText] = useState('');

  const resetCmsFormFromState = () => {
    setSiteLogoUrl((siteBrandSettings as any)?.site_logo_url || '');
    setFooterLogoUrl((siteBrandSettings as any)?.footer_logo_url || '');
    setFaviconUrl((siteBrandSettings as any)?.favicon_url || '');

    setFooterDescriptionText((footerSettings as any)?.footer_description_text || '');
    setFooterHeadquartersAddress((footerSettings as any)?.headquarters_address || '');
    setFooterPhoneNumber((footerSettings as any)?.phone_number || '');
    setFooterEmailAddress((footerSettings as any)?.email_address || '');
    setFooterCopyrightText((footerSettings as any)?.copyright_text || '');

    setContactEmailAddress((contactSettings as any)?.email_address || '');
    setContactPhoneNumber((contactSettings as any)?.phone_number || '');

    setSocialFacebookUrl((footerSettings as any)?.social_links?.facebook_url || '');
    setSocialInstagramUrl((footerSettings as any)?.social_links?.instagram_url || '');
    setSocialTwitterUrl((footerSettings as any)?.social_links?.twitter_url || '');
    setSocialYoutubeUrl((footerSettings as any)?.social_links?.youtube_url || '');

    const tagsArr: string[] = (netaTagsSettings as any)?.neta_tags || [];
    if (Array.isArray(tagsArr) && tagsArr.length) setNetaTagsText(tagsArr.join(', '));
    else setNetaTagsText((netaTagsSettings as any)?.neta_tags_text || '');
  };

  const openOfferEditor = (offer: OfferMarqueeItem) => {
    setOfferEditingId(offer.id);
    setOfferText(offer.offer_text);
    setOfferActive(offer.is_active);
    setOfferSpeed(String(offer.speed));
    setOfferBackground(offer.background_color);
    setOfferTextColor(offer.text_color);
    setShowOfferAdd(true);
  };

  const submitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pPrice || !pDuration || !pLoc || !pImage || !pDesc) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    try {
      const incList = pInclusions.split('\n').filter(s => s.trim() !== '');
      const excList = pExclusions.split('\n').filter(s => s.trim() !== '');
      const itinList = pItinerary.split('\n').filter(s => s.trim() !== '');

      const payload = {
        title: pTitle,
        category: pCat,
        price: Number(pPrice),
        duration: pDuration,
        location: pLoc,
        image: pImage,
        description: pDesc,
        inclusions: incList.length > 0 ? incList : ['Accommodation included', 'Sightseeing transfers'],
        exclusions: excList.length > 0 ? excList : ['Flights or train ticket costs'],
        itinerary: itinList.length > 0 ? itinList : ['Day 1: Arrival & transfer to hotel', 'Day 2: Full day sightseeing', 'Day 3: Return dropoff'],
        featured: pFeatured
      };

      if (pkgEditingId) {
        await updatePackage(pkgEditingId, payload);
      } else {
        await createPackage(payload);
      }

      resetPackageForm();
      setShowPkgAdd(false);
      alert(pkgEditingId ? 'Package updated successfully!' : 'New travel package added successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving package. Verify Firestore logging.');
    }
  };

  const submitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bExcerpt || !bContent || !bImage) {
      alert('Please fill out all blog details.');
      return;
    }

    try {
      const tagList = bTags.split(',').map(t => t.trim()).filter(t => t !== '');
      const payload = {
        title: bTitle,
        excerpt: bExcerpt,
        content: bContent,
        image: bImage,
        author: bAuthor || 'ColorMyTrip desk',
        tags: tagList.length > 0 ? tagList : ['Guides', 'Destinations']
      };

      if (blogEditingId) {
        await updateBlog(blogEditingId, payload);
      } else {
        await createBlog(payload);
      }

      resetBlogForm();
      setShowBlogAdd(false);
      alert(blogEditingId ? 'Blog post updated successfully!' : 'Blog post published successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving blog post.');
    }
  };

  const submitBulkPackages = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkPkgJson);
      if (!Array.isArray(parsed)) {
        alert('Bulk payload must be a JSON array.');
        return;
      }

      for (const item of parsed) {
        if (!item.title || !item.category || !item.price || !item.duration || !item.location || !item.image || !item.description) {
          throw new Error(`Invalid package entry: ${JSON.stringify(item).slice(0, 120)}...`);
        }

        await createPackage({
          title: String(item.title),
          category: item.category,
          price: Number(item.price),
          duration: String(item.duration),
          location: String(item.location),
          image: String(item.image),
          description: String(item.description),
          itinerary: Array.isArray(item.itinerary) ? item.itinerary : [],
          inclusions: Array.isArray(item.inclusions) ? item.inclusions : [],
          exclusions: Array.isArray(item.exclusions) ? item.exclusions : [],
          featured: Boolean(item.featured)
        });
      }

      setBulkPkgJson('');
      setShowPkgBulkAdd(false);
      alert(`Bulk upload complete: ${parsed.length} packages added.`);
    } catch (error) {
      console.error(error);
      alert(`Bulk upload failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  };

  const submitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerText.trim()) {
      alert('Offer text is required.');
      return;
    }

    const payload = {
      offer_text: offerText.trim(),
      is_active: offerActive,
      speed: Number(offerSpeed) || 28,
      background_color: offerBackground,
      text_color: offerTextColor
    };

    if (offerEditingId) {
      await updateOffer(offerEditingId, payload);
      alert('Offer updated successfully.');
    } else {
      await createOffer(payload);
      alert('Offer created successfully.');
    }

    setShowOfferAdd(false);
    resetOfferForm();
  };

  const insertIntoBlogContent = (prefix: string, suffix = '') => {
    setBContent(prev => `${prev}${prev ? '\n' : ''}${prefix}${suffix}`);
  };

  const blogPreviewHtml = useMemo(() => {
    const escaped = bContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      .split('\n\n')
      .map((block) => {
        if (block.startsWith('### ')) return `<h3>${block.replace('### ', '')}</h3>`;
        if (block.startsWith('## ')) return `<h2>${block.replace('## ', '')}</h2>`;
        if (block.startsWith('# ')) return `<h1>${block.replace('# ', '')}</h1>`;
        return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');
  }, [bContent]);

  const filteredEnquiries = enquiries.filter(e => enqFilter === 'all' || e.status === enqFilter);

  useEffect(() => {
    if (panelTab === 'website') {
      resetCmsFormFromState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelTab, footerSettings, contactSettings, siteBrandSettings, netaTagsSettings]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-end">
      
      {/* Right sliding panel */}
      <div className="w-full max-w-5xl h-full bg-white flex flex-col shadow-2xl relative animate-slide-up md:animate-slide-left">
        
        {/* Header Desk */}
        <div className="bg-slate-900 text-white p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Database className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-sans font-black tracking-tight flex items-center gap-2">
                <span>ColorMyTrip Admin Desk</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-slate-300">
                  {isFirebaseActive ? 'Firebase Active' : 'Sandbox (Demo)'}
                </span>
              </h2>
              <p className="text-slate-400 text-xs">
                Manage travel packages, delete outdated blogs, and review user inquiries.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Security Login Screen when user is not admin and clicked Admin Site */}
        {!isAdminLoggedIn ? (
          <div className="grow flex flex-col justify-center items-center p-8 text-center bg-slate-50">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-650 border border-indigo-100 mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Administrative Sign In Required</h3>
            <p className="text-slate-500 mb-8 max-w-sm text-sm">
              Authentic databases sync requests are restricted. If you are a client of the agency, log in with an approved Google Account, or bypass to test local CRUD state.
            </p>
            
            <div className="space-y-4 w-full max-w-xs">
              <button
                onClick={loginWithGoogle}
                className="w-full py-3 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md hover:bg-indigo-705 transition-all flex items-center justify-center gap-2"
              >
                Sign In with Google
              </button>
              
              {/* <button
                onClick={localAdminBypass}
                className="w-full py-3 bg-white text-slate-705 border border-slate-200 font-bold text-xs sm:text-sm rounded-xl cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <span>Bypass Security (Open Sandbox)</span>
                <Sparkles className="w-4 h-4 text-indigo-550 animate-spin" style={{ animationDuration: '4s' }} />
              </button> */}
            </div>

            <p className="text-[11px] text-slate-400 mt-12 font-medium">
              Authorized Administrator: <span className="font-semibold">info.colormytrip@gmail.com</span>
            </p>
          </div>
        ) : (
          /* Real Administrative Panel controls */
          <div className="grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar menu categories */}
            <div className="md:w-60 bg-slate-50 border-r border-slate-100 p-4 space-y-1.5 shrink-0 flex md:flex-col gap-2 md:gap-0 overflow-x-auto md:overflow-x-visible">
              
              <button
                onClick={() => setPanelTab('enquiries')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'enquiries'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-105 hover:text-slate-900'
                }`}
              >
                <Inbox className="w-5 h-5 shrink-0" />
                <span>Enquiries</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'enquiries' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {enquiries.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('packages')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'packages'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-105 hover:text-slate-900'
                }`}
              >
                <Globe className="w-5 h-5 shrink-0" />
                <span>Packages Manager</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'packages' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {packages.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('blogs')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'blogs'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-105 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span>Blog Articles</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'blogs' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {blogs.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('offers')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'offers'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-105 hover:text-slate-900'
                }`}
              >
                <Megaphone className="w-5 h-5 shrink-0" />
                <span>Offer Marquee</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'offers' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {offers.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('videos')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'videos'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-105 hover:text-slate-900'
                }`}
              >
                <Video className="w-5 h-5 shrink-0" />
                <span>Video Testimonials</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'videos' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {videoTestimonials.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('website')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'website'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-105 hover:text-slate-900'
                }`}
              >
                <Palette className="w-5 h-5 shrink-0" />
                <span>Website Settings</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'website' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  CMS
                </span>
              </button>

              <div className="hidden md:block border-t border-slate-200 my-4 pt-4" />
              
              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 text-indigo-600 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 mt-auto transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 shrink-0" />
                <span>Log Out Admin</span>
              </button>

            </div>

            {/* Display Body Content Panel */}
            <div className="grow overflow-y-auto p-4 md:p-6 bg-slate-50/40">
              
              {/* ENQUIRIES TAB LAYOUT */}
              {panelTab === 'enquiries' && (
                <div className="space-y-6">
                  
                  {/* Title & Filters */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Enquiries Inbox</h3>
                      <p className="text-slate-500 text-xs">Captures customer enquiries dropping to Info.colormytrip@gmail.com</p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                      {['all', 'pending', 'responded', 'closed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setEnqFilter(status as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer transition-colors ${
                            enqFilter === status
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredEnquiries.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
                      <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-bounce" />
                      <p className="text-slate-500 font-medium text-xs sm:text-sm">No enquiries found in this category.</p>
                    </div>
                  ) : (
                    /* Enquiries list card rows */
                    <div className="space-y-4">
                      {filteredEnquiries.map((enq) => (
                        <div key={enq.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative hover:shadow-md transition-shadow">
                          
                          {/* Top row */}
                          <div className="flex justify-between items-start gap-4 flex-wrap mb-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Enquiry ID: {enq.id}</span>
                              <h4 className="font-bold text-slate-900 text-base">{enq.name}</h4>
                              <p className="text-xs text-indigo-600 font-semibold font-mono">{enq.email} | {enq.phone}</p>
                            </div>
                            
                            {/* Status controls */}
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                                enq.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : enq.status === 'responded'
                                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {enq.status}
                              </span>
                              
                              <select
                                value={enq.status}
                                onChange={(e) => updateEnquiryStatus(enq.id, e.target.value as any)}
                                className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg p-1 text-slate-700 cursor-pointer focus:outline-none"
                              >
                                <option value="pending">Mark Pending</option>
                                <option value="responded">Mark Responded</option>
                                <option value="closed">Mark Closed</option>
                              </select>
                            </div>
                          </div>

                          {/* Detail panel */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl mb-4 text-xs font-semibold">
                            <div className="space-y-0.5">
                              <span className="text-slate-400 block text-[10px] uppercase">Destination / Package:</span>
                              <span className="text-slate-800 font-bold">{enq.destination}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-slate-400 block text-[10px] uppercase">Travel Date:</span>
                              <span className="text-slate-800 font-mono">{enq.travelDate}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-slate-400 block text-[10px] uppercase">Travelers:</span>
                              <span className="text-slate-800">{enq.travelers} Persons</span>
                            </div>
                          </div>

                          {/* Special Requirements */}
                          <div className="text-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Customer Requirements:</span>
                            <blockquote className="border-l-2 border-indigo-300 pl-3 italic text-slate-600 leading-normal">
                              "{enq.message}"
                            </blockquote>
                          </div>

                          {/* Time label */}
                          <p className="text-[10px] text-slate-400 font-mono text-right mt-4 pt-3 border-t border-slate-100">
                            Logged date: {new Date(enq.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* PACKAGES TAB LAYOUT */}
              {panelTab === 'packages' && (
                <div className="space-y-6">
                  
                  {/* Title & Floating Add */}
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Custom Packages Catalog</h3>
                      <p className="text-slate-500 text-xs">Create, view, and delete active travel directories</p>
                    </div>

                    <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        resetPackageForm();
                        setShowPkgAdd(true);
                      }}
                      className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Package</span>
                    </button>
                    <button
                      onClick={() => setShowPkgBulkAdd(true)}
                      className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Bulk Upload</span>
                    </button>
                    </div>
                  </div>

                  {/* Add form Overlay */}
                  {showPkgAdd && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-md animate-fade-in space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h4 className="font-sans font-black text-slate-900 text-[15px]">
                          {pkgEditingId ? 'Edit Travel Package' : 'Create a New Travel Package Listing'}
                        </h4>
                        <button
                          onClick={() => {
                            setShowPkgAdd(false);
                            resetPackageForm();
                          }}
                          className="text-slate-500 hover:text-indigo-600 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={submitPackage} className="space-y-4">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Package Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sikkim Old Silk Route Special"
                              value={pTitle}
                              onChange={(e) => setPTitle(e.target.value)}
                              className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Category *</label>
                            <select
                               value={pCat}
                              onChange={(e) => setPCat(e.target.value as any)}
                              className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            >
                              <option value="domestic">Domestic Tour</option>
                              <option value="international">International Tour</option>
                              <option value="trekking">Trekking</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Starting Price (INR) *</label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 14500"
                              value={pPrice}
                              onChange={(e) => setPPrice(e.target.value)}
                              className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Duration *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 5 Days / 4 Nights"
                              value={pDuration}
                              onChange={(e) => setPDuration(e.target.value)}
                              className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Location *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. East Sikkim, India"
                              value={pLoc}
                              onChange={(e) => setPLoc(e.target.value)}
                              className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            />
                          </div>
                        </div>

                        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={pFeatured}
                            onChange={(e) => setPFeatured(e.target.checked)}
                          />
                          Mark as featured package
                        </label>

                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Cover Image Source URL *</label>
                          <input
                            type="url"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={pImage}
                            onChange={(e) => setPImage(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Description *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Enter summary introducing the trail, vibe, and target locations..."
                            value={pDesc}
                            onChange={(e) => setPDesc(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-2">Inclusions (line separated)</label>
                            <textarea
                              rows={3}
                              placeholder="Homestay accommodation&#10;Meals&#10;Shared AC Cab"
                              value={pInclusions}
                              onChange={(e) => setPInclusions(e.target.value)}
                              className="w-full border border-slate-200 p-1.5 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-2">Exclusions (line separated)</label>
                            <textarea
                              rows={3}
                              placeholder="Flights tickets&#10;Tips and porter fee"
                              value={pExclusions}
                              onChange={(e) => setPExclusions(e.target.value)}
                              className="w-full border border-slate-200 p-1.5 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-2">Itinerary (line separated)</label>
                            <textarea
                              rows={3}
                              placeholder="Day 1: Reach Gangtok&#10;Day 2: Stroll Lake&#10;Day 3: Return Drop"
                              value={pItinerary}
                              onChange={(e) => setPItinerary(e.target.value)}
                              className="w-full border border-slate-200 p-1.5 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPkgAdd(false);
                              resetPackageForm();
                            }}
                            className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                          >
                            {pkgEditingId ? 'Save Changes' : 'Publish Package'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {showPkgBulkAdd && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-md animate-fade-in space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h4 className="font-sans font-black text-slate-900 text-[15px]">Bulk Package Upload (JSON)</h4>
                        <button onClick={() => setShowPkgBulkAdd(false)} className="text-slate-500 hover:text-indigo-600 cursor-pointer">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Paste a JSON array of package objects. Required keys: title, category, price, duration, location, image, description.
                      </p>
                      <form onSubmit={submitBulkPackages} className="space-y-3">
                        <textarea
                          value={bulkPkgJson}
                          onChange={(e) => setBulkPkgJson(e.target.value)}
                          rows={8}
                          className="w-full border border-slate-200 p-3 rounded-lg text-xs font-mono"
                          placeholder='[{"title":"...","category":"domestic","price":12000,"duration":"4 Days / 3 Nights","location":"Sikkim","image":"https://...","description":"...","itinerary":[],"inclusions":[],"exclusions":[],"featured":true}]'
                          required
                        />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setShowPkgBulkAdd(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 text-xs font-bold cursor-pointer">
                            Cancel
                          </button>
                          <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer">
                            Upload Packages
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Dynamic packages listing table */}
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          <th className="p-4">Cover / Title</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price / Duration</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {packages.map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-slate-50/50">
                            <td className="p-4 flex items-center gap-3">
                              <img
                                src={pkg.image}
                                alt={pkg.title}
                                className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h4 className="font-bold text-slate-900 line-clamp-1">{pkg.title}</h4>
                                <span className="text-[10px] text-slate-400 font-medium">{pkg.location}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-lg font-bold text-[10px] uppercase bg-slate-100 text-slate-700">
                                {pkg.category}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-slate-800">₹{pkg.price.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">{pkg.duration}</span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openPackageEditor(pkg)}
                                  className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"
                                  title="Edit listing"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete travel package: "${pkg.title}"?`)) {
                                      deletePackage(pkg.id);
                                    }
                                  }}
                                  className="p-2 bg-indigo-50 text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  title="Delete listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* BLOG ARTICLES TAB LAYOUT */}
              {panelTab === 'blogs' && (
                <div className="space-y-6">
                  
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Expedition Blog Secretariat</h3>
                      <p className="text-slate-500 text-xs">Delete or publish dynamic content to the blog directory</p>
                    </div>

                    <button
                      onClick={() => {
                        resetBlogForm();
                        setShowBlogAdd(true);
                      }}
                      className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Write New Post</span>
                    </button>
                  </div>

                  {/* Add Blog Post overlay form */}
                  {showBlogAdd && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-md animate-fade-in space-y-4">
                      
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h4 className="font-sans font-black text-slate-900 text-[15px]">
                          {blogEditingId ? 'Edit Blog Article' : 'Write & Publish Expedition Article'}
                        </h4>
                        <button
                          onClick={() => {
                            setShowBlogAdd(false);
                            resetBlogForm();
                          }}
                          className="text-slate-500 hover:text-indigo-600 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={submitBlog} className="space-y-4">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Article Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Winter Trekking Mistakes to Avoid"
                              value={bTitle}
                              onChange={(e) => setBTitle(e.target.value)}
                              className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Author Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Ratnadeep Mukherjee"
                              value={bAuthor}
                              onChange={(e) => setBAuthor(e.target.value)}
                              className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Article Cover Image URL *</label>
                          <input
                            type="url"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={bImage}
                            onChange={(e) => setBImage(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Short Excerpt *</label>
                          <input
                            type="text"
                            required
                            placeholder="A concise, high-impact paragraph preview..."
                            value={bExcerpt}
                            onChange={(e) => setBExcerpt(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Tags (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="Trekking, Travel Guidance, Kashmir"
                            value={bTags}
                            onChange={(e) => setBTags(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Content Body *</label>
                          <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
                            <button type="button" onClick={() => insertIntoBlogContent('# ')} className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded">H1</button>
                            <button type="button" onClick={() => insertIntoBlogContent('## ')} className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded">H2</button>
                            <button type="button" onClick={() => insertIntoBlogContent('### ')} className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded">H3</button>
                            <button type="button" onClick={() => insertIntoBlogContent('- ')} className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded">List</button>
                            <button type="button" onClick={() => insertIntoBlogContent('**bold text**')} className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded">Bold</button>
                            <button type="button" onClick={() => insertIntoBlogContent('*italic text*')} className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded">Italic</button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <textarea
                              required
                              rows={12}
                              placeholder="Write Markdown or text. Use headings and lists from toolbar."
                              value={bContent}
                              onChange={(e) => setBContent(e.target.value)}
                              className="w-full border border-slate-200 p-3 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-300"
                            />
                            <div className="border border-slate-200 rounded-lg p-3 bg-white">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Live Preview</p>
                              <div className="prose prose-slate max-w-none text-sm" dangerouslySetInnerHTML={{ __html: blogPreviewHtml }} />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowBlogAdd(false);
                              resetBlogForm();
                            }}
                            className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                          >
                            {blogEditingId ? 'Save Blog Changes' : 'Publish Blog'}
                          </button>
                        </div>
                      </form>

                    </div>
                  )}

                  {/* Blog articles list rows */}
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    {blogs.map((post) => (
                      <div key={post.id} className="p-4 flex items-center justify-between gap-4 border-b border-slate-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-slate-950 text-xs sm:text-sm">{post.title}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{post.author} • {new Date(post.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openBlogEditor(post)}
                            className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Edit post"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete blog post: "${post.title}"?`)) {
                                deleteBlog(post.id);
                              }
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* VIDEO TESTIMONIALS TAB LAYOUT */}
              {panelTab === 'offers' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Homepage Offer Marquee</h3>
                      <p className="text-slate-500 text-xs">Control running offer text, speed, and colors for the hero ticker.</p>
                    </div>
                    <button
                      onClick={() => {
                        resetOfferForm();
                        setShowOfferAdd(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Offer</span>
                    </button>
                  </div>

                  {showOfferAdd && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                        <h4 className="font-black text-slate-900 text-sm">{offerEditingId ? 'Edit Offer' : 'Create Offer'}</h4>
                        <button onClick={() => { setShowOfferAdd(false); resetOfferForm(); }} className="text-slate-500 hover:text-indigo-600 cursor-pointer">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={submitOffer} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Offer Text</label>
                          <input
                            type="text"
                            value={offerText}
                            onChange={(e) => setOfferText(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs"
                            placeholder="🔥 Meghalaya Group Tour Starting @ ₹8,999"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Timer className="w-3 h-3" />Speed (seconds)</label>
                            <input type="number" min={10} max={80} value={offerSpeed} onChange={(e) => setOfferSpeed(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Palette className="w-3 h-3" />Background</label>
                            <input type="color" value={offerBackground} onChange={(e) => setOfferBackground(e.target.value)} className="w-full h-9 border border-slate-200 p-1 rounded-lg" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Text Color</label>
                            <input type="color" value={offerTextColor} onChange={(e) => setOfferTextColor(e.target.value)} className="w-full h-9 border border-slate-200 p-1 rounded-lg" />
                          </div>
                        </div>
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                          <input type="checkbox" checked={offerActive} onChange={(e) => setOfferActive(e.target.checked)} />
                          Active on homepage
                        </label>
                        <div className="flex justify-end gap-2 pt-1">
                          <button type="button" onClick={() => { setShowOfferAdd(false); resetOfferForm(); }} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">{offerEditingId ? 'Save Offer' : 'Add Offer'}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    {offers.length === 0 ? (
                      <div className="p-10 text-center text-xs text-slate-500">No marquee offers configured.</div>
                    ) : (
                      offers.map((offer) => (
                        <div key={offer.id} className="p-4 border-b border-slate-100 last:border-b-0 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-900">{offer.offer_text}</p>
                            <p className="text-[11px] text-slate-500">Speed: {offer.speed}s • {offer.is_active ? 'Active' : 'Paused'}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span className="inline-flex items-center gap-1">BG <span className="w-4 h-4 rounded border border-slate-200 inline-block" style={{ backgroundColor: offer.background_color }} /></span>
                              <span className="inline-flex items-center gap-1">Text <span className="w-4 h-4 rounded border border-slate-200 inline-block" style={{ backgroundColor: offer.text_color }} /></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openOfferEditor(offer)} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => updateOffer(offer.id, { is_active: !offer.is_active })} className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                              {offer.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deleteOffer(offer.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {panelTab === 'website' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Website Content & Contact CMS</h3>
                      <p className="text-slate-500 text-xs">Update footer, contact details, brand assets, social links, and neta tags.</p>
                    </div>
                    <button
                      onClick={resetCmsFormFromState}
                      className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 cursor-pointer border border-slate-200"
                    >
                      Load Saved Values
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100">
                      <h4 className="text-sm font-black text-slate-900">Footer Settings</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Footer Description</label>
                          <textarea
                            rows={3}
                            value={footerDescriptionText}
                            onChange={(e) => setFooterDescriptionText(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            placeholder="Short footer paragraph"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Copyright Text</label>
                          <input
                            type="text"
                            value={footerCopyrightText}
                            onChange={(e) => setFooterCopyrightText(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            placeholder="© 2026 ..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Headquarters Address (rendered in footer + contact)</label>
                        <textarea
                          rows={3}
                          value={footerHeadquartersAddress}
                          onChange={(e) => setFooterHeadquartersAddress(e.target.value)}
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                          placeholder="Sevoke Road, near PC Mittal Bus Stand, ..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={footerPhoneNumber}
                            onChange={(e) => setFooterPhoneNumber(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            placeholder="+91 ..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>
                          <input
                            type="email"
                            value={footerEmailAddress}
                            onChange={(e) => setFooterEmailAddress(e.target.value)}
                            className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-indigo-300"
                            placeholder="info@..."
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900">Social Links (optional)</h4>
                        <p className="text-[11px] text-slate-500 mt-1">Only URLs you provide will be linked from the footer icons.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Facebook URL</label>
                          <input type="url" value={socialFacebookUrl} onChange={(e) => setSocialFacebookUrl(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="https://facebook.com/..." />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Instagram URL</label>
                          <input type="url" value={socialInstagramUrl} onChange={(e) => setSocialInstagramUrl(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Twitter URL</label>
                          <input type="url" value={socialTwitterUrl} onChange={(e) => setSocialTwitterUrl(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="https://twitter.com/..." />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">YouTube URL</label>
                          <input type="url" value={socialYoutubeUrl} onChange={(e) => setSocialYoutubeUrl(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="https://youtube.com/..." />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={async () => {
                            try {
                              await updateFooterSettings({
                                headquarters_address: footerHeadquartersAddress,
                                phone_number: footerPhoneNumber,
                                email_address: footerEmailAddress,
                                footer_description_text: footerDescriptionText,
                                copyright_text: footerCopyrightText,
                                social_links: {
                                  facebook_url: socialFacebookUrl || undefined,
                                  instagram_url: socialInstagramUrl || undefined,
                                  twitter_url: socialTwitterUrl || undefined,
                                  youtube_url: socialYoutubeUrl || undefined,
                                },
                              } as any);
                              alert('Footer settings saved successfully.');
                            } catch (e) {
                              console.error(e);
                              alert('Failed to save footer settings.');
                            }
                          }}
                          className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                        >
                          Save Footer Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100">
                      <h4 className="text-sm font-black text-slate-900">Contact Page Settings</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Contact Email (overrides footer email)</label>
                          <input type="email" value={contactEmailAddress} onChange={(e) => setContactEmailAddress(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="info@..." />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Contact Phone (overrides footer phone)</label>
                          <input type="text" value={contactPhoneNumber} onChange={(e) => setContactPhoneNumber(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="+91 ..." />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={async () => {
                            try {
                              await updateContactSettings({
                                email_address: contactEmailAddress,
                                phone_number: contactPhoneNumber,
                              } as any);
                              alert('Contact settings saved successfully.');
                            } catch (e) {
                              console.error(e);
                              alert('Failed to save contact settings.');
                            }
                          }}
                          className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                        >
                          Save Contact Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100">
                      <h4 className="text-sm font-black text-slate-900">Brand Assets + Neta Tags</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Site Logo URL (fallback for footer logo)</label>
                          <input type="url" value={siteLogoUrl} onChange={(e) => setSiteLogoUrl(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="https://.../logo-white.png" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Footer Logo URL</label>
                          <input type="url" value={footerLogoUrl} onChange={(e) => setFooterLogoUrl(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="https://.../logo-white.png" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Favicon URL</label>
                          <input type="url" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="https://.../favicon.ico" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Neta Tags (comma separated)</label>
                          <input type="text" value={netaTagsText} onChange={(e) => setNetaTagsText(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-xs" placeholder="neta1, neta2, neta3" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={async () => {
                            try {
                              const tagsArr = netaTagsText.split(',').map(s => s.trim()).filter(Boolean);
                              await updateSiteBrandSettings({
                                site_logo_url: siteLogoUrl || undefined,
                                footer_logo_url: footerLogoUrl || undefined,
                                favicon_url: faviconUrl || undefined,
                              } as any);
                              await updateNetaTagsSettings({
                                neta_tags: tagsArr,
                                neta_tags_text: netaTagsText,
                              } as any);
                              alert('Brand + neta tags saved successfully.');
                            } catch (e) {
                              console.error(e);
                              alert('Failed to save brand/neta settings.');
                            }
                          }}
                          className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                        >
                          Save Brand & Neta Tags
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {panelTab === 'videos' && (
                <div className="space-y-6">
                  
                  {/* Title & Add Video Button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Video Testimonials</h3>
                      <p className="text-slate-500 text-xs">Manage customer video testimonials (reels format)</p>
                    </div>

                    <button
                      onClick={() => setShowVideoAdd(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Video Testimonial</span>
                    </button>
                  </div>

                  {/* Video Upload Modal */}
                  {showVideoAdd && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-indigo-600 text-white p-5 flex items-center justify-between">
                          <h4 className="font-black text-lg">Upload Video Testimonial</h4>
                          <button onClick={() => setShowVideoAdd(false)} className="hover:bg-indigo-700 p-1 rounded">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          if (!vName || !vTitle || !vLocation || !vVideoUrl || !vDuration) {
                            alert('Please fill all fields');
                            return;
                          }
                          await addVideoTestimonial({
                            name: vName,
                            title: vTitle,
                            location: vLocation,
                            videoUrl: vVideoUrl,
                            duration: Number(vDuration)
                          });
                          setVName('');
                          setVTitle('');
                          setVLocation('');
                          setVVideoUrl('');
                          setVDuration('');
                          setShowVideoAdd(false);
                        }} className="p-6 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Customer Name *</label>
                            <input
                              type="text"
                              value={vName}
                              onChange={(e) => setVName(e.target.value)}
                              placeholder="E.g., Priya & Family"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Video Title *</label>
                            <input
                              type="text"
                              value={vTitle}
                              onChange={(e) => setVTitle(e.target.value)}
                              placeholder="E.g., Sikkim Adventure"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Location *</label>
                            <input
                              type="text"
                              value={vLocation}
                              onChange={(e) => setVLocation(e.target.value)}
                              placeholder="E.g., Zuluk, Sikkim"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">YouTube Embed URL *</label>
                            <input
                              type="text"
                              value={vVideoUrl}
                              onChange={(e) => setVVideoUrl(e.target.value)}
                              placeholder="https://www.youtube.com/embed/VIDEO_ID"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Use YouTube embed format (not regular URL)</p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Duration (seconds) *</label>
                            <input
                              type="number"
                              value={vDuration}
                              onChange={(e) => setVDuration(e.target.value)}
                              placeholder="E.g., 45"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              type="button"
                              onClick={() => setShowVideoAdd(false)}
                              className="flex-1 px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                            >
                              Upload Testimonial
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Video testimonials list */}
                  {videoTestimonials.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
                      <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium text-xs sm:text-sm">No video testimonials yet. Add your first one!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videoTestimonials.map((video) => (
                        <div key={video.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex gap-3 items-start">
                            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                              <Video className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-900 text-sm">{video.name}</p>
                              <p className="text-indigo-600 text-xs font-semibold">{video.title}</p>
                              <p className="text-slate-500 text-xs mt-1">{video.location} • {video.duration}s</p>
                            </div>
                            <button
                              onClick={() => deleteVideoTestimonial(video.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
