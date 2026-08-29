function apiSaveCampaignDraft(sessionToken, payload, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'merchant.campaigns.manage');
    return runIdempotent_('campaign-draft:' + context.user.id, idempotencyKey, payload, function () {
      return saveCampaignDraft_(context, payload || {});
    });
  });
}

function apiGetCampaignEditor(sessionToken, campaignId) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'merchant.campaigns.manage');
    assertSafeId_(campaignId, 'campaignId');
    var repository = getDataRepository_();
    var membership = getMerchantMembershipForUser_(context.user.id);
    var campaign = repository.findById('CAMPAIGNS', campaignId);
    if (!membership || !campaign || campaign.merchant_id !== membership.merchant_id) throw createPublicError_('CAMPAIGN_NOT_FOUND', 'No encontramos esa campaña.');
    if (['BORRADOR', 'CAMBIOS_SOLICITADOS', 'RECHAZADA'].indexOf(String(campaign.status)) < 0) throw createPublicError_('IMMUTABLE_PUBLISHED_CAMPAIGN', 'La versión publicada se consulta, pero no se edita.');
    return {
      id: campaign.id, title: campaign.title, summary: campaign.summary, description: campaign.description,
      categoryId: campaign.category_id, imageUrl: campaign.image_url,
      normalPriceCents: Number(campaign.normal_price_cents || 0), offerPriceCents: Number(campaign.offer_price_cents || 0), clubPriceCents: Number(campaign.club_price_cents || campaign.offer_price_cents || 0),
      inventoryTotal: Number(campaign.inventory_total || 0), lowStockThreshold: Number(campaign.low_stock_threshold || 0),
      maxPerCustomer: Number(campaign.max_per_customer || 1), salesStartAt: toIsoString_(campaign.sales_start_at),
      salesEndAt: toIsoString_(campaign.sales_end_at), redemptionStartAt: toIsoString_(campaign.redemption_start_at),
      redemptionEndAt: toIsoString_(campaign.redemption_end_at), includes: parseJsonSafe_(campaign.includes_json, []),
      excludes: parseJsonSafe_(campaign.excludes_json, []), restrictions: parseJsonSafe_(campaign.restrictions_json, []),
      requiresBooking: Boolean(campaign.requires_booking),
      branchIds: repository.list('CAMPAIGN_BRANCHES').filter(function (item) { return item.campaign_id === campaign.id && item.status === 'ACTIVE'; }).map(function (item) { return item.branch_id; }),
      options: repository.list('CAMPAIGN_OPTIONS').filter(function (item) { return item.campaign_id === campaign.id && item.status === 'ACTIVE'; }).map(function (item) {
        return { id: item.id, name: item.name, inventoryTotal: Number(item.inventory_total || 0), inventorySold: Number(item.inventory_sold || 0), normalPriceCents: Number(item.normal_price_cents || 0), offerPriceCents: Number(item.offer_price_cents || 0), clubPriceCents: Number(item.club_price_cents || item.offer_price_cents || 0) };
      })
    };
  });
}

function apiSubmitCampaign(sessionToken, campaignId, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'merchant.campaigns.manage');
    assertSafeId_(campaignId, 'campaignId');
    return runIdempotent_('campaign-submit:' + context.user.id, idempotencyKey, { campaignId: campaignId }, function () {
      return submitCampaignForReview_(context, campaignId);
    });
  });
}

