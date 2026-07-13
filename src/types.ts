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
  neta_tags_text?: string; // fallback if tags are not used
  createdAt?: string; // ISO timestamp — used for "newest first" sorting
}

export interface LegalSettings {
  privacyPolicy?: string;
  termsAndConditions?: string;
  cancellationPolicy?: string;
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
  enquiryId?: string;
  bookingAmount: number; // maps to total package cost
  bookingDate: string;
  travelDate?: string;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
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

  // New Google Sheet fields for Booking Dashboard
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  source: string;
  destination: string;
  packageName: string;
  travelType: 'Group' | 'Customized';
  noOfPax: number;
  noOfRooms: number;
  travelStartDate: string;
  travelEndDate: string;
  totalDays: number;
  hotelDetails?: string;
  mealPlan?: string;
  transportType?: string;
  pickupPoint?: string;
  advanceReceived: number;
  balanceAmount: number;
  vendorCost: number;
  profit: number;
  assignedStaff?: string;
  specialNotes?: string;
  voucherSent: 'Yes' | 'No';
  ticketStatus: 'Pending' | 'Booked' | 'N/A';
  tripStatus: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

  // Client Payments Tracker fields
  dueDate?: string;
  lastPaymentDate?: string;
  paymentMode?: string;
  paymentRemarks?: string;
  // Zoho Invoice integration number
  zohoInvoiceNo?: string;
}

export interface VendorPayment {
  id: string;
  bookingId: string;
  vendorType: string;
  vendorName: string;
  contact: string;
  totalCost: number;
  paid: number;
  balance: number;
  status: 'Unpaid' | 'Partial' | 'Paid';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}


export interface MasterVendor {
  id: string;
  name: string;
  location: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
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
  createdAt?: string;
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

export interface CustomTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  createdAt: string;
}

export interface EmailAttachment {
  filename: string;
  content: string; // base64 string
  contentType: string;
}

export interface ScheduledEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  sendAt: string; // ISO timestamp
  status: 'pending' | 'sent' | 'failed';
  attachments?: EmailAttachment[];
  error?: string;
  createdAt: string;
}

