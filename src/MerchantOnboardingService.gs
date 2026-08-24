function apiGetMerchantWorkspace(sessionToken) {
  return executeApi_(function () {
    return getMerchantWorkspaceForContext_(getSessionContext_(sessionToken));
  });
}

function apiSaveMerchantOnboarding(sessionToken, payload, idempotencyKey) {
  return executeApi_(function () {
    var context = getSessionContext_(sessionToken);
    return runIdempotent_('merchant-onboarding:' + context.user.id, idempotencyKey, payload, function () {
      return saveMerchantOnboarding_(context, payload || {});
    });
  });
}

function getMerchantWorkspaceForContext_(context) {
  var repository = getDataRepository_();
  var membership = getMerchantMembershipForUser_(context.user.id);
  var merchant = membership ? repository.findById('MERCHANTS', membership.merchant_id) : null;
  var categories = repository.list('CATEGORIES').filter(function (item) { return item.status === 'ACTIVE'; });
  var districts = repository.list('DISTRICTS').filter(function (item) { return item.status === 'ACTIVE'; });
  if (!merchant) {
    return {
      hasMerchant: false,
      canCreate: true,
      categories: categories.map(mapCategoryOption_),
      districts: districts.map(mapDistrictOption_),
      merchant: null,
      branches: [], documents: [], bankAccount: null, contracts: [], campaigns: []
    };
  }
  var branches = repository.list('BRANCHES').filter(function (item) { return item.merchant_id === merchant.id && item.status === 'ACTIVE'; });
  var documents = repository.list('MERCHANT_DOCUMENTS').filter(function (item) { return item.merchant_id === merchant.id && item.status === 'ACTIVE'; });
  var bank = repository.list('MERCHANT_BANK_ACCOUNTS').find(function (item) { return item.merchant_id === merchant.id && item.status === 'ACTIVE'; });
  var contracts = repository.list('CONTRACTS').filter(function (item) { return item.merchant_id === merchant.id && item.status !== 'ARCHIVED'; });
  var acceptances = repository.list('CONTRACT_ACCEPTANCES');
  var campaigns = repository.list('CAMPAIGNS').filter(function (item) { return item.merchant_id === merchant.id && item.status !== 'ARCHIVADA'; });
  return {
    hasMerchant: true,
    canCreate: false,
    categories: categories.map(mapCategoryOption_),
    districts: districts.map(mapDistrictOption_),
    merchant: mapMerchantWorkspaceDto_(merchant, membership),
    branches: branches.map(function (branch) {
      return { id: branch.id, name: branch.name, cityId: branch.city_id, districtId: branch.district_id, address: branch.address, phoneMasked: branch.phone_masked, businessMode: branch.business_mode || 'PRESENCIAL' };
    }),
    documents: documents.map(function (document) {
      return { id: document.id, type: document.document_type, fileName: document.file_name, reviewStatus: document.review_status, expiresAt: toIsoString_(document.expires_at) };
    }),
    bankAccount: bank ? { id: bank.id, bankName: bank.bank_name, currency: bank.currency, accountMasked: bank.account_masked, cciMasked: bank.cci_masked, holderName: bank.holder_name, reviewStatus: bank.review_status } : null,
    contracts: contracts.map(function (contract) {
      var accepted = acceptances.some(function (item) { return item.contract_id === contract.id && item.status === 'ACCEPTED'; });
      return { id: contract.id, type: contract.contract_type, version: contract.document_version, status: contract.status, accepted: accepted, driveFileId: contract.drive_file_id };
    }),
    campaigns: campaigns.map(mapCampaignWorkspaceDto_)
  };
}

