import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const buildTarget = String(process.env.TAZMANY_BUILD_TARGET || 'preview').toLowerCase();
const apiBaseUrl = String(process.env.TAZMANY_API_BASE_URL || '').trim().replace(/\/+$/, '');
const connected = /^https:\/\/[^/]+$/.test(apiBaseUrl);
if (!['preview', 'github'].includes(buildTarget)) throw new Error('TAZMANY_BUILD_TARGET must be preview or github.');
if (buildTarget === 'github' && !connected) {
  throw new Error('The GitHub build requires TAZMANY_API_BASE_URL with the deployed HTTPS relay URL.');
}
let template = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
template = template.replace(/<\?!= include\('([^']+)'\); \?>/g, (_, name) => fs.readFileSync(path.join(src, `${name}.html`), 'utf8'));

function renderStaticPreview(logoUrl, remoteUrl = '') {
  const isConnected = /^https:\/\//.test(remoteUrl);
  const appConfig = {
    appName: 'Tazmany',
    version: packageJson.version,
    environment: isConnected ? 'public-web-connected' : 'public-preview',
    logoUrl,
    apiBaseUrl: remoteUrl,
    isStaticPreview: !isConnected,
    features: {
      merchantAcquisitionPublic: false,
      checkoutEnabled: false,
      clubBillingEnabled: false,
      internalNoticesVisible: false
    },
    commerce: {
      orderReservationsEnabled: true,
      paymentsEnabled: false,
      reservationMinutes: 10
    },
    auth: {
      googleClientId: '',
      googleEnabled: false,
      otpEnabled: false,
      termsVersion: '2026-08-27',
      privacyVersion: '2026-08-27'
    }
  };

  return template
    .replace('<?!= appConfig ?>', JSON.stringify(appConfig))
    .replace("'<?= initialView ?>'", "'home'");
}

const rootHtml = renderStaticPreview(`assets/brand/tazmany-logo.png?v=${packageJson.version}`, apiBaseUrl);
const distHtml = renderStaticPreview(`assets/tazmany-logo.png?v=${packageJson.version}`, buildTarget === 'github' ? apiBaseUrl : '');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.mkdirSync(path.join(root, 'dist', 'assets'), { recursive: true });
fs.mkdirSync(path.join(root, 'dist', 'assets', 'brand'), { recursive: true });
if (buildTarget === 'github') fs.writeFileSync(path.join(root, 'index.html'), rootHtml);
fs.writeFileSync(path.join(root, 'dist', 'preview.html'), distHtml);
fs.writeFileSync(path.join(root, 'dist', 'index.html'), distHtml);
fs.writeFileSync(path.join(root, 'dist', '.nojekyll'), '');
fs.copyFileSync(path.join(root, 'assets', 'brand', 'tazmany-logo.png'), path.join(root, 'dist', 'assets', 'tazmany-logo.png'));
fs.copyFileSync(path.join(root, 'assets', 'brand', 'tazmany-logo.png'), path.join(root, 'dist', 'assets', 'brand', 'tazmany-logo.png'));
fs.copyFileSync(path.join(root, 'assets', 'brand', 'tazmany-isotipo.png'), path.join(root, 'dist', 'assets', 'brand', 'tazmany-isotipo.png'));
fs.copyFileSync(path.join(root, 'assets', 'legal.css'), path.join(root, 'dist', 'assets', 'legal.css'));
fs.copyFileSync(path.join(root, 'privacidad.html'), path.join(root, 'dist', 'privacidad.html'));
fs.copyFileSync(path.join(root, 'terminos.html'), path.join(root, 'dist', 'terminos.html'));
fs.copyFileSync(path.join(root, 'CNAME'), path.join(root, 'dist', 'CNAME'));
const versionedPreview = `tazmany-preview-amarillo-v${packageJson.version}.html`;
fs.writeFileSync(path.join(root, 'dist', versionedPreview), distHtml);
console.log(buildTarget === 'github'
  ? `Connected GitHub build generated: index.html, dist/index.html and dist/${versionedPreview}`
  : `Preview generated without replacing the connected root index: dist/preview.html and dist/${versionedPreview}`);
