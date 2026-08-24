function getDemoUserDirectory_() {
  return getDataRepository_().list('USERS').map(function (user) {
    return { id: user.id, name: user.display_name, type: user.user_type, roles: parseJsonSafe_(user.roles_json, []), emailMasked: maskEmail_(user.email) };
  });
}
