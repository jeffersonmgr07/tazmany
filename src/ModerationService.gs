function apiGetAdminModerationDashboard(sessionToken) {
  return executeApi_(function () {
    var context = getSessionContext_(sessionToken);
    var canReviewMerchants = hasPermission_(context.permissions, 'admin.merchants.review');
    var canReviewCampaigns = hasPermission_(context.permissions, 'admin.campaigns.review');
    if (!canReviewMerchants && !canReviewCampaigns && !hasPermission_(context.permissions, 'admin.dashboard.read')) {
      throw createPublicError_('FORBIDDEN', 'Tu cuenta no tiene permisos administrativos.');
    }
    return getAdminModerationDashboard_(canReviewMerchants || hasPermission_(context.permissions, '*'), canReviewCampaigns || hasPermission_(context.permissions, '*'));
  });
}

function apiReviewMerchant(sessionToken, merchantId, decision, reason, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'admin.merchants.review');
    assertSafeId_(merchantId, 'merchantId');
    return runIdempotent_('merchant-review:' + context.user.id, idempotencyKey, { merchantId: merchantId, decision: decision, reason: reason }, function () {
      return reviewMerchant_(context, merchantId, decision, reason);
    });
  });
}

function apiReviewCampaign(sessionToken, campaignId, decision, reason, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'admin.campaigns.review');
    assertSafeId_(campaignId, 'campaignId');
    return runIdempotent_('campaign-review:' + context.user.id, idempotencyKey, { campaignId: campaignId, decision: decision, reason: reason }, function () {
      return reviewCampaign_(context, campaignId, decision, reason);
    });
  });
}

function getAdminModerationDashboard_(includeMerchants, includeCampaigns) {
  var repository = getDataRepository_();
  var merchants = repository.list('MERCHANTS');
  var campaigns = repository.list('CAMPAIGNS');
  var merchantIndex = indexById_(merchants);
  return {
    summary: {
      merchantsPending: merchants.filter(function (item) { return item.onboarding_status === 'PENDIENTE_VERIFICACION'; }).length,
      merchantsObserved: merchants.filter(function (item) { return item.onboarding_status === 'OBSERVADO'; }).length,
      campaignsPending: campaigns.filter(function (item) { return item.status === 'ENVIADA_A_REVISION'; }).length,
      campaignsChangesRequested: campaigns.filter(function (item) { return item.status === 'CAMBIOS_SOLICITADOS'; }).length
    },
    merchants: includeMerchants ? merchants.filter(function (item) {
      return ['PENDIENTE_VERIFICACION', 'OBSERVADO', 'EN_REVISION'].indexOf(String(item.onboarding_status)) >= 0;
    }).map(function (item) {
      return {
        id: item.id, tradeName: item.trade_name, legalName: item.legal_name, rucMasked: item.ruc_masked,
        categoryId: item.category_id, businessMode: item.business_mode, status: item.onboarding_status,
        submittedAt: toIsoString_(item.submitted_at), reviewNotes: item.review_notes || ''
      };
    }) : [],
    campaigns: includeCampaigns ? campaigns.filter(function (item) {
      return ['ENVIADA_A_REVISION', 'CAMBIOS_SOLICITADOS'].indexOf(String(item.status)) >= 0;
    }).map(function (item) {
      var merchant = merchantIndex[item.merchant_id];
      return {
        id: item.id, title: item.title, merchantName: merchant ? merchant.trade_name : 'Comercio',
        status: item.status, normalPriceCents: Number(item.normal_price_cents || 0), offerPriceCents: Number(item.offer_price_cents || 0),
        inventoryTotal: Number(item.inventory_total || 0), submittedAt: toIsoString_(item.submitted_at), reviewNotes: item.review_notes || ''
      };
    }) : []
  };
}

