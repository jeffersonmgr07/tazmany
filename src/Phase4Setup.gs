function setupTazmanyPhase4() {
  return withScriptLock_(function () {
    var spreadsheet = getMasterSpreadsheet_();
    ['CAMPAIGNS', 'CAMPAIGN_OPTIONS', 'COUNTERS', 'INVENTORY_RESERVATIONS', 'ORDERS', 'ORDER_ITEMS']
      .forEach(function (sheetName) { ensureSheet_(spreadsheet, sheetName, TAZMANY_SCHEMA[sheetName]); });
    var now = nowIso_();
    var seedCampaignIds = [
      'campaign-ceviche', 'campaign-spa', 'campaign-fitness', 'campaign-detailing',
      'campaign-bowling', 'campaign-brunch', 'campaign-yoga', 'campaign-limpieza-auto'
    ];
    var campaigns = getRowsAsObjects_('CAMPAIGNS').filter(function (item) { return seedCampaignIds.indexOf(item.id) >= 0; });
    campaigns.forEach(function (item) {
      item.cashback_basis_points = TAZMANY_CONFIG.PUBLIC_CASHBACK_BASIS_POINTS;
      item.club_cashback_basis_points = TAZMANY_CONFIG.CLUB_CASHBACK_BASIS_POINTS;
      item.updated_at = now;
      item.version = Number(item.version || 0) + 1;
    });
    if (campaigns.length) upsertRowsById_('CAMPAIGNS', campaigns);
    var options = getRowsAsObjects_('CAMPAIGN_OPTIONS').filter(function (item) { return seedCampaignIds.indexOf(item.campaign_id) >= 0; });
    options.forEach(function (item) {
      item.club_cashback_basis_points = TAZMANY_CONFIG.CLUB_CASHBACK_BASIS_POINTS;
      item.updated_at = now;
      item.version = Number(item.version || 0) + 1;
    });
    if (options.length) upsertRowsById_('CAMPAIGN_OPTIONS', options);
    var existingCounter = getRowsAsObjects_('COUNTERS').find(function (item) { return item.counter_name === 'orders'; });
    if (!existingCounter) {
      var maximum = getRowsAsObjects_('ORDERS').reduce(function (max, order) {
        var match = String(order.order_number || '').match(/^TAZ-(\d+)$/);
        return match ? Math.max(max, Number(match[1])) : max;
      }, 100);
      upsertRowsById_('COUNTERS', [{
        id: 'counter-orders', counter_name: 'orders', current_value: maximum, prefix: 'TAZ',
        created_at: now, updated_at: now, status: 'ACTIVE', version: 1
      }]);
    }
    upsertRowsById_('SCHEMA_MIGRATIONS', [{
      id: 'migration-016', migration_key: '016-phase4-orders-reservations-money-responsive',
      description: 'Inicio Fase 4: precios en céntimos, cashback público/Club, órdenes y reservas de inventario',
      applied_at: now, checksum: 'tazmany-0.4.0-orders-reservations', created_at: now, updated_at: now,
      status: 'APPLIED', version: 1
    }]);
    CacheService.getScriptCache().removeAll([
      'public-bootstrap-v2-all', 'public-bootstrap-v2-city-lima', 'public-bootstrap-v2-city-arequipa',
      'public-bootstrap-v2-city-cusco', 'public-bootstrap-v2-city-trujillo', 'public-bootstrap-v2-city-piura'
    ]);
    return getTazmanyPhase4Diagnostics();
  });
}

function getTazmanyPhase4Diagnostics() {
  var spreadsheet = getMasterSpreadsheet_();
  var campaignHeaders = spreadsheet.getSheetByName('CAMPAIGNS').getRange(1, 1, 1, spreadsheet.getSheetByName('CAMPAIGNS').getLastColumn()).getValues()[0];
  var orderHeaders = spreadsheet.getSheetByName('ORDERS').getRange(1, 1, 1, spreadsheet.getSheetByName('ORDERS').getLastColumn()).getValues()[0];
  var reservationHeaders = spreadsheet.getSheetByName('INVENTORY_RESERVATIONS').getRange(1, 1, 1, spreadsheet.getSheetByName('INVENTORY_RESERVATIONS').getLastColumn()).getValues()[0];
  var counter = getRowsAsObjects_('COUNTERS').find(function (item) { return item.counter_name === 'orders'; }) || {};
  var checks = {
    phase3ClosedBeforePhase4: TAZMANY_CONFIG.VERSION === '0.4.0',
    campaignClubCashbackReady: campaignHeaders.indexOf('club_cashback_basis_points') >= 0,
    orderReservationExpiryReady: orderHeaders.indexOf('reservation_expires_at') >= 0,
    reservationOwnerReady: reservationHeaders.indexOf('customer_user_id') >= 0,
    orderCounterReady: counter.status === 'ACTIVE' && Number(counter.current_value || 0) >= 100,
    publicCashbackIsOnePercent: TAZMANY_CONFIG.PUBLIC_CASHBACK_BASIS_POINTS === 100,
    clubCashbackIsThreePercent: TAZMANY_CONFIG.CLUB_CASHBACK_BASIS_POINTS === 300,
    paymentsRemainDisabled: TAZMANY_CONFIG.FEATURES.CHECKOUT_ENABLED === false,
    clubBillingRemainsDisabled: TAZMANY_CONFIG.FEATURES.CLUB_BILLING_ENABLED === false
  };
  var issues = Object.keys(checks).filter(function (key) { return !checks[key]; });
  var result = { ok: issues.length === 0, version: TAZMANY_CONFIG.VERSION, phase: '4.0-ORDERS-RESERVATIONS', checks: checks, issues: issues };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
