function nowIso_() {
  return new Date().toISOString();
}

function solesToCents_(soles) {
  var numeric = Number(soles);
  if (!Number.isFinite(numeric)) throw new Error('Invalid money value');
  return Math.round(numeric * 100);
}

function formatPenFromCents_(cents) {
  return 'S/ ' + (Number(cents || 0) / 100).toFixed(2);
}

function calculateDiscountPercent_(normalCents, offerCents) {
  normalCents = Number(normalCents);
  offerCents = Number(offerCents);
  if (normalCents <= 0 || offerCents < 0 || offerCents > normalCents) return 0;
  return Math.round(((normalCents - offerCents) / normalCents) * 100);
}

function calculateCommission_(paidCents, basisPoints) {
  var commission = Math.round(Number(paidCents) * Number(basisPoints) / 10000);
  var igv = Math.round(commission * 18 / 100);
  return { commissionCents: commission, commissionIgvCents: igv, merchantNetCents: Number(paidCents) - commission - igv };
}

function parseJsonSafe_(text, fallback) {
  try { return JSON.parse(text); } catch (error) { return fallback; }
}

function sha256Base64Url_(value) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  );
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, '');
}

function constantTimeEquals_(left, right) {
  left = String(left || '');
  right = String(right || '');
  var mismatch = left.length ^ right.length;
  var length = Math.max(left.length, right.length);
  for (var index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function createPublicError_(code, publicMessage) {
  var error = new Error(code);
  error.code = code;
  error.publicMessage = publicMessage;
  return error;
}

function hoursFromNowIso_(hours) {
  return new Date(Date.now() + Number(hours) * 60 * 60 * 1000).toISOString();
}

function minutesFromNowIso_(minutes) {
  return new Date(Date.now() + Number(minutes) * 60 * 1000).toISOString();
}

function logError_(context, error) {
  console.error(JSON.stringify({ context: context, message: error.message, stack: error.stack, at: nowIso_() }));
}
