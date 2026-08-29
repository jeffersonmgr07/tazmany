import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../../src/${name}`, import.meta.url), 'utf8');
const app = read('app.html');
const scripts = read('scripts.html');
const config = read('Config.gs');
const phase39 = read('Phase39Setup.gs');
const auth = read('auth.html');
const main = read('Main.gs');
const privacy = fs.readFileSync(new URL('../../privacidad.html', import.meta.url), 'utf8');
const terms = fs.readFileSync(new URL('../../terminos.html', import.meta.url), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
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
  assert.match(scripts, /if\(isStaticPreview\(\)\)\{status\.textContent='No pudimos conectar con el servicio\.'/);
  assert.match(scripts, /await callServerStrict\('apiSubscribeToOffers'/);
});

test('GitHub es la interfaz y Apps Script redirige al dominio oficial', () => {
  assert.match(main, /publicUrl = 'https:\/\/tazmany\.com\/'/);
  assert.doesNotMatch(main, /createTemplateFromFile\('index'\)/);
});

test('el modal de acceso usa la mascota y el ny amarillo', () => {
  assert.ok(auth.includes(`assets/brand/tazmany-isotipo.png?v=${packageJson.version}`));
  assert.match(auth, /<span>Tazma<\/span><em>ny<\/em>/);
});

test('el portal conectado nunca sustituye una caída por datos visuales', () => {
  assert.match(scripts, /if\(hasRemoteApi\(\)\)return callRemoteApi\(name,args\)/);
  assert.match(scripts, /state\.backendAvailable=false/);
  assert.match(scripts, /Servicio temporalmente no disponible/);
  assert.doesNotMatch(scripts, /callRemoteApi\(name,args\).*catch\(\(\)=>fallbackValue\)/);
});

test('la compuerta previa a Fase 4 mantiene cobros bloqueados', () => {
  assert.match(config, /MERCHANT_ACQUISITION_PUBLIC: false/);
  assert.match(config, /CHECKOUT_ENABLED: false/);
  assert.match(config, /CLUB_BILLING_ENABLED: false/);
  assert.match(phase39, /readyForPhase4/);
  assert.match(phase39, /getTazmanyPrePaymentReadinessDiagnostics\(\)/);
});

test('la portada enlaza documentos legales públicos reales', () => {
  assert.match(app, /https:\/\/tazmany\.com\/terminos\.html/);
  assert.match(app, /https:\/\/tazmany\.com\/privacidad\.html/);
  assert.match(app, /privacidad\.html#derechos-arco/);
  assert.doesNotMatch(app, /jeffersonmgr07\.github\.io\/tazmany/);
});

test('privacidad informa Google, proveedores y derechos ARCO', () => {
  assert.match(privacy, /tazmani\.store@gmail\.com/);
  assert.match(privacy, /Ley N\.º 29733/);
  assert.match(privacy, /identificador estable de la cuenta de Google/);
  assert.match(privacy, /no solicita acceso a tus contactos, Google Drive, Gmail, calendario/);
  assert.match(privacy, /GitHub Pages y Cloudflare/);
  assert.match(privacy, /derechos de acceso, rectificación, cancelación y oposición/);
  assert.match(privacy, /rel="canonical" href="https:\/\/tazmany\.com\/privacidad\.html"/);
});

test('términos publica reglas de cuenta, ofertas y reclamos', () => {
  assert.match(terms, /tazmani\.store@gmail\.com/);
  assert.match(terms, /Cuentas y autenticación/);
  assert.match(terms, /Ofertas y comercios/);
  assert.match(terms, /Cancelaciones, devoluciones y reclamos/);
  assert.match(terms, /legislación de la República del Perú/);
  assert.match(terms, /rel="canonical" href="https:\/\/tazmany\.com\/terminos\.html"/);
});
