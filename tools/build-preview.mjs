import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
html = html.replace(/<\?!= include\('([^']+)'\); \?>/g, (_, name) => fs.readFileSync(path.join(src, `${name}.html`), 'utf8'));
html = html.replace('<\?!= appConfig ?>', JSON.stringify({ appName: 'Tazmany', version: '0.1.0', environment: 'local-preview', logoUrl: '../assets/brand/tazmany-logo.png', demoNotice: 'Vista local' }));
html = html.replace("'<?= initialView ?>'", "'home'");
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'preview.html'), html);
const versionedPreview = `tazmany-preview-amarillo-v${packageJson.version}.html`;
fs.writeFileSync(path.join(root, 'dist', versionedPreview), html);
console.log(`Preview generated: dist/preview.html and dist/${versionedPreview}`);
