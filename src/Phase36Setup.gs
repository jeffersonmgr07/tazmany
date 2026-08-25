function setupTazmanyPhase36() {
  var result = withScriptLock_(function () {
    var spreadsheet = getMasterSpreadsheet_();
    ['COUNTRIES', 'CITIES', 'MARKETING_SUBSCRIBERS', 'MARKETING_EVENTS', 'CLUB_PLANS', 'CLUB_MEMBERSHIPS', 'CAMPAIGNS', 'CAMPAIGN_OPTIONS', 'SCHEMA_MIGRATIONS']
      .forEach(function (sheetName) { ensureSheet_(spreadsheet, sheetName, TAZMANY_SCHEMA[sheetName]); });
    upsertRowsById_('SCHEMA_MIGRATIONS', [{
      id: 'migration-004', migration_key: '004-location-subscribers-club',
      description: 'Países, selección de ciudad, suscriptores independientes y precios Club',
      applied_at: nowIso_(), checksum: 'tazmany-v0.3.6', created_at: nowIso_(), updated_at: nowIso_(), status: 'APPLIED', version: 1
    }]);
    seedDemoData();
    return getTazmanyPhase36Diagnostics();
  });
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function getTazmanyPhase36Diagnostics() {
  var repository = getDataRepository_();
  var required = ['COUNTRIES', 'MARKETING_SUBSCRIBERS', 'MARKETING_EVENTS', 'CLUB_PLANS', 'CLUB_MEMBERSHIPS'];
  var spreadsheet = getMasterSpreadsheet_();
  return {
    ok: required.every(function (name) { return Boolean(spreadsheet.getSheetByName(name)); }),
    version: TAZMANY_CONFIG.VERSION,
    countries: repository.list('COUNTRIES').length,
    cities: repository.list('CITIES').filter(function (item) { return item.status === 'ACTIVE'; }).length,
    subscribers: repository.list('MARKETING_SUBSCRIBERS').length,
    clubPlans: repository.list('CLUB_PLANS').length,
    paymentsEnabled: false
  };
}
