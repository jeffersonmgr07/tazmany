function apiSubscribeToOffers(payload, idempotencyKey) {
  return executeApi_(function () {
    var normalized = validateMarketingSubscription_(payload || {});
    return runIdempotent_('PUBLIC_MARKETING_SUBSCRIBE', idempotencyKey, normalized, function () {
      return saveMarketingSubscriber_(normalized);
    });
  });
}

function validateMarketingSubscription_(payload) {
  if (!payload.marketingConsent) {
    throw createPublicError_('MARKETING_CONSENT_REQUIRED', 'Necesitamos tu autorización para enviarte ofertas.');
  }
  var repository = getDataRepository_();
  var email = normalizeEmail_(payload.email);
  var countryCode = String(payload.countryCode || 'PE').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) throw createPublicError_('INVALID_COUNTRY', 'Selecciona un país válido.');
  var country = repository.list('COUNTRIES').find(function (item) { return item.iso_code === countryCode && item.status === 'ACTIVE'; });
  if (!country) throw createPublicError_('COUNTRY_NOT_AVAILABLE', 'Ese país todavía no está disponible en Tazmany.');
  var cityId = assertSafeId_(payload.cityId || TAZMANY_CONFIG.DEFAULT_CITY_ID, 'cityId');
  var city = repository.findById('CITIES', cityId);
  if (!city || city.status !== 'ACTIVE' || city.country_code !== countryCode) {
    throw createPublicError_('INVALID_CITY', 'Selecciona una ciudad disponible.');
  }
  return {
    email: email,
    countryCode: countryCode,
    cityId: cityId,
    source: sanitizePlainText_(payload.source || 'WEB_MODAL', 40).toUpperCase(),
    consentVersion: sanitizePlainText_(payload.consentVersion || 'marketing-2026-08-25', 80)
  };
}

function saveMarketingSubscriber_(data) {
  var repository = getDataRepository_();
  var now = nowIso_();
  var emailHash = sha256Base64Url_('marketing-email|' + data.email);
  var existing = repository.list('MARKETING_SUBSCRIBERS').find(function (item) { return item.email_hash === emailHash; });
  var subscriber = existing || {
    id: Utilities.getUuid(), created_at: now, version: 0
  };
  subscriber.email = data.email;
  subscriber.email_hash = emailHash;
  subscriber.country_code = data.countryCode;
  subscriber.city_id = data.cityId;
  subscriber.source = data.source;
  subscriber.consent_version = data.consentVersion;
  subscriber.consented_at = now;
  subscriber.unsubscribed_at = '';
  subscriber.updated_at = now;
  subscriber.status = 'ACTIVE';
  subscriber.version = Number(subscriber.version || 0) + 1;
  repository.upsert('MARKETING_SUBSCRIBERS', [subscriber]);
  repository.upsert('MARKETING_EVENTS', [{
    id: Utilities.getUuid(), subscriber_id: subscriber.id, event_type: existing ? 'RESUBSCRIBED' : 'SUBSCRIBED',
    country_code: data.countryCode, city_id: data.cityId,
    metadata_json: JSON.stringify({ source: data.source, consentVersion: data.consentVersion }), occurred_at: now,
    created_at: now, updated_at: now, status: 'RECORDED', version: 1
  }]);
  appendAuditEvent_({
    actor_user_id: '', action: 'MARKETING_SUBSCRIBED', entity_type: 'MARKETING_SUBSCRIBER', entity_id: subscriber.id,
    before_hash: '', after_hash: emailHash,
    metadata_json: JSON.stringify({ countryCode: data.countryCode, cityId: data.cityId, source: data.source })
  });
  return { subscribed: true, subscriberId: subscriber.id, cityId: data.cityId };
}

function getPublicClubPlan_() {
  var plan = getDataRepository_().list('CLUB_PLANS').find(function (item) {
    return item.country_code === 'PE' && ['COMING_SOON', 'ACTIVE'].indexOf(String(item.status)) >= 0;
  });
  if (!plan) return null;
  return {
    id: plan.id, name: plan.name, status: plan.status,
    regularPriceCents: Number(plan.regular_price_cents || 0),
    introPriceCents: Number(plan.intro_price_cents || 0), introCycles: Number(plan.intro_cycles || 0),
    benefits: parseJsonSafe_(plan.benefits_json, [])
  };
}
