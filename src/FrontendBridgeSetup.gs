function setupTazmanyFrontendBridge() {
  var properties = PropertiesService.getScriptProperties();
  var originKey = TAZMANY_CONFIG.SCRIPT_PROPERTIES.ALLOWED_FRONTEND_ORIGINS;
  if (!properties.getProperty(originKey)) {
    properties.setProperty(originKey, 'https://tazmany.com,https://www.tazmany.com,https://jeffersonmgr07.github.io');
  }
  var result = getTazmanyFrontendBridgeDiagnostics_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function getTazmanyFrontendBridgeDiagnostics() {
  var result = getTazmanyFrontendBridgeDiagnostics_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function getTazmanyFrontendBridgeDiagnostics_() {
  var properties = PropertiesService.getScriptProperties();
  var secret = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.API_RELAY_SECRET) || '';
  var origins = (properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ALLOWED_FRONTEND_ORIGINS) || '')
    .split(',')
    .map(normalizeFrontendOrigin_)
    .filter(Boolean);
  var issues = [];
  if (secret.length < 32) issues.push('Falta TAZMANY_API_RELAY_SECRET con al menos 32 caracteres.');
  if (!origins.length) issues.push('Falta TAZMANY_ALLOWED_FRONTEND_ORIGINS.');
  return {
    ok: issues.length === 0,
    version: TAZMANY_CONFIG.VERSION,
    relaySecretConfigured: secret.length >= 32,
    allowedOrigins: origins,
    issues: issues
  };
}
