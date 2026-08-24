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

function validatePeruvianRuc_(value) {
  var ruc = String(value || '').replace(/\D/g, '');
  if (!/^(10|15|16|17|20)\d{9}$/.test(ruc)) {
    throw createPublicError_('INVALID_RUC', 'Ingresa un RUC peruano válido de 11 dígitos.');
  }
  var weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  var sum = weights.reduce(function (total, weight, index) { return total + Number(ruc[index]) * weight; }, 0);
  var checkDigit = 11 - (sum % 11);
  if (checkDigit === 10) checkDigit = 0;
  if (checkDigit === 11) checkDigit = 1;
  if (checkDigit !== Number(ruc[10])) throw createPublicError_('INVALID_RUC', 'El dígito verificador del RUC no es válido.');
  return ruc;
}

function validateHttpsUrl_(value, fieldName, optional) {
  var text = String(value || '').trim();
  if (!text && optional) return '';
  if (!/^https:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:[/?#][^\s<>]*)?$/.test(text) || text.length > 500) {
    throw createPublicError_('INVALID_URL', 'Revisa la URL de ' + String(fieldName || 'este campo') + '. Debe comenzar con https://.');
  }
  return text;
}

function validateIntegerCents_(value, fieldName, allowZero) {
  var cents = Number(value);
  if (!Number.isInteger(cents) || cents < (allowZero ? 0 : 1) || cents > 100000000) {
    throw createPublicError_('INVALID_MONEY', 'Revisa el importe de ' + String(fieldName || 'precio') + '.');
  }
  return cents;
}

function validateIsoDate_(value, fieldName) {
  var text = String(value || '').trim();
  var timestamp = new Date(text).getTime();
  if (!text || !Number.isFinite(timestamp)) throw createPublicError_('INVALID_DATE', 'Revisa la fecha de ' + String(fieldName || 'la campaña') + '.');
  return new Date(timestamp).toISOString();
}

function validateEnum_(value, allowed, fieldName) {
  var normalized = String(value || '').trim().toUpperCase();
  if ((allowed || []).indexOf(normalized) < 0) throw createPublicError_('INVALID_VALUE', 'Revisa el valor de ' + String(fieldName || 'este campo') + '.');
  return normalized;
}
