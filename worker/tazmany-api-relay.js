const ALLOWED_ACTIONS = new Set([
  'apiGetPublicBootstrap',
  'apiGetOfferDetails',
  'apiSubscribeToOffers',
  'apiGetAuthConfig',
  'apiAuthenticateGoogle',
  'apiRequestEmailOtp',
  'apiVerifyEmailOtp',
  'apiGetSession',
  'apiListSessions',
  'apiLogout',
  'apiRevokeSession',
  'apiGetMyProfile',
  'apiSaveCustomerProfile',
  'apiGetCustomerDashboard',
  'apiGetMerchantDashboard',
  'apiGetMerchantWorkspace',
  'apiSaveMerchantOnboarding',
  'apiUploadMerchantDocument',
  'apiSaveCampaignDraft',
  'apiGetCampaignEditor',
  'apiSubmitCampaign',
  'apiGenerateMerchantFrameworkContract',
  'apiAcceptMerchantContract',
  'apiGetAdminModerationDashboard',
  'apiReviewMerchant',
  'apiReviewCampaign'
]);

const MAX_REQUEST_BYTES = 7_500_000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      return jsonResponse({ ok: true, service: 'tazmany-api-relay', version: '0.3.6' }, 200, '');
    }
    if (url.pathname !== '/api') return jsonResponse({ ok: false, error: { code: 'NOT_FOUND', message: 'Ruta no disponible.' } }, 404, '');

    const origin = normalizeOrigin(request.headers.get('Origin'));
    const allowedOrigins = String(env.ALLOWED_ORIGINS || '').split(',').map(normalizeOrigin).filter(Boolean);
    if (!origin || !allowedOrigins.includes(origin)) {
      return jsonResponse({ ok: false, error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origen no autorizado.' } }, 403, '');
    }
    if (request.method === 'OPTIONS') return preflightResponse(origin);
    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Método no permitido.' } }, 405, origin);
    }

    const declaredLength = Number(request.headers.get('Content-Length') || 0);
    if (declaredLength > MAX_REQUEST_BYTES) {
      return jsonResponse({ ok: false, error: { code: 'REQUEST_TOO_LARGE', message: 'Solicitud demasiado grande.' } }, 413, origin);
    }

    let clientRequest;
    try {
      const rawBody = await request.text();
      if (!rawBody || new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) throw new Error('INVALID_SIZE');
      clientRequest = JSON.parse(rawBody);
    } catch (error) {
      return jsonResponse({ ok: false, error: { code: 'INVALID_JSON', message: 'Solicitud inválida.' } }, 400, origin);
    }
    if (!clientRequest || !ALLOWED_ACTIONS.has(String(clientRequest.action || '')) || !Array.isArray(clientRequest.args)) {
      return jsonResponse({ ok: false, error: { code: 'ACTION_NOT_ALLOWED', message: 'Operación no permitida.' } }, 400, origin);
    }
    if (!env.APPS_SCRIPT_URL || !env.APPS_SCRIPT_RELAY_SECRET) {
      return jsonResponse({ ok: false, error: { code: 'RELAY_NOT_CONFIGURED', message: 'Servicio temporalmente no disponible.' } }, 503, origin);
    }

    const upstreamUrl = `${String(env.APPS_SCRIPT_URL).replace(/\/+$/, '')}/api`;
    const upstreamPayload = {
      relaySecret: env.APPS_SCRIPT_RELAY_SECRET,
      origin,
      action: clientRequest.action,
      args: clientRequest.args,
      requestId: crypto.randomUUID()
    };
    try {
      const upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(upstreamPayload),
        redirect: 'follow'
      });
      const responseText = await upstream.text();
      const responseBody = JSON.parse(responseText);
      return jsonResponse(responseBody, upstream.ok ? 200 : 502, origin);
    } catch (error) {
      return jsonResponse({ ok: false, error: { code: 'UPSTREAM_UNAVAILABLE', message: 'No pudimos conectar con el servidor.' } }, 502, origin);
    }
  }
};

function normalizeOrigin(value) {
  const text = String(value || '').trim().replace(/\/$/, '').toLowerCase();
  return /^https:\/\/[a-z0-9.-]+(?::\d{2,5})?$/.test(text) ? text : '';
}

function preflightResponse(origin) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin),
      'Access-Control-Max-Age': '86400'
    }
  });
}

function jsonResponse(body, status, origin) {
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  };
  if (origin) Object.assign(headers, corsHeaders(origin));
  return new Response(JSON.stringify(body), { status, headers });
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}
