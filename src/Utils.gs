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

function logError_(context, error) {
  console.error(JSON.stringify({ context: context, message: error.message, stack: error.stack, at: nowIso_() }));
}
