import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const required = ['src/index.html','src/styles.html','src/scripts.html','src/Main.gs','src/Setup.gs','src/Seed.gs','src/SheetRepository.gs','src/appsscript.json','README.md'];
for (const file of required) if (!fs.existsSync(path.join(root,file))) throw new Error(`Missing required file: ${file}`);

const manifest = JSON.parse(fs.readFileSync(path.join(root,'src/appsscript.json'),'utf8'));
if (manifest.runtimeVersion !== 'V8') throw new Error('Apps Script runtime must be V8');
if (manifest.timeZone !== 'America/Lima') throw new Error('Apps Script timezone must be America/Lima');

const setup = fs.readFileSync(path.join(root,'src/Setup.gs'),'utf8');
const expectedSheets = ['USERS','MERCHANTS','CAMPAIGNS','ORDERS','PAYMENTS','COUPONS','SETTLEMENTS','AUDIT_LOG','ERROR_LOG'];
for (const sheet of expectedSheets) if (!setup.includes(`${sheet}: [`)) throw new Error(`Missing schema: ${sheet}`);

for (const file of fs.readdirSync(path.join(root,'src')).filter(name=>name.endsWith('.gs'))) {
  const code = fs.readFileSync(path.join(root,'src',file),'utf8');
  new vm.Script(code, { filename:file });
  if (/APP_USR-[A-Za-z0-9-]{20,}|TEST-[A-Za-z0-9-]{20,}/.test(code)) throw new Error(`Possible Mercado Pago secret in ${file}`);
}
const frontendSource = fs.readFileSync(path.join(root, 'src', 'scripts.html'), 'utf8');
const scripts = [...frontendSource.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
for (const [index, code] of scripts.entries()) new vm.Script(code, { filename: `preview-script-${index + 1}.js` });

const styles = fs.readFileSync(path.join(root, 'src', 'styles.html'), 'utf8');
for (const token of ['--yellow:#F2B705', '--amber:#D77800', '--navy:#182635', '--cream:#FFF7D6']) {
  if (!styles.includes(token)) throw new Error(`Missing approved theme token: ${token}`);
}
if (!styles.includes('--logo-navy:#0A264E') || !styles.includes('--logo-coral:#FD653A')) {
  throw new Error('Official wordmark colors must remain isolated from functional UI colors.');
}
console.log(`Validated ${required.length} required files, manifest, schemas and Apps Script syntax.`);