function saveMerchantOnboarding_(context, payload) {
  var repository = getDataRepository_();
  var membership = getMerchantMembershipForUser_(context.user.id);
  var existing = membership ? repository.findById('MERCHANTS', membership.merchant_id) : null;
  if (existing && ['PENDIENTE_VERIFICACION', 'APROBADO', 'ACTIVO', 'SUSPENDIDO', 'DADO_DE_BAJA'].indexOf(String(existing.onboarding_status)) >= 0) {
    throw createPublicError_('MERCHANT_PROFILE_LOCKED', 'El expediente ya fue enviado. Tazmany debe revisarlo antes de nuevos cambios.');
  }
  var submit = Boolean(payload.submit);
  var normalized = normalizeMerchantOnboardingPayload_(payload, submit);
  var now = nowIso_();
  var merchantId = existing ? existing.id : Utilities.getUuid();
  var previousStatus = existing ? String(existing.onboarding_status || 'BORRADOR') : '';
  var nextStatus = submit ? 'PENDIENTE_VERIFICACION' : 'BORRADOR';
  var record = Object.assign({}, existing || {}, {
    id: merchantId,
    trade_name: normalized.tradeName,
    legal_name: normalized.legalName,
    ruc_masked: normalized.ruc ? normalized.ruc.slice(0, 2) + '*******' + normalized.ruc.slice(-2) : '',
    category_id: normalized.categoryId,
    city_id: normalized.cityId,
    description: normalized.description,
    representative_name: normalized.representativeName,
    representative_document_masked: normalized.representativeDocument ? maskDocument_(normalized.representativeDocument.number) : '',
    fiscal_address: normalized.fiscalAddress,
    commercial_address: normalized.commercialAddress,
    business_mode: normalized.businessMode,
    website_url: normalized.websiteUrl,
    social_urls_json: JSON.stringify(normalized.socialUrls),
    commercial_email: normalized.commercialEmail,
    commercial_phone_masked: normalized.commercialPhone ? maskPhone_(normalized.commercialPhone) : '',
    onboarding_status: nextStatus,
    submitted_at: submit ? now : (existing && existing.submitted_at || ''),
    created_at: existing ? existing.created_at : now,
    updated_at: now,
    status: existing ? existing.status : 'ACTIVE',
    version: Number(existing && existing.version || 0) + 1
  });
  repository.upsert('MERCHANTS', [record]);

  if (normalized.ruc || normalized.representativeDocument || normalized.commercialPhone) {
    var privateRecord = repository.list('MERCHANT_PRIVATE_DATA').find(function (item) { return item.merchant_id === merchantId; }) || { id: Utilities.getUuid(), merchant_id: merchantId, created_at: now, version: 0 };
    privateRecord.ruc_hash = normalized.ruc ? hashSecret_('merchant-ruc', normalized.ruc) : '';
    privateRecord.ruc_last4 = normalized.ruc ? normalized.ruc.slice(-4) : '';
    privateRecord.representative_document_type = normalized.representativeDocument ? normalized.representativeDocument.type : '';
    privateRecord.representative_document_hash = normalized.representativeDocument ? hashSecret_('merchant-representative-document', normalized.representativeDocument.number) : '';
    privateRecord.representative_document_last4 = normalized.representativeDocument ? normalized.representativeDocument.number.slice(-4) : '';
    privateRecord.commercial_phone_e164 = normalized.commercialPhone;
    privateRecord.updated_at = now;
    privateRecord.status = 'ACTIVE';
    privateRecord.version = Number(privateRecord.version || 0) + 1;
    repository.upsert('MERCHANT_PRIVATE_DATA', [privateRecord]);
  }

  upsertMerchantOwnerMembership_(repository, context.user, merchantId, membership, now);
  saveOnboardingBranches_(repository, merchantId, normalized.branches, now);
  saveOnboardingBankAccount_(repository, merchantId, normalized.bankAccount, now);
  if (!existing || previousStatus !== nextStatus) {
    repository.upsert('MERCHANT_STATUS_HISTORY', [{
      id: Utilities.getUuid(), merchant_id: merchantId, previous_status: previousStatus, new_status: nextStatus,
      reason: submit ? 'Expediente enviado por el comercio' : 'Borrador guardado', actor_user_id: context.user.id,
      created_at: now, updated_at: now, status: 'RECORDED', version: 1
    }]);
  }
  appendAuditEvent_({
    actor_user_id: context.user.id,
    action: submit ? 'MERCHANT_ONBOARDING_SUBMITTED' : 'MERCHANT_ONBOARDING_SAVED',
    entity_type: 'MERCHANT', entity_id: merchantId,
    before_hash: existing ? sha256Base64Url_(JSON.stringify(existing)) : '',
    after_hash: sha256Base64Url_(JSON.stringify(record)),
    metadata_json: JSON.stringify({ status: nextStatus, branchCount: normalized.branches.length })
  });
  return { merchantId: merchantId, status: nextStatus, submitted: submit, rolesChanged: !membership };
}

