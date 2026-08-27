import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../../src/${name}`, import.meta.url), 'utf8');
const app = read('app.html');
const scripts = read('scripts.html');
const config = read('Config.gs');
const phase39 = read('Phase39Setup.gs');
const visibleSource = [app, read('components.html'), read('merchant.html'), read('admin.html'), read('phase3.html'), read('discovery.html'), scripts].join('\n');

test('el portal público no muestra textos técnicos o de desarrollo', () => {
  for (const phrase of [
    'Demo de desarrollo',
    'Pagos y canjes aún desactivados',
    'Haz que más personas',
    'Checkout reservado',
    'Conecta el relay',
    'GitHub Pages',
    'se registran en Sheets',
    'PANEL DEL COMERCIO · FASE',
    'OPERACIONES TAZMANY · FASE',
    'Escáner disponible en la Fase',
    'El pago con Mercado Pago se implementará'
  ]) assert.ok(!visibleSource.includes(phrase), `Texto interno encontrado: ${phrase}`);
});

test('la captación pública de comercios permanece retirada', () => {
  assert.ok(!app.includes('merchant-cta'));
  assert.ok(!app.includes('data-route="merchant"><span class="icon" data-icon="store"></span><small>Comercio</small>'));
});

test('la vista desconectada no simula una suscripción real', () => {
  assert.match(scripts, /if\(isStaticPreview\(\)\)\{status\.textContent='Las suscripciones estarán disponibles muy pronto\.'/);
  assert.match(scripts, /await callServerStrict\('apiSubscribeToOffers'/);
});

test('la compuerta 0.3.9 mantiene cobros bloqueados', () => {
  assert.match(config, /MERCHANT_ACQUISITION_PUBLIC: false/);
  assert.match(config, /CHECKOUT_ENABLED: false/);
  assert.match(config, /CLUB_BILLING_ENABLED: false/);
  assert.match(phase39, /readyForPhase4/);
  assert.match(phase39, /getTazmanyPrePaymentReadinessDiagnostics\(\)/);
});
