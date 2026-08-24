import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({ console });
vm.runInContext(fs.readFileSync(new URL('../../src/Utils.gs', import.meta.url), 'utf8'), context);

test('stores soles as integer cents', () => {
  assert.equal(context.solesToCents_(69.9), 6990);
  assert.equal(context.solesToCents_(0.1 + 0.2), 30);
});

test('calculates discount percentage', () => {
  assert.equal(context.calculateDiscountPercent_(11800, 6990), 41);
  assert.equal(context.calculateDiscountPercent_(10000, 11000), 0);
});

test('calculates 15% commission and 18% IGV in cents', () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.calculateCommission_(10000, 1500))),
    { commissionCents: 1500, commissionIgvCents: 270, merchantNetCents: 8230 }
  );
});
