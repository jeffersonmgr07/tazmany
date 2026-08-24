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

function normalizeEmail_(value) {
  var email = String(value || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createPublicError_('INVALID_EMAIL', 'Ingresa un correo electrónico válido.');
  }
  return email;
}

function normalizePeruPhone_(value) {
  var digits = String(value || '').replace(/\D/g, '');
  if (digits.indexOf('51') === 0 && digits.length === 11) digits = digits.slice(2);
  if (!/^9\d{8}$/.test(digits)) throw createPublicError_('INVALID_PHONE', 'Ingresa un celular peruano de 9 dígitos.');
  return '+51' + digits;
}

function validateDocument_(type, value) {
  var documentType = String(type || '').trim().toUpperCase();
  var documentNumber = String(value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  var rules = { DNI: /^\d{8}$/, CE: /^[A-Z0-9]{6,12}$/, PASSPORT: /^[A-Z0-9]{6,12}$/ };
  if (!rules[documentType] || !rules[documentType].test(documentNumber)) {
    throw createPublicError_('INVALID_DOCUMENT', 'Revisa el tipo y número de documento.');
  }
  return { type: documentType, number: documentNumber };
}

function validateIdempotencyKey_(value) {
  var key = String(value || '').trim();
  if (!/^[A-Za-z0-9:_-]{12,160}$/.test(key)) {
    throw createPublicError_('INVALID_IDEMPOTENCY_KEY', 'Actualiza la página e inténtalo nuevamente.');
  }
  return key;
}
