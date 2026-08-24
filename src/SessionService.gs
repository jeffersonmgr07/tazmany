function createSessionForUser_(user, deviceLabel) {
  var properties = PropertiesService.getScriptProperties();
  var ttlHours = Number(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.SESSION_TTL_HOURS) || 168);
  var rawToken = createOpaqueToken_();
  var now = nowIso_();
  var session = {
    id: Utilities.getUuid(), user_id: user.id, token_hash: hashSecret_('session', rawToken),
    device_label: sanitizePlainText_(deviceLabel || 'Navegador web', 80), expires_at: hoursFromNowIso_(ttlHours),
    revoked_at: '', created_at: now, updated_at: now, status: 'ACTIVE', version: 1
  };
  getDataRepository_().upsert('USER_SESSIONS', [session]);
  return { sessionId: session.id, sessionToken: rawToken, expiresAt: session.expires_at };
}

function getSessionContext_(sessionToken) {
  var token = String(sessionToken || '');
  if (token.length < 32) throw createPublicError_('AUTH_REQUIRED', 'Inicia sesión para continuar.');
  var tokenHash = hashSecret_('session', token);
  var repository = getDataRepository_();
  var session = repository.list('USER_SESSIONS').find(function (item) {
    return item.token_hash === tokenHash && item.status === 'ACTIVE' && !item.revoked_at;
  });
  if (!session || new Date(session.expires_at).getTime() <= Date.now()) {
    throw createPublicError_('SESSION_EXPIRED', 'Tu sesión venció. Vuelve a ingresar.');
  }
  var user = repository.findById('USERS', session.user_id);
  if (!user || user.status !== 'ACTIVE') throw createPublicError_('ACCOUNT_UNAVAILABLE', 'Tu cuenta no está disponible.');
  var roles = parseJsonSafe_(user.roles_json, []);
  return { session: session, user: user, roles: roles, permissions: permissionsForRoles_(roles) };
}

function apiGetSession(sessionToken) {
  return executeApi_(function () {
    var context = getSessionContext_(sessionToken);
    return buildAuthResponse_(context.user, context.session, 'EXISTING');
  });
}

function apiListSessions(sessionToken) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'customer.sessions.manage');
    return getDataRepository_().list('USER_SESSIONS').filter(function (item) {
      return item.user_id === context.user.id && item.status === 'ACTIVE' && !item.revoked_at;
    }).map(function (item) {
      return { id: item.id, deviceLabel: item.device_label, createdAt: toIsoString_(item.created_at), expiresAt: toIsoString_(item.expires_at), current: item.id === context.session.id };
    });
  });
}

function apiLogout(sessionToken) {
  return executeApi_(function () {
    var context = getSessionContext_(sessionToken);
    revokeSessionRecord_(context.session, context.user.id);
    return { loggedOut: true };
  });
}

function apiRevokeSession(sessionToken, targetSessionId) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'customer.sessions.manage');
    assertSafeId_(targetSessionId, 'targetSessionId');
    var target = getDataRepository_().findById('USER_SESSIONS', targetSessionId);
    if (!target || target.user_id !== context.user.id) throw createPublicError_('NOT_FOUND', 'No encontramos esa sesión.');
    revokeSessionRecord_(target, context.user.id);
    return { revoked: true, sessionId: target.id };
  });
}

function revokeSessionRecord_(session, actorUserId) {
  session.revoked_at = nowIso_();
  session.updated_at = nowIso_();
  session.status = 'REVOKED';
  session.version = Number(session.version || 0) + 1;
  getDataRepository_().upsert('USER_SESSIONS', [session]);
  appendAuditEvent_({ actor_user_id: actorUserId, action: 'SESSION_REVOKED', entity_type: 'USER_SESSION', entity_id: session.id });
}

function buildAuthResponse_(user, session, provider, sessionToken) {
  var roles = parseJsonSafe_(user.roles_json, []);
  var repository = getDataRepository_();
  var profile = repository.list('CUSTOMER_PROFILES').find(function (item) { return item.user_id === user.id && item.status === 'ACTIVE'; });
  var privateData = repository.list('CUSTOMER_PRIVATE_DATA').find(function (item) { return item.user_id === user.id && item.status === 'ACTIVE'; });
  var properties = PropertiesService.getScriptProperties();
  var termsVersion = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.TERMS_VERSION) || '2026-08-24';
  var privacyVersion = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.PRIVACY_VERSION) || '2026-08-24';
  var acceptance = repository.list('TERMS_ACCEPTANCES').find(function (item) {
    return item.user_id === user.id && item.terms_version === termsVersion && item.privacy_version === privacyVersion && item.status === 'ACCEPTED';
  });
  return {
    provider: provider,
    sessionId: session.id,
    sessionToken: sessionToken || '',
    expiresAt: toIsoString_(session.expires_at),
    user: { id: user.id, email: user.email, displayName: user.display_name || '', roles: roles, permissions: permissionsForRoles_(roles) },
    needsProfile: !profile || !privateData || !acceptance || !profile.first_name || !profile.last_name || !profile.phone_masked || !profile.document_masked
  };
}
