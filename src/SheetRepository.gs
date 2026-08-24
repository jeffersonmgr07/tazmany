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
  existing.forEach(function (row, index) { rowById[String(row[idIndex])] = index; });
  records.forEach(function (record) {
    var targetIndex = rowById[String(record.id)];
    var previous = targetIndex !== undefined ? existing[targetIndex] : [];
    var row = headers.map(function (header, columnIndex) {
      return record[header] === undefined ? (previous[columnIndex] === undefined ? '' : previous[columnIndex]) : record[header];
    });
    if (targetIndex !== undefined) existing[targetIndex] = row;
    else {
      rowById[String(record.id)] = existing.length;
      existing.push(row);
    }
  });
  if (existing.length) sheet.getRange(2, 1, existing.length, headers.length).setValues(existing);
}
