import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
let template = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
template = template.replace(/<\?!= include\('([^']+)'\); \?>/g, (_, name) => fs.readFileSync(path.join(src, `${name}.html`), 'utf8'));

function renderStaticPreview(logoUrl) {
  const appConfig = {
    appName: 'Tazmany',
    version: packageJson.version,
    environment: 'github-pages-preview',
    logoUrl,
    isStaticPreview: true,
    demoNotice: 'Vista visual: identidad real disponible en Apps Script',
    auth: {
      googleClientId: '',
      googleEnabled: false,
      otpEnabled: false,
      termsVersion: '2026-08-24',
      privacyVersion: '2026-08-24'
    }
  };

  return template
    .replace('<?!= appConfig ?>', JSON.stringify(appConfig))
    .replace("'<?= initialView ?>'", "'home'");
}

const rootHtml = renderStaticPreview('assets/brand/tazmany-logo.png');
const distHtml = renderStaticPreview('assets/tazmany-logo.png');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.mkdirSync(path.join(root, 'dist', 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'index.html'), rootHtml);
fs.writeFileSync(path.join(root, 'dist', 'preview.html'), distHtml);
fs.writeFileSync(path.join(root, 'dist', 'index.html'), distHtml);
fs.writeFileSync(path.join(root, 'dist', '.nojekyll'), '');
fs.copyFileSync(path.join(root, 'assets', 'brand', 'tazmany-logo.png'), path.join(root, 'dist', 'assets', 'tazmany-logo.png'));
const versionedPreview = `tazmany-preview-amarillo-v${packageJson.version}.html`;
fs.writeFileSync(path.join(root, 'dist', versionedPreview), distHtml);
console.log(`Preview generated: index.html, dist/index.html, dist/preview.html and dist/${versionedPreview}`);
