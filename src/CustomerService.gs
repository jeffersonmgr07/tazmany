function getCustomerDashboardDemo_() {
  var repository = getDataRepository_();
  var customerId = 'user-customer-1';
  var orders = repository.list('ORDERS').filter(function (item) { return item.customer_user_id === customerId; });
  var coupons = repository.list('COUPONS').filter(function (item) { return item.customer_user_id === customerId; });
  var campaigns = indexById_(repository.list('CAMPAIGNS'));
  var merchants = indexById_(repository.list('MERCHANTS'));
  var cashback = repository.list('CASHBACK_LEDGER').filter(function (item) { return item.customer_user_id === customerId && item.status === 'AVAILABLE'; });
  return {
    demo: true,
    profile: { name: 'Valeria', initials: 'VT', city: 'Lima', memberSince: 'Agosto 2026' },
    summary: {
      availableCoupons: coupons.filter(function (coupon) { return coupon.status === 'AVAILABLE'; }).length,
      totalOrders: orders.length,
      cashbackCents: cashback.reduce(function (sum, item) { return sum + Number(item.amount_cents || 0); }, 0),
      favorites: 4
    },
    coupons: coupons.map(function (coupon) {
      var campaign = campaigns[coupon.campaign_id] || {};
      var merchant = merchants[coupon.merchant_id] || {};
      return {
        id: coupon.id, code: coupon.public_code, title: campaign.title || 'Cupón Tazmany', merchantName: merchant.trade_name || '',
        imageUrl: campaign.image_url || '', expiresAt: toIsoString_(coupon.expires_at), status: coupon.status
      };
    }),
    activity: [
      { label: 'Cashback disponible', detail: 'Compra TAZ-000101', amountCents: 699, dateLabel: 'Hoy' },
      { label: 'Cupón utilizado', detail: 'Masaje relajante · Kantu Spa', amountCents: 0, dateLabel: 'Hace 6 días' }
    ]
  };
}
