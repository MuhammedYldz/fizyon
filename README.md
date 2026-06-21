# Fizyon — Egzersizini kanıtla

Fizyoterapi ev egzersiz programı: fizyoterapist program verir ve hareketi kaydeder, hasta evde
yapar, **canlı kamerayla kanıtlar** (cihaz üstünde poz algılama), uyum hekime senkronlanır.

A physiotherapy home-exercise app. The doctor prescribes/records exercises with notes and a
"verification move"; the patient does them at home with a timer and **proves completion via
on-device camera pose detection**, reports "couldn't do because…", and the doctor sees adherence
analytics. Turkish-first, built to beat clunky incumbents on patient engagement.

## Çalıştırma (run locally)

```bash
python3 -m http.server 5599
# open http://localhost:5599
```

It's an installable **PWA** — open on a phone and "Add to Home Screen".

## Demo girişi
Açılışta **Giriş yap** → rol seç (Fizyoterapist / Hasta). Veriler tarayıcıda saklanır (demo).

## Teknoloji
- Vanilla JS SPA (no build step) · Chart.js · Tabler icons · MediaPipe Tasks Vision (poz algılama)
- Installable PWA (manifest + service worker)
- Tasarım sistemi: [`DESIGN.md`](DESIGN.md) · yol haritası: [`ROADMAP.md`](ROADMAP.md)

## Durum
Demo / prototip. Backend, gerçek kimlik doğrulama ve KVKK uyumlu veri katmanı planlanıyor
(bkz. `DESIGN.md` §5). Şu an tüm veriler yereldir.
