function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  template.initialView = getRequestedView_(e);
  template.appConfig = JSON.stringify(getAppConfig_());
  return template.evaluate()
    .setTitle('Tazmany | Ofertas que sí valen la pena')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function doPost(e) {
  var path = String(e && e.pathInfo || '').replace(/^\/+|\/+$/g, '');
  if (path === 'api') return handleFrontendApiPost_(e);
  // Mercado Pago y otros webhooks permanecen fuera de alcance hasta la Fase 4.
  return createJsonOutput_({
    ok: false,
    error: { code: 'ENDPOINT_NOT_FOUND', message: 'La ruta solicitada no está disponible.' }
  });
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function apiGetPublicBootstrap(cityId) {
  return executeApi_(function () {
    if (cityId) assertSafeId_(cityId, 'cityId');
    return getPublicBootstrap_(cityId || '');
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
