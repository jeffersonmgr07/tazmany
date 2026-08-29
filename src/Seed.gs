function seedDemoData() {
  var now = nowIso_();
  var common = { created_at: now, updated_at: now, status: 'ACTIVE', version: 1 };
  function row(data) { return Object.assign({}, common, data); }

  upsertRowsById_('COUNTRIES', [row({ id: 'country-pe', iso_code: 'PE', name: 'Perú', currency: 'PEN', time_zone: 'America/Lima', sort_order: 1 })]);
  upsertRowsById_('CITIES', [
    row({ id: 'city-lima', name: 'Lima', department: 'Lima', country_code: 'PE', time_zone: 'America/Lima', sort_order: 1, latitude: -12.0464, longitude: -77.0428 }),
    row({ id: 'city-arequipa', name: 'Arequipa', department: 'Arequipa', country_code: 'PE', time_zone: 'America/Lima', sort_order: 2, latitude: -16.409, longitude: -71.5375 }),
    row({ id: 'city-cusco', name: 'Cusco', department: 'Cusco', country_code: 'PE', time_zone: 'America/Lima', sort_order: 3, latitude: -13.5319, longitude: -71.9675 }),
    row({ id: 'city-trujillo', name: 'Trujillo', department: 'La Libertad', country_code: 'PE', time_zone: 'America/Lima', sort_order: 4, latitude: -8.1116, longitude: -79.0287 }),
    row({ id: 'city-piura', name: 'Piura', department: 'Piura', country_code: 'PE', time_zone: 'America/Lima', sort_order: 5, latitude: -5.1945, longitude: -80.6328 })
  ]);
  upsertRowsById_('DISTRICTS', [
    row({ id: 'district-miraflores', city_id: 'city-lima', name: 'Miraflores', ubigeo: '150122' }),
    row({ id: 'district-san-borja', city_id: 'city-lima', name: 'San Borja', ubigeo: '150130' }),
    row({ id: 'district-barranco', city_id: 'city-lima', name: 'Barranco', ubigeo: '150104' }),
    row({ id: 'district-surco', city_id: 'city-lima', name: 'Santiago de Surco', ubigeo: '150140' }),
    row({ id: 'district-pachacamac', city_id: 'city-lima', name: 'Pachacámac', ubigeo: '150123' })
  ]);
  upsertRowsById_('CATEGORIES', [
    row({ id: 'cat-food', name: 'Gastronomía', slug: 'gastronomia', icon: 'restaurant', sort_order: 1, featured: true }),
    row({ id: 'cat-beauty', name: 'Belleza y spa', slug: 'belleza-spa', icon: 'sparkles', sort_order: 2, featured: true }),
    row({ id: 'cat-fitness', name: 'Fitness', slug: 'fitness', icon: 'fitness', sort_order: 3, featured: true }),
    row({ id: 'cat-auto', name: 'Automotriz', slug: 'automotriz', icon: 'car', sort_order: 4, featured: true }),
    row({ id: 'cat-fun', name: 'Entretenimiento', slug: 'entretenimiento', icon: 'ticket', sort_order: 5, featured: true })
  ]);
  upsertRowsById_('USERS', [
    row({ id: 'user-superadmin', email: 'superadmin@demo.tazmany.pe', display_name: 'Super Admin Demo', user_type: 'TAZMANY', roles_json: '["SUPERADMIN"]', email_verified: true, city_id: 'city-lima' }),
    row({ id: 'user-admin', email: 'admin@demo.tazmany.pe', display_name: 'Admin Demo', user_type: 'TAZMANY', roles_json: '["ADMIN"]', email_verified: true, city_id: 'city-lima' }),
    row({ id: 'user-finance', email: 'finanzas@demo.tazmany.pe', display_name: 'Finanzas Demo', user_type: 'TAZMANY', roles_json: '["FINANCE"]', email_verified: true, city_id: 'city-lima' }),
    row({ id: 'user-support', email: 'soporte@demo.tazmany.pe', display_name: 'Soporte Demo', user_type: 'TAZMANY', roles_json: '["SUPPORT"]', email_verified: true, city_id: 'city-lima' }),
    row({ id: 'user-moderator', email: 'moderacion@demo.tazmany.pe', display_name: 'Moderación Demo', user_type: 'TAZMANY', roles_json: '["MODERATOR"]', email_verified: true, city_id: 'city-lima' }),
    row({ id: 'user-customer-1', email: 'cliente1@demo.tazmany.pe', display_name: 'Valeria Torres', user_type: 'CUSTOMER', roles_json: '["CUSTOMER"]', email_verified: true, city_id: 'city-lima' }),
    row({ id: 'user-customer-2', email: 'cliente2@demo.tazmany.pe', display_name: 'Diego Ramos', user_type: 'CUSTOMER', roles_json: '["CUSTOMER"]', email_verified: true, city_id: 'city-lima' }),
    row({ id: 'user-merchant-owner', email: 'comercio@demo.tazmany.pe', display_name: 'Mariana Salazar', user_type: 'MERCHANT', roles_json: '["MERCHANT_OWNER"]', email_verified: true, city_id: 'city-lima' }),
    row({ id: 'user-merchant-pending', email: 'casa.nativa@demo.tazmany.pe', display_name: 'Lucía Paredes', user_type: 'MERCHANT', roles_json: '["MERCHANT_OWNER"]', email_verified: true, city_id: 'city-lima' })
  ]);
  upsertRowsById_('CUSTOMER_PROFILES', [
    row({ id: 'profile-customer-1', user_id: 'user-customer-1', first_name: 'Valeria', last_name: 'Torres', document_type: 'DNI', document_masked: '******42', phone_masked: '*** *** 841', marketing_consent: true }),
    row({ id: 'profile-customer-2', user_id: 'user-customer-2', first_name: 'Diego', last_name: 'Ramos', document_type: 'DNI', document_masked: '******19', phone_masked: '*** *** 224', marketing_consent: false })
  ]);
  upsertRowsById_('MERCHANT_USERS', [
    row({ id: 'merchant-user-owner-demo', merchant_id: 'merchant-sabores', user_id: 'user-merchant-owner', role: 'MERCHANT_OWNER', branch_ids_json: '["branch-sabores-miraflores","branch-sabores-barranco"]' }),
    row({ id: 'merchant-user-pending-demo', merchant_id: 'merchant-casa-nativa', user_id: 'user-merchant-pending', role: 'MERCHANT_OWNER', branch_ids_json: '["branch-casa-nativa"]' })
  ]);
  upsertRowsById_('MERCHANTS', [
    row({ id: 'merchant-sabores', trade_name: 'Sabores de Lima', legal_name: 'Sabores de Lima Demo SAC', ruc_masked: '20*******01', category_id: 'cat-food', city_id: 'city-lima', description: 'Cocina peruana contemporánea.', rating: 4.8, review_count: 342, onboarding_status: 'ACTIVO' }),
    row({ id: 'merchant-kantu', trade_name: 'Kantu Spa', legal_name: 'Kantu Bienestar Demo SAC', ruc_masked: '20*******02', category_id: 'cat-beauty', city_id: 'city-lima', description: 'Bienestar y relajación.', rating: 4.7, review_count: 186, onboarding_status: 'APROBADO' }),
    row({ id: 'merchant-pulso', trade_name: 'Pulso Fitness', legal_name: 'Pulso Fitness Demo SAC', ruc_masked: '20*******03', category_id: 'cat-fitness', city_id: 'city-lima', description: 'Entrenamiento funcional.', rating: 4.9, review_count: 221, onboarding_status: 'APROBADO' }),
    row({ id: 'merchant-motor', trade_name: 'MotorLab', legal_name: 'MotorLab Demo SAC', ruc_masked: '20*******04', category_id: 'cat-auto', city_id: 'city-lima', description: 'Cuidado automotriz profesional.', rating: 4.6, review_count: 98, onboarding_status: 'APROBADO' }),
    row({ id: 'merchant-zona', trade_name: 'Zona Aventura', legal_name: 'Zona Aventura Demo SAC', ruc_masked: '20*******05', category_id: 'cat-fun', city_id: 'city-lima', description: 'Experiencias para compartir.', rating: 4.8, review_count: 154, onboarding_status: 'APROBADO' }),
    row({ id: 'merchant-casa-nativa', trade_name: 'Casa Nativa', legal_name: 'Casa Nativa Demo SAC', ruc_masked: '20*******41', category_id: 'cat-food', city_id: 'city-lima', description: 'Cocina local de temporada.', rating: 0, review_count: 0, onboarding_status: 'PENDIENTE_VERIFICACION', business_mode: 'PRESENCIAL', commercial_email: 'casa.nativa@demo.tazmany.pe', submitted_at: now })
  ]);
  upsertRowsById_('BRANCHES', [
    row({ id: 'branch-sabores-miraflores', merchant_id: 'merchant-sabores', name: 'Miraflores', city_id: 'city-lima', district_id: 'district-miraflores', address: 'Av. Demo 245, Miraflores' }),
    row({ id: 'branch-sabores-barranco', merchant_id: 'merchant-sabores', name: 'Barranco', city_id: 'city-lima', district_id: 'district-barranco', address: 'Jr. Ejemplo 118, Barranco' }),
    row({ id: 'branch-kantu-sanborja', merchant_id: 'merchant-kantu', name: 'San Borja', city_id: 'city-lima', district_id: 'district-san-borja', address: 'Av. Muestra 820, San Borja' }),
    row({ id: 'branch-casa-nativa', merchant_id: 'merchant-casa-nativa', name: 'Barranco', city_id: 'city-lima', district_id: 'district-barranco', address: 'Calle Demostración 510, Barranco' })
  ]);

  var campaigns = getDemoCampaignSeed_(now);
  upsertRowsById_('CLUB_PLANS', [row({
    id: 'club-monthly-pe', country_code: 'PE', name: 'Club Tazmany', billing_period: 'MONTHLY',
    regular_price_cents: 990, intro_price_cents: 490, intro_cycles: 1,
    benefits_json: '["Precios exclusivos en ofertas seleccionadas","Acceso anticipado a nuevas campañas","Promociones especiales para miembros","Beneficios configurables por ciudad"]',
    status: 'COMING_SOON'
  })]);
  upsertRowsById_('CAMPAIGNS', campaigns);
  upsertRowsById_('CAMPAIGN_VERSIONS', campaigns.map(function (campaign, index) {
    var submitted = campaign.status === 'ENVIADA_A_REVISION';
    return row({ id: 'version-demo-' + (index + 1), campaign_id: campaign.id, version_number: 1, snapshot_json: JSON.stringify({ title: campaign.title, offer_price_cents: campaign.offer_price_cents, restrictions_json: campaign.restrictions_json }), approved_by: submitted ? '' : 'user-moderator', approved_at: submitted ? '' : now, status: submitted ? 'SUBMITTED' : 'APPROVED' });
  }));
  upsertRowsById_('CAMPAIGN_OPTIONS', campaigns.map(function (campaign, index) {
    return row({ id: 'option-' + (index + 1), campaign_id: campaign.id, name: 'Opción principal', normal_price_cents: campaign.normal_price_cents, offer_price_cents: campaign.offer_price_cents, club_price_cents: campaign.club_price_cents, inventory_total: campaign.inventory_total, inventory_sold: campaign.inventory_sold, sort_order: 1 });
  }));
  seedDemoOperations_(row);
  seedDemoPhase3Workflow_(row, now);
  ['public-bootstrap-v2-all','public-bootstrap-v2-city-lima','public-bootstrap-v2-city-arequipa','public-bootstrap-v2-city-cusco','public-bootstrap-v2-city-trujillo','public-bootstrap-v2-city-piura']
    .forEach(function (key) { CacheService.getScriptCache().remove(key); });
  return { ok: true, campaigns: campaigns.length };
}

