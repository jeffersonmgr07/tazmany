function apiCreateOrderReservation(sessionToken, payload, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'customer.orders.create');
    var normalized = validateOrderReservationPayload_(payload || {});
    return runIdempotent_('order-reservation:' + context.user.id, idempotencyKey, normalized, function () {
      return createOrderReservation_(context, normalized);
    });
  });
}

function apiGetMyOrder(sessionToken, orderId) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'customer.orders.read');
    return getCustomerOrder_(context.user.id, assertSafeId_(orderId, 'orderId'));
  });
}

function apiCancelMyOrder(sessionToken, orderId, idempotencyKey) {
  return executeApi_(function () {
    var context = requirePermission_(sessionToken, 'customer.orders.cancel');
    var safeOrderId = assertSafeId_(orderId, 'orderId');
    return runIdempotent_('order-cancel:' + context.user.id, idempotencyKey, { orderId: safeOrderId }, function () {
      return cancelCustomerOrder_(context, safeOrderId);
    });
  });
}

function validateOrderReservationPayload_(payload) {
  return {
    campaignId: assertSafeId_(payload.campaignId, 'campaignId'),
    optionId: payload.optionId ? assertSafeId_(payload.optionId, 'optionId') : '',
    quantity: clampInteger_(payload.quantity, 1, 10, 1)
  };
}

