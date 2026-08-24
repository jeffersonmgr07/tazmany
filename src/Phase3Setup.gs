function setupTazmanyPhase3() {
  var result = withScriptLock_(function () {
    var spreadsheet = getMasterSpreadsheet_();
    [
      'MERCHANTS', 'MERCHANT_PRIVATE_DATA', 'MERCHANT_USERS', 'MERCHANT_STATUS_HISTORY',
      'BRANCHES', 'BRANCH_HOURS', 'MERCHANT_DOCUMENTS', 'MERCHANT_BANK_ACCOUNTS',
      'CAMPAIGNS', 'CAMPAIGN_VERSIONS', 'CAMPAIGN_OPTIONS', 'CAMPAIGN_BRANCHES',
      'CAMPAIGN_SCHEDULES', 'BLACKOUT_DATES', 'CONTRACTS', 'CONTRACT_ACCEPTANCES'
    ].forEach(function (sheetName) {
      ensureSheet_(spreadsheet, sheetName, TAZMANY_SCHEMA[sheetName]);
    });
    upsertRowsById_('SCHEMA_MIGRATIONS', [{
      id: 'migration-003', migration_key: '003-merchants-campaigns',
      description: 'Onboarding KYC, sucursales, contratos, campañas, versiones y moderación',
      applied_at: nowIso_(), checksum: 'tazmany-v0.3.0', created_at: nowIso_(), updated_at: nowIso_(),
      status: 'APPLIED', version: 1
    }]);
    ensurePhase3DriveFolders_();
    return getTazmanyPhase3Diagnostics_();
  });
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function ensurePhase3DriveFolders_() {
  var root = getTazmanyDriveFolder_();
  ['Comercios', 'Contratos'].forEach(function (name) { getOrCreateChildFolder_(root, name); });
}

function getOrCreateChildFolder_(parent, name) {
  var folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function getTazmanyPhase3Diagnostics() {
  var result = getTazmanyPhase3Diagnostics_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function getTazmanyPhase3Diagnostics_() {
  var repository = getDataRepository_();
  var merchants = repository.list('MERCHANTS');
  var campaigns = repository.list('CAMPAIGNS');
  var contracts = repository.list('CONTRACTS');
  var issues = [];
  if (!PropertiesService.getScriptProperties().getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.DRIVE_FOLDER_ID)) issues.push('Falta la carpeta de Drive. Ejecuta setupTazmany().');
  if (!getMasterSpreadsheet_().getSheetByName('MERCHANT_PRIVATE_DATA')) issues.push('Falta MERCHANT_PRIVATE_DATA. Ejecuta setupTazmanyPhase3().');
  return {
    ok: issues.length === 0,
    version: TAZMANY_CONFIG.VERSION,
    merchantsByStatus: countRecordsByStatus_(merchants, 'onboarding_status'),
    campaignsByStatus: countRecordsByStatus_(campaigns, 'status'),
    contracts: contracts.length,
    issues: issues
  };
}

function countRecordsByStatus_(records, fieldName) {
  return (records || []).reduce(function (result, item) {
    var key = String(item[fieldName] || 'SIN_ESTADO');
    result[key] = Number(result[key] || 0) + 1;
    return result;
  }, {});
}
