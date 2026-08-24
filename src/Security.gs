function createOpaqueToken_() {
  return Utilities.base64EncodeWebSafe(Utilities.getUuid() + ':' + Utilities.getUuid()).replace(/=+$/g, '');
}

function withScriptLock_(callback, timeoutMs) {
  var lock = LockService.getScriptLock();
  lock.waitLock(timeoutMs || 20000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function maskEmail_(email) {
  var parts = String(email || '').split('@');
  if (parts.length !== 2) return '';
  return parts[0].slice(0, 2) + '***@' + parts[1];
}

function getAuthPepper_() {
  var pepper = PropertiesService.getScriptProperties().getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.AUTH_PEPPER);
  if (!pepper) throw createPublicError_('AUTH_NOT_CONFIGURED', 'Ejecuta setupTazmanyPhase2() antes de iniciar sesión.');
  return pepper;
}

function hashSecret_(scope, value) {
  return sha256Base64Url_(getAuthPepper_() + '|' + scope + '|' + String(value));
}

function maskPhone_(phoneE164) {
  var digits = String(phoneE164 || '').replace(/\D/g, '');
  return digits.length >= 3 ? '*** *** ' + digits.slice(-3) : '';
}

function maskDocument_(documentNumber) {
  var value = String(documentNumber || '').replace(/[^A-Za-z0-9]/g, '');
  return value.length > 4 ? Array(value.length - 3).join('*') + value.slice(-4) : value;
}
