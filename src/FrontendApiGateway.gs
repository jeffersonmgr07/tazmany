var TAZMANY_FRONTEND_API_ACTIONS_ = Object.freeze({
  apiGetPublicBootstrap: routeFrontendApi_(0, 1, function (args) { return apiGetPublicBootstrap(args[0] || ''); }),
  apiGetOfferDetails: routeFrontendApi_(1, 1, function (args) { return apiGetOfferDetails(args[0]); }),
  apiSubscribeToOffers: routeFrontendApi_(2, 2, function (args) { return apiSubscribeToOffers(args[0], args[1]); }),
  apiGetAuthConfig: routeFrontendApi_(0, 0, function () { return apiGetAuthConfig(); }),
  apiAuthenticateGoogle: routeFrontendApi_(4, 4, function (args) { return apiAuthenticateGoogle(args[0], args[1], args[2], args[3]); }),
  apiRequestEmailOtp: routeFrontendApi_(3, 3, function (args) { return apiRequestEmailOtp(args[0], args[1], args[2]); }),
  apiVerifyEmailOtp: routeFrontendApi_(5, 5, function (args) { return apiVerifyEmailOtp(args[0], args[1], args[2], args[3], args[4]); }),
  apiGetSession: routeFrontendApi_(1, 1, function (args) { return apiGetSession(args[0]); }),
  apiListSessions: routeFrontendApi_(1, 1, function (args) { return apiListSessions(args[0]); }),
  apiLogout: routeFrontendApi_(1, 1, function (args) { return apiLogout(args[0]); }),
  apiRevokeSession: routeFrontendApi_(2, 2, function (args) { return apiRevokeSession(args[0], args[1]); }),
  apiGetMyProfile: routeFrontendApi_(1, 1, function (args) { return apiGetMyProfile(args[0]); }),
  apiSaveCustomerProfile: routeFrontendApi_(3, 3, function (args) { return apiSaveCustomerProfile(args[0], args[1], args[2]); }),
  apiGetCustomerDashboard: routeFrontendApi_(1, 1, function (args) { return apiGetCustomerDashboard(args[0]); }),
  apiGetMerchantDashboard: routeFrontendApi_(1, 1, function (args) { return apiGetMerchantDashboard(args[0]); }),
  apiGetMerchantWorkspace: routeFrontendApi_(1, 1, function (args) { return apiGetMerchantWorkspace(args[0]); }),
  apiSaveMerchantOnboarding: routeFrontendApi_(3, 3, function (args) { return apiSaveMerchantOnboarding(args[0], args[1], args[2]); }),
  apiUploadMerchantDocument: routeFrontendApi_(3, 3, function (args) { return apiUploadMerchantDocument(args[0], args[1], args[2]); }),
  apiSaveCampaignDraft: routeFrontendApi_(3, 3, function (args) { return apiSaveCampaignDraft(args[0], args[1], args[2]); }),
  apiGetCampaignEditor: routeFrontendApi_(2, 2, function (args) { return apiGetCampaignEditor(args[0], args[1]); }),
  apiSubmitCampaign: routeFrontendApi_(3, 3, function (args) { return apiSubmitCampaign(args[0], args[1], args[2]); }),
  apiGenerateMerchantFrameworkContract: routeFrontendApi_(2, 2, function (args) { return apiGenerateMerchantFrameworkContract(args[0], args[1]); }),
  apiAcceptMerchantContract: routeFrontendApi_(4, 4, function (args) { return apiAcceptMerchantContract(args[0], args[1], args[2], args[3]); }),
  apiGetAdminModerationDashboard: routeFrontendApi_(1, 1, function (args) { return apiGetAdminModerationDashboard(args[0]); }),
  apiReviewMerchant: routeFrontendApi_(5, 5, function (args) { return apiReviewMerchant(args[0], args[1], args[2], args[3], args[4]); }),
  apiReviewCampaign: routeFrontendApi_(5, 5, function (args) { return apiReviewCampaign(args[0], args[1], args[2], args[3], args[4]); })
});

function routeFrontendApi_(minimumArgs, maximumArgs, handler) {
  return Object.freeze({ minimumArgs: minimumArgs, maximumArgs: maximumArgs, handler: handler });
}

function handleFrontendApiPost_(e) {
  try {
    var bodyText = String(e && e.postData && e.postData.contents || '');
    if (!bodyText || bodyText.length > 7500000) {
      throw createPublicError_('INVALID_API_REQUEST', 'La solicitud no es válida o supera el tamaño permitido.');
    }
    var request = parseJsonSafe_(bodyText, null);
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      throw createPublicError_('INVALID_API_REQUEST', 'La solicitud no tiene un formato válido.');
    }
    assertTrustedFrontendRelay_(request);
    var action = String(request.action || '');
    var route = TAZMANY_FRONTEND_API_ACTIONS_[action];
    if (!route) throw createPublicError_('API_ACTION_NOT_ALLOWED', 'La operación solicitada no está habilitada.');
    var args = Array.isArray(request.args) ? request.args : [];
    if (args.length < route.minimumArgs || args.length > route.maximumArgs) {
      throw createPublicError_('INVALID_API_ARGUMENTS', 'La operación no recibió los datos esperados.');
    }
    var response = route.handler(args);
    if (!response || typeof response !== 'object') {
      throw createPublicError_('INVALID_API_RESPONSE', 'El servidor no pudo completar la operación.');
    }
    return createJsonOutput_(response);
  } catch (error) {
    logError_('FRONTEND_API_GATEWAY', error);
    return createJsonOutput_({
      ok: false,
      error: {
        code: error.code || 'API_GATEWAY_ERROR',
        message: error.publicMessage || 'No pudimos procesar la solicitud.'
      }
    });
  }
}

function assertTrustedFrontendRelay_(request) {
  var properties = PropertiesService.getScriptProperties();
  var expectedSecret = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.API_RELAY_SECRET) || '';
  if (expectedSecret.length < 32) {
    throw createPublicError_('API_RELAY_NOT_CONFIGURED', 'El acceso web todavía no está configurado.');
  }
  if (!constantTimeEquals_(request.relaySecret, expectedSecret)) {
    throw createPublicError_('UNTRUSTED_API_RELAY', 'No pudimos validar el canal de comunicación.');
  }
  var origin = normalizeFrontendOrigin_(request.origin);
  var configuredOrigins = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ALLOWED_FRONTEND_ORIGINS) || '';
  var allowedOrigins = configuredOrigins.split(',').map(normalizeFrontendOrigin_).filter(Boolean);
  if (!origin || allowedOrigins.indexOf(origin) < 0) {
    throw createPublicError_('FRONTEND_ORIGIN_NOT_ALLOWED', 'Este sitio no tiene autorización para usar el servicio.');
  }
}

function normalizeFrontendOrigin_(value) {
  var origin = String(value || '').trim().replace(/\/$/, '');
  return /^https:\/\/[A-Za-z0-9.-]+(?::\d{2,5})?$/.test(origin) ? origin.toLowerCase() : '';
}

function createJsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
