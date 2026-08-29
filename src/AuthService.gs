function apiGetAuthConfig() {
  return executeApi_(function () { return getAppConfig_().auth; });
}

function apiAuthenticateGoogle(idToken, nonce, deviceLabel, idempotencyKey) {
  return executeApi_(function () {
    return runSensitiveIdempotent_('AUTH_GOOGLE', idempotencyKey, { tokenHash: sha256Base64Url_(idToken), nonce: nonce }, function () {
      var claims = verifyGoogleIdToken_(idToken, nonce);
      if (!claims.googleAuthoritative) {
        throw createPublicError_('GOOGLE_EMAIL_REQUIRES_OTP', 'Por seguridad, confirma este correo con un código.');
      }
      var repository = getDataRepository_();
      var subject = hashSecret_('google-sub', String(claims.sub));
      var identity = repository.list('AUTH_IDENTITIES').find(function (item) {
        return item.provider === 'GOOGLE' && item.provider_subject === subject && item.status === 'ACTIVE';
      });
      var user = identity ? repository.findById('USERS', identity.user_id) : findOrCreateCustomerUser_(normalizeEmail_(claims.email), claims.name || claims.given_name || 'Cliente Tazmany');
      prefillCustomerNamesFromGoogle_(repository, user, claims);
      var now = nowIso_();
      if (!identity) {
        identity = {
          id: Utilities.getUuid(), user_id: user.id, provider: 'GOOGLE', provider_subject: subject,
          email: normalizeEmail_(claims.email), email_verified: true, last_authenticated_at: now,
          created_at: now, updated_at: now, status: 'ACTIVE', version: 1
        };
      } else {
        identity.email = normalizeEmail_(claims.email); identity.email_verified = true;
        identity.last_authenticated_at = now; identity.updated_at = now; identity.version = Number(identity.version || 0) + 1;
      }
      repository.upsert('AUTH_IDENTITIES', [identity]);
      user.email_verified = true; user.last_login_at = now; user.updated_at = now; user.version = Number(user.version || 0) + 1;
      repository.upsert('USERS', [user]);
      var session = createSessionForUser_(user, deviceLabel);
      appendAuditEvent_({ actor_user_id: user.id, action: 'LOGIN_GOOGLE_SUCCESS', entity_type: 'AUTH_IDENTITY', entity_id: identity.id });
      return buildAuthResponse_(user, { id: session.sessionId, expires_at: session.expiresAt }, 'GOOGLE', session.sessionToken);
    });
  });
}

function prefillCustomerNamesFromGoogle_(repository, user, claims) {
  var firstName = sanitizePlainText_(claims && claims.given_name, 60);
  var lastName = sanitizePlainText_(claims && claims.family_name, 80);
  if (firstName.length < 2 || lastName.length < 2) {
    var parts = sanitizePlainText_(claims && claims.name, 140).split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      if (firstName.length < 2) firstName = parts.shift().slice(0, 60);
      if (lastName.length < 2) lastName = parts.join(' ').slice(0, 80);
    }
  }
  if (firstName.length < 2 || lastName.length < 2) return;
  var now = nowIso_();
  var profileId = 'profile-' + user.id;
  var profile = repository.findById('CUSTOMER_PROFILES', profileId);
  var changed = false;
  if (!profile) {
    profile = {
      id: profileId, user_id: user.id, first_name: firstName, last_name: lastName,
      document_type: '', document_masked: '', phone_masked: '', marketing_consent: false,
      created_at: now, updated_at: now, status: 'ACTIVE', version: 1
    };
    changed = true;
  } else {
    if (!profile.first_name) { profile.first_name = firstName; changed = true; }
    if (!profile.last_name) { profile.last_name = lastName; changed = true; }
    if (changed) {
      profile.updated_at = now;
      profile.version = Number(profile.version || 0) + 1;
    }
  }
  if (changed) {
    repository.upsert('CUSTOMER_PROFILES', [profile]);
    appendAuditEvent_({ actor_user_id: user.id, action: 'GOOGLE_PROFILE_NAME_IMPORTED', entity_type: 'CUSTOMER_PROFILE', entity_id: profile.id });
  }
  if (!user.display_name || user.display_name === 'Cliente Tazmany') user.display_name = firstName + ' ' + lastName;
}

function apiRequestEmailOtp(email, deviceLabel, idempotencyKey) {
  return executeApi_(function () {
    return runIdempotent_('OTP_REQUEST', idempotencyKey, { email: normalizeEmail_(email), deviceLabel: sanitizePlainText_(deviceLabel, 80) }, function () {
      return requestEmailOtp_(email, deviceLabel);
    });
  });
}

function apiVerifyEmailOtp(email, challengeId, code, deviceLabel, idempotencyKey) {
  return executeApi_(function () {
    return runSensitiveIdempotent_('OTP_VERIFY', idempotencyKey, {
      email: normalizeEmail_(email), challengeId: challengeId, codeHash: sha256Base64Url_(String(code || ''))
    }, function () { return verifyEmailOtp_(email, challengeId, code, deviceLabel); });
  });
}

function findOrCreateCustomerUser_(email, displayName) {
  var repository = getDataRepository_();
  var existing = repository.list('USERS').find(function (item) { return String(item.email).toLowerCase() === email; });
  if (existing && existing.status !== 'ACTIVE') throw createPublicError_('ACCOUNT_UNAVAILABLE', 'Esta cuenta requiere revisión. Contacta a soporte.');
  if (existing) return existing;
  var now = nowIso_();
  var user = {
    id: Utilities.getUuid(), email: email, display_name: sanitizePlainText_(displayName || 'Cliente Tazmany', 100),
    phone_masked: '', user_type: 'CUSTOMER', roles_json: '["CUSTOMER"]', email_verified: true,
    city_id: TAZMANY_CONFIG.DEFAULT_CITY_ID, last_login_at: now, created_at: now, updated_at: now, status: 'ACTIVE', version: 1
  };
  repository.upsert('USERS', [user]);
  appendAuditEvent_({ actor_user_id: user.id, action: 'CUSTOMER_ACCOUNT_CREATED', entity_type: 'USER', entity_id: user.id });
  return user;
}
