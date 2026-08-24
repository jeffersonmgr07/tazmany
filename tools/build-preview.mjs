import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
html = html.replace(/<\?!= include\('([^']+)'\); \?>/g, (_, name) => fs.readFileSync(path.join(src, `${name}.html`), 'utf8'));
html = html.replace('<\?!= appConfig ?>', JSON.stringify({
  appName: 'Tazmany',
  version: packageJson.version,
  environment: 'github-pages-preview',
  logoUrl: 'assets/tazmany-logo.png',
  isStaticPreview: true,
  demoNotice: 'Vista visual: identidad real disponible en Apps Script',
  auth: { googleClientId: '', googleEnabled: false, otpEnabled: false, termsVersion: '2026-08-24', privacyVersion: '2026-08-24' }
}));
html = html.replace("'<?= initialView ?>'", "'home'");
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.mkdirSync(path.join(root, 'dist', 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'preview.html'), html);
fs.writeFileSync(path.join(root, 'dist', 'index.html'), html);
fs.writeFileSync(path.join(root, 'dist', '.nojekyll'), '');
fs.copyFileSync(path.join(root, 'assets', 'brand', 'tazmany-logo.png'), path.join(root, 'dist', 'assets', 'tazmany-logo.png'));
const versionedPreview = `tazmany-preview-amarillo-v${packageJson.version}.html`;
fs.writeFileSync(path.join(root, 'dist', versionedPreview), html);
console.log(`Preview generated: dist/index.html, dist/preview.html and dist/${versionedPreview}`);
