function getPublicBootstrap_(cityId) {
  var repository = getDataRepository_();
  var cache = CacheService.getScriptCache();
  var selectedCityId = String(cityId || '');
  var cacheKey = 'public-bootstrap-v2-' + (selectedCityId || 'all');
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  var campaigns = repository.list('CAMPAIGNS');
  var merchants = repository.list('MERCHANTS');
  var categories = repository.list('CATEGORIES');
  var countries = repository.list('COUNTRIES');
  var cities = repository.list('CITIES');
  var merchantById = indexById_(merchants);
  var categoryById = indexById_(categories);
  var offers = campaigns
    .filter(function (campaign) {
      return TAZMANY_CONFIG.CAMPAIGN_PUBLIC_STATES.indexOf(String(campaign.status)) >= 0 &&
        (!selectedCityId || String(campaign.city_id) === selectedCityId);
    })
    .map(function (campaign) { return mapCampaignForPublic_(campaign, merchantById[campaign.merchant_id], categoryById[campaign.category_id]); })
    .sort(function (a, b) { return b.soldCount - a.soldCount; });
  var result = {
    config: getAppConfig_(),
    countries: countries.filter(function (country) { return country.status === 'ACTIVE'; }).sort(function (a, b) { return Number(a.sort_order) - Number(b.sort_order); }).map(function (country) { return { id: country.id, code: country.iso_code, name: country.name, currency: country.currency }; }),
    cities: cities.filter(function (city) { return city.status === 'ACTIVE'; }).sort(function (a, b) { return Number(a.sort_order) - Number(b.sort_order); }).map(function (city) { return { id: city.id, name: city.name, countryCode: city.country_code, department: city.department, latitude: Number(city.latitude), longitude: Number(city.longitude) }; }),
    selectedCityId: selectedCityId,
    clubPlan: getPublicClubPlan_(),
    categories: categories.filter(function (category) { return category.status === 'ACTIVE'; }).sort(function (a, b) { return Number(a.sort_order) - Number(b.sort_order); }).map(function (category) { return { id: category.id, name: category.name, slug: category.slug, icon: category.icon }; }),
    offers: offers,
    featuredMerchants: merchants.filter(function (merchant) { return merchant.status === 'ACTIVE'; }).slice(0, 5).map(function (merchant) {
      return { id: merchant.id, name: merchant.trade_name, rating: Number(merchant.rating), description: merchant.description, categoryId: merchant.category_id };
    })
  };
  var serialized = JSON.stringify(result);
  if (serialized.length < 95000) cache.put(cacheKey, serialized, TAZMANY_CONFIG.CACHE_SECONDS);
  return result;
}

function getOfferDetails_(campaignId) {
  var repository = getDataRepository_();
  var campaigns = repository.list('CAMPAIGNS');
  var campaign = campaigns.find(function (item) { return String(item.id) === String(campaignId); });
  if (!campaign || TAZMANY_CONFIG.CAMPAIGN_PUBLIC_STATES.indexOf(String(campaign.status)) < 0) {
    var error = new Error('Campaign not found');
    error.code = 'NOT_FOUND';
    error.publicMessage = 'La oferta ya no está disponible.';
    throw error;
  }
  var merchant = repository.list('MERCHANTS').find(function (item) { return item.id === campaign.merchant_id; });
  var category = repository.list('CATEGORIES').find(function (item) { return item.id === campaign.category_id; });
  var branches = repository.list('BRANCHES').filter(function (item) { return item.merchant_id === campaign.merchant_id && item.status === 'ACTIVE'; });
  var offer = mapCampaignForPublic_(campaign, merchant, category);
  offer.description = String(campaign.description || '');
  offer.includes = parseJsonSafe_(campaign.includes_json, []);
  offer.excludes = parseJsonSafe_(campaign.excludes_json, []);
  offer.restrictions = parseJsonSafe_(campaign.restrictions_json, []);
  offer.validity = { purchaseUntil: toIsoString_(campaign.sales_end_at), redeemFrom: toIsoString_(campaign.redemption_start_at), redeemUntil: toIsoString_(campaign.redemption_end_at) };
  offer.branches = branches.map(function (branch) { return { id: branch.id, name: branch.name, address: branch.address }; });
  return offer;
}

function mapCampaignForPublic_(campaign, merchant, category) {
  var normal = Number(campaign.normal_price_cents || 0);
  var offer = Number(campaign.offer_price_cents || 0);
  var club = Number(campaign.club_price_cents || 0);
  if (club <= 0 || club > offer) club = offer;
  var remaining = Math.max(0, Number(campaign.inventory_total || 0) - Number(campaign.inventory_sold || 0));
  return {
    id: String(campaign.id),
    title: String(campaign.title),
    summary: String(campaign.summary || ''),
    merchantId: String(campaign.merchant_id),
    merchantName: merchant ? String(merchant.trade_name) : 'Comercio Tazmany',
    categoryId: String(campaign.category_id),
    categoryName: category ? String(category.name) : '',
    imageUrl: String(campaign.image_url || ''),
    normalPriceCents: normal,
    offerPriceCents: offer,
    publicPriceCents: offer,
    clubPriceCents: club,
    clubSavingsCents: Math.max(0, offer - club),
    discountPercent: calculateDiscountPercent_(normal, offer),
    publicCashbackPercent: Number(campaign.cashback_basis_points || TAZMANY_CONFIG.PUBLIC_CASHBACK_BASIS_POINTS) / 100,
    clubCashbackPercent: Number(campaign.club_cashback_basis_points || TAZMANY_CONFIG.CLUB_CASHBACK_BASIS_POINTS) / 100,
    cashbackPercent: Number(campaign.cashback_basis_points || TAZMANY_CONFIG.PUBLIC_CASHBACK_BASIS_POINTS) / 100,
    districtLabel: String(campaign.district_label || 'Lima'),
    tags: parseJsonSafe_(campaign.tags_json, []),
    rating: Number(campaign.rating || (merchant && merchant.rating) || 0),
    reviewCount: Number(campaign.review_count || 0),
    soldCount: Number(campaign.sold_count || 0),
    remainingStock: remaining,
    lowStock: remaining > 0 && remaining <= Number(campaign.low_stock_threshold || 0),
    availability: String(campaign.status)
  };
}

function indexById_(items) {
  return items.reduce(function (index, item) { index[item.id] = item; return index; }, {});
}

function toIsoString_(value) {
  return value instanceof Date ? value.toISOString() : String(value || '');
}
