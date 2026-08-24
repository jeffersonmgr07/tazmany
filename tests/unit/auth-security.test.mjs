import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

test('RBAC expands customer permissions and wildcard admin permissions', () => {
  const code = fs.readFileSync(new URL('../../src/RbacService.gs', import.meta.url), 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  const customerPermissions = Array.from(context.permissionsForRoles_(['CUSTOMER']));
  assert.ok(customerPermissions.includes('customer.dashboard.read'));
  assert.equal(context.hasPermission_(customerPermissions, 'merchant.dashboard.read'), false);
  assert.equal(context.hasPermission_(['admin.*'], 'admin.finance.read'), true);
  assert.equal(context.hasPermission_(['*'], 'merchant.coupons.redeem'), true);
});

test('authentication source persists hashes instead of raw OTP and session values', () => {
  const session = fs.readFileSync(new URL('../../src/SessionService.gs', import.meta.url), 'utf8');
  const otp = fs.readFileSync(new URL('../../src/OtpService.gs', import.meta.url), 'utf8');
  const setup = fs.readFileSync(new URL('../../src/Setup.gs', import.meta.url), 'utf8');
  assert.match(session, /token_hash:\s*hashSecret_/);
  assert.match(otp, /code_hash:\s*hashOtpCode_/);
  assert.match(setup, /CUSTOMER_PRIVATE_DATA/);
  assert.doesNotMatch(setup, /document_number['"]/);
});

test('production blocks the development-only Google tokeninfo verifier', () => {
  const googleIdentity = fs.readFileSync(new URL('../../src/GoogleIdentityService.gs', import.meta.url), 'utf8');
  assert.match(googleIdentity, /environment === 'production' && mode === 'TOKENINFO'/);
  assert.match(googleIdentity, /GOOGLE_PRODUCTION_VERIFIER_REQUIRED/);
  assert.match(googleIdentity, /claims\.sub/);
  assert.match(googleIdentity, /claims\.nonce/);
});

test('idempotency stores sensitive responses only in short-lived cache', () => {
  const idempotency = fs.readFileSync(new URL('../../src/IdempotencyService.gs', import.meta.url), 'utf8');
  assert.match(idempotency, /sensitiveResponse \? \{/);
  assert.match(idempotency, /CacheService\.getScriptCache\(\)\.put/);
  assert.match(idempotency, /IDEMPOTENCY_CONFLICT/);
  assert.doesNotMatch(idempotency, /response_json\s*=\s*JSON\.stringify\(result/);
});