function saveCampaignDraft_(context, payload) {
  var repository = getDataRepository_();
  var membership = getMerchantMembershipForUser_(context.user.id);
  if (!membership) throw createPublicError_('MERCHANT_MEMBERSHIP_REQUIRED', 'Tu cuenta no está vinculada a un comercio.');
  var merchant = repository.findById('MERCHANTS', membership.merchant_id);
  if (!merchant || ['APROBADO', 'ACTIVO'].indexOf(String(merchant.onboarding_status)) < 0) {
    throw createPublicError_('MERCHANT_NOT_APPROVED', 'Tazmany debe aprobar el comercio antes de crear campañas.');
  }
  var campaignId = payload.id ? assertSafeId_(payload.id, 'campaignId') : Utilities.getUuid();
  var existing = payload.id ? repository.findById('CAMPAIGNS', campaignId) : null;
  if (existing && existing.merchant_id !== membership.merchant_id) throw createPublicError_('FORBIDDEN', 'No puedes editar esta campaña.');
  if (existing && ['BORRADOR', 'CAMBIOS_SOLICITADOS', 'RECHAZADA'].indexOf(String(existing.status)) < 0) {
    throw createPublicError_('IMMUTABLE_PUBLISHED_CAMPAIGN', 'La versión publicada no se modifica. Crea una nueva revisión controlada.');
  }
  var normalized = normalizeCampaignPayload_(payload, false);
  validateCampaignReferences_(repository, membership.merchant_id, normalized);
  var now = nowIso_();
  var options = normalizeCampaignOptions_(payload.options || [], normalized, existing, now);
  var inventoryTotal = options.reduce(function (sum, option) { return sum + option.inventory_total; }, 0);
  var record = Object.assign({}, existing || {}, {
    id: campaignId, merchant_id: membership.merchant_id, category_id: normalized.categoryId,
    title: normalized.title, slug: normalized.slug, summary: normalized.summary, description: normalized.description,
    image_url: normalized.imageUrl, gallery_json: JSON.stringify(normalized.galleryUrls),
    normal_price_cents: normalized.normalPriceCents, offer_price_cents: normalized.offerPriceCents, club_price_cents: normalized.clubPriceCents,
    cashback_basis_points: Number(existing && existing.cashback_basis_points || TAZMANY_CONFIG.PUBLIC_CASHBACK_BASIS_POINTS),
    club_cashback_basis_points: Number(existing && existing.club_cashback_basis_points || TAZMANY_CONFIG.CLUB_CASHBACK_BASIS_POINTS),
    inventory_total: inventoryTotal, inventory_sold: Number(existing && existing.inventory_sold || 0),
    low_stock_threshold: normalized.lowStockThreshold, max_per_customer: normalized.maxPerCustomer,
    sales_start_at: normalized.salesStartAt, sales_end_at: normalized.salesEndAt,
    redemption_start_at: normalized.redemptionStartAt, redemption_end_at: normalized.redemptionEndAt,
    district_label: normalized.districtLabel, city_id: normalized.cityId,
    tags_json: JSON.stringify(normalized.tags), includes_json: JSON.stringify(normalized.includes),
    excludes_json: JSON.stringify(normalized.excludes), restrictions_json: JSON.stringify(normalized.restrictions),
    commission_basis_points: Number(existing && existing.commission_basis_points || 1500),
    requires_booking: normalized.requiresBooking, minimum_notice_hours: normalized.minimumNoticeHours,
    customer_eligibility: normalized.customerEligibility, reservation_minutes: 10,
    review_notes: '', submitted_at: '', approved_at: existing && existing.approved_at || '',
    approved_by: existing && existing.approved_by || '', published_version_id: existing && existing.published_version_id || '',
    created_at: existing ? existing.created_at : now, updated_at: now, status: 'BORRADOR',
    version: Number(existing && existing.version || 0) + 1
  });
  repository.upsert('CAMPAIGNS', [record]);
  saveCampaignOptions_(repository, campaignId, options, now);
  saveCampaignBranches_(repository, campaignId, normalized.branchIds, now);
  var versionRecord = createCampaignVersionRecord_(repository, record, options, normalized.branchIds, 'DRAFT', context.user.id, now);
  appendAuditEvent_({
    actor_user_id: context.user.id, action: 'CAMPAIGN_DRAFT_SAVED', entity_type: 'CAMPAIGN', entity_id: campaignId,
    before_hash: existing ? sha256Base64Url_(JSON.stringify(existing)) : '', after_hash: sha256Base64Url_(versionRecord.snapshot_json),
    metadata_json: JSON.stringify({ merchantId: membership.merchant_id, versionId: versionRecord.id })
  });
  return { id: campaignId, versionId: versionRecord.id, status: 'BORRADOR', versionNumber: versionRecord.version_number };
}

