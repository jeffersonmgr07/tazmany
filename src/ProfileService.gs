function apiGetMyProfile(sessionToken) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'customer.profile.read');
    return getCustomerProfileDto_(context.user);
  });
}

function apiSaveCustomerProfile(sessionToken, payload, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'customer.profile.write');
    var validated = validateCustomerProfilePayload_(payload);
    return runIdempotent_('CUSTOMER_PROFILE_SAVE:' + context.user.id, idempotencyKey, validated, function () {
      return saveCustomerProfile_(context.user, validated);
    });
  });
}

function validateCustomerProfilePayload_(payload) {
  payload = payload || {};
  var firstName = sanitizePlainText_(payload.firstName, 60);
  var lastName = sanitizePlainText_(payload.lastName, 80);
  if (firstName.length < 2 || lastName.length < 2) throw createPublicError_('INVALID_NAME', 'Ingresa tus nombres y apellidos.');
  var document = validateDocument_(payload.documentType, payload.documentNumber);
  var phone = normalizeInternationalPhone_(payload.phoneCountryIso, payload.phoneE164);
  var primaryCityId = assertSafeId_(payload.primaryCityId || TAZMANY_CONFIG.DEFAULT_CITY_ID, 'primaryCityId');
  var cityIds = Array.isArray(payload.cityIds) ? payload.cityIds : [primaryCityId];
  cityIds = cityIds.map(function (cityId) { return assertSafeId_(cityId, 'cityId'); });
  if (cityIds.indexOf(primaryCityId) < 0) cityIds.unshift(primaryCityId);
  cityIds = cityIds.filter(function (cityId, index, list) { return list.indexOf(cityId) === index; }).slice(0, 8);
  if (payload.acceptTerms !== true || payload.acceptPrivacy !== true) throw createPublicError_('LEGAL_ACCEPTANCE_REQUIRED', 'Debes aceptar los términos y la política de privacidad.');
  var properties = PropertiesService.getScriptProperties();
  var termsVersion = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.TERMS_VERSION) || '2026-08-27';
  var privacyVersion = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.PRIVACY_VERSION) || '2026-08-27';
  return {
    firstName: firstName, lastName: lastName, documentType: document.type, documentNumber: document.number,
    phoneE164: phone.phoneE164, phoneCountryIso: phone.countryIso, primaryCityId: primaryCityId, cityIds: cityIds,
    marketingConsent: payload.marketingConsent === true, termsVersion: termsVersion, privacyVersion: privacyVersion
  };
}

