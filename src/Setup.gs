var TAZMANY_SCHEMA = Object.freeze({
  CONFIG: ['id', 'key', 'value', 'scope', 'description', 'created_at', 'updated_at', 'status', 'version'],
  COUNTERS: ['id', 'counter_name', 'current_value', 'prefix', 'created_at', 'updated_at', 'status', 'version'],
  USERS: ['id', 'email', 'display_name', 'phone_masked', 'user_type', 'roles_json', 'email_verified', 'city_id', 'last_login_at', 'created_at', 'updated_at', 'status', 'version'],
  AUTH_IDENTITIES: ['id', 'user_id', 'provider', 'provider_subject', 'email', 'email_verified', 'last_authenticated_at', 'created_at', 'updated_at', 'status', 'version'],
  OTP_CHALLENGES: ['id', 'email', 'code_hash', 'attempts', 'max_attempts', 'expires_at', 'consumed_at', 'device_label', 'created_at', 'updated_at', 'status', 'version'],
  USER_SESSIONS: ['id', 'user_id', 'token_hash', 'device_label', 'expires_at', 'revoked_at', 'created_at', 'updated_at', 'status', 'version'],
  CUSTOMER_PROFILES: ['id', 'user_id', 'first_name', 'last_name', 'document_type', 'document_masked', 'phone_masked', 'marketing_consent', 'created_at', 'updated_at', 'status', 'version'],
  CUSTOMER_PRIVATE_DATA: ['id', 'user_id', 'phone_e164', 'phone_verified_at', 'document_type', 'document_number_hash', 'document_last4', 'created_at', 'updated_at', 'status', 'version'],
  USER_CITY_PREFERENCES: ['id', 'user_id', 'city_id', 'is_primary', 'created_at', 'updated_at', 'status', 'version'],
  TERMS_ACCEPTANCES: ['id', 'user_id', 'terms_version', 'privacy_version', 'marketing_consent', 'accepted_at', 'evidence_json', 'created_at', 'updated_at', 'status', 'version'],
  CITIES: ['id', 'name', 'department', 'country_code', 'time_zone', 'sort_order', 'created_at', 'updated_at', 'status', 'version'],
  DISTRICTS: ['id', 'city_id', 'name', 'ubigeo', 'latitude', 'longitude', 'created_at', 'updated_at', 'status', 'version'],
  MERCHANTS: ['id', 'trade_name', 'legal_name', 'ruc_masked', 'category_id', 'city_id', 'description', 'logo_url', 'rating', 'review_count', 'onboarding_status', 'created_at', 'updated_at', 'status', 'version'],
  MERCHANT_USERS: ['id', 'merchant_id', 'user_id', 'role', 'branch_ids_json', 'created_at', 'updated_at', 'status', 'version'],
  MERCHANT_STATUS_HISTORY: ['id', 'merchant_id', 'previous_status', 'new_status', 'reason', 'actor_user_id', 'created_at', 'updated_at', 'status', 'version'],
  BRANCHES: ['id', 'merchant_id', 'name', 'city_id', 'district_id', 'address', 'latitude', 'longitude', 'phone_masked', 'created_at', 'updated_at', 'status', 'version'],
  BRANCH_HOURS: ['id', 'branch_id', 'day_of_week', 'opens_at', 'closes_at', 'is_closed', 'created_at', 'updated_at', 'status', 'version'],
  MERCHANT_DOCUMENTS: ['id', 'merchant_id', 'document_type', 'drive_file_id', 'expires_at', 'review_status', 'created_at', 'updated_at', 'status', 'version'],
  MERCHANT_BANK_ACCOUNTS: ['id', 'merchant_id', 'bank_name', 'currency', 'account_masked', 'cci_masked', 'holder_name', 'verified_at', 'created_at', 'updated_at', 'status', 'version'],
  CATEGORIES: ['id', 'name', 'slug', 'icon', 'sort_order', 'featured', 'created_at', 'updated_at', 'status', 'version'],
  CATEGORY_REQUIREMENTS: ['id', 'category_id', 'requirement_type', 'label', 'required', 'created_at', 'updated_at', 'status', 'version'],
  CAMPAIGNS: ['id', 'merchant_id', 'category_id', 'title', 'slug', 'summary', 'description', 'image_url', 'gallery_json', 'normal_price_cents', 'offer_price_cents', 'cashback_basis_points', 'inventory_total', 'inventory_sold', 'low_stock_threshold', 'max_per_customer', 'sales_start_at', 'sales_end_at', 'redemption_start_at', 'redemption_end_at', 'district_label', 'city_id', 'tags_json', 'includes_json', 'excludes_json', 'restrictions_json', 'rating', 'review_count', 'sold_count', 'commission_basis_points', 'created_at', 'updated_at', 'status', 'version'],
  CAMPAIGN_VERSIONS: ['id', 'campaign_id', 'version_number', 'snapshot_json', 'approved_by', 'approved_at', 'created_at', 'updated_at', 'status', 'version'],
  CAMPAIGN_OPTIONS: ['id', 'campaign_id', 'name', 'normal_price_cents', 'offer_price_cents', 'inventory_total', 'inventory_sold', 'sort_order', 'created_at', 'updated_at', 'status', 'version'],
  CAMPAIGN_BRANCHES: ['id', 'campaign_id', 'branch_id', 'created_at', 'updated_at', 'status', 'version'],
  CAMPAIGN_SCHEDULES: ['id', 'campaign_id', 'day_of_week', 'start_time', 'end_time', 'created_at', 'updated_at', 'status', 'version'],
  BLACKOUT_DATES: ['id', 'campaign_id', 'branch_id', 'date', 'reason', 'created_at', 'updated_at', 'status', 'version'],
  INVENTORY_RESERVATIONS: ['id', 'campaign_id', 'option_id', 'order_id', 'quantity', 'expires_at', 'confirmed_at', 'released_at', 'created_at', 'updated_at', 'status', 'version'],
  ORDERS: ['id', 'order_number', 'customer_user_id', 'currency', 'subtotal_cents', 'discount_cents', 'cashback_used_cents', 'total_cents', 'payment_status', 'created_at', 'updated_at', 'status', 'version'],
  ORDER_ITEMS: ['id', 'order_id', 'campaign_id', 'campaign_version_id', 'option_id', 'quantity', 'unit_price_cents', 'total_cents', 'conditions_snapshot_json', 'created_at', 'updated_at', 'status', 'version'],
  PAYMENTS: ['id', 'order_id', 'provider', 'external_payment_id', 'currency', 'amount_cents', 'approved_at', 'created_at', 'updated_at', 'status', 'version'],
  PAYMENT_EVENTS: ['id', 'payment_id', 'event_type', 'external_event_id', 'payload_hash', 'occurred_at', 'created_at', 'updated_at', 'status', 'version'],
  PAYMENT_WEBHOOKS: ['id', 'provider', 'external_event_id', 'payload_hash', 'received_at', 'processed_at', 'created_at', 'updated_at', 'status', 'version'],
  COUPONS: ['id', 'public_code', 'order_item_id', 'customer_user_id', 'merchant_id', 'campaign_id', 'branch_scope_json', 'valid_from', 'expires_at', 'uses_allowed', 'uses_redeemed', 'conditions_snapshot_json', 'created_at', 'updated_at', 'status', 'version'],
  COUPON_EVENTS: ['id', 'coupon_id', 'event_type', 'actor_user_id', 'metadata_json', 'occurred_at', 'created_at', 'updated_at', 'status', 'version'],
  COUPON_REDEMPTIONS: ['id', 'coupon_id', 'merchant_id', 'branch_id', 'employee_user_id', 'uses', 'redeemed_at', 'reversed_at', 'reversal_reason', 'created_at', 'updated_at', 'status', 'version'],
  BOOKINGS: ['id', 'coupon_id', 'customer_user_id', 'merchant_id', 'branch_id', 'slot_id', 'starts_at', 'ends_at', 'created_at', 'updated_at', 'status', 'version'],
  BOOKING_SLOTS: ['id', 'branch_id', 'campaign_id', 'starts_at', 'ends_at', 'capacity', 'reserved', 'created_at', 'updated_at', 'status', 'version'],
  CASHBACK_LEDGER: ['id', 'customer_user_id', 'order_id', 'movement_type', 'amount_cents', 'available_at', 'expires_at', 'created_at', 'updated_at', 'status', 'version'],
  CASHBACK_RULES: ['id', 'name', 'basis_points', 'day_of_week', 'starts_at', 'ends_at', 'max_cents', 'created_at', 'updated_at', 'status', 'version'],
  PROMOTIONS: ['id', 'name', 'promotion_type', 'rules_json', 'starts_at', 'ends_at', 'created_at', 'updated_at', 'status', 'version'],
  PROMO_CODES: ['id', 'promotion_id', 'code_hash', 'max_uses', 'uses', 'created_at', 'updated_at', 'status', 'version'],
  SETTLEMENT_PERIODS: ['id', 'starts_at', 'ends_at', 'payable_at', 'created_at', 'updated_at', 'status', 'version'],
  SETTLEMENTS: ['id', 'period_id', 'merchant_id', 'currency', 'gross_cents', 'commission_cents', 'commission_igv_cents', 'adjustments_cents', 'net_cents', 'paid_at', 'created_at', 'updated_at', 'status', 'version'],
  SETTLEMENT_ITEMS: ['id', 'settlement_id', 'coupon_redemption_id', 'gross_cents', 'commission_cents', 'commission_igv_cents', 'net_cents', 'created_at', 'updated_at', 'status', 'version'],
  PAYOUTS: ['id', 'settlement_id', 'bank_operation_number', 'amount_cents', 'proof_drive_file_id', 'paid_at', 'created_at', 'updated_at', 'status', 'version'],
  FINANCIAL_ADJUSTMENTS: ['id', 'merchant_id', 'settlement_id', 'reason', 'amount_cents', 'approved_by', 'created_at', 'updated_at', 'status', 'version'],
  RISK_HOLDS: ['id', 'entity_type', 'entity_id', 'reason', 'amount_cents', 'released_at', 'created_at', 'updated_at', 'status', 'version'],
  CONTRACTS: ['id', 'merchant_id', 'campaign_id', 'contract_type', 'document_version', 'drive_file_id', 'document_hash', 'created_at', 'updated_at', 'status', 'version'],
  CONTRACT_ACCEPTANCES: ['id', 'contract_id', 'user_id', 'accepted_at', 'ip_address', 'evidence_json', 'created_at', 'updated_at', 'status', 'version'],
  REVIEWS: ['id', 'customer_user_id', 'merchant_id', 'campaign_id', 'coupon_id', 'rating', 'comment', 'merchant_response', 'created_at', 'updated_at', 'status', 'version'],
  SUPPORT_TICKETS: ['id', 'ticket_number', 'requester_user_id', 'entity_type', 'entity_id', 'reason', 'priority', 'assignee_user_id', 'created_at', 'updated_at', 'status', 'version'],
  SUPPORT_MESSAGES: ['id', 'ticket_id', 'author_user_id', 'message', 'attachments_json', 'created_at', 'updated_at', 'status', 'version'],
  COMPLAINTS_BOOK: ['id', 'complaint_number', 'customer_user_id', 'complaint_type', 'summary', 'response', 'created_at', 'updated_at', 'status', 'version'],
  NOTIFICATIONS: ['id', 'user_id', 'channel', 'template_key', 'payload_json', 'sent_at', 'created_at', 'updated_at', 'status', 'version'],
  IDEMPOTENCY_KEYS: ['id', 'scope', 'key_hash', 'request_hash', 'response_json', 'expires_at', 'created_at', 'updated_at', 'status', 'version'],
  AUDIT_LOG: ['id', 'actor_user_id', 'action', 'entity_type', 'entity_id', 'before_hash', 'after_hash', 'metadata_json', 'occurred_at', 'created_at', 'updated_at', 'status', 'version'],
  ERROR_LOG: ['id', 'context', 'error_code', 'message', 'stack_hash', 'metadata_json', 'occurred_at', 'created_at', 'updated_at', 'status', 'version'],
  SCHEMA_MIGRATIONS: ['id', 'migration_key', 'description', 'applied_at', 'checksum', 'created_at', 'updated_at', 'status', 'version']
});

