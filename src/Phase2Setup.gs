function setupTazmanyPhase2() {
  var result = withScriptLock_(function () {
    var spreadsheet = getMasterSpreadsheet_();
    ['AUTH_IDENTITIES', 'OTP_CHALLENGES', 'USER_SESSIONS', 'CUSTOMER_PRIVATE_DATA', 'TERMS_ACCEPTANCES', 'IDEMPOTENCY_KEYS']
      .forEach(function (sheetName) { ensureSheet_(spreadsheet, sheetName, TAZMANY_SCHEMA[sheetName]); });
    var properties = PropertiesService.getScriptProperties();
    ensurePhase2Properties_(properties);
    upsertRowsById_('SCHEMA_MIGRATIONS', [{
      id: 'migration-002', migration_key: '002-auth-sessions-rbac',
      description: 'Identidades, OTP, sesiones propias, perfil privado y aceptaciones versionadas',
      applied_at: nowIso_(), checksum: 'tazmany-v0.2.0', created_at: nowIso_(), updated_at: nowIso_(), status: 'APPLIED', version: 1
    }]);
    return getTazmanyPhase2Diagnostics_();
  });
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function ensurePhase2Properties_(properties) {
  var defaults = {};
  defaults[TAZMANY_CONFIG.SCRIPT_PROPERTIES.SESSION_TTL_HOURS] = '168';
  defaults[TAZMANY_CONFIG.SCRIPT_PROPERTIES.OTP_TTL_MINUTES] = '10';
  defaults[TAZMANY_CONFIG.SCRIPT_PROPERTIES.OTP_MAX_ATTEMPTS] = '5';
  defaults[TAZMANY_CONFIG.SCRIPT_PROPERTIES.TERMS_VERSION] = '2026-08-27';
  defaults[TAZMANY_CONFIG.SCRIPT_PROPERTIES.PRIVACY_VERSION] = '2026-08-27';
  defaults[TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_VERIFY_MODE] = 'TOKENINFO';
  Object.keys(defaults).forEach(function (key) {
    if (!properties.getProperty(key)) properties.setProperty(key, defaults[key]);
  });
  if (!properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.AUTH_PEPPER)) {
    properties.setProperty(
      TAZMANY_CONFIG.SCRIPT_PROPERTIES.AUTH_PEPPER,
      createOpaqueToken_() + createOpaqueToken_()
    );
  }
}

function getTazmanyPhase2Diagnostics() {
  var result = getTazmanyPhase2Diagnostics_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function getTazmanyPhase2Diagnostics_() {
  var properties = PropertiesService.getScriptProperties();
  var environment = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ENVIRONMENT) || 'development';
  var verifyMode = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_VERIFY_MODE) || 'TOKENINFO';
  var issues = [];
  if (!properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_CLIENT_ID)) issues.push('Falta TAZMANY_GOOGLE_CLIENT_ID: Google Identity permanecerá desactivado.');
  if (environment === 'production' && verifyMode === 'TOKENINFO') issues.push('Producción bloqueada: configura RELAY y TAZMANY_GOOGLE_VERIFY_URL.');
  return {
    ok: issues.length === 0,
    version: TAZMANY_CONFIG.VERSION,
    environment: environment,
    spreadsheetConfigured: Boolean(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.SPREADSHEET_ID)),
    driveConfigured: Boolean(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.DRIVE_FOLDER_ID)),
    authPepperConfigured: Boolean(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.AUTH_PEPPER)),
    googleClientConfigured: Boolean(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_CLIENT_ID)),
    googleVerifyMode: verifyMode,
    otpMailRecipientsRemainingToday: MailApp.getRemainingDailyQuota(),
    sessionTtlHours: Number(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.SESSION_TTL_HOURS) || 168),
    otpTtlMinutes: Number(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.OTP_TTL_MINUTES) || 10),
    issues: issues
  };
}

function installTazmanyAuthTriggers() {
  var handler = 'purgeExpiredAuthRecords';
  var existing = ScriptApp.getProjectTriggers().filter(function (trigger) { return trigger.getHandlerFunction() === handler; });
  if (!existing.length) ScriptApp.newTrigger(handler).timeBased().everyDays(1).atHour(3).create();
  var result = { ok: true, handler: handler, alreadyInstalled: existing.length > 0 };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function purgeExpiredAuthRecords() {
  return withScriptLock_(function () {
    var now = Date.now();
    var changed = { sessions: 0, otpChallenges: 0, idempotencyKeys: 0 };
    var repository = getDataRepository_();
    var sessions = repository.list('USER_SESSIONS').filter(function (item) {
      return item.status === 'ACTIVE' && new Date(item.expires_at).getTime() <= now;
    }).map(function (item) {
      item.status = 'EXPIRED'; item.updated_at = nowIso_(); item.version = Number(item.version || 0) + 1; changed.sessions += 1; return item;
    });
    var challenges = repository.list('OTP_CHALLENGES').filter(function (item) {
      return item.status === 'ACTIVE' && new Date(item.expires_at).getTime() <= now;
    }).map(function (item) {
      item.status = 'EXPIRED'; item.updated_at = nowIso_(); item.version = Number(item.version || 0) + 1; changed.otpChallenges += 1; return item;
    });
    var keys = repository.list('IDEMPOTENCY_KEYS').filter(function (item) {
      return ['PROCESSING', 'COMPLETED', 'FAILED'].indexOf(String(item.status)) >= 0 && new Date(item.expires_at).getTime() <= now;
    }).map(function (item) {
      item.status = 'EXPIRED'; item.updated_at = nowIso_(); item.version = Number(item.version || 0) + 1; changed.idempotencyKeys += 1; return item;
    });
    if (sessions.length) repository.upsert('USER_SESSIONS', sessions);
    if (challenges.length) repository.upsert('OTP_CHALLENGES', challenges);
    if (keys.length) repository.upsert('IDEMPOTENCY_KEYS', keys);
    return changed;
  });
}
