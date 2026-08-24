import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const styles = fs.readFileSync(new URL('../../src/styles.html', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../../src/index.html', import.meta.url), 'utf8');

test('usa la paleta aprobada ahorro amarillo + ámbar', () => {
  assert.match(styles, /--yellow:#F2B705/);
  assert.match(styles, /--amber:#D77800/);
  assert.match(styles, /--navy:#182635/);
  assert.match(styles, /--cream:#FFF7D6/);
  assert.match(index, /data-theme="savings-yellow"/);
  assert.match(styles, /\.hero-section\{background:linear-gradient\(125deg,#FFE56F 0%,var\(--yellow\) 56%,#E49A00 100%\)\}/);
});

test('protege los colores oficiales del wordmark', () => {
  assert.match(styles, /--logo-navy:#0A264E/);
  assert.match(styles, /--logo-coral:#FD653A/);
  assert.match(styles, /\.brand-name\{color:var\(--logo-navy\)\}/);
  assert.match(styles, /\.brand-name strong\{color:var\(--logo-coral\)\}/);
});
