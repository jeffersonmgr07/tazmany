var TAZMANY_ROLE_PERMISSIONS = Object.freeze({
  CUSTOMER: ['customer.dashboard.read', 'customer.profile.read', 'customer.profile.write', 'customer.sessions.manage'],
  MERCHANT_OWNER: ['merchant.dashboard.read', 'merchant.profile.write', 'merchant.campaigns.manage', 'merchant.users.manage', 'merchant.coupons.redeem', 'merchant.finances.read'],
  MERCHANT_ADMIN: ['merchant.dashboard.read', 'merchant.profile.write', 'merchant.campaigns.manage', 'merchant.users.manage', 'merchant.coupons.redeem'],
  CAMPAIGN_MANAGER: ['merchant.dashboard.read', 'merchant.campaigns.manage'],
  BRANCH_ADMIN: ['merchant.dashboard.read', 'merchant.coupons.redeem'],
  CASHIER: ['merchant.coupons.redeem'],
  MERCHANT_FINANCE_READ: ['merchant.dashboard.read', 'merchant.finances.read'],
  SUPERADMIN: ['*'],
  ADMIN: ['admin.*'],
  COMMERCIAL: ['admin.merchants.read', 'admin.merchants.write'],
  KYC_REVIEWER: ['admin.merchants.review'],
  MODERATOR: ['admin.campaigns.review'],
  FINANCE: ['admin.finance.*'],
  SUPPORT: ['admin.support.*', 'admin.coupons.read'],
  COMPLAINTS_MANAGER: ['admin.complaints.*'],
  AUDITOR: ['admin.audit.read']
});

function permissionsForRoles_(roles) {
  var seen = {};
  (roles || []).forEach(function (role) {
    (TAZMANY_ROLE_PERMISSIONS[String(role)] || []).forEach(function (permission) { seen[permission] = true; });
  });
  return Object.keys(seen);
}

function hasPermission_(permissions, requiredPermission) {
  return (permissions || []).some(function (permission) {
    if (permission === '*' || permission === requiredPermission) return true;
    return /\.\*$/.test(permission) && requiredPermission.indexOf(permission.slice(0, -1)) === 0;
  });
}

function requirePermission_(sessionToken, permission) {
  var context = getSessionContext_(sessionToken);
  if (!hasPermission_(context.permissions, permission)) {
    appendAuditEvent_({
      actor_user_id: context.user.id, action: 'ACCESS_DENIED', entity_type: 'PERMISSION', entity_id: permission,
      metadata_json: JSON.stringify({ roles: context.roles })
    });
    throw createPublicError_('FORBIDDEN', 'Tu cuenta no tiene permiso para realizar esta acción.');
  }
  return context;
}
