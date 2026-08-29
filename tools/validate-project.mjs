import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const required = ['CNAME','index.html','privacidad.html','terminos.html','assets/legal.css','assets/brand/tazmany-logo.png','assets/brand/tazmany-isotipo.png','src/index.html','src/styles.html','src/scripts.html','src/auth.html','src/phone-countries.html','src/category-icons.html','src/phase3.html','src/discovery.html','src/Main.gs','src/Setup.gs','src/Seed.gs','src/SheetRepository.gs','src/AuthService.gs','src/OtpService.gs','src/SessionService.gs','src/RbacService.gs','src/IdempotencyService.gs','src/ProfileService.gs','src/GoogleIdentityService.gs','src/Phase2Setup.gs','src/Phase3Setup.gs','src/Phase36Setup.gs','src/Phase37Setup.gs','src/Phase39Setup.gs','src/Phase312Setup.gs','src/Phase314Setup.gs','src/Phase315Setup.gs','src/DiscoveryService.gs','src/FrontendApiGateway.gs','src/FrontendBridgeSetup.gs','src/MerchantOnboardingService.gs','src/CampaignWorkflowService.gs','src/ContractService.gs','src/ModerationService.gs','worker/tazmany-api-relay.js','wrangler.toml','src/appsscript.json','README.md'];
for (const file of required) if (!fs.existsSync(path.join(root,file))) throw new Error(`Missing required file: ${file}`);

const officialLogo = fs.readFileSync(path.join(root, 'assets', 'brand', 'tazmany-logo.png'));
const officialLogoHash = crypto.createHash('sha256').update(officialLogo).digest('hex');
if (officialLogoHash !== '4998f9e9cfc4611fe821c13541fdd1943db1876636049203c0e2c1f4437cd1f3') {
  throw new Error('Official Tazmany logo does not match the approved master file.');
}

const manifest = JSON.parse(fs.readFileSync(path.join(root,'src/appsscript.json'),'utf8'));
if (manifest.runtimeVersion !== 'V8') throw new Error('Apps Script runtime must be V8');
if (manifest.timeZone !== 'America/Lima') throw new Error('Apps Script timezone must be America/Lima');
if (!manifest.oauthScopes.includes('https://www.googleapis.com/auth/script.send_mail')) throw new Error('Mail scope is required for OTP delivery');
if (!manifest.oauthScopes.includes('https://www.googleapis.com/auth/documents')) throw new Error('Documents scope is required for versioned contract generation');
if (!manifest.oauthScopes.includes('https://www.googleapis.com/auth/script.scriptapp')) throw new Error('ScriptApp scope is required to install and inspect project triggers');

