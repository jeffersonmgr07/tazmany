function apiGenerateMerchantFrameworkContract(sessionToken, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'merchant.profile.write');
    return runIdempotent_('merchant-contract:' + context.user.id, idempotencyKey, { version: 'MARCO-2026-08-24-v1' }, function () {
      return generateMerchantFrameworkContract_(context);
    });
  });
}

function apiAcceptMerchantContract(sessionToken, contractId, evidence, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'merchant.profile.write');
    assertSafeId_(contractId, 'contractId');
    return runIdempotent_('contract-acceptance:' + context.user.id, idempotencyKey, { contractId: contractId, accepted: Boolean(evidence && evidence.accepted) }, function () {
      return acceptMerchantContract_(context, contractId, evidence || {});
    });
  });
}

function generateMerchantFrameworkContract_(context) {
  var repository = getDataRepository_();
  var membership = getMerchantMembershipForUser_(context.user.id);
  if (!membership) throw createPublicError_('MERCHANT_MEMBERSHIP_REQUIRED', 'Tu cuenta no está vinculada a un comercio.');
  var merchant = repository.findById('MERCHANTS', membership.merchant_id);
  if (!merchant || ['APROBADO', 'ACTIVO'].indexOf(String(merchant.onboarding_status)) < 0) throw createPublicError_('MERCHANT_NOT_APPROVED', 'El comercio debe estar aprobado antes de emitir el contrato.');
  var documentVersion = 'MARCO-2026-08-24-v1';
  var existing = repository.list('CONTRACTS').find(function (item) {
    return item.merchant_id === merchant.id && item.contract_type === 'MARCO_COMERCIO' && item.document_version === documentVersion && item.status !== 'ARCHIVED';
  });
  if (existing) return mapContractDto_(existing, repository, context.user.id);

  var root = getOrCreateChildFolder_(getTazmanyDriveFolder_(), 'Contratos');
  var merchantFolder = getOrCreateChildFolder_(root, merchant.id);
  var issuedAt = nowIso_();
  var document = DocumentApp.create('Tazmany - Contrato marco - ' + merchant.trade_name);
  var body = document.getBody();
  body.appendParagraph('TAZMANY').setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph('CONTRATO MARCO PARA COMERCIOS').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('Versión: ' + documentVersion);
  body.appendParagraph('Fecha de emisión UTC: ' + issuedAt);
  body.appendParagraph('Comercio: ' + merchant.trade_name);
  body.appendParagraph('Razón social: ' + merchant.legal_name);
  body.appendParagraph('RUC: ' + merchant.ruc_masked);
  body.appendParagraph('Representante: ' + merchant.representative_name);
  body.appendParagraph('Objeto').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('Este documento registra las condiciones preliminares para que el comercio proponga campañas y atienda cupones dentro de Tazmany. Cada campaña aprobada requerirá condiciones y anexos versionados.');
  body.appendParagraph('Trazabilidad y responsabilidades').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('El comercio declara que los precios, stock, sedes, restricciones y vigencias enviados son verificables. Tazmany conserva auditoría de versiones y no elimina operaciones históricas.');
  body.appendParagraph('Validación profesional pendiente').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('PENDIENTE DE VALIDACIÓN LEGAL, TRIBUTARIA Y CONTABLE. La aceptación electrónica registrada por la plataforma constituye evidencia operativa, pero no se presenta automáticamente como firma digital regulada.');
  document.saveAndClose();
  var sourceFile = DriveApp.getFileById(document.getId());
  sourceFile.moveTo(merchantFolder);
  var pdfBlob = sourceFile.getAs(MimeType.PDF).setName('Contrato-Marco-Tazmany-' + slugifyCampaign_(merchant.trade_name) + '.pdf');
  var pdfFile = merchantFolder.createFile(pdfBlob);
  var documentHash = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pdfBlob.getBytes())).replace(/=+$/g, '');
  var contract = {
    id: Utilities.getUuid(), merchant_id: merchant.id, campaign_id: '', contract_type: 'MARCO_COMERCIO',
    document_version: documentVersion, drive_file_id: pdfFile.getId(), document_hash: documentHash,
    created_at: issuedAt, updated_at: issuedAt, status: 'ISSUED', version: 1
  };
  repository.upsert('CONTRACTS', [contract]);
  appendAuditEvent_({ actor_user_id: context.user.id, action: 'MERCHANT_CONTRACT_ISSUED', entity_type: 'CONTRACT', entity_id: contract.id, after_hash: documentHash, metadata_json: JSON.stringify({ merchantId: merchant.id, version: documentVersion }) });
  return mapContractDto_(contract, repository, context.user.id);
}

