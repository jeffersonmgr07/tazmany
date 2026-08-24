import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = file => fs.readFileSync(new URL(`../../src/${file}`, import.meta.url), 'utf8');

test('la Fase 3 protege comercios, campañas y moderación en backend', () => {
  const merchant = read('MerchantOnboardingService.gs');
  const campaign = read('CampaignWorkflowService.gs');
  const moderation = read('ModerationService.gs');
  assert.match(merchant, /runIdempotent_\('merchant-onboarding:/);
  assert.match(merchant, /representative_document_hash/);
  assert.doesNotMatch(merchant, /representative_document_number\s*=/);
  assert.match(campaign, /merchant\.campaigns\.manage/);
  assert.match(campaign, /IMMUTABLE_PUBLISHED_CAMPAIGN/);
  assert.match(campaign, /assertAcceptedMerchantContract_/);
  assert.match(moderation, /admin\.merchants\.review/);
  assert.match(moderation, /admin\.campaigns\.review/);
});

test('el index usa iconos SVG propios para categorías', () => {
  const icons = read('category-icons.html');
  const scripts = read('scripts.html');
  for (const icon of ['restaurant', 'sparkles', 'fitness', 'car', 'ticket']) {
    assert.match(icons, new RegExp(`id="taz-cat-${icon}"`));
  }
  assert.match(scripts, /categoryIconMarkup/);
  assert.doesNotMatch(scripts, /🍽|✨|🏋|🚗|🎟/);
});
