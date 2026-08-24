function verifyGoogleIdToken_(idToken, expectedNonce) {
  var properties = PropertiesService.getScriptProperties();
  var clientId = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_CLIENT_ID);
  if (!clientId) throw createPublicError_('GOOGLE_AUTH_NOT_CONFIGURED', 'El acceso con Google todavía no está configurado. Usa el código por correo.');
  var mode = String(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_VERIFY_MODE) || 'TOKENINFO').toUpperCase();
  var environment = String(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ENVIRONMENT) || 'development').toLowerCase();
  if (environment === 'production' && mode === 'TOKENINFO') {
    throw createPublicError_('GOOGLE_PRODUCTION_VERIFIER_REQUIRED', 'El acceso con Google está bloqueado hasta configurar el verificador seguro de producción.');
  }
  var claims = mode === 'RELAY'
    ? fetchGoogleClaimsFromRelay_(idToken, clientId, expectedNonce)
    : fetchGoogleClaimsFromTokenInfo_(idToken);
  validateGoogleClaims_(claims, clientId, expectedNonce);
  claims.googleAuthoritative = /@gmail\.com$/i.test(String(claims.email || '')) || Boolean(claims.hd);
  return claims;
}

function fetchGoogleClaimsFromTokenInfo_(idToken) {
  var response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(String(idToken || '')), {
    method: 'get', muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) throw createPublicError_('INVALID_GOOGLE_TOKEN', 'Google no pudo confirmar tu identidad. Inténtalo otra vez.');
  return parseJsonSafe_(response.getContentText(), {});
}

function fetchGoogleClaimsFromRelay_(idToken, clientId, expectedNonce) {
  var properties = PropertiesService.getScriptProperties();
  var url = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_VERIFY_URL);
  if (!url || !/^https:\/\//.test(url)) throw createPublicError_('GOOGLE_RELAY_NOT_CONFIGURED', 'Falta configurar el verificador seguro de Google.');
  var headers = { 'Content-Type': 'application/json' };
  var relaySecret = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_VERIFY_RELAY_SECRET);
  if (relaySecret) headers['X-Tazmany-Relay-Secret'] = relaySecret;
  var response = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json', headers: headers, muteHttpExceptions: true,
    payload: JSON.stringify({ idToken: String(idToken || ''), audience: clientId, nonce: String(expectedNonce || '') })
  });
  if (response.getResponseCode() !== 200) throw createPublicError_('INVALID_GOOGLE_TOKEN', 'Google no pudo confirmar tu identidad. Inténtalo otra vez.');
  var payload = parseJsonSafe_(response.getContentText(), {});
  return payload.claims || payload;
}

function validateGoogleClaims_(claims, clientId, expectedNonce) {
  var audience = claims.aud;
  var audienceMatches = Array.isArray(audience) ? audience.indexOf(clientId) >= 0 : String(audience) === String(clientId);
  var issuer = String(claims.iss || '');
  var emailVerified = claims.email_verified === true || String(claims.email_verified) === 'true';
  if (!audienceMatches || ['accounts.google.com', 'https://accounts.google.com'].indexOf(issuer) < 0 || Number(claims.exp || 0) * 1000 <= Date.now() || !emailVerified) {
    throw createPublicError_('INVALID_GOOGLE_TOKEN', 'Google no pudo confirmar tu identidad. Inténtalo otra vez.');
  }
  if (!/^[0-9]{6,64}$/.test(String(claims.sub || ''))) throw createPublicError_('INVALID_GOOGLE_SUBJECT', 'La identidad recibida de Google no es válida.');
  if (expectedNonce && !constantTimeEquals_(String(claims.nonce || ''), String(expectedNonce))) {
    throw createPublicError_('INVALID_GOOGLE_NONCE', 'La solicitud de acceso venció. Actualiza la página.');
  }
  normalizeEmail_(claims.email);
}