function submitCampaignForReview_(context, campaignId) {
  var repository = getDataRepository_();
  var membership = getMerchantMembershipForUser_(context.user.id);
  var campaign = repository.findById('CAMPAIGNS', campaignId);
  if (!membership || !campaign || campaign.merchant_id !== membership.merchant_id) throw createPublicError_('CAMPAIGN_NOT_FOUND', 'No encontramos esa campaña.');
  if (['BORRADOR', 'CAMBIOS_SOLICITADOS', 'RECHAZADA'].indexOf(String(campaign.status)) < 0) throw createPublicError_('INVALID_CAMPAIGN_STATE', 'La campaña no puede enviarse desde su estado actual.');
  var merchant = repository.findById('MERCHANTS', membership.merchant_id);
  if (!merchant || ['APROBADO', 'ACTIVO'].indexOf(String(merchant.onboarding_status)) < 0) throw createPublicError_('MERCHANT_NOT_APPROVED', 'El comercio debe estar aprobado.');
  assertAcceptedMerchantContract_(repository, membership.merchant_id);
  var options = repository.list('CAMPAIGN_OPTIONS').filter(function (item) { return item.campaign_id === campaignId && item.status === 'ACTIVE'; });
  var branchIds = repository.list('CAMPAIGN_BRANCHES').filter(function (item) { return item.campaign_id === campaignId && item.status === 'ACTIVE'; }).map(function (item) { return item.branch_id; });
  validateCampaignForSubmission_(campaign, options, branchIds);
  var now = nowIso_();
  campaign.status = 'ENVIADA_A_REVISION';
  campaign.submitted_at = now;
  campaign.updated_at = now;
  campaign.review_notes = '';
  campaign.version = Number(campaign.version || 0) + 1;
  repository.upsert('CAMPAIGNS', [campaign]);
  var versionRecord = createCampaignVersionRecord_(repository, campaign, options, branchIds, 'SUBMITTED', context.user.id, now);
  appendAuditEvent_({ actor_user_id: context.user.id, action: 'CAMPAIGN_SUBMITTED', entity_type: 'CAMPAIGN', entity_id: campaignId, after_hash: sha256Base64Url_(versionRecord.snapshot_json), metadata_json: JSON.stringify({ versionId: versionRecord.id }) });
  return { id: campaignId, status: campaign.status, versionId: versionRecord.id };
}

