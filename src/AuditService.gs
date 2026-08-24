function appendAuditEvent_(event) {
  var sheet = getMasterSpreadsheet_().getSheetByName('AUDIT_LOG');
  var headers = TAZMANY_SCHEMA.AUDIT_LOG;
  var record = Object.assign({
    id: Utilities.getUuid(), actor_user_id: '', before_hash: '', after_hash: '', metadata_json: '{}',
    occurred_at: nowIso_(), created_at: nowIso_(), updated_at: nowIso_(), status: 'RECORDED', version: 1
  }, event || {});
  sheet.appendRow(headers.map(function (header) { return record[header] === undefined ? '' : record[header]; }));
}
