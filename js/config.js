/* Public client config. The anon/publishable key is SAFE to expose:
   every table is protected by Row-Level Security (see supabase/schema.sql).
   Never put the service_role or management (sbp_) key here. */
window.FZ_CONFIG = {
  url: 'https://nvqtfikmfrvwgedqluav.supabase.co',
  anon: 'sb_publishable_I-j9gjLgj6VY7XltxMghfg_fgpvyKts',
  // Web Push public key (VAPID). Generate a keypair and paste the PUBLIC key here;
  // keep the PRIVATE key as a Supabase secret (see supabase/functions/send-reminders).
  // Empty = push disabled (in-app/local notifications still work). Setup: REMINDERS.md
  vapidPublic: ''
};