function acceptMerchantContract_(context, contractId, evidence) {
  if (!evidence.accepted) throw createPublicError_('CONTRACT_ACCEPTANCE_REQUIRED', 'Debes confirmar que leíste y aceptas el documento.');
  var repository = getDataRepository_();
  var membership = getMerchantMembershipForUser_(context.user.id);
  var contract = repository.findById('CONTRACTS', contractId);
  if (!membership || !contract || contract.merchant_id !== membership.merchant_id || contract.status === 'ARCHIVED') throw createPublicError_('CONTRACT_NOT_FOUND', 'No encontramos ese contrato.');
  var now = nowIso_();
  var acceptance = {
    id: Utilities.getUuid(), contract_id: contract.id, user_id: context.user.id, accepted_at: now,
    ip_address: sanitizePlainText_(evidence.ipAddress, 80),
    evidence_json: JSON.stringify({
      documentHash: contract.document_hash,
      documentVersion: contract.document_version,
      deviceLabel: sanitizePlainText_(evidence.deviceLabel, 120),
      userAgentHash: evidence.userAgent ? sha256Base64Url_(String(evidence.userAgent)) : '',
      notice: 'Evidencia operativa; pendiente de validación como firma regulada.'
    }),
    created_at: now, updated_at: now, status: 'ACCEPTED', version: 1
  };
  repository.upsert('CONTRACT_ACCEPTANCES', [acceptance]);
  contract.status = 'ACCEPTED';
  contract.updated_at = now;
  contract.version = Number(contract.version || 0) + 1;
  repository.upsert('CONTRACTS', [contract]);
  var merchant = repository.findById('MERCHANTS', membership.merchant_id);
  if (merchant && merchant.onboarding_status === 'APROBADO') {
    merchant.onboarding_status = 'ACTIVO';
    merchant.updated_at = now;
    merchant.version = Number(merchant.version || 0) + 1;
    repository.upsert('MERCHANTS', [merchant]);
    repository.upsert('MERCHANT_STATUS_HISTORY', [{
      id: Utilities.getUuid(), merchant_id: merchant.id, previous_status: 'APROBADO', new_status: 'ACTIVO',
      reason: 'Contrato marco aceptado', actor_user_id: context.user.id,
      created_at: now, updated_at: now, status: 'RECORDED', version: 1
    }]);
  }
  appendAuditEvent_({ actor_user_id: context.user.id, action: 'MERCHANT_CONTRACT_ACCEPTED', entity_type: 'CONTRACT', entity_id: contract.id, before_hash: contract.document_hash, after_hash: contract.document_hash, metadata_json: JSON.stringify({ acceptanceId: acceptance.id, merchantId: membership.merchant_id }) });
  return { contractId: contract.id, acceptanceId: acceptance.id, acceptedAt: now, status: 'ACCEPTED' };
}

function mapContractDto_(contract, repository, userId) {
  var acceptance = repository.list('CONTRACT_ACCEPTANCES').find(function (item) {
    return item.contract_id === contract.id && item.user_id === userId && item.status === 'ACCEPTED';
  });
  return {
    id: contract.id, type: contract.contract_type, version: contract.document_version,
    status: contract.status, documentHash: contract.document_hash, driveFileId: contract.drive_file_id,
    accepted: Boolean(acceptance), acceptedAt: acceptance ? toIsoString_(acceptance.accepted_at) : ''
  };
}