function normalizeMerchantOnboardingPayload_(payload, strict) {
  var tradeName = sanitizePlainText_(payload.tradeName, 120);
  if (!tradeName) throw createPublicError_('TRADE_NAME_REQUIRED', 'Ingresa el nombre comercial.');
  var legalName = sanitizePlainText_(payload.legalName, 180);
  var ruc = payload.ruc ? validatePeruvianRuc_(payload.ruc) : '';
  var representativeName = sanitizePlainText_(payload.representativeName, 160);
  var representativeDocument = payload.representativeDocumentNumber
    ? validateDocument_(payload.representativeDocumentType, payload.representativeDocumentNumber)
    : null;
  var categoryId = payload.categoryId ? assertSafeId_(payload.categoryId, 'categoryId') : '';
  var cityId = payload.cityId ? assertSafeId_(payload.cityId, 'cityId') : TAZMANY_CONFIG.DEFAULT_CITY_ID;
  var businessMode = validateEnum_(payload.businessMode || 'PRESENCIAL', ['PRESENCIAL', 'DIGITAL', 'HIBRIDO'], 'modalidad');
  var commercialEmail = payload.commercialEmail ? normalizeEmail_(payload.commercialEmail) : '';
  var commercialPhone = payload.commercialPhone ? normalizePeruPhone_(payload.commercialPhone) : '';
  var websiteUrl = payload.websiteUrl ? validateHttpsUrl_(payload.websiteUrl, 'página web', true) : '';
  var socialUrls = (Array.isArray(payload.socialUrls) ? payload.socialUrls : []).filter(Boolean).slice(0, 4).map(function (url) { return validateHttpsUrl_(url, 'red social', false); });
  var branches = normalizeOnboardingBranches_(payload.branches || [], businessMode, strict);
  var bankAccount = normalizeOnboardingBankAccount_(payload.bankAccount || {}, strict);
  if (strict) {
    if (!legalName || !ruc || !representativeName || !representativeDocument || !categoryId || !commercialEmail || !commercialPhone) {
      throw createPublicError_('INCOMPLETE_MERCHANT_PROFILE', 'Completa los datos legales, comerciales y del representante antes de enviar.');
    }
    if (!sanitizePlainText_(payload.fiscalAddress, 300)) throw createPublicError_('FISCAL_ADDRESS_REQUIRED', 'Ingresa la dirección fiscal.');
  }
  return {
    tradeName: tradeName, legalName: legalName, ruc: ruc, representativeName: representativeName,
    representativeDocument: representativeDocument, categoryId: categoryId, cityId: cityId,
    description: sanitizePlainText_(payload.description, 900), fiscalAddress: sanitizePlainText_(payload.fiscalAddress, 300),
    commercialAddress: sanitizePlainText_(payload.commercialAddress, 300), businessMode: businessMode,
    websiteUrl: websiteUrl, socialUrls: socialUrls, commercialEmail: commercialEmail,
    commercialPhone: commercialPhone, branches: branches, bankAccount: bankAccount
  };
}

function normalizeOnboardingBranches_(branches, businessMode, strict) {
  if (!Array.isArray(branches) || branches.length > 20) throw createPublicError_('INVALID_BRANCHES', 'Revisa las sucursales ingresadas.');
  var result = branches.map(function (branch) {
    var name = sanitizePlainText_(branch.name, 100);
    var address = sanitizePlainText_(branch.address, 300);
    var districtId = branch.districtId ? assertSafeId_(branch.districtId, 'districtId') : '';
    if (!name || !address || !districtId) throw createPublicError_('INCOMPLETE_BRANCH', 'Cada sucursal necesita nombre, distrito y dirección.');
    return {
      id: branch.id ? assertSafeId_(branch.id, 'branchId') : Utilities.getUuid(),
      name: name, cityId: TAZMANY_CONFIG.DEFAULT_CITY_ID, districtId: districtId, address: address,
      latitude: Number.isFinite(Number(branch.latitude)) ? Number(branch.latitude) : '',
      longitude: Number.isFinite(Number(branch.longitude)) ? Number(branch.longitude) : '',
      phone: branch.phone ? normalizePeruPhone_(branch.phone) : '', businessMode: businessMode,
      commercialEmail: branch.commercialEmail ? normalizeEmail_(branch.commercialEmail) : ''
    };
  });
  if (strict && businessMode !== 'DIGITAL' && !result.length) throw createPublicError_('BRANCH_REQUIRED', 'Agrega al menos una sucursal para atención presencial.');
  return result;
}

