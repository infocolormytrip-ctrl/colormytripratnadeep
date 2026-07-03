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
  status:
    | 'pending'
    | 'responded'
    | 'closed'
    | 'Enquired'
    | 'Under Processing'
    | 'Under Follow-up'
    | 'Onboarded'
    | 'Completed'
    | 'Cancelled';
  packageId?: string;
  createdAt: string;

  // Phase 2 (Affiliate / Promo) extensions
  promoCode?: string;
  promoCodeId?: string;

  affiliateId?: string;
  affiliateEmail?: string;
  affiliateName?: string;
  affiliateIds?: string[];

  commissionType?: 'Percentage' | 'Fixed Amount';
  commissionValue?: number;

  commissionAmount?: number;

  // Phase 3 (Booking workflow)
  // Current enquiry stage for negotiation/booking lifecycle.
  bookingStatus?:
    | 'New'
    | 'Contacted'
    | 'Interested'
    | 'Quotation Sent'
    | 'Negotiation'
    | 'Confirmed'
    | 'Onboarded'
    | 'Cancelled'
    | 'Completed'
    | 'Deleted'
    | 'Enquired'
    | 'Under Processing'
    | 'Under Follow-up';

  deleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;

  // payment / commission lifecycle
  bookingAmount?: number | null;
  paymentStatus?: 'Unpaid' | 'Paid' | null;
  affiliateCommissionStatus?: 'pending' | 'approved' | 'paid' | null;

  // extra bookkeeping
  statusHistory?: Array<{
    fromStatus?: string;
    toStatus?: string;
    bookingStatus?: string;
    actor?: string;
    at?: string;
    note?: string;
  }>;
  createdByPromo?: boolean;

  // Rule 2 fields
  estimatedBookingAmount?: number;
  finalNegotiatedAmount?: number | null;
  calculatedCommission?: number | null;
  commissionStatus?: 'Pending Confirmation' | 'Generated' | 'Processing' | 'Processed' | 'Cancelled' | null;
  commissionGeneratedAt?: string | null;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Booking {
  id: string;
  enquiryId: string;
  bookingAmount: number;
  bookingDate: string;
  travelDate?: string;
  paymentStatus: 'Unpaid' | 'Paid';
  remarks?: string;
  bookingStatus:
    | 'New'
    | 'Contacted'
    | 'Interested'
    | 'Quotation Sent'
    | 'Negotiation'
    | 'Confirmed'
    | 'Onboarded'
    | 'Cancelled'
    | 'Completed'
    | 'Deleted';
  affiliateId?: string;
  affiliateEmail?: string;
  affiliateName?: string;
  commissionType?: 'Percentage' | 'Fixed Amount';
  commissionValue?: number | null;
  commissionAmount?: number;
  createdAt: string;
  updatedAt?: string;
  transactionId?: string | null;
  paidAt?: string | null;
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