function saveCustomerProfile_(user, payload) {
  var repository = getDataRepository_();
  var activeCities = repository.list('CITIES').filter(function (item) { return item.status === 'ACTIVE'; }).map(function (item) { return item.id; });
  if (activeCities.indexOf(payload.primaryCityId) < 0 || payload.cityIds.some(function (id) { return activeCities.indexOf(id) < 0; })) {
    throw createPublicError_('INVALID_CITY', 'Selecciona una ciudad habilitada.');
  }
  var now = nowIso_();
  var profileId = 'profile-' + user.id;
  var privateId = 'private-' + user.id;
  var existingProfile = repository.findById('CUSTOMER_PROFILES', profileId);
  var beforeHash = existingProfile ? sha256Base64Url_(JSON.stringify(existingProfile)) : '';
  var profile = {
    id: profileId, user_id: user.id, first_name: payload.firstName, last_name: payload.lastName,
    document_type: payload.documentType, document_masked: maskDocument_(payload.documentNumber),
    phone_masked: maskPhone_(payload.phoneE164), marketing_consent: payload.marketingConsent,
    created_at: existingProfile ? existingProfile.created_at : now, updated_at: now, status: 'ACTIVE',
    version: Number(existingProfile && existingProfile.version || 0) + 1
  };
  var existingPrivate = repository.findById('CUSTOMER_PRIVATE_DATA', privateId);
  var privateData = {
    id: privateId, user_id: user.id, phone_e164: payload.phoneE164,
    phone_verified_at: existingPrivate && existingPrivate.phone_e164 === payload.phoneE164 ? existingPrivate.phone_verified_at : '',
    document_type: payload.documentType, document_number_hash: hashSecret_('customer-document', payload.documentType + '|' + payload.documentNumber),
    document_last4: payload.documentNumber.slice(-4), created_at: existingPrivate ? existingPrivate.created_at : now,
    updated_at: now, status: 'ACTIVE', version: Number(existingPrivate && existingPrivate.version || 0) + 1,
    phone_country_iso: payload.phoneCountryIso
  };
  repository.upsert('CUSTOMER_PROFILES', [profile]);
  repository.upsert('CUSTOMER_PRIVATE_DATA', [privateData]);

  var preferences = repository.list('USER_CITY_PREFERENCES').filter(function (item) { return item.user_id === user.id; });
  preferences.forEach(function (item) { item.status = 'INACTIVE'; item.updated_at = now; item.version = Number(item.version || 0) + 1; });
  var preferenceByCity = preferences.reduce(function (index, item) { index[item.city_id] = item; return index; }, {});
  payload.cityIds.forEach(function (cityId) {
    var preference = preferenceByCity[cityId] || { id: Utilities.getUuid(), user_id: user.id, city_id: cityId, created_at: now, version: 0 };
    preference.is_primary = cityId === payload.primaryCityId; preference.updated_at = now; preference.status = 'ACTIVE'; preference.version = Number(preference.version || 0) + 1;
    preferenceByCity[cityId] = preference;
  });
  repository.upsert('USER_CITY_PREFERENCES', Object.keys(preferenceByCity).map(function (cityId) { return preferenceByCity[cityId]; }));

  var priorAcceptance = repository.list('TERMS_ACCEPTANCES').find(function (item) {
    return item.user_id === user.id && item.terms_version === payload.termsVersion && item.privacy_version === payload.privacyVersion && item.status === 'ACCEPTED';
  });
  if (!priorAcceptance) repository.upsert('TERMS_ACCEPTANCES', [{
    id: Utilities.getUuid(), user_id: user.id, terms_version: payload.termsVersion, privacy_version: payload.privacyVersion,
    marketing_consent: payload.marketingConsent, accepted_at: now,
    evidence_json: JSON.stringify({ channel: 'WEB_APP', appVersion: TAZMANY_CONFIG.VERSION }),
    created_at: now, updated_at: now, status: 'ACCEPTED', version: 1
  }]);

  user.display_name = payload.firstName + ' ' + payload.lastName;
  user.phone_masked = profile.phone_masked;
  user.city_id = payload.primaryCityId;
  user.updated_at = now;
  user.version = Number(user.version || 0) + 1;
  repository.upsert('USERS', [user]);
  appendAuditEvent_({
    actor_user_id: user.id, action: 'CUSTOMER_PROFILE_UPDATED', entity_type: 'CUSTOMER_PROFILE', entity_id: profile.id,
    before_hash: beforeHash, after_hash: sha256Base64Url_(JSON.stringify(profile)),
    metadata_json: JSON.stringify({ termsVersion: payload.termsVersion, privacyVersion: payload.privacyVersion, phoneVerified: Boolean(privateData.phone_verified_at) })
  });
  return getCustomerProfileDto_(user);
}

function getCustomerProfileDto_(user) {
  var repository = getDataRepository_();
  var profile = repository.list('CUSTOMER_PROFILES').find(function (item) { return item.user_id === user.id && item.status === 'ACTIVE'; });
  var privateData = repository.list('CUSTOMER_PRIVATE_DATA').find(function (item) { return item.user_id === user.id && item.status === 'ACTIVE'; });
  var cityIds = repository.list('USER_CITY_PREFERENCES').filter(function (item) { return item.user_id === user.id && item.status === 'ACTIVE'; }).map(function (item) { return item.city_id; });
  return {
    email: user.email, emailVerified: user.email_verified === true || String(user.email_verified) === 'true',
    firstName: profile ? profile.first_name : '', lastName: profile ? profile.last_name : '',
    documentType: profile ? profile.document_type : '', documentMasked: profile ? profile.document_masked : '',
    phoneMasked: profile ? profile.phone_masked : '', phoneVerified: Boolean(privateData && privateData.phone_verified_at),
    phoneCountryIso: privateData && privateData.phone_country_iso || 'PE',
    primaryCityId: user.city_id || TAZMANY_CONFIG.DEFAULT_CITY_ID, cityIds: cityIds,
    marketingConsent: Boolean(profile && (profile.marketing_consent === true || String(profile.marketing_consent) === 'true'))
  };
}
