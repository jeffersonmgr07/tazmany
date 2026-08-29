function setupTazmanyPhase314() {
  return withScriptLock_(function () {
    var spreadsheet = getMasterSpreadsheet_();
    ensureSheet_(spreadsheet, 'CUSTOMER_PROFILES', TAZMANY_SCHEMA.CUSTOMER_PROFILES);
    ensureSheet_(spreadsheet, 'CUSTOMER_PRIVATE_DATA', TAZMANY_SCHEMA.CUSTOMER_PRIVATE_DATA);
    upsertRowsById_('SCHEMA_MIGRATIONS', [{
      id: 'migration-014', migration_key: '014-google-name-international-whatsapp',
      description: 'Nombres sugeridos por Google y WhatsApp internacional con país', applied_at: nowIso_(),
      checksum: 'tazmany-0.3.14-google-whatsapp', created_at: nowIso_(), updated_at: nowIso_(), status: 'APPLIED', version: 1
    }]);
    return getTazmanyPhase314Diagnostics();
  });
}

function getTazmanyPhase314Diagnostics() {
  var spreadsheet = getMasterSpreadsheet_();
  var sheet = spreadsheet.getSheetByName('CUSTOMER_PRIVATE_DATA');
  var headers = sheet ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  var properties = PropertiesService.getScriptProperties();
  var origins = String(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ALLOWED_FRONTEND_ORIGINS) || '');
  var checks = {
    environmentIsStaging: properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ENVIRONMENT) === 'staging',
    googleClientConfigured: Boolean(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_CLIENT_ID)),
    relaySecretConfigured: String(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.API_RELAY_SECRET) || '').length >= 32,
    officialDomainAllowed: origins.split(',').map(function (item) { return item.trim(); }).indexOf('https://tazmany.com') >= 0,
    phoneCountryColumnReady: headers.indexOf('phone_country_iso') >= 0,
    paymentsRemainDisabled: TAZMANY_CONFIG.FEATURES.CHECKOUT_ENABLED === false
  };
  var issues = Object.keys(checks).filter(function (key) { return !checks[key]; });
  return { ok: issues.length === 0, version: TAZMANY_CONFIG.VERSION, phase: '3-CLOSED', checks: checks, issues: issues };
}
