function getMasterSpreadsheet_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.SPREADSHEET_ID);
  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    properties.setProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.SPREADSHEET_ID, active.getId());
    return active;
  }
  throw new Error('Ejecuta setupTazmany() para crear y vincular el Spreadsheet maestro.');
}

function getRowsAsObjects_(sheetName) {
  var sheet = getMasterSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var headers = values.shift();
  return values.filter(function (row) { return row.some(function (cell) { return cell !== ''; }); }).map(function (row) {
    return headers.reduce(function (record, header, index) {
      record[header] = row[index];
      return record;
    }, {});
  });
}

function upsertRowsById_(sheetName, records) {
  if (!records.length) return;
  var sheet = getMasterSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Missing sheet: ' + sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var existing = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues()
    : [];
  var idIndex = headers.indexOf('id');
  var rowById = {};
  existing.forEach(function (row, index) { rowById[String(row[idIndex])] = index + 2; });
  var inserts = [];
  records.forEach(function (record) {
    var row = headers.map(function (header) { return record[header] === undefined ? '' : record[header]; });
    var targetRow = rowById[String(record.id)];
    if (targetRow) sheet.getRange(targetRow, 1, 1, headers.length).setValues([row]);
    else inserts.push(row);
  });
  if (inserts.length) sheet.getRange(sheet.getLastRow() + 1, 1, inserts.length, headers.length).setValues(inserts);
}