function normalizeOnboardingBankAccount_(bank, strict) {
  var bankName = sanitizePlainText_(bank.bankName, 100);
  var holderName = sanitizePlainText_(bank.holderName, 160);
  var currency = bank.currency ? validateEnum_(bank.currency, ['PEN', 'USD'], 'moneda bancaria') : 'PEN';
  var account = String(bank.accountNumber || '').replace(/\D/g, '');
  var cci = String(bank.cci || '').replace(/\D/g, '');
  if (account && !/^\d{8,24}$/.test(account)) throw createPublicError_('INVALID_BANK_ACCOUNT', 'Revisa el número de cuenta bancaria.');
  if (cci && !/^\d{20}$/.test(cci)) throw createPublicError_('INVALID_CCI', 'El CCI debe tener 20 dígitos.');
  if (strict && (!bankName || !holderName || (!account && !cci))) throw createPublicError_('BANK_ACCOUNT_REQUIRED', 'Completa la cuenta bancaria o CCI del comercio.');
  return { bankName: bankName, holderName: holderName, currency: currency, account: account, cci: cci };
}

function upsertMerchantOwnerMembership_(repository, user, merchantId, existingMembership, now) {
  if (!existingMembership) {
    repository.upsert('MERCHANT_USERS', [{
      id: Utilities.getUuid(), merchant_id: merchantId, user_id: user.id, role: 'MERCHANT_OWNER', branch_ids_json: '[]',
      created_at: now, updated_at: now, status: 'ACTIVE', version: 1
    }]);
  }
  var roles = parseJsonSafe_(user.roles_json, []);
  if (roles.indexOf('MERCHANT_OWNER') < 0) {
    roles.push('MERCHANT_OWNER');
    user.roles_json = JSON.stringify(roles);
    user.user_type = 'MERCHANT';
    user.updated_at = now;
    user.version = Number(user.version || 0) + 1;
    repository.upsert('USERS', [user]);
  }
}

function saveOnboardingBranches_(repository, merchantId, branches, now) {
  if (!branches.length) return;
  var existing = repository.list('BRANCHES').filter(function (item) { return item.merchant_id === merchantId; });
  var existingById = indexById_(existing);
  var records = branches.map(function (branch) {
    var previous = existingById[branch.id] || {};
    return Object.assign({}, previous, {
      id: branch.id, merchant_id: merchantId, name: branch.name, city_id: branch.cityId, district_id: branch.districtId,
      address: branch.address, latitude: branch.latitude, longitude: branch.longitude, phone_masked: branch.phone ? maskPhone_(branch.phone) : '',
      business_mode: branch.businessMode, commercial_email: branch.commercialEmail,
      created_at: previous.created_at || now, updated_at: now, status: 'ACTIVE', version: Number(previous.version || 0) + 1
    });
  });
  repository.upsert('BRANCHES', records);
}

function saveOnboardingBankAccount_(repository, merchantId, bank, now) {
  if (!bank.bankName && !bank.account && !bank.cci) return;
  var existing = repository.list('MERCHANT_BANK_ACCOUNTS').find(function (item) { return item.merchant_id === merchantId && item.status === 'ACTIVE'; });
  var record = Object.assign({}, existing || {}, {
    id: existing ? existing.id : Utilities.getUuid(), merchant_id: merchantId, bank_name: bank.bankName,
    currency: bank.currency, account_masked: maskBankNumber_(bank.account), cci_masked: maskBankNumber_(bank.cci),
    account_hash: bank.account ? hashSecret_('merchant-bank-account', bank.account) : '',
    cci_hash: bank.cci ? hashSecret_('merchant-bank-cci', bank.cci) : '', holder_name: bank.holderName,
    verified_at: '', review_status: 'PENDING', change_effective_at: hoursFromNowIso_(72),
    created_at: existing ? existing.created_at : now, updated_at: now, status: 'ACTIVE', version: Number(existing && existing.version || 0) + 1
  });
  repository.upsert('MERCHANT_BANK_ACCOUNTS', [record]);
}

function maskBankNumber_(value) {
  var digits = String(value || '').replace(/\D/g, '');
  return digits ? Array(Math.max(1, digits.length - 3)).join('*') + digits.slice(-4) : '';
}

function getMerchantMembershipForUser_(userId) {
  return getDataRepository_().list('MERCHANT_USERS').find(function (item) {
    return item.user_id === userId && item.status === 'ACTIVE';
  }) || null;
}

function mapMerchantWorkspaceDto_(merchant, membership) {
  return {
    id: merchant.id, tradeName: merchant.trade_name, legalName: merchant.legal_name, rucMasked: merchant.ruc_masked,
    categoryId: merchant.category_id, cityId: merchant.city_id, description: merchant.description,
    representativeName: merchant.representative_name, representativeDocumentMasked: merchant.representative_document_masked,
    fiscalAddress: merchant.fiscal_address, commercialAddress: merchant.commercial_address,
    businessMode: merchant.business_mode || 'PRESENCIAL', websiteUrl: merchant.website_url,
    socialUrls: parseJsonSafe_(merchant.social_urls_json, []), commercialEmail: merchant.commercial_email,
    commercialPhoneMasked: merchant.commercial_phone_masked, onboardingStatus: merchant.onboarding_status,
    reviewNotes: merchant.review_notes || '', membershipRole: membership && membership.role
  };
}