function createOrderReservation_(context, request) {
  var repository = getDataRepository_();
  assertCustomerCheckoutProfile_(repository, context.user.id);
  releaseExpiredInventoryReservations_(repository);

  var campaign = repository.findById('CAMPAIGNS', request.campaignId);
  if (!campaign || String(campaign.status) !== 'ACTIVA') {
    throw createPublicError_('OFFER_NOT_PURCHASABLE', 'Esta oferta no está disponible para reservar en este momento.');
  }
  var nowMs = Date.now();
  if (campaign.sales_start_at && new Date(campaign.sales_start_at).getTime() > nowMs) {
    throw createPublicError_('OFFER_NOT_STARTED', 'La venta de esta oferta todavía no comienza.');
  }
  if (campaign.sales_end_at && new Date(campaign.sales_end_at).getTime() <= nowMs) {
    throw createPublicError_('OFFER_ENDED', 'La venta de esta oferta ya terminó.');
  }

  var options = repository.list('CAMPAIGN_OPTIONS').filter(function (item) {
    return item.campaign_id === campaign.id && item.status === 'ACTIVE';
  }).sort(function (left, right) { return Number(left.sort_order || 0) - Number(right.sort_order || 0); });
  var option = request.optionId
    ? options.find(function (item) { return item.id === request.optionId; })
    : options[0];
  if (!option) throw createPublicError_('OFFER_OPTION_NOT_FOUND', 'Selecciona una opción disponible.');

  var inventoryTotal = Number(option.inventory_total || campaign.inventory_total || 0);
  var inventorySold = Number(option.inventory_sold || 0);
  var activeReserved = repository.list('INVENTORY_RESERVATIONS').filter(function (item) {
    return item.campaign_id === campaign.id && item.option_id === option.id && item.status === 'ACTIVE' && new Date(item.expires_at).getTime() > nowMs;
  }).reduce(function (sum, item) { return sum + Number(item.quantity || 0); }, 0);
  var available = Math.max(0, inventoryTotal - inventorySold - activeReserved);
  if (available < request.quantity) {
    throw createPublicError_('INSUFFICIENT_STOCK', available > 0 ? 'Solo quedan ' + available + ' unidades disponibles.' : 'La oferta acaba de agotarse.');
  }

  var maxPerCustomer = Number(option.max_per_customer || campaign.max_per_customer || 1);
  var customerQuantity = countCustomerCommittedQuantity_(repository, context.user.id, campaign.id);
  if (customerQuantity + request.quantity > maxPerCustomer) {
    throw createPublicError_('CUSTOMER_LIMIT_REACHED', 'Esta oferta permite un máximo de ' + maxPerCustomer + ' unidades por cliente.');
  }

  var clubMember = hasActiveClubMembership_(repository, context.user.id, nowMs);
  var priceTier = clubMember ? 'CLUB' : 'PUBLIC';
  var publicPrice = Number(option.offer_price_cents || campaign.offer_price_cents || 0);
  var clubPrice = Number(option.club_price_cents || campaign.club_price_cents || publicPrice);
  var unitPrice = priceTier === 'CLUB' ? clubPrice : publicPrice;
  if (!Number.isInteger(unitPrice) || unitPrice <= 0) throw createPublicError_('INVALID_OFFER_PRICE', 'La oferta necesita una revisión de precio.');
  var cashbackBasisPoints = priceTier === 'CLUB'
    ? Number(option.club_cashback_basis_points || campaign.club_cashback_basis_points || TAZMANY_CONFIG.CLUB_CASHBACK_BASIS_POINTS)
    : Number(campaign.cashback_basis_points || TAZMANY_CONFIG.PUBLIC_CASHBACK_BASIS_POINTS);
  var total = unitPrice * request.quantity;
  var cashbackExpected = Math.round(total * cashbackBasisPoints / 10000);
  var now = nowIso_();
  var reservationMinutes = clampInteger_(campaign.reservation_minutes, 5, 30, TAZMANY_CONFIG.ORDER_RESERVATION_MINUTES);
  var expiresAt = minutesFromNowIso_(reservationMinutes);
  var orderId = Utilities.getUuid();
  var itemId = Utilities.getUuid();
  var reservationId = Utilities.getUuid();
  var orderNumber = nextOrderNumber_(repository, now);
  var conditions = {
    schemaVersion: 1,
    campaignId: campaign.id,
    campaignVersionId: campaign.published_version_id || '',
    optionId: option.id,
    title: campaign.title,
    optionName: option.name,
    merchantId: campaign.merchant_id,
    priceTier: priceTier,
    unitPriceCents: unitPrice,
    cashbackBasisPoints: cashbackBasisPoints,
    includes: parseJsonSafe_(campaign.includes_json, []),
    excludes: parseJsonSafe_(campaign.excludes_json, []),
    restrictions: parseJsonSafe_(campaign.restrictions_json, []),
    redemptionStartAt: toIsoString_(campaign.redemption_start_at),
    redemptionEndAt: toIsoString_(campaign.redemption_end_at),
    frozenAt: now
  };

  repository.upsert('ORDERS', [{
    id: orderId, order_number: orderNumber, customer_user_id: context.user.id, currency: TAZMANY_CONFIG.CURRENCY,
    subtotal_cents: total, discount_cents: 0, cashback_used_cents: 0, total_cents: total,
    payment_status: 'PENDING', reservation_expires_at: expiresAt, price_tier: priceTier,
    cashback_basis_points: cashbackBasisPoints, source: 'WEB', created_at: now, updated_at: now,
    status: 'PENDING_PAYMENT', version: 1
  }]);
  repository.upsert('ORDER_ITEMS', [{
    id: itemId, order_id: orderId, campaign_id: campaign.id, campaign_version_id: campaign.published_version_id || '',
    option_id: option.id, quantity: request.quantity, unit_price_cents: unitPrice, total_cents: total,
    cashback_basis_points: cashbackBasisPoints, cashback_expected_cents: cashbackExpected,
    conditions_snapshot_json: JSON.stringify(conditions), created_at: now, updated_at: now, status: 'RESERVED', version: 1
  }]);
  repository.upsert('INVENTORY_RESERVATIONS', [{
    id: reservationId, campaign_id: campaign.id, option_id: option.id, order_id: orderId,
    customer_user_id: context.user.id, quantity: request.quantity, expires_at: expiresAt,
    confirmed_at: '', released_at: '', created_at: now, updated_at: now, status: 'ACTIVE', version: 1
  }]);
  appendAuditEvent_({
    actor_user_id: context.user.id, action: 'ORDER_INVENTORY_RESERVED', entity_type: 'ORDER', entity_id: orderId,
    after_hash: sha256Base64Url_(JSON.stringify({ orderNumber: orderNumber, campaignId: campaign.id, quantity: request.quantity, totalCents: total })),
    metadata_json: JSON.stringify({ reservationId: reservationId, expiresAt: expiresAt, priceTier: priceTier })
  });
  invalidateCustomerDashboardCache_(context.user.id);
  return {
    orderId: orderId, orderNumber: orderNumber, reservationId: reservationId, campaignId: campaign.id,
    optionId: option.id, quantity: request.quantity, currency: TAZMANY_CONFIG.CURRENCY,
    unitPriceCents: unitPrice, totalCents: total, priceTier: priceTier,
    cashbackBasisPoints: cashbackBasisPoints, cashbackExpectedCents: cashbackExpected,
    reservationExpiresAt: expiresAt, paymentEnabled: false, status: 'PENDING_PAYMENT'
  };
}

