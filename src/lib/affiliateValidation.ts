export interface AffiliateFormValues {
  fullName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Disabled';
  commissionType?: 'Percentage' | 'Fixed Amount';
  defaultCommissionValue?: number;
  address?: string;
  profileImage?: string;
  bankDetails?: string;
}

export interface AffiliateFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: string;
  commissionType?: string;
  defaultCommissionValue?: string;
}

export function validateAffiliateForm(values: AffiliateFormValues): AffiliateFormErrors {
  const errors: AffiliateFormErrors = {};

  if (!values.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!values.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.phone?.trim()) {
    errors.phone = 'Phone number is required';
  }

  if (!values.status) {
    errors.status = 'Status is required';
  }

  if (values.commissionType && !['Percentage', 'Fixed Amount'].includes(values.commissionType)) {
    errors.commissionType = 'Select a valid commission type';
  }

  if (values.defaultCommissionValue !== undefined && values.defaultCommissionValue !== null) {
    if (Number(values.defaultCommissionValue) <= 0) {
      errors.defaultCommissionValue = 'Commission value must be greater than 0';
    }
  }

  return errors;
}