function mapCampaignWorkspaceDto_(campaign) {
  return {
    id: campaign.id, title: campaign.title, status: campaign.status, categoryId: campaign.category_id,
    imageUrl: campaign.image_url, normalPriceCents: Number(campaign.normal_price_cents || 0),
    offerPriceCents: Number(campaign.offer_price_cents || 0), inventoryTotal: Number(campaign.inventory_total || 0),
    inventorySold: Number(campaign.inventory_sold || 0), reviewNotes: campaign.review_notes || '',
    submittedAt: toIsoString_(campaign.submitted_at), approvedAt: toIsoString_(campaign.approved_at)
  };
}

function mapCategoryOption_(category) { return { id: category.id, name: category.name, icon: category.icon }; }
function mapDistrictOption_(district) { return { id: district.id, cityId: district.city_id, name: district.name }; }

function apiUploadMerchantDocument(sessionToken, payload, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'merchant.profile.write');
    return runIdempotent_('merchant-document:' + context.user.id, idempotencyKey, { fileName: payload && payload.fileName, documentType: payload && payload.documentType, contentHash: sha256Base64Url_(payload && payload.dataBase64 || '') }, function () {
      return uploadMerchantDocument_(context, payload || {});
    });
  });
}

function uploadMerchantDocument_(context, payload) {
  var membership = getMerchantMembershipForUser_(context.user.id);
  if (!membership) throw createPublicError_('MERCHANT_MEMBERSHIP_REQUIRED', 'Tu cuenta no está vinculada a un comercio.');
  var type = validateEnum_(payload.documentType, ['RUC_FILE', 'REPRESENTATIVE_ID', 'BANK_OWNERSHIP', 'CATEGORY_LICENSE', 'OTHER'], 'tipo de documento');
  var mimeType = validateEnum_(payload.mimeType, ['APPLICATION/PDF', 'IMAGE/PNG', 'IMAGE/JPEG'], 'formato de archivo').toLowerCase();
  var base64 = String(payload.dataBase64 || '').replace(/^data:[^;]+;base64,/, '');
  if (!base64 || base64.length > 7000000) throw createPublicError_('INVALID_DOCUMENT_FILE', 'El archivo debe pesar menos de 5 MB.');
  var bytes;
  try { bytes = Utilities.base64Decode(base64); } catch (error) { throw createPublicError_('INVALID_DOCUMENT_FILE', 'No pudimos leer el archivo.'); }
  if (bytes.length > 5 * 1024 * 1024) throw createPublicError_('INVALID_DOCUMENT_FILE', 'El archivo debe pesar menos de 5 MB.');
  var fileName = sanitizePlainText_(payload.fileName, 120).replace(/[^A-Za-z0-9._ -]/g, '_') || type.toLowerCase();
  var root = getOrCreateChildFolder_(getTazmanyDriveFolder_(), 'Comercios');
  var merchantFolder = getOrCreateChildFolder_(root, membership.merchant_id);
  var file = merchantFolder.createFile(Utilities.newBlob(bytes, mimeType, fileName));
  var digest = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes)).replace(/=+$/g, '');
  var now = nowIso_();
  var document = {
    id: Utilities.getUuid(), merchant_id: membership.merchant_id, document_type: type, drive_file_id: file.getId(),
    expires_at: payload.expiresAt ? validateIsoDate_(payload.expiresAt, 'vencimiento') : '', review_status: 'PENDING',
    file_name: fileName, mime_type: mimeType, document_hash: digest, review_notes: '',
    created_at: now, updated_at: now, status: 'ACTIVE', version: 1
  };
  getDataRepository_().upsert('MERCHANT_DOCUMENTS', [document]);
  appendAuditEvent_({ actor_user_id: context.user.id, action: 'MERCHANT_DOCUMENT_UPLOADED', entity_type: 'MERCHANT_DOCUMENT', entity_id: document.id, after_hash: digest, metadata_json: JSON.stringify({ merchantId: membership.merchant_id, type: type }) });
  return { id: document.id, type: type, fileName: fileName, reviewStatus: 'PENDING' };
}