function reviewMerchant_(context, merchantId, decision, reason) {
  var repository = getDataRepository_();
  var merchant = repository.findById('MERCHANTS', merchantId);
  if (!merchant) throw createPublicError_('MERCHANT_NOT_FOUND', 'No encontramos ese comercio.');
  var normalizedDecision = validateEnum_(decision, ['APPROVE', 'OBSERVE', 'SUSPEND'], 'decisión');
  var notes = sanitizePlainText_(reason, 1000);
  if (normalizedDecision !== 'APPROVE' && notes.length < 10) throw createPublicError_('REVIEW_REASON_REQUIRED', 'Explica el motivo con al menos 10 caracteres.');
  var statusByDecision = { APPROVE: 'APROBADO', OBSERVE: 'OBSERVADO', SUSPEND: 'SUSPENDIDO' };
  var previousStatus = String(merchant.onboarding_status || 'BORRADOR');
  var now = nowIso_();
  merchant.onboarding_status = statusByDecision[normalizedDecision];
  merchant.review_notes = notes;
  merchant.approved_at = normalizedDecision === 'APPROVE' ? now : merchant.approved_at;
  merchant.approved_by = normalizedDecision === 'APPROVE' ? context.user.id : merchant.approved_by;
  merchant.updated_at = now;
  merchant.status = normalizedDecision === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE';
  merchant.version = Number(merchant.version || 0) + 1;
  repository.upsert('MERCHANTS', [merchant]);
  repository.upsert('MERCHANT_STATUS_HISTORY', [{
    id: Utilities.getUuid(), merchant_id: merchant.id, previous_status: previousStatus, new_status: merchant.onboarding_status,
    reason: notes || 'Expediente aprobado por Tazmany', actor_user_id: context.user.id,
    created_at: now, updated_at: now, status: 'RECORDED', version: 1
  }]);
  appendAuditEvent_({ actor_user_id: context.user.id, action: 'MERCHANT_REVIEW_' + normalizedDecision, entity_type: 'MERCHANT', entity_id: merchant.id, metadata_json: JSON.stringify({ previousStatus: previousStatus, newStatus: merchant.onboarding_status, reason: notes }) });
  return { id: merchant.id, status: merchant.onboarding_status, reviewedAt: now };
}

function reviewCampaign_(context, campaignId, decision, reason) {
  var repository = getDataRepository_();
  var campaign = repository.findById('CAMPAIGNS', campaignId);
  if (!campaign) throw createPublicError_('CAMPAIGN_NOT_FOUND', 'No encontramos esa campaña.');
  var normalizedDecision = validateEnum_(decision, ['APPROVE', 'REQUEST_CHANGES', 'REJECT', 'PAUSE'], 'decisión');
  var notes = sanitizePlainText_(reason, 1200);
  if (normalizedDecision !== 'APPROVE' && notes.length < 10) throw createPublicError_('REVIEW_REASON_REQUIRED', 'Explica el motivo con al menos 10 caracteres.');
  if (normalizedDecision === 'APPROVE' && campaign.status !== 'ENVIADA_A_REVISION') throw createPublicError_('INVALID_CAMPAIGN_STATE', 'Solo se aprueban campañas enviadas a revisión.');
  var now = nowIso_();
  var previousStatus = String(campaign.status);
  if (normalizedDecision === 'APPROVE') {
    var versions = repository.list('CAMPAIGN_VERSIONS').filter(function (item) { return item.campaign_id === campaign.id && item.status === 'SUBMITTED'; });
    versions.sort(function (a, b) { return Number(b.version_number || 0) - Number(a.version_number || 0); });
    if (!versions.length) throw createPublicError_('CAMPAIGN_VERSION_REQUIRED', 'La campaña no tiene una versión enviada.');
    var versionRecord = versions[0];
    versionRecord.status = 'APPROVED';
    versionRecord.approved_by = context.user.id;
    versionRecord.approved_at = now;
    versionRecord.updated_at = now;
    versionRecord.version = Number(versionRecord.version || 0) + 1;
    repository.upsert('CAMPAIGN_VERSIONS', [versionRecord]);
    campaign.status = resolveApprovedCampaignStatus_(campaign.sales_start_at, campaign.sales_end_at, campaign.inventory_total, campaign.inventory_sold, now);
    campaign.approved_at = now;
    campaign.approved_by = context.user.id;
    campaign.published_version_id = versionRecord.id;
    campaign.review_notes = '';
  } else if (normalizedDecision === 'REQUEST_CHANGES') {
    campaign.status = 'CAMBIOS_SOLICITADOS';
    campaign.review_notes = notes;
  } else if (normalizedDecision === 'REJECT') {
    campaign.status = 'RECHAZADA';
    campaign.review_notes = notes;
  } else {
    campaign.status = 'PAUSADA';
    campaign.review_notes = notes;
  }
  campaign.updated_at = now;
  campaign.version = Number(campaign.version || 0) + 1;
  repository.upsert('CAMPAIGNS', [campaign]);
  CacheService.getScriptCache().remove('public-bootstrap-v2-all');
  CacheService.getScriptCache().remove('public-bootstrap-v2-' + String(campaign.city_id || 'city-lima'));
  appendAuditEvent_({ actor_user_id: context.user.id, action: 'CAMPAIGN_REVIEW_' + normalizedDecision, entity_type: 'CAMPAIGN', entity_id: campaign.id, metadata_json: JSON.stringify({ previousStatus: previousStatus, newStatus: campaign.status, reason: notes, publishedVersionId: campaign.published_version_id || '' }) });
  return { id: campaign.id, status: campaign.status, reviewedAt: now, publishedVersionId: campaign.published_version_id || '' };
}
