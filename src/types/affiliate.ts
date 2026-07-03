export type Role = 'admin' | 'affiliate' | 'public';

export type AffiliateStatus = 'Active' | 'Disabled';

export type CommissionType = 'Percentage' | 'Fixed Amount';

export type PaymentStatus = 'Unpaid' | 'Paid';

export type AffiliateCommissionStatus = 'pending' | 'approved' | 'paid';

export type UserRole = Role;

export interface AppUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  affiliateId?: string;
  status: 'active' | 'disabled';
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface Affiliate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  address?: string;
  commissionType?: CommissionType;
  defaultCommissionValue?: number;
  bankDetails?: string;
  status: AffiliateStatus;
  joinedDate: string;
  totalBookings: number;
  totalCommission: number;
  totalPaid: number;
  pendingCommission: number;
  totalRevenueGenerated: number;
  lastLogin: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  label?: string;
  affiliateIds: string[];
  affiliateId?: string;
  affiliateEmails?: string[];
  affiliateEmail?: string;
  affiliateName?: string;
  description?: string;
  active: boolean;
  applicablePackages?: string[];
  expiryDate?: string;
  usageLimit?: number;
  totalUsed?: number;
  currentUsage?: number;
  status?: string;
  deleted?: boolean;
  commissionType?: CommissionType;
  commissionValue?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CommissionRecord {
  id: string;
  enquiryId: string;
  affiliateId: string;
  promoCodeId?: string;
  amount: number;
  commissionType: CommissionType;
  commissionValue: number;
  status: AffiliateCommissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userUid: string;
  affiliateId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  actorUid?: string;
  actorEmail?: string;
  action: string;
  entityType: 'enquiry' | 'promoCode' | 'affiliate' | 'commission' | 'notification' | 'user';
  entityId?: string;
  detail?: string;
  createdAt: string;
}