function setupTazmany() {
  var result = withScriptLock_(function () {
    var properties = PropertiesService.getScriptProperties();
    var spreadsheetId = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.SPREADSHEET_ID);
    var spreadsheet;
    if (spreadsheetId) spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    else {
      spreadsheet = SpreadsheetApp.create('Tazmany DB - Development');
      properties.setProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.SPREADSHEET_ID, spreadsheet.getId());
    }

    Object.keys(TAZMANY_SCHEMA).forEach(function (sheetName) {
      ensureSheet_(spreadsheet, sheetName, TAZMANY_SCHEMA[sheetName]);
    });
    removeDefaultSheetIfSafe_(spreadsheet);
    ensureDriveFolder_(properties);
    properties.setProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ENVIRONMENT,
      properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ENVIRONMENT) || 'development');
    ensurePhase2Properties_(properties);

    upsertRowsById_('SCHEMA_MIGRATIONS', [{
      id: 'migration-001', migration_key: '001-initial-schema', description: 'Esquema inicial de Fase 1',
      applied_at: nowIso_(), checksum: 'tazmany-v0.1.0', created_at: nowIso_(), updated_at: nowIso_(), status: 'APPLIED', version: 1
    }]);
    upsertRowsById_('SCHEMA_MIGRATIONS', [{
      id: 'migration-002', migration_key: '002-auth-sessions-rbac', description: 'Identidades, OTP, sesiones propias, perfil privado y aceptaciones versionadas',
      applied_at: nowIso_(), checksum: 'tazmany-v0.2.0', created_at: nowIso_(), updated_at: nowIso_(), status: 'APPLIED', version: 1
    }]);
    seedDemoData();
    return { ok: true, spreadsheetId: spreadsheet.getId(), spreadsheetUrl: spreadsheet.getUrl(), sheets: Object.keys(TAZMANY_SCHEMA).length };
  });
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function ensureSheet_(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var isEmpty = current.every(function (value) { return value === ''; });
  if (isEmpty) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  else if (current.join('|') !== headers.join('|')) throw new Error('Schema mismatch in sheet ' + sheetName + '. Apply a controlled migration.');
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#182635').setFontColor('#FFFFFF').setFontWeight('bold').setWrap(true);
  sheet.autoResizeColumns(1, Math.min(headers.length, 12));
  if (['AUTH_IDENTITIES', 'OTP_CHALLENGES', 'USER_SESSIONS', 'CUSTOMER_PRIVATE_DATA', 'TERMS_ACCEPTANCES', 'PAYMENTS', 'PAYMENT_EVENTS', 'CASHBACK_LEDGER', 'SETTLEMENTS', 'SETTLEMENT_ITEMS', 'PAYOUTS', 'AUDIT_LOG'].indexOf(sheetName) >= 0) {
    var existingProtection = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
    if (!existingProtection) sheet.protect().setDescription('Zona financiera/auditoría: cambios controlados').setWarningOnly(true);
  }
}

function removeDefaultSheetIfSafe_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName('Sheet1') || spreadsheet.getSheetByName('Hoja 1');
  if (sheet && spreadsheet.getSheets().length > 1 && sheet.getLastRow() <= 1) spreadsheet.deleteSheet(sheet);
}

function ensureDriveFolder_(properties) {
  var folderId = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.DRIVE_FOLDER_ID);
  if (folderId) {
    try { DriveApp.getFolderById(folderId).getName(); return folderId; } catch (error) { /* recreate */ }
  }
  var folder = DriveApp.createFolder('Tazmany - Development');
  ['Contratos', 'Comprobantes', 'Estados de cuenta', 'Comercios'].forEach(function (name) { folder.createFolder(name); });
  properties.setProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.DRIVE_FOLDER_ID, folder.getId());
  return folder.getId();
}