function getCustomerOrder_(customerUserId, orderId) {
  var repository = getDataRepository_();
  releaseExpiredInventoryReservations_(repository);
  var order = repository.findById('ORDERS', orderId);
  if (!order || order.customer_user_id !== customerUserId) throw createPublicError_('ORDER_NOT_FOUND', 'No encontramos esa orden.');
  var items = repository.list('ORDER_ITEMS').filter(function (item) { return item.order_id === order.id; });
  var reservations = repository.list('INVENTORY_RESERVATIONS').filter(function (item) { return item.order_id === order.id; });
  return mapOrderForCustomer_(order, items, reservations);
}

function cancelCustomerOrder_(context, orderId) {
  var repository = getDataRepository_();
  releaseExpiredInventoryReservations_(repository);
  var order = repository.findById('ORDERS', orderId);
  if (!order || order.customer_user_id !== context.user.id) throw createPublicError_('ORDER_NOT_FOUND', 'No encontramos esa orden.');
  if (String(order.payment_status) === 'APPROVED' || String(order.status) === 'PAID') {
    throw createPublicError_('PAID_ORDER_CANNOT_BE_CANCELLED', 'Una compra pagada sigue el proceso de cancelación y devolución.');
  }
  if (['CANCELLED', 'EXPIRED'].indexOf(String(order.status)) >= 0) return { orderId: order.id, status: order.status, cancelled: true };
  var now = nowIso_();
  order.status = 'CANCELLED';
  order.payment_status = 'CANCELLED';
  order.updated_at = now;
  order.version = Number(order.version || 0) + 1;
  repository.upsert('ORDERS', [order]);
  var reservations = repository.list('INVENTORY_RESERVATIONS').filter(function (item) { return item.order_id === order.id && item.status === 'ACTIVE'; });
  reservations.forEach(function (item) {
    item.status = 'RELEASED'; item.released_at = now; item.updated_at = now; item.version = Number(item.version || 0) + 1;
  });
  if (reservations.length) repository.upsert('INVENTORY_RESERVATIONS', reservations);
  appendAuditEvent_({ actor_user_id: context.user.id, action: 'ORDER_CANCELLED', entity_type: 'ORDER', entity_id: order.id, metadata_json: JSON.stringify({ releasedReservations: reservations.length }) });
  invalidateCustomerDashboardCache_(context.user.id);
  return { orderId: order.id, orderNumber: order.order_number, status: order.status, cancelled: true };
}

function releaseExpiredInventoryReservations_(repository) {
  var nowMs = Date.now();
  var now = nowIso_();
  var expired = repository.list('INVENTORY_RESERVATIONS').filter(function (item) {
    return item.status === 'ACTIVE' && new Date(item.expires_at).getTime() <= nowMs;
  });
  if (!expired.length) return 0;
  var orderIds = {};
  expired.forEach(function (item) {
    item.status = 'EXPIRED'; item.released_at = now; item.updated_at = now; item.version = Number(item.version || 0) + 1; orderIds[item.order_id] = true;
  });
  repository.upsert('INVENTORY_RESERVATIONS', expired);
  var orders = repository.list('ORDERS').filter(function (item) {
    return orderIds[item.id] && item.status === 'PENDING_PAYMENT' && item.payment_status === 'PENDING';
  });
  orders.forEach(function (item) {
    item.status = 'EXPIRED'; item.payment_status = 'EXPIRED'; item.updated_at = now; item.version = Number(item.version || 0) + 1;
  });
  if (orders.length) repository.upsert('ORDERS', orders);
  return expired.length;
}

