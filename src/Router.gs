function getRequestedView_(e) {
  var candidate = e && e.parameter && e.parameter.view ? String(e.parameter.view).toLowerCase() : 'home';
  return TAZMANY_CONFIG.PUBLIC_VIEWS.indexOf(candidate) >= 0 ? candidate : 'home';
}