function normalizeCampaignPayload_(payload, strict) {
  var title = sanitizePlainText_(payload.title, 140);
  var summary = sanitizePlainText_(payload.summary, 260);
  var description = sanitizePlainText_(payload.description, 4000);
  if (!title) throw createPublicError_('CAMPAIGN_TITLE_REQUIRED', 'Ingresa un título para la campaña.');
  var normalPrice = validateIntegerCents_(payload.normalPriceCents, 'precio regular', false);
  var offerPrice = validateIntegerCents_(payload.offerPriceCents, 'precio Tazmany', false);
  if (offerPrice >= normalPrice) throw createPublicError_('INVALID_DISCOUNT', 'El precio Tazmany debe ser menor al precio regular.');
  var clubPrice = validateIntegerCents_(payload.clubPriceCents || offerPrice, 'precio Club', false);
  if (clubPrice > offerPrice) throw createPublicError_('INVALID_CLUB_PRICE', 'El precio Club no puede superar el precio público Tazmany.');
  var salesStart = validateIsoDate_(payload.salesStartAt, 'inicio de venta');
  var salesEnd = validateIsoDate_(payload.salesEndAt, 'fin de venta');
  var redemptionStart = validateIsoDate_(payload.redemptionStartAt, 'inicio de canje');
  var redemptionEnd = validateIsoDate_(payload.redemptionEndAt, 'fin de canje');
  if (new Date(salesStart) >= new Date(salesEnd)) throw createPublicError_('INVALID_SALES_DATES', 'La fecha final de venta debe ser posterior al inicio.');
  if (new Date(redemptionStart) >= new Date(redemptionEnd)) throw createPublicError_('INVALID_REDEMPTION_DATES', 'La fecha final de canje debe ser posterior al inicio.');
  if (new Date(redemptionEnd) <= new Date(salesStart)) throw createPublicError_('INVALID_CAMPAIGN_DATES', 'La vigencia de canje debe extenderse después del inicio de venta.');
  var imageUrl = validateHttpsUrl_(payload.imageUrl, 'imagen principal', true);
  var gallery = (Array.isArray(payload.galleryUrls) ? payload.galleryUrls : []).filter(Boolean).slice(0, 8).map(function (url) { return validateHttpsUrl_(url, 'galería', false); });
  var normalized = {
    title: title, slug: slugifyCampaign_(payload.slug || title), summary: summary, description: description,
    categoryId: assertSafeId_(payload.categoryId, 'categoryId'), cityId: assertSafeId_(payload.cityId || TAZMANY_CONFIG.DEFAULT_CITY_ID, 'cityId'),
    imageUrl: imageUrl, galleryUrls: gallery, normalPriceCents: normalPrice, offerPriceCents: offerPrice, clubPriceCents: clubPrice,
    lowStockThreshold: clampInteger_(payload.lowStockThreshold, 0, 100000, 5), maxPerCustomer: clampInteger_(payload.maxPerCustomer, 1, 100, 1),
    salesStartAt: salesStart, salesEndAt: salesEnd, redemptionStartAt: redemptionStart, redemptionEndAt: redemptionEnd,
    districtLabel: sanitizePlainText_(payload.districtLabel, 160) || 'Lima',
    tags: normalizeStringList_(payload.tags, 8, 60), includes: normalizeStringList_(payload.includes, 20, 300),
    excludes: normalizeStringList_(payload.excludes, 20, 300), restrictions: normalizeStringList_(payload.restrictions, 30, 500),
    branchIds: (Array.isArray(payload.branchIds) ? payload.branchIds : []).slice(0, 30).map(function (id) { return assertSafeId_(id, 'branchId'); }),
    requiresBooking: Boolean(payload.requiresBooking), minimumNoticeHours: clampInteger_(payload.minimumNoticeHours, 0, 720, 0),
    customerEligibility: validateEnum_(payload.customerEligibility || 'TODOS', ['TODOS', 'NUEVOS', 'ACTUALES'], 'elegibilidad')
  };
  if (strict && (!summary || !description || !imageUrl || !normalized.includes.length || !normalized.restrictions.length)) {
    throw createPublicError_('INCOMPLETE_CAMPAIGN', 'Completa descripción, imagen, incluidos y restricciones.');
  }
  return normalized;
}

function normalizeCampaignOptions_(options, campaign, existingCampaign, now) {
  var list = Array.isArray(options) && options.length ? options : [{
    name: 'Opción principal', normalPriceCents: campaign.normalPriceCents, offerPriceCents: campaign.offerPriceCents, clubPriceCents: campaign.clubPriceCents,
    inventoryTotal: 1, lowStockThreshold: campaign.lowStockThreshold, maxPerCustomer: campaign.maxPerCustomer
  }];
  if (list.length > 20) throw createPublicError_('TOO_MANY_OPTIONS', 'Una campaña admite hasta 20 opciones.');
  return list.map(function (option, index) {
    var normalPrice = validateIntegerCents_(option.normalPriceCents, 'precio regular de opción', false);
    var offerPrice = validateIntegerCents_(option.offerPriceCents, 'precio de opción', false);
    if (offerPrice >= normalPrice) throw createPublicError_('INVALID_OPTION_DISCOUNT', 'Cada opción debe tener un descuento real.');
    var clubPrice = validateIntegerCents_(option.clubPriceCents || offerPrice, 'precio Club de opción', false);
    if (clubPrice > offerPrice) throw createPublicError_('INVALID_OPTION_CLUB_PRICE', 'El precio Club de cada opción no puede superar su precio público.');
    return {
      id: option.id ? assertSafeId_(option.id, 'optionId') : Utilities.getUuid(),
      name: sanitizePlainText_(option.name, 120) || 'Opción ' + (index + 1), description: sanitizePlainText_(option.description, 500),
      normal_price_cents: normalPrice, offer_price_cents: offerPrice, club_price_cents: clubPrice,
      club_cashback_basis_points: TAZMANY_CONFIG.CLUB_CASHBACK_BASIS_POINTS,
      inventory_total: clampInteger_(option.inventoryTotal, 1, 1000000, 1),
      inventory_sold: Number(option.inventorySold || 0), low_stock_threshold: clampInteger_(option.lowStockThreshold, 0, 100000, campaign.lowStockThreshold),
      max_per_customer: clampInteger_(option.maxPerCustomer, 1, 100, campaign.maxPerCustomer), sort_order: index + 1,
      created_at: now, updated_at: now, status: 'ACTIVE', version: 1
    };
  });
}

