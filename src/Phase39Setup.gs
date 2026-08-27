function getTazmanyPhase39Diagnostics() {
  var prePayment = getTazmanyPrePaymentReadinessDiagnostics();
  var publicCopy = getTazmanyPublicCopyDiagnostics_();
  var checks = {
    publicCopyClean: publicCopy.ok,
    merchantAcquisitionHidden: publicCopy.merchantAcquisitionHidden,
    internalNoticesHidden: TAZMANY_CONFIG.FEATURES.INTERNAL_NOTICES_VISIBLE === false,
    checkoutDisabled: TAZMANY_CONFIG.FEATURES.CHECKOUT_ENABLED === false,
    clubBillingDisabled: TAZMANY_CONFIG.FEATURES.CLUB_BILLING_ENABLED === false,
    prePaymentReady: prePayment.ok
  };
  var issues = publicCopy.issues.slice();
  (prePayment.issues || []).forEach(function (issue) {
    issues.push('Preparación previa a pagos: ' + issue);
  });
  var closureChecks = [
    checks.publicCopyClean,
    checks.merchantAcquisitionHidden,
    checks.internalNoticesHidden,
    checks.checkoutDisabled,
    checks.clubBillingDisabled
  ];
  var result = {
    ok: Object.keys(checks).every(function (key) { return checks[key] === true; }),
    phase3ClosureOk: closureChecks.every(function (value) { return value === true; }),
    readyForPhase4: Object.keys(checks).every(function (key) { return checks[key] === true; }),
    version: TAZMANY_CONFIG.VERSION,
    checks: checks,
    paymentsEnabled: false,
    issues: issues
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function getTazmanyPublicCopyDiagnostics_() {
  var publicFiles = ['app', 'components', 'customer', 'merchant', 'admin', 'auth', 'phase3', 'discovery', 'scripts'];
  var blockedPhrases = [
    'Demo de desarrollo',
    'Pagos y canjes aún desactivados',
    'Haz que más personas',
    'Checkout reservado',
    'Conecta el relay',
    'GitHub Pages',
    'se registran en Sheets',
    'PANEL DEL COMERCIO · FASE',
    'OPERACIONES TAZMANY · FASE',
    'Escáner disponible en la Fase',
    'El pago con Mercado Pago se implementará',
    'No se realizará ningún cobro hasta implementar',
    'Se conectará a sus reglas específicas en una fase posterior',
    'La carga privada funciona en Apps Script',
    'El guardado real funciona en Apps Script',
    'Decisión demostrativa',
    'Campaña demostrativa',
    'FASE 3 · INCORPORACIÓN DE COMERCIOS'
  ];
  var issues = [];
  publicFiles.forEach(function (fileName) {
    var content = HtmlService.createHtmlOutputFromFile(fileName).getContent();
    blockedPhrases.forEach(function (phrase) {
      if (content.indexOf(phrase) >= 0) issues.push(fileName + ': texto interno visible: ' + phrase);
    });
  });
  var appContent = HtmlService.createHtmlOutputFromFile('app').getContent();
  var merchantAcquisitionHidden = appContent.indexOf('merchant-cta') < 0 && appContent.indexOf('Haz que más personas') < 0;
  if (!merchantAcquisitionHidden) issues.push('El bloque público de captación de comercios debe permanecer oculto.');
  return {
    ok: issues.length === 0,
    merchantAcquisitionHidden: merchantAcquisitionHidden,
    scannedFiles: publicFiles.length,
    issues: issues
  };
}
