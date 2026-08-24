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
