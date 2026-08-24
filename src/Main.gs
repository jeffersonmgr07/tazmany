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
  // Fase 2 no procesa webhooks ni efectos financieros.
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, code: 'NOT_IMPLEMENTED_PHASE_2' }))
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

function apiGetCustomerDashboard(sessionToken) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'customer.dashboard.read');
    return getCustomerDashboardForUser_(context.user.id);
  });
}

function apiGetMerchantDashboard(sessionToken) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'merchant.dashboard.read');
    return getMerchantDashboardForContext_(context);
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
