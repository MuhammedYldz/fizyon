# Hatırlatmalar — Push & E-posta kurulumu

Uygulama tarafı **hazır**: hasta "Telefon bildirimine izin ver" dediğinde tarayıcı push aboneliği
oluşur ve `push_subscriptions` tablosuna yazılır; service worker (`sw.js`) push + tıklama olaylarını
karşılar. Geriye **3 hesap-bağlı adım** kalıyor (kod değil, senin yapacağın):

## 1) VAPID anahtarı üret (Web Push)
```bash
npx web-push generate-vapid-keys
```
- **Public key** → `js/config.js` içindeki `vapidPublic` alanına yapıştır.
- **Private key** → Supabase secret olarak sakla (asla commit etme).

## 2) Edge Function'ı yayınla
```bash
supabase functions deploy send-reminders --no-verify-jwt
supabase secrets set \
  VAPID_PUBLIC_KEY="BPUBLIC..." \
  VAPID_PRIVATE_KEY="PRIVATE..." \
  VAPID_SUBJECT="mailto:sen@fizyon.net" \
  RESEND_API_KEY="re_..."           \  # e-posta için (opsiyonel; yoksa sadece push)
  SEND_FROM="Fizyon <hatirlatma@fizyon.net>"
```
`SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` otomatik gelir.

## 3) Saatlik çalıştır (zamanlama)
Supabase Dashboard → **Edge Functions → Schedules** ile `send-reminders` fonksiyonunu
`0 * * * *` (her saat başı) cron ile tetikle. Alternatif (pg_cron + pg_net):
```sql
select cron.schedule('fizyon-reminders', '0 * * * *', $$
  select net.http_post(
    url := 'https://nvqtfikmfrvwgedqluav.functions.supabase.co/send-reminders',
    headers := jsonb_build_object('Content-Type','application/json')
  );
$$);
```
Fonksiyon, o saatte hatırlatma saati gelen ve **bugün egzersizini bitirmemiş** hastalara push
(+ varsa e-posta) gönderir. Saat dilimi `Europe/Istanbul`.

## E-posta / SMTP (Supabase Auth — kayıt & doğrulama postaları)
Hatırlatma e-postaları yukarıdaki fonksiyon + Resend ile gider. Ayrıca **kayıt/doğrulama**
e-postaları için Supabase Auth'un kendi SMTP'sini ayarla (ücretsiz katmanda da çalışır):
Dashboard → **Authentication → Emails → SMTP Settings** → kendi SMTP'ni gir (örn. Resend/Brevo/
kendi alan adın). Sonra **Email confirmation**'ı tekrar **aç** (`fizyon-project` notu: launch öncesi).

## Test
- Tarayıcıda hasta hesabıyla bildirime izin ver → `push_subscriptions` tablosunda satır oluşmalı.
- Fonksiyonu elle çağır: `curl -X POST https://nvqtfikmfrvwgedqluav.functions.supabase.co/send-reminders`
  → JSON `{ ok:true, sent:N }` döner; izin verdiğin cihaza bildirim düşer.

> Not: VAPID public key boşsa push devre dışıdır ama **uygulama içi/yerel** bildirimler
> (izin + zamanında yerel `Notification`) yine çalışır.