function countCustomerCommittedQuantity_(repository, customerUserId, campaignId) {
  var validOrderIds = {};
  repository.list('ORDERS').forEach(function (order) {
    if (order.customer_user_id === customerUserId && ['PENDING_PAYMENT', 'PAID'].indexOf(String(order.status)) >= 0) validOrderIds[order.id] = true;
  });
  return repository.list('ORDER_ITEMS').filter(function (item) {
    return validOrderIds[item.order_id] && item.campaign_id === campaignId && ['RESERVED', 'PAID', 'ACTIVE'].indexOf(String(item.status)) >= 0;
  }).reduce(function (sum, item) { return sum + Number(item.quantity || 0); }, 0);
}

function assertCustomerCheckoutProfile_(repository, customerUserId) {
  var profile = repository.list('CUSTOMER_PROFILES').find(function (item) { return item.user_id === customerUserId && item.status === 'ACTIVE'; });
  var privateData = repository.list('CUSTOMER_PRIVATE_DATA').find(function (item) { return item.user_id === customerUserId && item.status === 'ACTIVE'; });
  var acceptance = repository.list('TERMS_ACCEPTANCES').find(function (item) { return item.user_id === customerUserId && ['ACTIVE', 'ACCEPTED'].indexOf(String(item.status)) >= 0; });
  if (!profile || !privateData || !acceptance) {
    throw createPublicError_('PROFILE_REQUIRED', 'Completa tu perfil, WhatsApp y aceptaciones antes de reservar una oferta.');
  }
}

function hasActiveClubMembership_(repository, customerUserId, nowMs) {
  return repository.list('CLUB_MEMBERSHIPS').some(function (item) {
    var periodEnd = item.current_period_end ? new Date(item.current_period_end).getTime() : Number.POSITIVE_INFINITY;
    return item.user_id === customerUserId && item.status === 'ACTIVE' && periodEnd > nowMs;
  });
}

function nextOrderNumber_(repository, now) {
  var counter = repository.list('COUNTERS').find(function (item) { return item.counter_name === 'orders'; });
  if (!counter) {
    var maximum = repository.list('ORDERS').reduce(function (max, order) {
      var match = String(order.order_number || '').match(/^TAZ-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 100);
    counter = { id: 'counter-orders', counter_name: 'orders', current_value: maximum, prefix: 'TAZ', created_at: now, version: 0 };
  }
  counter.current_value = Number(counter.current_value || 0) + 1;
  counter.updated_at = now;
  counter.status = 'ACTIVE';
  counter.version = Number(counter.version || 0) + 1;
  repository.upsert('COUNTERS', [counter]);
  return String(counter.prefix || 'TAZ') + '-' + String(counter.current_value).padStart(6, '0');
}

function mapOrderForCustomer_(order, items, reservations) {
  return {
    id: order.id, orderNumber: order.order_number, currency: order.currency,
    subtotalCents: Number(order.subtotal_cents || 0), discountCents: Number(order.discount_cents || 0),
    totalCents: Number(order.total_cents || 0), paymentStatus: order.payment_status, status: order.status,
    priceTier: order.price_tier || 'PUBLIC', cashbackBasisPoints: Number(order.cashback_basis_points || 0),
    reservationExpiresAt: toIsoString_(order.reservation_expires_at), createdAt: toIsoString_(order.created_at),
    items: items.map(function (item) { return {
      id: item.id, campaignId: item.campaign_id, optionId: item.option_id, quantity: Number(item.quantity || 0),
      unitPriceCents: Number(item.unit_price_cents || 0), totalCents: Number(item.total_cents || 0),
      cashbackExpectedCents: Number(item.cashback_expected_cents || 0)
    }; }),
    reservations: reservations.map(function (item) { return { id: item.id, quantity: Number(item.quantity || 0), expiresAt: toIsoString_(item.expires_at), status: item.status }; })
  };
}
