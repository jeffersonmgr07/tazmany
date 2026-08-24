function getCustomerDashboardForUser_(customerId) {
  var repository = getDataRepository_();
  var user = repository.findById('USERS', customerId) || {};
  var profile = repository.list('CUSTOMER_PROFILES').find(function (item) { return item.user_id === customerId && item.status === 'ACTIVE'; }) || {};
  var orders = repository.list('ORDERS').filter(function (item) { return item.customer_user_id === customerId; });
  var coupons = repository.list('COUPONS').filter(function (item) { return item.customer_user_id === customerId; });
  var campaigns = indexById_(repository.list('CAMPAIGNS'));
  var merchants = indexById_(repository.list('MERCHANTS'));
  var cashback = repository.list('CASHBACK_LEDGER').filter(function (item) { return item.customer_user_id === customerId && item.status === 'AVAILABLE'; });
  return {
    demo: false,
    profile: {
      name: user.display_name || 'Cliente Tazmany',
      initials: initialsFromName_(user.display_name || 'Cliente Tazmany'),
      city: cityNameById_(user.city_id || TAZMANY_CONFIG.DEFAULT_CITY_ID),
      memberSince: formatMemberSince_(user.created_at)
    },
    summary: {
      availableCoupons: coupons.filter(function (coupon) { return coupon.status === 'AVAILABLE'; }).length,
      totalOrders: orders.length,
      cashbackCents: cashback.reduce(function (sum, item) { return sum + Number(item.amount_cents || 0); }, 0),
      favorites: 0
    },
    coupons: coupons.map(function (coupon) {
      var campaign = campaigns[coupon.campaign_id] || {};
      var merchant = merchants[coupon.merchant_id] || {};
      return {
        id: coupon.id, code: coupon.public_code, title: campaign.title || 'Cupón Tazmany', merchantName: merchant.trade_name || '',
        imageUrl: campaign.image_url || '', expiresAt: toIsoString_(coupon.expires_at), status: coupon.status
      };
    }),
    activity: cashback.slice(0, 5).map(function (item) {
      return { label: 'Cashback ' + String(item.status).toLowerCase(), detail: 'Movimiento ' + String(item.id).slice(0, 8), amountCents: Number(item.amount_cents || 0), dateLabel: toIsoString_(item.created_at).slice(0, 10) };
    })
  };
}

function getCustomerDashboardDemo_() {
  return getCustomerDashboardForUser_('user-customer-1');
}

function initialsFromName_(name) {
  return String(name || 'T').trim().split(/\s+/).map(function (part) { return part.charAt(0).toUpperCase(); }).slice(0, 2).join('');
}

function cityNameById_(cityId) {
  var city = getDataRepository_().findById('CITIES', cityId);
  return city ? city.name : 'Lima';
}

function formatMemberSince_(value) {
  if (!value) return '';
  return Utilities.formatDate(new Date(value), TAZMANY_CONFIG.TIME_ZONE, 'MMMM yyyy');
}
