var TAZMANY_CONFIG = Object.freeze({
  APP_NAME: 'Tazmany',
  VERSION: '0.1.0',
  TIME_ZONE: 'America/Lima',
  CURRENCY: 'PEN',
  DEFAULT_CITY_ID: 'city-lima',
  CACHE_SECONDS: 300,
  SCRIPT_PROPERTIES: Object.freeze({
    SPREADSHEET_ID: 'TAZMANY_SPREADSHEET_ID',
    DRIVE_FOLDER_ID: 'TAZMANY_DRIVE_FOLDER_ID',
    ENVIRONMENT: 'TAZMANY_ENVIRONMENT',
    LOGO_URL: 'TAZMANY_LOGO_URL'
  }),
  PUBLIC_VIEWS: Object.freeze(['home', 'customer', 'merchant', 'admin']),
  CAMPAIGN_PUBLIC_STATES: Object.freeze(['ACTIVA', 'PROGRAMADA', 'AGOTADA']),
  DEMO_NOTICE: 'Vista demostrativa de Fase 1. No procesa pagos ni canjes.'
});

function getAppConfig_() {
  var properties = PropertiesService.getScriptProperties();
  return {
    appName: TAZMANY_CONFIG.APP_NAME,
    version: TAZMANY_CONFIG.VERSION,
    environment: properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.ENVIRONMENT) || 'development',
    logoUrl: properties.getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.LOGO_URL) || '',
    currency: TAZMANY_CONFIG.CURRENCY,
    timeZone: TAZMANY_CONFIG.TIME_ZONE,
    demoNotice: TAZMANY_CONFIG.DEMO_NOTICE
  };
}
