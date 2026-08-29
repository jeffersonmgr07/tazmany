import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../../${name}`, import.meta.url), 'utf8');

test('los centimos se presentan como soles peruanos sin multiplicar el precio', () => {
  const scripts = read('src/scripts.html');
  assert.match(scripts, /format\(Number\(cents\|\|0\)\/100\)/);
  assert.match(read('src/Seed.gs'), /offer_price_cents: 8990/);
  assert.match(read('src/Utils.gs'), /Number\(cents \|\| 0\) \/ 100/);
});

test('la tarjeta prioriza precio Club y separa cashback Club y publico', () => {
  const components = read('src/components.html');
  const clubPosition = components.indexOf('class="club-card-price"');
  const publicPosition = components.indexOf('class="public-card-price"');
  assert.ok(clubPosition >= 0 && publicPosition > clubPosition);
  assert.match(components, /club-cashback-pill/);
  assert.match(components, /public-cashback-pill/);
  assert.match(read('src/CampaignService.gs'), /publicCashbackPercent/);
  assert.match(read('src/CampaignService.gs'), /clubCashbackPercent/);
});

test('el documento publico tiene viewport responsivo y favicon del isotipo', () => {
  const index = read('src/index.html');
  assert.match(index, /name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/);
  assert.match(index, /rel="icon"[^>]+tazmany-isotipo\.png\?v=0\.4\.0/);
});

test('Fase 4 crea orden y reserva de inventario sin habilitar pagos', () => {
  const orders = read('src/OrderService.gs');
  const setup = read('src/Phase4Setup.gs');
  const schema = read('src/Setup.gs');
  assert.match(orders, /runIdempotent_\('order-reservation:/);
  assert.match(orders, /INSUFFICIENT_STOCK/);
  assert.match(orders, /status: 'PENDING_PAYMENT'/);
  assert.match(orders, /paymentEnabled: false/);
  assert.match(schema, /reservation_expires_at/);
  assert.match(schema, /customer_user_id'\]/);
  assert.match(setup, /paymentsRemainDisabled/);
  assert.match(setup, /clubCashbackIsThreePercent/);
});

test('catalogo y panel del cliente tienen cache y precarga', () => {
  const scripts = read('src/scripts.html');
  const customer = read('src/CustomerService.gs');
  assert.match(scripts, /hydrateCachedPublicData/);
  assert.match(scripts, /renderInitialCategoryStrip/);
  assert.match(scripts, /prefetchCustomerDashboard/);
  assert.match(customer, /CacheService\.getScriptCache\(\)/);
  assert.match(customer, /cache\.put\(cacheKey, serialized, 60\)/);
});

test('relay permite solamente las nuevas operaciones de orden declaradas', () => {
  const relay = read('worker/tazmany-api-relay.js');
  const gateway = read('src/FrontendApiGateway.gs');
  for (const action of ['apiCreateOrderReservation','apiGetMyOrder','apiCancelMyOrder']) {
    assert.match(relay, new RegExp(`'${action}'`));
    assert.match(gateway, new RegExp(`${action}: routeFrontendApi_`));
  }
});
