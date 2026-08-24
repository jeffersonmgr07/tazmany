function runIdempotent_(scope, key, requestPayload, operation) {
  return runIdempotentCore_(scope, key, requestPayload, operation, false);
}

function runSensitiveIdempotent_(scope, key, requestPayload, operation) {
  return runIdempotentCore_(scope, key, requestPayload, operation, true);
}

function runIdempotentCore_(scope, key, requestPayload, operation, sensitiveResponse) {
  key = validateIdempotencyKey_(key);
  return withScriptLock_(function () {
    var repository = getDataRepository_();
    var keyHash = hashSecret_('idempotency:' + scope, key);
    var requestHash = sha256Base64Url_(JSON.stringify(requestPayload || {}));
    var cacheKey = 'idem-' + sha256Base64Url_(scope + '|' + keyHash).slice(0, 48);
    var cached = CacheService.getScriptCache().get(cacheKey);
    if (cached) return parseJsonSafe_(cached, null);

    var existing = repository.list('IDEMPOTENCY_KEYS').find(function (item) {
      return item.scope === scope && item.key_hash === keyHash && item.status !== 'EXPIRED';
    });
    if (existing && existing.request_hash !== requestHash) {
      throw createPublicError_('IDEMPOTENCY_CONFLICT', 'La misma operación llegó con datos diferentes. Actualiza la página.');
    }
    if (existing && existing.status === 'COMPLETED') {
      if (sensitiveResponse) throw createPublicError_('IDEMPOTENT_RESPONSE_EXPIRED', 'La operación ya terminó. Continúa con la sesión creada o vuelve a ingresar.');
      return parseJsonSafe_(existing.response_json, {});
    }
    if (existing && existing.status === 'PROCESSING') {
      throw createPublicError_('OPERATION_IN_PROGRESS', 'La operación ya está en proceso. Espera un momento.');
    }

    var now = nowIso_();
    var record = existing || {
      id: Utilities.getUuid(), scope: scope, key_hash: keyHash, request_hash: requestHash,
      created_at: now, version: 0
    };
    record.request_hash = requestHash;
    record.response_json = '';
    record.expires_at = hoursFromNowIso_(24);
    record.updated_at = now;
    record.status = 'PROCESSING';
    record.version = Number(record.version || 0) + 1;
    repository.upsert('IDEMPOTENCY_KEYS', [record]);

    try {
      var result = operation();
      var durableResult = sensitiveResponse ? {
        processed: true,
        userId: result && result.user ? result.user.id : '',
        sessionId: result && result.sessionId ? result.sessionId : ''
      } : result;
      record.response_json = JSON.stringify(durableResult || {});
      record.updated_at = nowIso_();
      record.status = 'COMPLETED';
      record.version += 1;
      repository.upsert('IDEMPOTENCY_KEYS', [record]);
      CacheService.getScriptCache().put(cacheKey, JSON.stringify(result || {}), sensitiveResponse ? 120 : 600);
      return result;
    } catch (error) {
      record.response_json = '';
      record.updated_at = nowIso_();
      record.status = 'FAILED';
      record.version += 1;
      repository.upsert('IDEMPOTENCY_KEYS', [record]);
      throw error;
    }
  });
}
