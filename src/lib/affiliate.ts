import { PromoCode } from '../types/affiliate';

/**
 * Checks if a promo code is valid for a given package and usage constraints.
 */
export function isPromoValid(
  promo: PromoCode,
  packageId?: string
): { valid: boolean; reason?: string } {
  if (promo.active === false || promo.status === 'Disabled') {
    return { valid: false, reason: 'inactive' };
  }

  if (packageId && Array.isArray(promo.applicablePackages) && promo.applicablePackages.length > 0) {
    if (!promo.applicablePackages.includes(packageId)) {
      return { valid: false, reason: 'package_not_applicable' };
    }
  }

  if (promo.expiryDate) {
    const expiry = new Date(promo.expiryDate);
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return { valid: false, reason: 'expired' };
    }
  }

  const usageLimit = promo.usageLimit ?? null;
  const totalUsed = promo.totalUsed ?? promo.currentUsage ?? 0;
  if (usageLimit !== null && totalUsed !== undefined) {
    if (Number(totalUsed) >= Number(usageLimit)) {
      return { valid: false, reason: 'limit_reached' };
    }
  }

  return { valid: true };
}

/**
 * Calculates commission amount based on booking amount and promo commission settings.
 */
export function calculateCommission(
  bookingAmount: number,
  commissionType?: 'Percentage' | 'Fixed Amount' | string,
  commissionValue?: number,
  overrideAmount?: number
): number {
  if (typeof overrideAmount === 'number' && !Number.isNaN(overrideAmount)) {
    return overrideAmount;
  }

  if (!commissionType || commissionValue === undefined || commissionValue === null) {
    return 0;
  }

  if (commissionType === 'Percentage') {
    if (!Number.isFinite(commissionValue)) return 0;
    return Math.round((bookingAmount * commissionValue) / 100);
  }

  if (commissionType === 'Fixed Amount') {
    if (!Number.isFinite(commissionValue)) return 0;
    return Math.round(commissionValue);
  }

  return 0;
}