function validateCampaignReferences_(repository, merchantId, campaign) {
  var category = repository.findById('CATEGORIES', campaign.categoryId);
  if (!category || category.status !== 'ACTIVE') throw createPublicError_('CATEGORY_UNAVAILABLE', 'Selecciona una categoría activa.');
  var branchIndex = indexById_(repository.list('BRANCHES').filter(function (item) { return item.merchant_id === merchantId && item.status === 'ACTIVE'; }));
  campaign.branchIds.forEach(function (branchId) {
    if (!branchIndex[branchId]) throw createPublicError_('INVALID_CAMPAIGN_BRANCH', 'Una sede seleccionada no pertenece al comercio.');
  });
}

function saveCampaignOptions_(repository, campaignId, options, now) {
  var existing = repository.list('CAMPAIGN_OPTIONS').filter(function (item) { return item.campaign_id === campaignId; });
  var existingById = indexById_(existing);
  var activeIds = {};
  var records = options.map(function (option) {
    activeIds[option.id] = true;
    var previous = existingById[option.id] || {};
    return Object.assign({}, previous, option, {
      campaign_id: campaignId, inventory_sold: Number(previous.inventory_sold || option.inventory_sold || 0),
      created_at: previous.created_at || now, updated_at: now, status: 'ACTIVE', version: Number(previous.version || 0) + 1
    });
  });
  existing.forEach(function (item) {
    if (!activeIds[item.id] && item.status === 'ACTIVE') {
      item.status = 'ARCHIVED'; item.updated_at = now; item.version = Number(item.version || 0) + 1; records.push(item);
    }
  });
  repository.upsert('CAMPAIGN_OPTIONS', records);
}

function saveCampaignBranches_(repository, campaignId, branchIds, now) {
  var existing = repository.list('CAMPAIGN_BRANCHES').filter(function (item) { return item.campaign_id === campaignId; });
  var byBranch = {};
  existing.forEach(function (item) { byBranch[item.branch_id] = item; });
  var active = {};
  var records = branchIds.map(function (branchId) {
    active[branchId] = true;
    var previous = byBranch[branchId] || {};
    return Object.assign({}, previous, {
      id: previous.id || Utilities.getUuid(), campaign_id: campaignId, branch_id: branchId,
      created_at: previous.created_at || now, updated_at: now, status: 'ACTIVE', version: Number(previous.version || 0) + 1
    });
  });
  existing.forEach(function (item) {
    if (!active[item.branch_id] && item.status === 'ACTIVE') {
      item.status = 'ARCHIVED'; item.updated_at = now; item.version = Number(item.version || 0) + 1; records.push(item);
    }
  });
  if (records.length) repository.upsert('CAMPAIGN_BRANCHES', records);
}

