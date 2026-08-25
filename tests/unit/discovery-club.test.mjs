import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const setup = fs.readFileSync(new URL('../../src/Setup.gs', import.meta.url), 'utf8');
const service = fs.readFileSync(new URL('../../src/DiscoveryService.gs', import.meta.url), 'utf8');
const campaigns = fs.readFileSync(new URL('../../src/CampaignService.gs', import.meta.url), 'utf8');
const frontend = fs.readFileSync(new URL('../../src/scripts.html', import.meta.url), 'utf8');

test('suscriptores libres permanecen separados de USERS y exigen consentimiento', () => {
  assert.match(setup, /MARKETING_SUBSCRIBERS:/);
  assert.match(service, /MARKETING_CONSENT_REQUIRED/);
  assert.match(service, /runIdempotent_\('PUBLIC_MARKETING_SUBSCRIBE'/);
  assert.doesNotMatch(service, /repository\.upsert\('USERS'/);
});

test('el catálogo publica precios público y Club en céntimos', () => {
  assert.match(setup, /club_price_cents/);
  assert.match(campaigns, /publicPriceCents: offer/);
  assert.match(campaigns, /clubPriceCents: club/);
});

test('la ubicación anónima requiere confirmación y queda en el navegador', () => {
  assert.match(frontend, /localStorage\.setItem\('tazmany_location'/);
  assert.match(frontend, /Sugerencia: \$\{nearest\.name\}\. Confirma para aplicarla\./);
});
