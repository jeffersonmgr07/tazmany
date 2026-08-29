import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../../src/${name}`, import.meta.url), 'utf8');

test('las operaciones de acceso y perfil usan un modal de carga', () => {
  const auth = read('auth.html');
  const scripts = read('scripts.html');
  const styles = read('styles.html');
  assert.match(auth, /id="activityOverlay"/);
  assert.match(auth, /class="activity-spinner"/);
  assert.match(styles, /\.activity-overlay/);
  assert.match(scripts, /showActivity\('Conectando con Google'/);
  assert.match(scripts, /showActivity\('Cargando tu información'/);
  assert.match(scripts, /showActivity\('Guardando tu perfil'/);
  assert.doesNotMatch(scripts, /setStatus\('profileStatus','Guardando de forma segura/);
});

test('WhatsApp reserva un subcampo compacto para el código internacional', () => {
  const scripts = read('scripts.html');
  const styles = read('styles.html');
  assert.match(styles, /grid-template-columns:112px minmax\(0,1fr\)/);
  assert.match(styles, /grid-template-columns:105px minmax\(0,1fr\)/);
  assert.match(scripts, /\$\{phoneFlag\(country\.iso\)\} \+\$\{escapeHtml\(country\.dial\)\}/);
  assert.doesNotMatch(scripts, /\$\{escapeHtml\(country\.name\)\} \(\+\$\{escapeHtml\(country\.dial\)\}\)/);
});

test('Club Tazmany usa 4.90 el primer mes y 9.90 desde el segundo', () => {
  const discovery = read('discovery.html');
  const seed = read('Seed.gs');
  const setup = read('Phase315Setup.gs');
  assert.match(discovery, /S\/ 4\.90/);
  assert.match(discovery, /S\/ 9\.90 al mes/);
  assert.match(seed, /regular_price_cents: 990, intro_price_cents: 490/);
  assert.match(setup, /regular_price_cents: 990, intro_price_cents: 490/);
  assert.match(setup, /clubBillingRemainsDisabled/);
});