const setup = fs.readFileSync(path.join(root,'src/Setup.gs'),'utf8');
const expectedSheets = ['USERS','AUTH_IDENTITIES','OTP_CHALLENGES','USER_SESSIONS','CUSTOMER_PROFILES','CUSTOMER_PRIVATE_DATA','TERMS_ACCEPTANCES','IDEMPOTENCY_KEYS','COUNTRIES','CITIES','MARKETING_SUBSCRIBERS','MARKETING_EVENTS','CLUB_PLANS','CLUB_MEMBERSHIPS','MERCHANTS','MERCHANT_PRIVATE_DATA','MERCHANT_DOCUMENTS','MERCHANT_BANK_ACCOUNTS','CAMPAIGNS','CAMPAIGN_VERSIONS','CAMPAIGN_OPTIONS','CONTRACTS','CONTRACT_ACCEPTANCES','ORDERS','PAYMENTS','COUPONS','SETTLEMENTS','AUDIT_LOG','ERROR_LOG'];
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
if (!styles.includes('--logo-navy:#0A264E') || !styles.includes(':root{--logo-coral:#F2A000}')) {
  throw new Error('Official wordmark colors must remain isolated from functional UI colors.');
}
const rootIndex = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (/<\?(!?=|=)/.test(rootIndex)) throw new Error('Root index.html contains unresolved Apps Script template tags.');
if (!rootIndex.includes('"environment":"public-web-connected"')) throw new Error('Root index.html must be the connected GitHub web build.');
if (!rootIndex.includes('"apiBaseUrl":"https://')) throw new Error('Root index.html must contain the deployed HTTPS relay URL.');
if (!rootIndex.includes('"isStaticPreview":false')) throw new Error('Root index.html cannot be a static preview.');
if (!rootIndex.includes('assets/brand/tazmany-logo.png')) throw new Error('Root index.html must reference the existing repository logo.');
if (!rootIndex.includes(`assets/brand/tazmany-logo.png?v=${packageJson.version}`)) throw new Error('Root index.html must cache-bust the approved logo with the current version.');
if (!rootIndex.includes(`assets/brand/tazmany-isotipo.png?v=${packageJson.version}`)) throw new Error('Root index.html must use the mascot isotipo with the current cache-busting version.');
if (fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim() !== 'tazmany.com') throw new Error('GitHub Pages CNAME must use tazmany.com.');
for (const blockedText of ['Demo de desarrollo','Pagos y canjes aún desactivados','Haz que más personas','Checkout reservado','Conecta el relay','GitHub Pages','se registran en Sheets']) {
  if (rootIndex.includes(blockedText)) throw new Error(`Public index exposes internal copy: ${blockedText}`);
}
const authSource = fs.readdirSync(path.join(root, 'src')).filter(file => file.endsWith('.gs')).map(file => fs.readFileSync(path.join(root, 'src', file), 'utf8')).join('\n');
for (const requiredControl of ['LockService.getScriptLock()', 'token_hash', 'code_hash', 'IDEMPOTENCY_KEYS', 'requirePermission_', 'TAZMANY_AUTH_PEPPER']) {
  if (!authSource.includes(requiredControl)) throw new Error(`Missing Phase 2 security control: ${requiredControl}`);
}
const phase3Source = ['MerchantOnboardingService.gs','CampaignWorkflowService.gs','ContractService.gs','ModerationService.gs'].map(file => fs.readFileSync(path.join(root,'src',file),'utf8')).join('\n');
for (const requiredControl of ['runIdempotent_', 'merchant.campaigns.manage', 'admin.merchants.review', 'admin.campaigns.review', 'document_hash', 'CAMPAIGN_VERSIONS']) {
  if (!phase3Source.includes(requiredControl)) throw new Error(`Missing Phase 3 control: ${requiredControl}`);
}
const bridgeSource = fs.readFileSync(path.join(root, 'src', 'FrontendApiGateway.gs'), 'utf8');
for (const requiredControl of ['constantTimeEquals_', 'API_ACTION_NOT_ALLOWED', 'ALLOWED_FRONTEND_ORIGINS', 'TAZMANY_FRONTEND_API_ACTIONS_']) {
  if (!bridgeSource.includes(requiredControl)) throw new Error(`Missing frontend bridge control: ${requiredControl}`);
}
if (/eval\s*\(|this\s*\[/.test(bridgeSource)) throw new Error('Frontend API gateway must use an explicit action allowlist.');
const categoryIcons = fs.readFileSync(path.join(root, 'src', 'category-icons.html'), 'utf8');
for (const icon of ['restaurant','sparkles','fitness','car','ticket']) if (!categoryIcons.includes(`id="taz-cat-${icon}"`)) throw new Error(`Missing custom category icon: ${icon}`);
if (/🍽|✨|🏋|🚗|🎟/.test(frontendSource)) throw new Error('Category emojis must not be used in the frontend.');
const discoverySource = fs.readFileSync(path.join(root, 'src', 'DiscoveryService.gs'), 'utf8') + fs.readFileSync(path.join(root, 'src', 'discovery.html'), 'utf8');
for (const control of ['runIdempotent_', 'marketingConsent', 'MARKETING_SUBSCRIBERS', 'CLUB_PLANS', 'locationDialog', 'subscriberDialog']) {
  if (!discoverySource.includes(control)) throw new Error(`Missing discovery/Club control: ${control}`);
}
console.log(`Validated ${required.length} required files, manifest, schemas and Apps Script syntax.`);
