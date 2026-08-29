function setupTazmanyPhase315() {
  return withScriptLock_(function () {
    var spreadsheet = getMasterSpreadsheet_();
    ensureSheet_(spreadsheet, 'CLUB_PLANS', TAZMANY_SCHEMA.CLUB_PLANS);
    var now = nowIso_();
    var existing = getRowsAsObjects_('CLUB_PLANS').find(function (item) { return item.id === 'club-monthly-pe'; }) || {};
    upsertRowsById_('CLUB_PLANS', [{
      id: 'club-monthly-pe', country_code: 'PE', name: 'Club Tazmany', billing_period: 'MONTHLY',
      regular_price_cents: 990, intro_price_cents: 490, intro_cycles: 1,
      benefits_json: '["Precios exclusivos en ofertas seleccionadas","Acceso anticipado a nuevas campañas","Promociones especiales para miembros","Beneficios configurables por ciudad"]',
      created_at: existing.created_at || now, updated_at: now, status: 'COMING_SOON', version: Number(existing.version || 0) + 1
    }]);
    upsertRowsById_('SCHEMA_MIGRATIONS', [{
      id: 'migration-015', migration_key: '015-loader-whatsapp-club-price',
      description: 'Carga modal, selector compacto de WhatsApp y precio final del Club', applied_at: now,
      checksum: 'tazmany-0.3.15-ui-club-price', created_at: now, updated_at: now, status: 'APPLIED', version: 1
    }]);
    CacheService.getScriptCache().removeAll([
      'public-bootstrap-v2-all', 'public-bootstrap-v2-city-lima', 'public-bootstrap-v2-city-arequipa',
      'public-bootstrap-v2-city-cusco', 'public-bootstrap-v2-city-trujillo', 'public-bootstrap-v2-city-piura'
    ]);
    return getTazmanyPhase315Diagnostics();
  });
}

function getTazmanyPhase315Diagnostics() {
  var plan = getRowsAsObjects_('CLUB_PLANS').find(function (item) { return item.id === 'club-monthly-pe'; }) || {};
  var benefits = parseJsonSafe_(plan.benefits_json, []);
  var checks = {
    introPriceIs490: Number(plan.intro_price_cents) === 490,
    regularPriceIs990: Number(plan.regular_price_cents) === 990,
    introIsOneMonth: Number(plan.intro_cycles) === 1,
    benefitsConfigured: Array.isArray(benefits) && benefits.length >= 4,
    clubRemainsComingSoon: String(plan.status) === 'COMING_SOON',
    checkoutRemainsDisabled: TAZMANY_CONFIG.FEATURES.CHECKOUT_ENABLED === false,
    clubBillingRemainsDisabled: TAZMANY_CONFIG.FEATURES.CLUB_BILLING_ENABLED === false
  };
  var issues = Object.keys(checks).filter(function (key) { return !checks[key]; });
  var result = { ok: issues.length === 0, version: TAZMANY_CONFIG.VERSION, phase: '3-CLOSED', checks: checks, issues: issues };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
