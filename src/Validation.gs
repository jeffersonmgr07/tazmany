function assertSafeId_(value, fieldName) {
  var text = String(value || '');
  if (!/^[a-zA-Z0-9_-]{3,80}$/.test(text)) {
    var error = new Error('Invalid identifier: ' + fieldName);
    error.code = 'VALIDATION_ERROR';
    error.publicMessage = 'El identificador solicitado no es válido.';
    throw error;
  }
  return text;
}

function normalizeText_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function sanitizePlainText_(value, maxLength) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength || 500);
}
