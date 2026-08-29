import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read = name => fs.readFileSync(new URL(`../../src/${name}`, import.meta.url), 'utf8');

test('Google completa nombres separados sin reemplazar un perfil existente', () => {
  const auth = read('AuthService.gs');
  assert.match(auth, /claims && claims\.given_name/);
  assert.match(auth, /claims && claims\.family_name/);
  assert.match(auth, /if \(!profile\.first_name\)/);
  assert.match(auth, /GOOGLE_PROFILE_NAME_IMPORTED/);
});

test('el perfil usa WhatsApp internacional y conserva el país del número', () => {
  const html = read('auth.html');
  const profile = read('ProfileService.gs');
  const setup = read('Setup.gs');
  assert.match(html, />WhatsApp</);
  assert.doesNotMatch(html, /Celular peruano/);
  assert.match(html, /name="phoneCountryIso"/);
  assert.match(html, /name="phoneNationalNumber"/);
  assert.match(profile, /normalizeInternationalPhone_\(payload\.phoneCountryIso, payload\.phoneE164\)/);
  assert.match(setup, /phone_country_iso/);
});

test('el selector ofrece todos los países y deja Perú con +51 disponible', () => {
  const source = read('phone-countries.html').match(/<script>([\s\S]*?)<\/script>/)[1];
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  const countries = Array.from(context.window.TAZMANY_PHONE_COUNTRIES);
  assert.ok(countries.length >= 240);
  assert.equal(countries.find(item => item.iso === 'PE')?.dial, '51');
  assert.equal(countries.find(item => item.iso === 'ES')?.dial, '34');
  assert.equal(new Set(countries.map(item => item.iso)).size, countries.length);
});

test('la validación acepta E.164 internacional y rechaza teléfonos inválidos', () => {
  const context = { createPublicError_: (code, message) => Object.assign(new Error(message), { code }) };
  vm.createContext(context);
  vm.runInContext(read('Validation.gs'), context);
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.normalizeInternationalPhone_('ES', '+34612345678'))),
    { countryIso: 'ES', phoneE164: '+34612345678' }
  );
  assert.throws(() => context.normalizeInternationalPhone_('PE', '934838822'), /WhatsApp válido/);
});
