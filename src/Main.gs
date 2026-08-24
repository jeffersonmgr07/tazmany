function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  template.initialView = getRequestedView_(e);
  template.appConfig = JSON.stringify(getAppConfig_());
  return template.evaluate()
    .setTitle('Tazmany | Ofertas que sí valen la pena')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .addMetaTag('description', 'Ofertas y cupones digitales de comercios locales del Perú.');
}

function doPost(e) {
  // Fase 1 no procesa webhooks. Se registra el intento sin ejecutar efectos financieros.
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, code: 'NOT_IMPLEMENTED_PHASE_1' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function apiGetPublicBootstrap() {
  return executeApi_(function () {
    return getPublicBootstrap_();
  });
}

function apiGetOfferDetails(campaignId) {
  return executeApi_(function () {
    assertSafeId_(campaignId, 'campaignId');
    return getOfferDetails_(campaignId);
  });
}

function apiGetCustomerDashboard() {
  return executeApi_(function () {
    return getCustomerDashboardDemo_();
  });
}

function apiGetMerchantDashboard() {
  return executeApi_(function () {
    return getMerchantDashboardDemo_();
  });
}

function executeApi_(operation) {
  try {
    return { ok: true, data: operation(), meta: { version: TAZMANY_CONFIG.VERSION } };
  } catch (error) {
    logError_('API_ERROR', error);
    return {
      ok: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.publicMessage || 'No pudimos completar la solicitud. Inténtalo nuevamente.'
      }
    };
  }
}
