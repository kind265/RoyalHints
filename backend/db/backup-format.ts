export const BACKUP_FORMAT = 'royal-hints-database-backup';
export const BACKUP_VERSION = 1;
export const BACKUP_TABLES = [
  'products',
  'business_posts',
  'shipments',
  'rh_pending_checkout_orders',
  'quotations',
  'bespoke_requests',
  'users',
  'rh_user_carts',
  'rh_photo_history',
  'rh_notification_reads',
  'rh_item_subscribers',
  'rh_login_history'
] as const;
