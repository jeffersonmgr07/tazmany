var TAZMANY_CONFIG = Object.freeze({
  APP_NAME: 'Tazmany',
  VERSION: '0.3.8',
  TIME_ZONE: 'America/Lima',
  CURRENCY: 'PEN',
  DEFAULT_CITY_ID: 'city-lima',
  DEFAULT_PUBLIC_LOGO_URL: 'https://jeffersonmgr07.github.io/tazmany/assets/brand/tazmany-logo.png?v=0.3.8',
  CACHE_SECONDS: 300,
  SCRIPT_PROPERTIES: Object.freeze({
    SPREADSHEET_ID: 'TAZMANY_SPREADSHEET_ID',
    DRIVE_FOLDER_ID: 'TAZMANY_DRIVE_FOLDER_ID',
    ENVIRONMENT: 'TAZMANY_ENVIRONMENT',
    LOGO_URL: 'TAZMANY_LOGO_URL',
    AUTH_PEPPER: 'TAZMANY_AUTH_PEPPER',
    GOOGLE_CLIENT_ID: 'TAZMANY_GOOGLE_CLIENT_ID',
    GOOGLE_VERIFY_MODE: 'TAZMANY_GOOGLE_VERIFY_MODE',
    GOOGLE_VERIFY_URL: 'TAZMANY_GOOGLE_VERIFY_URL',
    GOOGLE_VERIFY_RELAY_SECRET: 'TAZMANY_GOOGLE_VERIFY_RELAY_SECRET',
    API_RELAY_SECRET: 'TAZMANY_API_RELAY_SECRET',
    ALLOWED_FRONTEND_ORIGINS: 'TAZMANY_ALLOWED_FRONTEND_ORIGINS',
    SESSION_TTL_HOURS: 'TAZMANY_SESSION_TTL_HOURS',
    OTP_TTL_MINUTES: 'TAZMANY_OTP_TTL_MINUTES',
    OTP_MAX_ATTEMPTS: 'TAZMANY_OTP_MAX_ATTEMPTS',
    TERMS_VERSION: 'TAZMANY_TERMS_VERSION',
    PRIVACY_VERSION: 'TAZMANY_PRIVACY_VERSION'
  }),
  PUBLIC_VIEWS: Object.freeze(['home', 'customer', 'merchant', 'admin']),
  CAMPAIGN_PUBLIC_STATES: Object.freeze(['ACTIVA', 'PROGRAMADA', 'AGOTADA']),
  DEMO_NOTICE: 'Fase 3 cerrada, identidad oficial actualizada. Pagos y canjes permanecen desactivados hasta aprobar el diagnóstico previo a pagos.'
});

function getAppConfig_() {
  var properties = PropertiesService.getScriptProperties();
  return {
    appName: TAZMANY_CONFIG.APP_NAME,
    version: TAZMANY_CONFIG.VERSION,
    environment: properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ENVIRONMENT) || 'development',
    logoUrl: properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.LOGO_URL) || TAZMANY_CONFIG.DEFAULT_PUBLIC_LOGO_URL,
    currency: TAZMANY_CONFIG.CURRENCY,
    timeZone: TAZMANY_CONFIG.TIME_ZONE,
    demoNotice: TAZMANY_CONFIG.DEMO_NOTICE,
    auth: {
      googleClientId: properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_CLIENT_ID) || '',
      googleEnabled: Boolean(properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.GOOGLE_CLIENT_ID)),
      otpEnabled: true,
      termsVersion: properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.TERMS_VERSION) || '2026-08-24',
      privacyVersion: properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.PRIVACY_VERSION) || '2026-08-24'
    },
    club: { name: 'Club Tazmany', status: 'COMING_SOON' }
  };
}
