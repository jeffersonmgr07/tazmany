function requestEmailOtp_(email, deviceLabel) {
  email = normalizeEmail_(email);
  var properties = PropertiesService.getScriptProperties();
  var ttlMinutes = Number(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.OTP_TTL_MINUTES) || 10);
  var maxAttempts = Number(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.OTP_MAX_ATTEMPTS) || 5);
  var nowMs = Date.now();
  var recent = getDataRepository_().list('OTP_CHALLENGES').filter(function (item) {
    return item.email === email && nowMs - new Date(item.created_at).getTime() < 60 * 60 * 1000;
  });
  if (recent.some(function (item) { return nowMs - new Date(item.created_at).getTime() < 60 * 1000; })) {
    throw createPublicError_('OTP_TOO_SOON', 'Espera un minuto antes de solicitar otro código.');
  }
  if (recent.length >= 5) throw createPublicError_('OTP_RATE_LIMIT', 'Alcanzaste el límite temporal de códigos. Inténtalo más tarde.');
  if (MailApp.getRemainingDailyQuota() < 1) throw createPublicError_('OTP_MAIL_QUOTA', 'El servicio de correo alcanzó su límite diario. Inténtalo más tarde.');

  var challengeId = Utilities.getUuid();
  var code = generateOtpCode_();
  var now = nowIso_();
  var challenge = {
    id: challengeId, email: email, code_hash: hashOtpCode_(challengeId, email, code), attempts: 0,
    max_attempts: maxAttempts, expires_at: minutesFromNowIso_(ttlMinutes), consumed_at: '',
    device_label: sanitizePlainText_(deviceLabel || 'Navegador web', 80), created_at: now, updated_at: now,
    status: 'ACTIVE', version: 1
  };
  getDataRepository_().upsert('OTP_CHALLENGES', [challenge]);
  try {
    MailApp.sendEmail({
      to: email,
      subject: code + ' es tu código para ingresar a Tazmany',
      name: 'Tazmany',
      body: 'Tu código de acceso a Tazmany es ' + code + '. Vence en ' + ttlMinutes + ' minutos. Si no lo solicitaste, ignora este mensaje.',
      htmlBody: '<div style="font-family:Arial,sans-serif;color:#182635;max-width:520px;margin:auto">' +
        '<div style="background:#F2B705;padding:18px 24px;border-radius:16px 16px 0 0"><b style="font-size:24px">Tazmany</b></div>' +
        '<div style="border:1px solid #E7DFB9;border-top:0;padding:28px 24px;border-radius:0 0 16px 16px">' +
        '<h2 style="margin-top:0">Tu código de acceso</h2><p>Úsalo para iniciar sesión. Vence en ' + ttlMinutes + ' minutos.</p>' +
        '<p style="font-size:34px;letter-spacing:8px;font-weight:700;margin:24px 0">' + code + '</p>' +
        '<p style="color:#5E6673">Si no solicitaste este código, puedes ignorar este mensaje.</p></div></div>'
    });
  } catch (error) {
    challenge.status = 'FAILED'; challenge.updated_at = nowIso_(); challenge.version += 1;
    getDataRepository_().upsert('OTP_CHALLENGES', [challenge]);
    throw createPublicError_('OTP_SEND_FAILED', 'No pudimos enviar el código. Inténtalo nuevamente.');
  }
  return { challengeId: challengeId, emailMasked: maskEmail_(email), expiresInSeconds: ttlMinutes * 60 };
}

function verifyEmailOtp_(email, challengeId, code, deviceLabel) {
  email = normalizeEmail_(email);
  assertSafeId_(challengeId, 'challengeId');
  code = String(code || '').replace(/\D/g, '');
  if (!/^\d{6}$/.test(code)) throw createPublicError_('INVALID_OTP_FORMAT', 'Ingresa los 6 dígitos del código.');
  var repository = getDataRepository_();
  var challenge = repository.findById('OTP_CHALLENGES', challengeId);
  if (!challenge || challenge.email !== email) throw createPublicError_('OTP_NOT_FOUND', 'No encontramos ese código. Solicita uno nuevo.');
  if (challenge.status !== 'ACTIVE' || challenge.consumed_at) throw createPublicError_('OTP_ALREADY_USED', 'Ese código ya fue utilizado. Solicita uno nuevo.');
  if (new Date(challenge.expires_at).getTime() <= Date.now()) {
    challenge.status = 'EXPIRED'; challenge.updated_at = nowIso_(); challenge.version = Number(challenge.version || 0) + 1;
    repository.upsert('OTP_CHALLENGES', [challenge]);
    throw createPublicError_('OTP_EXPIRED', 'El código venció. Solicita uno nuevo.');
  }
  challenge.attempts = Number(challenge.attempts || 0) + 1;
  challenge.updated_at = nowIso_();
  challenge.version = Number(challenge.version || 0) + 1;
  if (!constantTimeEquals_(challenge.code_hash, hashOtpCode_(challenge.id, email, code))) {
    if (challenge.attempts >= Number(challenge.max_attempts || 5)) challenge.status = 'BLOCKED';
    repository.upsert('OTP_CHALLENGES', [challenge]);
    throw createPublicError_('INVALID_OTP', challenge.status === 'BLOCKED' ? 'Código bloqueado por demasiados intentos.' : 'El código no coincide. Revísalo e inténtalo otra vez.');
  }
  challenge.consumed_at = nowIso_();
  challenge.status = 'CONSUMED';
  repository.upsert('OTP_CHALLENGES', [challenge]);
  var user = findOrCreateCustomerUser_(email, email.split('@')[0]);
  user.email_verified = true;
  user.last_login_at = nowIso_();
  user.updated_at = nowIso_();
  user.version = Number(user.version || 0) + 1;
  repository.upsert('USERS', [user]);
  var session = createSessionForUser_(user, deviceLabel);
  appendAuditEvent_({ actor_user_id: user.id, action: 'LOGIN_OTP_SUCCESS', entity_type: 'USER', entity_id: user.id });
  return buildAuthResponse_(user, { id: session.sessionId, expires_at: session.expiresAt }, 'EMAIL_OTP', session.sessionToken);
}

function generateOtpCode_() {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + '|' + Utilities.getUuid());
  var number = 0;
  for (var index = 0; index < 4; index += 1) number = (number * 256 + (bytes[index] & 255)) >>> 0;
  return String(100000 + (number % 900000));
}

function hashOtpCode_(challengeId, email, code) {
  return hashSecret_('otp', challengeId + '|' + email + '|' + code);
}