function getDemoCampaignSeed_(now) {
  var common = { created_at: now, updated_at: now, city_id: 'city-lima', sales_start_at: '2026-08-01T05:00:00.000Z', sales_end_at: '2026-12-31T04:59:59.000Z', redemption_start_at: '2026-08-01T05:00:00.000Z', redemption_end_at: '2027-02-28T04:59:59.000Z', commission_basis_points: 1500, max_per_customer: 4, version: 1 };
  function c(data) { return Object.assign({}, common, data); }
  return [
    c({ id: 'campaign-ceviche', merchant_id: 'merchant-sabores', category_id: 'cat-food', title: 'Ceviche clásico + bebida para 2', slug: 'ceviche-clasico-bebida-2', summary: 'Una experiencia peruana fresca para compartir.', description: 'Disfruta dos porciones de ceviche clásico y dos bebidas de la casa en cualquiera de nuestras sedes participantes.', image_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=1200&q=80', normal_price_cents: 11800, offer_price_cents: 6990, cashback_basis_points: 100, inventory_total: 120, inventory_sold: 93, low_stock_threshold: 15, district_label: 'Miraflores y Barranco', tags_json: '["Varias sedes","Regalable"]', includes_json: '["2 ceviches clásicos","2 bebidas de la casa"]', excludes_json: '["Productos adicionales"]', restrictions_json: '["Reserva recomendada","No válido en feriados"]', rating: 4.8, review_count: 342, sold_count: 93, status: 'ACTIVA' }),
    c({ id: 'campaign-spa', merchant_id: 'merchant-kantu', category_id: 'cat-beauty', title: 'Masaje relajante de 60 minutos', slug: 'masaje-relajante-60', summary: 'Una pausa diseñada para recuperar energía.', description: 'Sesión individual de masaje relajante de 60 minutos con aromaterapia.', image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80', normal_price_cents: 16000, offer_price_cents: 8990, cashback_basis_points: 300, inventory_total: 80, inventory_sold: 71, low_stock_threshold: 10, district_label: 'San Borja', tags_json: '["Reserva requerida","Cashback 3%"]', includes_json: '["Masaje de 60 minutos","Aromaterapia"]', excludes_json: '["Propina"]', restrictions_json: '["Reserva con 24 horas de anticipación"]', rating: 4.7, review_count: 186, sold_count: 71, status: 'ACTIVA' }),
    c({ id: 'campaign-fitness', merchant_id: 'merchant-pulso', category_id: 'cat-fitness', title: '1 mes de entrenamiento funcional', slug: 'mes-entrenamiento-funcional', summary: 'Entrena con acompañamiento y clases dinámicas.', description: 'Acceso por 30 días a clases grupales de entrenamiento funcional.', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', normal_price_cents: 22000, offer_price_cents: 11990, cashback_basis_points: 100, inventory_total: 100, inventory_sold: 46, low_stock_threshold: 12, district_label: 'Santiago de Surco', tags_json: '["Clientes nuevos","Regalable"]', includes_json: '["Acceso por 30 días","Evaluación inicial"]', excludes_json: '["Entrenamiento personal"]', restrictions_json: '["Solo clientes nuevos"]', rating: 4.9, review_count: 221, sold_count: 46, status: 'ACTIVA' }),
    c({ id: 'campaign-detailing', merchant_id: 'merchant-motor', category_id: 'cat-auto', title: 'Detailing interior premium', slug: 'detailing-interior-premium', summary: 'Renueva el interior de tu auto con atención profesional.', description: 'Limpieza profunda de asientos, tablero, puertas y maletera.', image_url: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&w=1200&q=80', normal_price_cents: 28000, offer_price_cents: 15990, cashback_basis_points: 100, inventory_total: 60, inventory_sold: 18, low_stock_threshold: 8, district_label: 'La Molina', tags_json: '["Reserva requerida"]', includes_json: '["Aspirado profundo","Limpieza de tapiz"]', excludes_json: '["Lavado exterior"]', restrictions_json: '["Vehículos livianos"]', rating: 4.6, review_count: 98, sold_count: 18, status: 'ACTIVA' }),
    c({ id: 'campaign-bowling', merchant_id: 'merchant-zona', category_id: 'cat-fun', title: '1 hora de bowling para 4', slug: 'bowling-para-4', summary: 'Un plan divertido para familia o amigos.', description: 'Una pista de bowling durante 60 minutos para hasta cuatro personas.', image_url: 'https://images.unsplash.com/photo-1573509078860-0197f7e4b5b3?auto=format&fit=crop&w=1200&q=80', normal_price_cents: 14000, offer_price_cents: 7990, cashback_basis_points: 100, inventory_total: 90, inventory_sold: 53, low_stock_threshold: 10, district_label: 'San Miguel', tags_json: '["Regalable","Reserva requerida"]', includes_json: '["1 pista por 60 minutos","Calzado"]', excludes_json: '["Alimentos y bebidas"]', restrictions_json: '["Máximo 4 personas"]', rating: 4.8, review_count: 154, sold_count: 53, status: 'ACTIVA' }),
    c({ id: 'campaign-brunch', merchant_id: 'merchant-sabores', category_id: 'cat-food', title: 'Brunch criollo para 2', slug: 'brunch-criollo-2', summary: 'Sabores peruanos para comenzar un gran día.', description: 'Brunch criollo para dos personas con bebida caliente.', image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80', normal_price_cents: 9600, offer_price_cents: 5790, cashback_basis_points: 100, inventory_total: 75, inventory_sold: 67, low_stock_threshold: 10, district_label: 'Barranco', tags_json: '["Últimas unidades"]', includes_json: '["2 brunch criollos","2 bebidas calientes"]', excludes_json: '["Bebidas frías"]', restrictions_json: '["Sábados y domingos de 9 a 12"]', rating: 4.8, review_count: 128, sold_count: 67, status: 'PAUSADA' }),
    c({ id: 'campaign-yoga', merchant_id: 'merchant-pulso', category_id: 'cat-fitness', title: 'Pack de 4 clases de yoga', slug: 'pack-4-yoga', summary: 'Respira, fortalece y mejora tu movilidad.', description: 'Cuatro clases grupales de yoga para usar durante 30 días.', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80', normal_price_cents: 12000, offer_price_cents: 6990, cashback_basis_points: 100, inventory_total: 50, inventory_sold: 12, low_stock_threshold: 6, district_label: 'Santiago de Surco', tags_json: '["Reserva requerida"]', includes_json: '["4 clases grupales"]', excludes_json: '["Mat personal"]', restrictions_json: '["Válido por 30 días desde el primer uso"]', rating: 4.9, review_count: 74, sold_count: 12, status: 'PROGRAMADA' }),
    c({ id: 'campaign-limpieza-auto', merchant_id: 'merchant-motor', category_id: 'cat-auto', title: 'Lavado ecológico completo', slug: 'lavado-ecologico', summary: 'Tu auto impecable usando menos agua.', description: 'Lavado exterior e interior con productos biodegradables.', image_url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80', normal_price_cents: 8000, offer_price_cents: 4490, cashback_basis_points: 100, inventory_total: 40, inventory_sold: 40, low_stock_threshold: 5, district_label: 'La Molina', tags_json: '["Agotada"]', includes_json: '["Lavado exterior","Aspirado interior"]', excludes_json: '["Pulido"]', restrictions_json: '["Con cita previa"]', rating: 4.6, review_count: 52, sold_count: 40, status: 'AGOTADA' }),
    c({ id: 'campaign-cena-review', merchant_id: 'merchant-sabores', category_id: 'cat-food', title: 'Cena peruana para dos', slug: 'cena-peruana-para-dos', summary: 'Menú para compartir con ingredientes locales.', description: 'Entrada, dos fondos y bebidas sin alcohol en sedes seleccionadas.', image_url: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80', normal_price_cents: 14000, offer_price_cents: 7990, cashback_basis_points: 0, inventory_total: 80, inventory_sold: 0, low_stock_threshold: 8, district_label: 'Miraflores y Barranco', tags_json: '["Reserva requerida"]', includes_json: '["1 entrada","2 fondos","2 bebidas"]', excludes_json: '["Bebidas alcohólicas"]', restrictions_json: '["Reserva con 24 horas"]', rating: 0, review_count: 0, sold_count: 0, submitted_at: now, status: 'ENVIADA_A_REVISION' })
  ].map(function (campaign) {
    campaign.club_price_cents = Math.max(1, Math.round(Number(campaign.offer_price_cents) * 0.9));
    return campaign;
  });
}

function seedDemoPhase3Workflow_(row, now) {
  upsertRowsById_('CONTRACTS', [row({
    id: 'contract-demo-sabores', merchant_id: 'merchant-sabores', campaign_id: '', contract_type: 'MARCO_COMERCIO',
    document_version: 'MARCO-DEMO-v1', drive_file_id: '', document_hash: 'demo-hash-no-valido-produccion', status: 'ACCEPTED'
  })]);
  upsertRowsById_('CONTRACT_ACCEPTANCES', [row({
    id: 'acceptance-demo-sabores', contract_id: 'contract-demo-sabores', user_id: 'user-merchant-owner', accepted_at: now,
    ip_address: '', evidence_json: '{"notice":"Dato ficticio de desarrollo"}', status: 'ACCEPTED'
  })]);
  upsertRowsById_('CAMPAIGN_BRANCHES', [
    row({ id: 'campaign-branch-cena-1', campaign_id: 'campaign-cena-review', branch_id: 'branch-sabores-miraflores' }),
    row({ id: 'campaign-branch-cena-2', campaign_id: 'campaign-cena-review', branch_id: 'branch-sabores-barranco' })
  ]);
}

function seedDemoOperations_(row) {
  upsertRowsById_('ORDERS', [
    row({ id: 'order-demo-1', order_number: 'TAZ-000101', customer_user_id: 'user-customer-1', currency: 'PEN', subtotal_cents: 6990, discount_cents: 0, cashback_used_cents: 0, total_cents: 6990, payment_status: 'APPROVED', status: 'PAID' }),
    row({ id: 'order-demo-2', order_number: 'TAZ-000102', customer_user_id: 'user-customer-1', currency: 'PEN', subtotal_cents: 8990, discount_cents: 0, cashback_used_cents: 0, total_cents: 8990, payment_status: 'APPROVED', status: 'PAID' }),
    row({ id: 'order-demo-3', order_number: 'TAZ-000103', customer_user_id: 'user-customer-1', currency: 'PEN', subtotal_cents: 11990, discount_cents: 0, cashback_used_cents: 0, total_cents: 11990, payment_status: 'APPROVED', status: 'PAID' }),
    row({ id: 'order-demo-4', order_number: 'TAZ-000104', customer_user_id: 'user-customer-1', currency: 'PEN', subtotal_cents: 7990, discount_cents: 0, cashback_used_cents: 0, total_cents: 7990, payment_status: 'REFUNDED', status: 'REFUNDED' })
  ]);
  upsertRowsById_('ORDER_ITEMS', [
    row({ id: 'item-demo-1', order_id: 'order-demo-1', campaign_id: 'campaign-ceviche', campaign_version_id: 'version-demo-1', option_id: 'option-1', quantity: 1, unit_price_cents: 6990, total_cents: 6990, conditions_snapshot_json: '{"version":1}' }),
    row({ id: 'item-demo-2', order_id: 'order-demo-2', campaign_id: 'campaign-spa', campaign_version_id: 'version-demo-2', option_id: 'option-2', quantity: 1, unit_price_cents: 8990, total_cents: 8990, conditions_snapshot_json: '{"version":1}' }),
    row({ id: 'item-demo-3', order_id: 'order-demo-3', campaign_id: 'campaign-fitness', campaign_version_id: 'version-demo-3', option_id: 'option-3', quantity: 1, unit_price_cents: 11990, total_cents: 11990, conditions_snapshot_json: '{"version":1}' }),
    row({ id: 'item-demo-4', order_id: 'order-demo-4', campaign_id: 'campaign-bowling', campaign_version_id: 'version-demo-5', option_id: 'option-5', quantity: 1, unit_price_cents: 7990, total_cents: 7990, conditions_snapshot_json: '{"version":1}' })
  ]);
  upsertRowsById_('PAYMENTS', [
    row({ id: 'payment-demo-1', order_id: 'order-demo-1', provider: 'DEMO', external_payment_id: 'demo-payment-101', currency: 'PEN', amount_cents: 6990, approved_at: '2026-08-24T14:00:00.000Z', status: 'APPROVED' }),
    row({ id: 'payment-demo-2', order_id: 'order-demo-2', provider: 'DEMO', external_payment_id: 'demo-payment-102', currency: 'PEN', amount_cents: 8990, approved_at: '2026-08-10T14:00:00.000Z', status: 'APPROVED' }),
    row({ id: 'payment-demo-3', order_id: 'order-demo-3', provider: 'DEMO', external_payment_id: 'demo-payment-103', currency: 'PEN', amount_cents: 11990, approved_at: '2026-04-01T14:00:00.000Z', status: 'APPROVED' }),
    row({ id: 'payment-demo-4', order_id: 'order-demo-4', provider: 'DEMO', external_payment_id: 'demo-payment-104', currency: 'PEN', amount_cents: 7990, approved_at: '2026-08-02T14:00:00.000Z', status: 'REFUNDED' })
  ]);
  upsertRowsById_('COUPONS', [
    row({ id: 'coupon-demo-1', public_code: 'TAZ-DEMO-7K2P', order_item_id: 'item-demo-1', customer_user_id: 'user-customer-1', merchant_id: 'merchant-sabores', campaign_id: 'campaign-ceviche', branch_scope_json: '["branch-sabores-miraflores","branch-sabores-barranco"]', valid_from: '2026-08-24T05:00:00.000Z', expires_at: '2026-12-20T04:59:59.000Z', uses_allowed: 1, uses_redeemed: 0, conditions_snapshot_json: '{}', status: 'AVAILABLE' }),
    row({ id: 'coupon-demo-2', public_code: 'TAZ-DEMO-4N8M', order_item_id: 'item-demo-2', customer_user_id: 'user-customer-1', merchant_id: 'merchant-kantu', campaign_id: 'campaign-spa', branch_scope_json: '["branch-kantu-sanborja"]', valid_from: '2026-08-10T05:00:00.000Z', expires_at: '2026-11-30T04:59:59.000Z', uses_allowed: 1, uses_redeemed: 1, conditions_snapshot_json: '{}', status: 'REDEEMED' }),
    row({ id: 'coupon-demo-3', public_code: 'TAZ-DEMO-3X6Q', order_item_id: 'item-demo-3', customer_user_id: 'user-customer-1', merchant_id: 'merchant-pulso', campaign_id: 'campaign-fitness', branch_scope_json: '[]', valid_from: '2026-04-01T05:00:00.000Z', expires_at: '2026-07-31T04:59:59.000Z', uses_allowed: 1, uses_redeemed: 0, conditions_snapshot_json: '{}', status: 'EXPIRED' }),
    row({ id: 'coupon-demo-4', public_code: 'TAZ-DEMO-8B1R', order_item_id: 'item-demo-4', customer_user_id: 'user-customer-1', merchant_id: 'merchant-zona', campaign_id: 'campaign-bowling', branch_scope_json: '[]', valid_from: '2026-08-02T05:00:00.000Z', expires_at: '2026-10-31T04:59:59.000Z', uses_allowed: 1, uses_redeemed: 0, conditions_snapshot_json: '{}', status: 'REFUNDED' })
  ]);
  upsertRowsById_('CASHBACK_LEDGER', [row({ id: 'cashback-demo-1', customer_user_id: 'user-customer-1', order_id: 'order-demo-1', movement_type: 'EARN', amount_cents: 699, available_at: '2026-08-24T05:00:00.000Z', expires_at: '2027-08-24T05:00:00.000Z', status: 'AVAILABLE' })]);
  upsertRowsById_('SETTLEMENT_PERIODS', [row({ id: 'period-demo-1', starts_at: '2026-08-17T05:00:00.000Z', ends_at: '2026-08-24T04:59:59.000Z', payable_at: '2026-08-25T14:00:00.000Z', status: 'APPROVED' })]);
  upsertRowsById_('SETTLEMENTS', [row({ id: 'settlement-demo-1', period_id: 'period-demo-1', merchant_id: 'merchant-sabores', currency: 'PEN', gross_cents: 245600, commission_cents: 36840, commission_igv_cents: 6631, adjustments_cents: 0, net_cents: 202129, status: 'SCHEDULED' })]);
}
