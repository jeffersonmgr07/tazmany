function doGet() {
  var publicUrl = 'https://tazmany.com/';
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="robots" content="noindex,nofollow">' +
    '<meta http-equiv="refresh" content="0;url=' + publicUrl + '">' +
    '<base target="_top"><title>Abriendo Tazmany</title></head>' +
    '<body style="font-family:Arial,sans-serif;padding:32px;color:#182635">' +
    '<p>Abriendo el portal oficial de Tazmany…</p>' +
    '<p><a href="' + publicUrl + '">Continuar a tazmany.com</a></p>' +
    '<script>window.top.location.replace(' + JSON.stringify(publicUrl) + ');<\/script>' +
    '</body></html>'
  ).setTitle('Tazmany');
}

function doPost(e) {
  var path = String(e && e.pathInfo || '').replace(/^\/+|\/+$/g, '');
  // The relay posts to the web-app root. Google can reserve /exec/api and
  // reject it before Apps Script invokes this function.
  if (!path || path === 'api') return handleFrontendApiPost_(e);
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

// Las órdenes y reservas de stock comienzan en Fase 4. Los cobros continúan
// deshabilitados hasta que Mercado Pago sandbox supere sus diagnósticos.

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
