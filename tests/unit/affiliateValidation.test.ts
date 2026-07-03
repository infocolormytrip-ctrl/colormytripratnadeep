import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAffiliateForm } from '../../src/lib/affiliateValidation';

test('validates required affiliate fields', () => {
  const errors = validateAffiliateForm({
    fullName: '',
    email: 'affiliate@example.com',
    phone: '',
    status: 'Active',
    commissionType: 'Percentage',
    defaultCommissionValue: 10,
    address: '',
    profileImage: '',
    bankDetails: '',
  });

  assert.equal(errors.fullName, 'Full name is required');
  assert.equal(errors.phone, 'Phone number is required');
});

test('validates commission values', () => {
  const errors = validateAffiliateForm({
    fullName: 'Test Affiliate',
    email: 'affiliate@example.com',
    phone: '9876543210',
    status: 'Active',
    commissionType: 'Percentage',
    defaultCommissionValue: -5,
    address: '',
    profileImage: '',
    bankDetails: '',
  });

  assert.equal(errors.defaultCommissionValue, 'Commission value must be greater than 0');
});
