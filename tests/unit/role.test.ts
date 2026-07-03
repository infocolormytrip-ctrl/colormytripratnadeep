import test from 'node:test';
import assert from 'node:assert/strict';
import { isAuthorizedAdminEmail, isAuthorizedAffiliateEmail } from '../../src/lib/role';

test('authorizes the configured admin email', () => {
  assert.equal(isAuthorizedAdminEmail('info.colormytrip@gmail.com'), true);
  assert.equal(isAuthorizedAdminEmail('INFO.COLORMYTRIP@GMAIL.COM'), true);
});

test('authorizes the configured affiliate email', () => {
  assert.equal(isAuthorizedAffiliateEmail('ratnadeepmukherjee.banti@gmail.com'), true);
  assert.equal(isAuthorizedAffiliateEmail('RATNADEEPMUKHERJEE.BANTI@GMAIL.COM'), true);
});

test('rejects non-admin or non-affiliate emails', () => {
  assert.equal(isAuthorizedAdminEmail('someone@example.com'), false);
  assert.equal(isAuthorizedAffiliateEmail('someone@example.com'), false);
  assert.equal(isAuthorizedAdminEmail(''), false);
  assert.equal(isAuthorizedAffiliateEmail(''), false);
});
