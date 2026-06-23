export interface TravelPackage {
  id: string;
  title: string;
  description: string;
  category: 'domestic' | 'international' | 'trekking';
  price: number;
  duration: string;
  location: string;
  image: string;
  itinerary: string[]; // Day-by-day description
  inclusions: string[];
  exclusions: string[];
  featured: boolean;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  travelDate: string;
  destination: string;
  travelers: number;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  packageId?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  tags: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  source: string;
}

export interface VideoTestimonial {
  id: string;
  name: string;
  title: string;
  location: string;
  videoUrl: string;
  thumbnail?: string;
  duration: number;
  createdAt: string;
}

export interface OfferMarqueeItem {
  id: string;
  offer_text: string;
  is_active: boolean;
  speed: number;
  background_color: string;
  text_color: string;
}