function createCampaignVersionRecord_(repository, campaign, options, branchIds, status, actorUserId, now) {
  var versions = repository.list('CAMPAIGN_VERSIONS').filter(function (item) { return item.campaign_id === campaign.id; });
  var versionNumber = versions.reduce(function (max, item) { return Math.max(max, Number(item.version_number || 0)); }, 0) + 1;
  var snapshot = {
    campaign: Object.assign({}, campaign),
    options: options.map(function (item) { return Object.assign({}, item); }),
    branchIds: branchIds.slice(),
    frozenAt: now
  };
  var record = {
    id: Utilities.getUuid(), campaign_id: campaign.id, version_number: versionNumber,
    snapshot_json: JSON.stringify(snapshot), approved_by: status === 'APPROVED' ? actorUserId : '',
    approved_at: status === 'APPROVED' ? now : '', created_at: now, updated_at: now, status: status, version: 1
  };
  repository.upsert('CAMPAIGN_VERSIONS', [record]);
  return record;
}

function validateCampaignForSubmission_(campaign, options, branchIds) {
  normalizeCampaignPayload_({
    title: campaign.title, slug: campaign.slug, summary: campaign.summary, description: campaign.description,
    categoryId: campaign.category_id, cityId: campaign.city_id, imageUrl: campaign.image_url,
    galleryUrls: parseJsonSafe_(campaign.gallery_json, []), normalPriceCents: campaign.normal_price_cents,
    offerPriceCents: campaign.offer_price_cents, clubPriceCents: campaign.club_price_cents || campaign.offer_price_cents, lowStockThreshold: campaign.low_stock_threshold,
    maxPerCustomer: campaign.max_per_customer, salesStartAt: toIsoString_(campaign.sales_start_at), salesEndAt: toIsoString_(campaign.sales_end_at),
    redemptionStartAt: toIsoString_(campaign.redemption_start_at), redemptionEndAt: toIsoString_(campaign.redemption_end_at),
    districtLabel: campaign.district_label, tags: parseJsonSafe_(campaign.tags_json, []), includes: parseJsonSafe_(campaign.includes_json, []),
    excludes: parseJsonSafe_(campaign.excludes_json, []), restrictions: parseJsonSafe_(campaign.restrictions_json, []), branchIds: branchIds,
    requiresBooking: campaign.requires_booking, minimumNoticeHours: campaign.minimum_notice_hours, customerEligibility: campaign.customer_eligibility
  }, true);
  if (!options.length) throw createPublicError_('CAMPAIGN_OPTIONS_REQUIRED', 'Agrega al menos una opción con stock.');
}

function assertAcceptedMerchantContract_(repository, merchantId) {
  var contractIds = repository.list('CONTRACTS').filter(function (item) {
    return item.merchant_id === merchantId && item.contract_type === 'MARCO_COMERCIO' && ['ISSUED', 'ACCEPTED'].indexOf(String(item.status)) >= 0;
  }).map(function (item) { return item.id; });
  var accepted = repository.list('CONTRACT_ACCEPTANCES').some(function (item) {
    return contractIds.indexOf(item.contract_id) >= 0 && item.status === 'ACCEPTED';
  });
  if (!accepted) throw createPublicError_('CONTRACT_ACCEPTANCE_REQUIRED', 'Acepta el contrato marco antes de enviar campañas.');
}

function slugifyCampaign_(value) {
  var slug = normalizeText_(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
  return slug || 'oferta-tazmany';
}

function normalizeStringList_(value, maxItems, maxLength) {
  var items = Array.isArray(value) ? value : String(value || '').split(/\n|,/);
  return items.map(function (item) { return sanitizePlainText_(item, maxLength); }).filter(Boolean).slice(0, maxItems);
}

function clampInteger_(value, min, max, fallback) {
  var number = Number(value);
  if (!Number.isInteger(number)) number = Number(fallback);
  return Math.min(max, Math.max(min, number));
}

function resolveApprovedCampaignStatus_(salesStartAt, salesEndAt, inventoryTotal, inventorySold, nowValue) {
  var now = new Date(nowValue || Date.now()).getTime();
  if (Number(inventorySold || 0) >= Number(inventoryTotal || 0)) return 'AGOTADA';
  if (new Date(salesEndAt).getTime() <= now) return 'FINALIZADA';
  if (new Date(salesStartAt).getTime() > now) return 'PROGRAMADA';
  return 'ACTIVA';
}
