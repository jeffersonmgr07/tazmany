import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import relay from '../../worker/tazmany-api-relay.js';

test('Apps Script gateway uses a trusted relay and an explicit action allowlist', () => {
  const source = fs.readFileSync(new URL('../../src/FrontendApiGateway.gs', import.meta.url), 'utf8');
  assert.match(source, /constantTimeEquals_\(request\.relaySecret, expectedSecret\)/);
  assert.match(source, /TAZMANY_FRONTEND_API_ACTIONS_/);
  assert.match(source, /FRONTEND_ORIGIN_NOT_ALLOWED/);
  assert.doesNotMatch(source, /eval\s*\(|this\s*\[/);
});

test('relay rejects a browser origin that is not allowed', async () => {
  const response = await relay.fetch(new Request('https://relay.example/api', {
    method: 'POST',
    headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'apiGetPublicBootstrap', args: [] })
  }), {
    ALLOWED_ORIGINS: 'https://tazmany.com,https://www.tazmany.com,https://jeffersonmgr07.github.io',
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/example/exec',
    APPS_SCRIPT_RELAY_SECRET: 'a'.repeat(64)
  });
  assert.equal(response.status, 403);
});

test('relay forwards only the allowlisted action and keeps the shared secret server-side', async () => {
  const originalFetch = globalThis.fetch;
  let forwarded;
  globalThis.fetch = async (url, options) => {
    forwarded = { url, options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ ok: true, data: { connected: true } }), { status: 200 });
  };
  try {
    const response = await relay.fetch(new Request('https://relay.example/api', {
      method: 'POST',
      headers: { Origin: 'https://tazmany.com', 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'apiGetPublicBootstrap', args: [] })
    }), {
      ALLOWED_ORIGINS: 'https://tazmany.com,https://www.tazmany.com,https://jeffersonmgr07.github.io',
      APPS_SCRIPT_URL: 'https://script.google.com/macros/s/example/exec',
      APPS_SCRIPT_RELAY_SECRET: 's'.repeat(64)
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://tazmany.com');
    assert.equal(forwarded.url, 'https://script.google.com/macros/s/example/exec/api');
    assert.equal(forwarded.body.action, 'apiGetPublicBootstrap');
    assert.equal(forwarded.body.relaySecret, 's'.repeat(64));
    assert.equal(forwarded.body.origin, 'https://tazmany.com');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('relay blocks a function name outside its action allowlist', async () => {
  const response = await relay.fetch(new Request('https://relay.example/api', {
    method: 'POST',
    headers: { Origin: 'https://tazmany.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'setupTazmany', args: [] })
  }), {
    ALLOWED_ORIGINS: 'https://tazmany.com,https://www.tazmany.com,https://jeffersonmgr07.github.io',
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/example/exec',
    APPS_SCRIPT_RELAY_SECRET: 's'.repeat(64)
  });
  assert.equal(response.status, 400);
});
