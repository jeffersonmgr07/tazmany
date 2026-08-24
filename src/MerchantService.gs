function getMerchantDashboardDemo_() {
  var repository = getDataRepository_();
  var merchantId = 'merchant-sabores';
  var campaigns = repository.list('CAMPAIGNS').filter(function (item) { return item.merchant_id === merchantId; });
  var coupons = repository.list('COUPONS').filter(function (item) { return item.merchant_id === merchantId; });
  var settlements = repository.list('SETTLEMENTS').filter(function (item) { return item.merchant_id === merchantId; });
  return {
    demo: true,
    merchant: { id: merchantId, name: 'Sabores de Lima', initials: 'SL', plan: 'Comercio verificado', branchCount: 2 },
    summary: {
      salesTodayCents: 195720,
      redemptionsToday: 18,
      activeCoupons: Math.max(0, campaigns.reduce(function (sum, campaign) { return sum + Number(campaign.inventory_sold || 0); }, 0) - coupons.filter(function (coupon) { return coupon.status === 'REDEEMED'; }).length),
      nextPayoutCents: settlements.filter(function (item) { return item.status === 'SCHEDULED'; }).reduce(function (sum, item) { return sum + Number(item.net_cents || 0); }, 0)
    },
    weeklySales: [42, 58, 51, 76, 88, 104, 92],
    campaigns: campaigns.map(function (campaign) {
      return {
        id: campaign.id, title: campaign.title, imageUrl: campaign.image_url, status: campaign.status,
        sold: Number(campaign.inventory_sold || 0), inventory: Number(campaign.inventory_total || 0),
        revenueCents: Number(campaign.inventory_sold || 0) * Number(campaign.offer_price_cents || 0)
      };
    }),
    recentRedemptions: [
      { code: 'TAZ-•••-7K2P', offer: 'Ceviche clásico + bebida para 2', branch: 'Miraflores', time: '12:42' },
      { code: 'TAZ-•••-2R5A', offer: 'Brunch criollo para 2', branch: 'Barranco', time: '11:18' },
      { code: 'TAZ-•••-9F1C', offer: 'Ceviche clásico + bebida para 2', branch: 'Barranco', time: '10:56' }
    ]
  };
}
