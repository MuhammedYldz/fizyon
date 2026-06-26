/* Fizyon app core, vanilla SPA: state, router, screens. */
(function () {
  const app = document.getElementById('app');
  const S = window.FZ;
  let stack = ['welcome'];       // navigation stack
  let params = {};               // current route params
  let session = null;            // guided session: { ids:[exerciseId], i }

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = app) => root.querySelector(sel);
  const $$ = (sel, root = app) => [...root.querySelectorAll(sel)];
  const CUES = { squat: 'Yavaşça çök, sonra kalk', legraise: 'Bacağını düz kaldır, yavaşça indir', balance: 'Tek ayak üstünde sabit dur', bridge: 'Kalçanı yukarı kaldır, indir', shoulder: 'Kolunu kontrollü hareket ettir', generic: 'Yavaş ve kontrollü hareket et' };
  const cueFor = (demo) => CUES[demo] || CUES.generic;
  const targetText = (e) => (e.reps > 1 ? e.reps + ' tekrar' : (e.hold || 5) + ' sn dur');
  /* daily session tracking: a "session" = one full run of an exercise (all sets),
     proven once. An exercise is done for the day after `freq` sessions. */
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const sessionsOf = (p, exId, date) => (p.sessions || []).filter(s => s.exId === exId && (!date || s.date === date));
  const sessionsToday = (p, exId) => sessionsOf(p, exId, todayStr()).length;
  const isDoneToday = (p, e) => sessionsToday(p, e.id) >= (e.freq || 1);
  const uiGet = (k) => { try { return localStorage.getItem('fizyon.ui.' + k) === '1'; } catch { return false; } };
  const uiSet = (k, v) => { try { localStorage.setItem('fizyon.ui.' + k, v ? '1' : '0'); } catch {} };
  /* completion integrity: a session's method is 'camera' (CV-attested), 'manual' (self-confirmed,
     no camera) or 'none' (completed without proof). `verified` === camera-attested only. */
  const camVerifiedToday = (p, exId) => sessionsOf(p, exId, todayStr()).some(s => s.verified);
  /* Derive adherence / 7-day history / streak from REAL sessions — never hardcoded. Patients with
     no assigned program keep their existing values (illustrative placeholders only). */
  function recomputeStats(p) {
    p.journeyStage = (p.week <= 2) ? 0 : (p.week <= 5) ? 1 : (p.week <= 9) ? 2 : (p.week <= 14) ? 3 : 4; // recovery phase from clinical week
    const prog = p.program || [];
    if (!prog.length) return;
    const iso = (d) => d.toISOString().slice(0, 10);
    const now = new Date(); const hist = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i);
      const done = prog.filter(e => sessionsOf(p, e.id, iso(d)).length >= (e.freq || 1)).length;
      hist.push(Math.round(done / prog.length * 100)); }
    p.history = hist;
    p.adherence = Math.round(hist.reduce((a, b) => a + b, 0) / 7);
    let streak = 0;
    for (let i = 0; i < 120; i++) { const d = new Date(now); d.setDate(now.getDate() - i);
      const active = prog.some(e => sessionsOf(p, e.id, iso(d)).length > 0);
      if (active) streak++; else if (i > 0) break; }
    p.streak = streak;
  }
  function recomputeAll() { const st = S.get(); if (st && st.patients) st.patients.forEach(recomputeStats); }

  function go(route, p = {}) { params = p; stack.push(route); render(); }
  function replace(route, p = {}) { params = p; stack[stack.length - 1] = route; render(); }
  function back() { if (stack.length > 1) { stack.pop(); render(); } }
  function home() { const st = S.get(); stack = [st.session.role === 'doctor' ? 'd_patients' : 'p_today']; render(); }
  function sessionAdvance() {
    if (!session) { home(); return; }
    session.i++;
    if (session.i >= session.ids.length) { session = null; stack = ['p_done']; render(); return; }
    replace('p_exercise', { eid: session.ids[session.i], session: true });
  }

  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
  }
  function adherenceColor(a) { return a >= 70 ? 'teal' : a >= 40 ? 'warn' : 'danger'; }

  function appbar(title, opts = {}) {
    return `<div class="appbar">
      ${opts.back ? `<button class="back" data-act="back" aria-label="Geri"><i class="ti ti-arrow-left"></i></button>` : ''}
      <h2>${esc(title)}</h2>
      ${opts.right || ''}
    </div>`;
  }

  function tabbar(active, role) {
    const tabs = role === 'doctor'
      ? [['d_patients', 'ti-users', 'Hastalar'], ['d_analytics', 'ti-chart-line', 'Analiz'], ['d_notifs', 'ti-bell', 'Bildirim'], ['d_profile', 'ti-user', 'Profil']]
      : [['p_today', 'ti-checkbox', 'Bugün'], ['p_journey', 'ti-map-2', 'Yolculuk'], ['p_profile', 'ti-user', 'Profil']];
    return `<nav class="tabbar"><div class="tabwrap">${tabs.map(([r, i, l]) =>
      `<button data-nav="${r}" class="${active === r ? 'on' : ''}" aria-label="${l}"><i class="ti ${i}"></i><span class="lbl">${l}</span></button>`).join('')}</div></nav>`;
  }

  /* ---------- screens ---------- */
  const screens = {
    /* Onboarding */
    welcome() {
      return `<section class="screen welcome-hero fade">
        <div class="wh-arc" aria-hidden="true">
          <svg viewBox="0 0 240 168">
            <path class="wh-track" d="M28 150 A 110 110 0 0 1 212 150"/>
            <path class="wh-fill" d="M28 150 A 110 110 0 0 1 212 150"/>
            <circle class="wh-dot" r="7"><animateMotion dur="1.7s" begin="0.25s" fill="freeze" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" path="M28 150 A 110 110 0 0 1 212 150"/></circle>
          </svg>
          <span class="wh-logo"><img src="assets/logo.svg" width="56" height="56" alt=""></span>
        </div>
        <h1 class="wh-title">Hareketi geri kazan.</h1>
        <p class="wh-sub">Fizyoterapistinin ev programını yap, <b>kamerayla kanıtla</b>, iyileşmeni gör.</p>
        <div class="wh-cta">
          <button class="btn btn-primary" data-go="reg_type">Üye ol</button>
          <button class="btn btn-secondary" data-go="login">Giriş yap</button>
          <button class="btn-ghost" data-go="demo_pick" style="margin:2px auto 0"><i class="ti ti-eye"></i> Demo olarak gez</button>
        </div>
        <div class="wh-trust"><i class="ti ti-lock" style="vertical-align:-2px"></i> Sağlık verilerin KVKK kapsamında, cihazında işlenir</div>
      </section>`;
    },

    reg_type() {
      return `${appbar('Nasıl kayıt olmak istersin?', { back: true })}
      <section class="screen">
        <p class="muted" style="margin-bottom:18px">İki seçenek de güvenli. İstediğini seç.</p>
        <div class="stack">
          <button class="option" data-reg="email">
            <span class="oi"><i class="ti ti-mail"></i></span>
            <span><span class="ot">E-posta ile</span><br><span class="od">E-posta adresin ve bir parola ile hızlıca başla.</span></span>
          </button>
          <button class="option" data-reg="phone">
            <span class="oi"><i class="ti ti-device-mobile-message"></i></span>
            <span><span class="ot">Telefon (SMS kodu) ile</span><br><span class="od">Numaranı doğrula, parola yok, daha az uğraş.</span></span>
          </button>
        </div>
        <p class="hint center mt24"><i class="ti ti-lock" style="vertical-align:-2px"></i> Sağlık verilerin KVKK kapsamında korunur.</p>
      </section>`;
    },

    reg_form() {
      const phone = params.type === 'phone';
      return `${appbar('Hesap oluştur', { back: true })}
      <section class="screen">
        <div class="field">
          <label>Rolün</label>
          <div class="row gap8">
            <button class="chip on" data-role-pick="patient">Hasta</button>
            <button class="chip" data-role-pick="doctor">Fizyoterapist</button>
          </div>
        </div>
        <div class="field"><label for="rn">Ad soyad</label><input class="input" id="rn" autocomplete="name" placeholder="Adın"></div>
        ${phone
          ? `<div class="field"><label for="rp">Telefon</label><input class="input" id="rp" inputmode="tel" placeholder="05XX XXX XX XX"></div>`
          : `<div class="field"><label for="re">E-posta</label><input class="input" id="re" inputmode="email" autocomplete="email" placeholder="ornek@eposta.com"></div>
             <div class="field"><label for="rpw">Parola</label><input class="input" id="rpw" type="password" autocomplete="new-password" placeholder="En az 8 karakter"></div>`}
        <div id="docLic" class="field" hidden><label for="rl">Fizyoterapist lisans no</label><input class="input" id="rl" placeholder="TR-FT-XXXXX"><p class="hint mt8">Profesyonel hesaplar doğrulanır.</p></div>
        <div id="patLink" class="field"><label for="rdc">Fizyoterapist kodu (varsa)</label><input class="input" id="rdc" placeholder="örn. A1B2C3" style="text-transform:uppercase"><p class="hint mt8">Fizyoterapistinin verdiği kod. Daha sonra da bağlanabilirsin.</p></div>
        <label class="row gap8" style="align-items:flex-start;cursor:pointer;margin:6px 0 14px">
          <input type="checkbox" id="consentHealth" style="width:20px;height:20px;margin-top:2px;flex-shrink:0;accent-color:var(--teal-600)">
          <span style="font-size:13px;color:var(--ink-700)">Sağlık verilerimin tedavi takibi amacıyla işlenmesine <b>açık rıza</b> veriyorum ve <a href="privacy.html" target="_blank" style="color:var(--teal-600)">Gizlilik Politikası</a> ile <a href="terms.html" target="_blank" style="color:var(--teal-600)">Kullanım Koşulları</a>'nı okudum.</span>
        </label>
        <div class="err-msg" id="regErr" hidden></div>
        <button class="btn btn-primary mt8" data-act="register">Devam et</button>
      </section>`;
    },

    login() {
      return `${appbar('Giriş yap', { back: true })}
      <section class="screen">
        <p class="muted" style="margin-bottom:18px">Hesabınla giriş yap.</p>
        <div class="field"><label for="liEmail">E-posta</label><input class="input" id="liEmail" inputmode="email" autocomplete="email" placeholder="ornek@eposta.com"></div>
        <div class="field"><label for="liPw">Parola</label><input class="input" id="liPw" type="password" autocomplete="current-password" placeholder="Parolan"></div>
        <div class="err-msg" id="liErr" hidden></div>
        <button class="btn btn-primary mt8" data-act="dologin">Giriş yap</button>
        <p class="hint center mt16">Hesabın yok mu? <a href="#" data-go="reg_type" style="color:var(--teal-600)">Üye ol</a></p>
      </section>`;
    },

    demo_pick() {
      return `${appbar('Demo', { back: true })}
      <section class="screen">
        <div class="card" style="background:var(--warn-bg);border-color:transparent;margin-bottom:16px"><p style="color:var(--warn);font-size:14px;margin:0"><i class="ti ti-flask"></i> Demo modu, örnek verilerle gezinirsin, gerçek hesap oluşmaz.</p></div>
        <div class="stack">
          <button class="option" data-act="demo-doctor">
            <span class="oi"><i class="ti ti-stethoscope"></i></span>
            <span><span class="ot">Fizyoterapist olarak gez</span><br><span class="od">Hastalar, program, analiz ve bildirimler.</span></span>
          </button>
          <button class="option" data-act="demo-patient">
            <span class="oi"><i class="ti ti-walk"></i></span>
            <span><span class="ot">Hasta olarak gez</span><br><span class="od">Bugünün programı, kamera kanıtı, yolculuk.</span></span>
          </button>
        </div>
      </section>`;
    },

    reg_done() {
      return `${appbar('E-postanı doğrula', { back: true })}
        <section class="screen center" style="padding-top:36px">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--teal-50);color:var(--teal-600);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><i class="ti ti-mail-check" style="font-size:32px"></i></div>
          <h2>Son bir adım</h2>
          <p class="muted mt8"><b>${esc(params.email || '')}</b> adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıkladıktan sonra giriş yapabilirsin.</p>
          <button class="btn btn-primary mt24" data-go="login" style="max-width:240px;margin:24px auto 0">Giriş yap</button>
          <button class="btn-ghost mt16" data-go="welcome" style="display:block;margin:16px auto 0">Başa dön</button>
        </section>`;
    },

    /* Doctor */
    d_patients() {
      const st = S.get();
      const needs = (p) => p.adherence < 50 || (p.couldnt && p.couldnt.length > 0);
      // Consistent triage: EVERY row shows adherence % AND the reason (if any), so the
      // physiotherapist can compare patients at a glance.
      const reasonChip = (p) => (p.couldnt && p.couldnt.length) ? `<span class="badge warn"><i class="ti ti-message-2"></i> ${esc(p.couldnt[0].reason || 'geri bildirim')}</span>` : '';
      const card = (p) => `
        <button class="pt-row" data-patient="${p.id}">
          <span class="avatar">${esc(p.initials)}</span>
          <span class="pt-id"><span class="pt-name">${esc(p.name)}</span><span class="hint pt-cond">${esc(p.condition)} · ${p.week}. hafta</span></span>
          <span class="pt-meta"><span class="badge ${adherenceColor(p.adherence)}">%${p.adherence} uyum</span>${reasonChip(p)}</span>
          <i class="ti ti-chevron-right pt-chev"></i>
        </button>`;
      const attention = st.patients.filter(needs);
      const others = st.patients.filter(p => !needs(p));
      return `<div class="appbar"><div class="brand"><img src="assets/logo.svg" alt="">Fizyon</div><div class="spacer"></div><span class="hint">${esc(st.doctor.name)}</span></div>
        <section class="screen">
          <div class="row between" style="margin-bottom:16px">
            <div class="row gap8"><h1>Hastalarım</h1><span class="badge teal">${st.patients.length}</span></div>
            ${st.patients.length ? `<button class="btn btn-primary sm" data-act="new-patient"><i class="ti ti-plus"></i> Yeni hasta</button>` : ''}
          </div>
          ${attention.length ? `<h3 style="margin-bottom:8px;color:var(--warn)"><i class="ti ti-alert-triangle" style="vertical-align:-2px"></i> Dikkat gerekenler (${attention.length})</h3>
            <div class="card flush" style="border-color:var(--warn-border);margin-bottom:18px">${attention.map(card).join('')}</div>` : ''}
          ${others.length ? `<h3 style="margin-bottom:8px">${attention.length ? 'Diğer hastalar' : 'Hastalar'}</h3><div class="card flush">${others.map(card).join('')}</div>` : ''}
          ${!st.patients.length ? '<div class="card center" style="padding:40px 20px"><i class="ti ti-user-plus" style="font-size:40px;color:var(--ink-300)"></i><div style="font-weight:700;margin-top:14px">Henüz hasta yok</div><p class="hint" style="margin-top:4px;margin-bottom:16px">Kodunu paylaşıp ilk hastanı davet et.</p><button class="btn btn-primary" data-act="new-patient" style="max-width:240px;margin:0 auto"><i class="ti ti-plus"></i> Hasta ekle</button></div>' : ''}
        </section>
        ${tabbar('d_patients', 'doctor')}`;
    },

    d_patient() {
      const p = S.patient(params.id); if (!p) { return screens.d_patients(); }
      const painBadge = (c) => (c.pain != null) ? ` <span class="badge ${c.pain >= 7 ? 'danger' : c.pain >= 4 ? 'warn' : 'teal'}"><i class="ti ti-activity"></i> Ağrı ${c.pain}/10</span>` : '';
      const couldnt = p.couldnt.length ? p.couldnt.map(c => `<div class="card" style="border-color:var(--warn)"><div class="row gap8" style="flex-wrap:wrap"><span class="badge warn"><i class="ti ti-message-2"></i> ${esc(c.reason || 'Geri bildirim')}</span>${painBadge(c)}</div>${c.text ? `<p class="mt8">${esc(c.text)}</p>` : ''}</div>`).join('') : '<p class="hint">Henüz bildirim yok.</p>';
      return `${appbar(p.name, { back: true, right: `<button class="icon-btn" data-act="patient-notif" aria-label="Bildirim ayarı"><i class="ti ti-bell"></i></button>` })}
        <section class="screen">
          <div class="detail-head">
            <span class="avatar lg">${esc(p.initials)}</span>
            <div style="flex:1">
              <div class="hint" style="font-size:15px">${esc(p.condition)} · ${p.week}. hafta <button class="btn-ghost" data-act="edit-clinical" data-id="${p.id}" style="padding:4px;font-size:13px" aria-label="Durumu düzenle"><i class="ti ti-pencil"></i></button></div>
              <div class="mt8 row gap8" style="flex-wrap:wrap"><span class="badge ${adherenceColor(p.adherence)}">%${p.adherence} uyum</span> <span class="badge coral"><i class="ti ti-flame"></i> ${p.streak} gün seri</span></div>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-main">
              <h3 style="margin-bottom:8px">Son 7 gün</h3>
              <div class="card"><div style="position:relative;height:160px"><canvas id="adChart"></canvas></div></div>

              <div class="row between" style="margin:18px 0 8px"><h3>Program</h3><button class="btn btn-primary sm" data-act="build" data-id="${p.id}"><i class="ti ti-pencil"></i> Düzenle</button></div>
              ${p.program.length ? p.program.map(e => {
                const need = e.freq || 1, dc = sessionsToday(p, e.id), ok = dc >= need, nv = sessionsOf(p, e.id, '').filter(s => s.date === todayStr() && !s.verified).length;
                return `<div class="card"><div class="row between"><div><div style="font-weight:600">${esc(e.name)}</div><div class="hint">${e.reps}×${e.sets}${e.hold ? ' · ' + e.hold + ' sn' : ''} · günde ${need} kez</div></div><span class="badge ${ok ? 'teal' : 'neutral'}">${dc}/${need} bugün</span></div>${e.verify ? `<div class="badge teal mt8"><i class="ti ti-shield-check"></i> Kanıt: ${esc(e.verify)}</div>` : ''}${nv ? `<div class="badge warn mt8"><i class="ti ti-shield-off"></i> Bugün ${nv} kez kanıtsız</div>` : ''}</div>`;
              }).join('') : '<p class="hint">Henüz program yok. "Düzenle" ile ekle.</p>'}
            </div>

            <div class="detail-side">
              <div class="row between" style="margin-bottom:8px"><h3>Geri bildirim</h3><button class="btn btn-primary sm" data-act="reply-note" data-id="${p.id}"><i class="ti ti-message-plus"></i> Not gönder</button></div>
              ${couldnt}
              ${p.note ? `<div class="card mt8" style="background:var(--teal-50);border-color:var(--teal-100)"><span class="caption" style="color:var(--teal-600)"><i class="ti ti-send"></i> Hastaya gönderdiğin not</span><p class="mt8" style="color:var(--teal-700)">${esc(p.note)}</p></div>` : ''}

              <h3 style="margin:18px 0 8px">Randevu</h3>
              <button class="list-item card" data-act="edit-appt" data-id="${p.id}" style="border-radius:var(--r-lg)"><div style="flex:1"><div class="caption">Sonraki randevu</div><div style="font-weight:600">${esc(p.nextAppt)}</div></div><i class="ti ti-calendar-event" style="font-size:24px;color:var(--teal-600)"></i></button>
            </div>
          </div>
        </section>
        ${tabbar('d_patients', 'doctor')}`;
    },

    d_build() {
      const p = S.patient(params.id); if (!p) return screens.d_patients();
      const list = p.program.map(e => `
        <div class="card ex-card">
          <div class="row between" style="gap:10px">
            <button class="row ex-edit" data-act="edit-ex" data-eid="${e.id}" style="flex:1;gap:12px"><span class="pv">${fzDemo(e.demo)}</span>
              <span style="min-width:0"><span style="font-weight:600">${esc(e.name)}</span><br><span class="hint">${e.reps}×${e.sets}${e.hold ? ' · ' + e.hold + ' sn' : ''} · günde ${e.freq || 1} kez</span></span></button>
            <button class="icon-btn ex-del" data-act="del-ex-ask" data-eid="${e.id}" aria-label="${esc(e.name)} sil"><i class="ti ti-trash"></i></button>
          </div>${e.verify ? `<div class="badge teal mt8"><i class="ti ti-shield-check"></i> Kanıt: ${esc(e.verify)}</div>` : ''}
        </div>`).join('');
      return `${appbar(p.name + ' · program', { back: true, right: `<span class="hint" style="font-size:13px"><i class="ti ti-device-floppy" style="vertical-align:-2px"></i> otomatik kayıt</span>` })}
        <section class="screen">
          <div class="builder-toolbar">
            <button class="btn btn-primary sm" data-act="open-protocols" data-id="${p.id}"><i class="ti ti-stack-2"></i> Hazır program</button>
            <button class="btn btn-secondary sm" data-act="open-library" data-id="${p.id}"><i class="ti ti-list-search"></i> Tek hareket</button>
            <button class="btn btn-secondary sm" data-act="record-own" data-id="${p.id}"><i class="ti ti-video"></i> Video kaydet</button>
          </div>
          ${p.program.length ? `<div class="builder-grid">${list}</div>`
            : '<div class="card center" style="padding:44px 20px"><i class="ti ti-stretching" style="font-size:40px;color:var(--ink-300)"></i><div style="font-weight:700;margin-top:14px">Henüz hareket yok</div><p class="hint" style="margin-top:4px">Yukarıdan hazır program uygula ya da tek tek ekle.</p></div>'}
        </section>
        ${tabbar('d_patients', 'doctor')}`;
    },

    d_newpatient() {
      return `${appbar('Yeni hasta', { back: true })}
        <section class="screen">
          <p class="muted" style="margin-bottom:16px">Birkaç bilgiyle başla, programı sonra eklersin.</p>
          <div class="field"><label for="npName">Ad soyad</label><input class="input" id="npName" placeholder="Hasta adı" autocomplete="off"></div>
          <div class="field"><label for="npCond">Durum / bölge</label><input class="input" id="npCond" placeholder="Örn. Sol diz, menisküs"></div>
          <div class="field"><label for="npWeek">Tedavi haftası</label><input class="input" id="npWeek" type="number" value="1" min="1" inputmode="numeric"></div>
          <div class="err-msg" id="npErr" hidden></div>
          <button class="btn btn-primary mt8" data-act="create-patient"><i class="ti ti-check"></i> Hasta oluştur</button>
        </section>
        ${tabbar('d_patients', 'doctor')}`;
    },

    d_analytics() {
      const st = S.get();
      const avg = Math.round(st.patients.reduce((s, p) => s + p.adherence, 0) / st.patients.length);
      const atRisk = st.patients.filter(p => p.adherence < 50).length;
      return `${appbar('Analiz')}
        <section class="screen">
          <div class="num-row" style="margin-bottom:12px">
            <div class="stat" style="flex:1"><div class="l">Ortalama uyum</div><div class="v">%${avg}</div></div>
            <div class="stat" style="flex:1"><div class="l">Risk altında</div><div class="v" style="color:var(--warn)">${atRisk}</div></div>
          </div>
          <div class="chart-grid">
            <div class="card"><h3 style="margin-bottom:10px">Hasta uyum karşılaştırması</h3><div style="position:relative;height:200px"><canvas id="cmpChart"></canvas></div></div>
            <div class="card"><h3 style="margin-bottom:10px">Haftalık trend</h3><div style="position:relative;height:200px"><canvas id="trendChart"></canvas></div></div>
          </div>
        </section>
        ${tabbar('d_analytics', 'doctor')}`;
    },
    d_notifs() {
      const st = S.get(); const n = st.settings.notif;
      const chTog = (k, l) => `<div class="row between" style="margin-bottom:12px"><span>${l}</span><button class="switch" role="switch" aria-checked="${n[k] ? 'true' : 'false'}" data-act="ntog" data-k="${k}" aria-label="${l}"></button></div>`;
      return `${appbar('Bildirimler')}
        <section class="screen">
          <h3 style="margin-bottom:8px">Genel ayarlar</h3>
          <div class="card">
            ${chTog('push', 'Push bildirim')}${chTog('sms', 'SMS')}${chTog('email', 'E-posta')}
            <div class="divider"></div>
            <div class="row between"><span class="muted">Sessiz saatler</span><span style="font-weight:600">${n.quietFrom} – ${n.quietTo}</span></div>
          </div>
          <h3 style="margin:18px 0 8px"><i class="ti ti-robot" style="vertical-align:-2px"></i> Otomatik takip (varsayılan)</h3>
          <div class="card">
            <p class="muted" style="margin-bottom:10px">Hasta kaç gün egzersiz yapmazsa harekete geç:</p>
            <div class="row gap8" style="margin-bottom:12px">${[1, 2, 3].map(dn => `<button class="chip ${n.inactiveDays === dn ? 'on' : ''}" data-act="gesc" data-d="${dn}">${dn} gün</button>`).join('')}</div>
            <p class="muted" style="margin-bottom:10px">Ne yapılsın:</p>
            <div class="row gap8" style="flex-wrap:wrap">${ACTIONS.map(([a, l, ic]) => `<button class="chip ${n.autoActions.includes(a) ? 'on' : ''}" data-act="gnact" data-a="${a}"><i class="ti ${ic}"></i> ${l}</button>`).join('')}</div>
          </div>
          <h3 style="margin:18px 0 8px">Hastaya özel</h3>
          <p class="hint" style="margin-bottom:8px">Her hasta için tonu ve hatırlatmayı ayarla.</p>
          <div class="card flush">${st.patients.map(p => `<button class="list-item" data-act="patient-notif" data-id="${p.id}"><span class="avatar">${esc(p.initials)}</span><span style="flex:1"><span style="font-weight:600">${esc(p.name)}</span><br><span class="hint">${toneLabel(p.notif.tone)} · ${p.notif.times.join(', ')}</span></span><i class="ti ti-chevron-right" style="color:var(--ink-300)"></i></button>`).join('')}</div>
        </section>
        ${tabbar('d_notifs', 'doctor')}`;
    },
    d_appts() {
      const st = S.get(); const slots = st.slots || [];
      const slotRow = (s) => `<div class="list-item"><div style="flex:1"><div style="font-weight:600">${esc(s.date)} · ${esc(s.time)}</div><div class="hint">${s.bookedBy ? 'Dolu — ' + esc(slotPatientName(s.bookedBy)) : 'Boş'}</div></div>${s.bookedBy ? '<span class="badge teal"><i class="ti ti-user-check"></i> Dolu</span>' : `<button class="btn-ghost" data-act="del-slot" data-sid="${s.id}" aria-label="Sil"><i class="ti ti-trash" style="color:var(--danger);font-size:20px"></i></button>`}</div>`;
      return `${appbar('Randevular', { back: true })}
        <section class="screen">
          <h3 style="margin-bottom:6px">Randevu bağlantın</h3>
          <p class="hint" style="margin-bottom:10px">Kendi randevu sistemin (Calendly, Google Takvim vb.) varsa bağlantını ekle — hastaların oraya yönlendirilir.</p>
          <div class="field"><input class="input" id="bkUrl" inputmode="url" placeholder="https://..." value="${esc(st.doctor.bookingUrl || '')}"></div>
          <button class="btn btn-secondary" data-act="set-booking-url"><i class="ti ti-link"></i> Bağlantıyı kaydet</button>
          <div class="divider"></div>
          <h3 style="margin-bottom:6px">Uygun saatler (iç sistem)</h3>
          <p class="hint" style="margin-bottom:10px">Boş saat ekle; hastaların uygulamadan seçip randevu alsın.</p>
          <div class="num-row"><div class="field"><label>Tarih</label><input class="input" id="slDate" type="date"></div><div class="field"><label>Saat</label><input class="input" id="slTime" type="time" value="10:00"></div></div>
          <button class="btn btn-secondary" data-act="add-slot"><i class="ti ti-plus"></i> Saat ekle</button>
          <div class="card flush mt16">${slots.length ? slots.map(slotRow).join('') : '<p class="hint" style="padding:16px">Henüz uygun saat eklemedin.</p>'}</div>
        </section>
        ${tabbar('d_profile', 'doctor')}`;
    },
    d_profile() { return profile('doctor'); },

    /* Patient */
    p_today() {
      session = null; // landing home cancels any running session
      const st = S.get(); const p = st.patients[0];
      const done = p.program.filter(e => isDoneToday(p, e)).length;
      const remaining = p.program.filter(e => !isDoneToday(p, e)).length;
      const lastActive = (p.sessions || []).map(s => s.date).sort().pop();
      const gapDays = lastActive ? Math.round((new Date(todayStr() + 'T00:00') - new Date(lastActive + 'T00:00')) / 86400000) : 0;
      const welcomeBack = gapDays >= 2;   // missed at least one full day → gentle, no-shame return
      const items = p.program.map(e => {
        const dc = sessionsToday(p, e.id), need = e.freq || 1, ok = dc >= need;
        return `<button class="list-item" data-exercise="${e.id}">
          <i class="ti ${ok ? 'ti-circle-check' : 'ti-circle'}" style="font-size:24px;color:${ok ? 'var(--teal-600)' : 'var(--ink-300)'}"></i>
          <span style="flex:1;min-width:0"><span style="font-weight:600">${esc(e.name)}</span><br><span class="hint">${e.reps}×${e.sets}${e.hold ? ' · ' + e.hold + ' sn' : ''}</span></span>
          ${need > 1 ? `<span class="badge neutral">${dc}/${need}</span>` : ''}
          ${e.verify ? '<span class="badge teal" aria-label="Kamera kanıtı istenir"><i class="ti ti-shield-check"></i></span>' : ''}
          <i class="ti ti-player-play" style="font-size:20px;color:var(--teal-600)" aria-hidden="true"></i>
        </button>`; }).join('');
      const docInit = st.doctor.name.replace('Fzt.', '').trim().split(' ').map(w => w[0]).join('').slice(0, 2);
      return `<div class="appbar"><div class="brand"><img src="assets/logo.svg" alt="">Fizyon</div><div class="spacer"></div>${st.settings.gamify ? `<span class="badge coral"><i class="ti ti-flame"></i> ${p.streak}</span>` : ''}</div>
        <section class="screen">
          <div class="card row between" style="margin-bottom:16px">
            <div class="row"><span class="avatar" style="background:var(--teal-600);color:#fff">${esc(docInit)}</span><div><div class="caption">Fizyoterapistin</div><div style="font-weight:600;font-size:17px">${esc(st.doctor.name)}</div></div></div>
            <button class="btn-ghost" data-act="msg-doctor" aria-label="Mesaj gönder"><i class="ti ti-message-2" style="font-size:24px"></i></button>
          </div>
          <h1>Bugün</h1>
          <p class="muted" style="margin-bottom:14px">${DAYS_FULL[new Date().getDay()]} · ${p.program.length} hareket · ${done}/${p.program.length} tamam</p>
          ${welcomeBack ? `<div class="card" style="background:var(--teal-50);border-color:var(--teal-100);margin-bottom:14px"><p style="color:var(--teal-700);margin:0"><i class="ti ti-mood-heart" style="vertical-align:-2px"></i> İyi ki geldin. Birkaç gün ara vermişsin — bugün küçük bir adımla başlayalım, acelesi yok.</p></div>` : ''}
          <div class="bar" style="margin-bottom:16px"><i style="width:${p.program.length ? done / p.program.length * 100 : 0}%"></i></div>
          ${remaining ? `<button class="btn btn-primary" data-act="start-session" style="margin-bottom:16px"><i class="ti ti-player-play"></i> Seansa başla (${remaining} hareket)</button>` : (p.program.length ? '<div class="card center" style="background:var(--teal-50);border-color:var(--teal-100);margin-bottom:16px"><p style="color:var(--teal-700);margin:0"><i class="ti ti-circle-check"></i> Bugünü tamamladın! 🎉</p></div>' : '')}
          <div class="card" style="background:var(--teal-50);border-color:var(--teal-100)">
            <span class="caption" style="color:var(--teal-600)"><i class="ti ti-quote"></i> ${esc(S.get().doctor.name)}</span>
            <p class="mt8" style="color:var(--teal-700)">${esc(p.note)}</p>
          </div>
          <div class="card flush mt16">${items}</div>
          <button class="list-item card mt16" data-act="open-booking" style="border-radius:var(--r-lg)"><i class="ti ti-calendar-event" style="font-size:24px;color:var(--teal-600)"></i><span style="flex:1"><span class="caption">Sonraki randevu</span><br><span style="font-weight:600">${esc(p.nextAppt || 'Planlanmadı')}</span></span><span class="badge teal"><i class="ti ti-calendar-plus"></i> Randevu al</span></button>
          <button class="btn-ghost mt16" data-go="p_history" style="display:block;margin:14px auto 0"><i class="ti ti-history"></i> Egzersiz geçmişim</button>
          <div class="row gap8 mt8 hint" style="align-items:center;justify-content:center"><i class="ti ti-bell"></i> Hatırlatma: her gün ${esc(p.notif.times[0])} · <button class="btn-ghost" data-act="reminder" style="font-size:14px">değiştir</button></div>
        </section>
        ${tabbar('p_today', 'patient')}`;
    },

    p_exercise() {
      const p = S.get().patients[0];
      const e = p.program.find(x => x.id === params.eid) || p.program[0];
      const idx = p.program.indexOf(e) + 1;
      const sets = e.sets || 1, dc = sessionsToday(p, e.id), need = e.freq || 1;
      const already = !!e.verify && camVerifiedToday(p, e.id), needsProof = !!e.verify && !already;
      return `${appbar(e.name, { back: true })}
        <section class="screen">
          <div class="meta-chips">
            <span class="chip-sm"><i class="ti ti-list-numbers"></i> Hareket ${idx}/${p.program.length}</span>
            <span class="chip-sm">${e.reps}×${sets}${e.hold ? ' · ' + e.hold + ' sn' : ' tekrar'}</span>
            ${need > 1 ? `<span class="chip-sm"><i class="ti ti-repeat"></i> Bugün ${dc}/${need}</span>` : ''}
          </div>
          <div class="demo-stage" style="height:200px">
            <span class="badge teal demo-src"><i class="ti ti-${e.video ? 'video' : 'sparkles'}"></i> ${e.video ? 'Hekimin kaydı' : 'Hazır animasyon'}</span>
            ${fzDemo(e.demo)}
          </div>
          <p class="caption center" style="margin:10px 0 0"><i class="ti ti-info-circle" style="vertical-align:-2px"></i> ${esc(cueFor(e.demo))} · ${esc(targetText(e))}</p>
          ${e.note ? `<div class="card mt16" style="background:var(--teal-50);border-color:var(--teal-100)"><span class="caption" style="color:var(--teal-600)"><i class="ti ti-bulb"></i> Hekim notu</span><p class="mt8" style="color:var(--teal-700)">${esc(e.note)}</p></div>` : ''}
          <div class="card mt16 center">
            <div class="set-dots" id="setDots">${Array.from({ length: sets }, (_, i) => `<span class="set-dot"></span>`).join('')}</div>
            <div class="caption" id="setLbl" style="margin:6px 0 10px">Set 1/${sets}</div>
            <div class="timer-ring" id="tring"><div class="inner"><span class="timer" id="tval">${e.hold || e.reps}</span><span class="hint" id="tlbl">${e.hold ? 'saniye tut' : 'tekrar'}</span></div></div>
            <button class="btn btn-primary mt16" id="tstart" style="max-width:220px;margin-left:auto;margin-right:auto"><i class="ti ti-player-play"></i> Seti başlat</button>
          </div>
          <div id="finishBox">
            ${needsProof ? `
            <p class="caption center" id="finishHdr" style="margin:14px 0 8px"><i class="ti ti-shield-check" style="color:var(--teal-600);vertical-align:-2px"></i> Hareketi yap, sonra canlı kamerayla kanıtla:</p>
            <button class="btn btn-accent" data-act="goverify" data-eid="${e.id}"><i class="ti ti-camera"></i> Kamerayla kanıtla</button>
            <button class="btn btn-secondary mt8" data-act="complete-noverify" data-eid="${e.id}"><i class="ti ti-check"></i> Kanıtsız tamamla</button>
            <p class="hint center mt8">Kanıtlamadan tamamlarsan kaydında “kanıtsız” görünür.</p>
            ` : `
            ${already ? '<p class="caption center" style="margin:14px 0 8px"><i class="ti ti-shield-check" style="color:var(--teal-600);vertical-align:-2px"></i> Bugün kameralı kanıtladın — bugün tekrar gerekmez.</p>' : '<p class="caption center" style="margin:14px 0 8px">Seti bitirince tamamla:</p>'}
            <button class="btn btn-primary" data-act="complete-noverify" data-eid="${e.id}"><i class="ti ti-check"></i> Seti tamamla</button>
            `}
          </div>
          <button class="btn-ghost" data-act="couldnt" data-eid="${e.id}" style="display:flex;margin:14px auto 0"><i class="ti ti-help-circle"></i> Bugün yapamadım</button>
        </section>`;
    },

    p_verify() {
      const p = S.get().patients[0];
      const e = p.program.find(x => x.id === params.eid) || p.program.find(x => x.verify) || p.program[0];
      return `${appbar('Kanıtla', { back: true })}
        <section class="screen">
          <p class="muted" style="margin-bottom:4px"><i class="ti ti-shield-check" style="color:var(--teal-600);vertical-align:-2px"></i> ${esc(cueFor(e.demo))}</p>
          <p class="hint" style="margin-bottom:12px">Hedef: <b>${esc(targetText(e))}</b>, kamera sayacak.</p>
          <div class="cam-stage" id="camStage">
            <div class="cam-live"><span class="dot"></span> CANLI</div>
            <div class="ring cam-prog" id="camProg" style="--p:0"><span id="camPct">0%</span></div>
            <video id="cam" autoplay playsinline muted></video>
            <canvas id="camCanvas"></canvas>
            <div class="cam-hint" id="camHint">Kamera başlatılıyor…</div>
          </div>
          <p class="hint center mt16"><i class="ti ti-lock" style="vertical-align:-2px"></i> Görüntü cihazından çıkmaz, analiz telefonda yapılır. Sadece sonuç hekime gönderilir.</p>
          <button class="btn btn-secondary mt8" data-act="sim-verify" data-eid="${e.id}"><i class="ti ti-device-mobile-check"></i> Kamerasız doğrula (demo)</button>
        </section>`;
    },

    p_journey() {
      const st = S.get(); const p = st.patients[0];
      if (!st.settings.gamify) return `${appbar('Yolculuk')}<section class="screen"><div class="card center" style="padding:40px 20px"><i class="ti ti-confetti" style="font-size:40px;color:var(--ink-300)"></i><p class="muted mt16">Oyunlaştırma kapalı. Motivasyon için açabilirsin.</p><button class="btn btn-primary mt16" data-act="toggle-gamify" style="max-width:220px;margin:16px auto 0"><i class="ti ti-player-play"></i> Aç</button></div></section>${tabbar('p_journey', 'patient')}`;
      const stages = ['Başlangıç', 'Hareket', 'Güçlenme', 'Dönüş', 'Tam iyileşme'];
      const goalPct = p.adherence || 0;
      const earned = { b1: (p.sessions || []).length >= 1, b2: p.streak >= 7, b3: (p.sessions || []).filter(s => s.verified).length >= 10, b4: (p.adherence || 0) >= 80 };
      return `${appbar('Yolculuk')}
        <section class="screen">
          <div class="card" style="background:var(--coral-50);border-color:var(--coral-100)">
            <div class="row between"><div><div class="caption" style="color:var(--coral-600)">Puanın</div><div style="font-size:28px;font-weight:600;color:var(--coral-600)">${p.points}</div></div>
            <div class="row gap16"><div class="center"><div style="font-size:22px;font-weight:600"><i class="ti ti-flame" style="color:var(--coral-500)"></i> ${p.streak}</div><div class="hint">gün seri</div></div></div></div>
          </div>
          <button class="btn btn-accent mt16" data-go="p_achievement"><i class="ti ti-award"></i> Başarı kartını gör & paylaş</button>
          <h3 style="margin:18px 0 8px">Haftalık hedef</h3>
          <div class="card"><div class="row between" style="margin-bottom:8px"><span class="muted">Bu haftaki egzersizler</span><span style="font-weight:600">%${goalPct}</span></div><div class="bar"><i style="width:${goalPct}%"></i></div>${goalPct >= 100 ? '<div class="badge coral mt8"><i class="ti ti-gift"></i> Hedef tamam, ödül açıldı!</div>' : ''}</div>
          <h3 style="margin:18px 0 8px">İyileşme yolun · diz</h3>
          <div class="card"><div class="row between">${stages.map((s, i) => `<div class="center" style="flex:1"><div style="width:30px;height:30px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;background:${i < p.journeyStage ? 'var(--teal-600)' : i === p.journeyStage ? 'var(--coral-500)' : 'var(--bg)'};color:${i <= p.journeyStage ? '#fff' : 'var(--ink-300)'};font-size:13px;font-weight:600">${i < p.journeyStage ? '<i class="ti ti-check"></i>' : i + 1}</div><div class="hint" style="font-size:10px;margin-top:4px">${s}</div></div>`).join('')}</div></div>
          <h3 style="margin:18px 0 8px">Ödüller</h3>
          <div class="grid2">${st.badges.map(b => `<div class="reward ${earned[b.id] ? '' : 'locked'}"><span class="rc"><i class="ti ${b.icon}"></i></span><span style="font-size:13px;font-weight:500">${esc(b.name)}</span></div>`).join('')}</div>
        </section>
        ${tabbar('p_journey', 'patient')}`;
    },

    p_achievement() {
      const st = S.get(); const p = st.patients[0];
      const moves = (p.sessions || []).length, days = new Set((p.sessions || []).map(s => s.date)).size, first = p.name.split(' ')[0];
      return `${appbar('Başarı kartın', { back: true })}
        <section class="screen">
          <div class="ach-card" id="achCard">
            <div class="ach-mark"><i class="ti ti-trophy"></i></div>
            <div class="ach-logo"><i class="ti ti-activity-heartbeat"></i></div>
            <h2>Harika gidiyorum! 💪</h2>
            <div class="ach-name">${esc(first)}</div>
            <div class="ach-line">Fizyon ile ev egzersiz programıma sadık kaldım.</div>
            <div class="ach-stats">
              <div class="ach-stat"><div class="v">${moves}</div><div class="l">toplam hareket</div></div>
              <div class="ach-stat"><div class="v">${days}</div><div class="l">gün</div></div>
            </div>
            <div class="ach-by"><i class="ti ti-stethoscope"></i> ${esc(st.doctor.name)} eşliğinde</div>
          </div>
          <button class="btn btn-accent mt16" data-act="share-card"><i class="ti ti-share"></i> Paylaş</button>
          <button class="btn btn-secondary mt8" data-act="download-card"><i class="ti ti-download"></i> Görseli indir</button>
          <p class="hint center mt16">Kartta hastalık adı yok, istediğin yerde paylaşabilirsin.</p>
        </section>`;
    },

    p_done() {
      const st = S.get(); const p = st.patients[0];
      return `${appbar('Seans tamam')}
        <section class="screen center" style="padding-top:30px">
          <div style="width:72px;height:72px;border-radius:50%;background:var(--teal-50);color:var(--teal-600);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><i class="ti ti-circle-check" style="font-size:38px"></i></div>
          <h2>Harika iş! 🎉</h2>
          <p class="muted mt8">Bugünün seansını tamamladın. Hekimine iletildi.</p>
          ${st.settings.gamify ? `<div class="card" style="background:var(--coral-50);border-color:var(--coral-100);max-width:280px;margin:18px auto 0"><div style="font-size:28px;font-weight:600;color:var(--coral-600)"><i class="ti ti-flame"></i> ${p.streak} gün</div><div class="hint">seri sürüyor</div></div>` : ''}
          <button class="btn btn-primary mt24" data-nav="p_today" style="max-width:240px;margin:24px auto 0">Bugüne dön</button>
          ${st.settings.gamify ? `<button class="btn btn-accent mt8" data-go="p_achievement" style="max-width:240px;margin:8px auto 0"><i class="ti ti-share"></i> Başarını paylaş</button>` : ''}
        </section>`;
    },

    p_history() {
      const p = S.get().patients[0];
      const byDate = {};
      (p.sessions || []).forEach(s => { (byDate[s.date] = byDate[s.date] || []).push(s); });
      const dates = Object.keys(byDate).sort().reverse();
      const exName = (id) => { const e = p.program.find(x => x.id === id); return e ? e.name : 'Hareket'; };
      const fmtDate = (iso) => { const d = new Date(iso + 'T00:00'); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${DAYS_SHORT[d.getDay()]}`; };
      const dayCard = (date) => {
        const g = {}; byDate[date].forEach(s => { (g[s.exId] = g[s.exId] || []).push(s); });
        const rows = Object.keys(g).map(exId => {
          const arr = g[exId], v = arr.filter(s => s.verified).length, nv = arr.length - v;
          return `<div class="row between" style="padding:8px 0;border-top:1px solid var(--line)"><span style="flex:1">${esc(exName(exId))} <span class="hint">· ${arr.length} kez</span></span>${v ? `<span class="badge teal"><i class="ti ti-shield-check"></i> ${v} kanıtlı</span>` : ''}${nv ? `<span class="badge warn" style="margin-left:6px"><i class="ti ti-shield-off"></i> ${nv} kanıtsız</span>` : ''}</div>`;
        }).join('');
        return `<div class="card"><div class="row between" style="margin-bottom:2px"><h3 style="font-size:16px">${date === todayStr() ? 'Bugün' : fmtDate(date)}</h3><span class="hint">${byDate[date].length} seans</span></div>${rows}</div>`;
      };
      return `${appbar('Egzersiz geçmişim', { back: true })}
        <section class="screen">
          <p class="hint" style="margin-bottom:12px">Her günün kaydı; kanıtlı ve kanıtsız seanslar burada tutulur.</p>
          ${dates.length ? dates.map(dayCard).join('') : '<div class="card center" style="padding:32px 20px"><i class="ti ti-history" style="font-size:38px;color:var(--ink-300)"></i><p class="muted mt16">Henüz kayıt yok. İlk seansını yap, burada görünsün.</p></div>'}
        </section>`;
    },
    p_profile() { return profile('patient'); },
  };

  function placeholder(route, role, title, msg) {
    return `${appbar(title)}<section class="screen"><div class="card center" style="padding:40px 20px"><i class="ti ti-tools" style="font-size:40px;color:var(--ink-300)"></i><p class="muted mt16">${esc(msg)}</p></div></section>${tabbar(route, role)}`;
  }
  function profile(role) {
    const st = S.get();
    const name = role === 'doctor' ? st.doctor.name : (st.patients[0] ? st.patients[0].name : 'Hasta');
    const inits = role === 'doctor' ? (st.doctor.name || 'Fzt').replace('Fzt.', '').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2) : (st.patients[0] ? st.patients[0].initials : '?');
    const sub = role === 'doctor' ? ('Fizyoterapist' + (st.doctor.license ? ' · ' + esc(st.doctor.license) : '')) : 'Hasta';
    return `${appbar('Profil')}<section class="screen">
      <div class="row" style="margin-bottom:18px"><span class="avatar lg">${esc(inits)}</span><div><div style="font-weight:600;font-size:18px">${esc(name)}</div><div class="hint">${sub}${st.cloud ? '' : ' · demo'}</div></div></div>
      ${role === 'doctor' && st.cloud ? `<div class="card"><div class="caption">Fizyoterapist kodun</div><div class="row between" style="margin-top:6px"><div style="font-weight:700;letter-spacing:3px;font-size:22px;color:var(--teal-700)">${esc(st.code || '-')}</div><div class="row gap8"><button class="btn sm btn-secondary" data-act="copy-code" data-code="${esc(st.code || '')}"><i class="ti ti-copy"></i> Kopyala</button><button class="btn sm btn-secondary" data-act="new-patient"><i class="ti ti-user-plus"></i> Davet</button></div></div></div>` : ''}
      ${role === 'patient' ? `<div class="card row between"><div><div style="font-weight:600">Oyunlaştırma</div><div class="hint">Puan, seri ve ödülleri göster</div></div><button class="switch" role="switch" aria-checked="${st.settings.gamify ? 'true' : 'false'}" data-act="toggle-gamify" aria-label="Oyunlaştırma"></button></div>` : ''}
      ${role === 'doctor' ? `<button class="list-item card" data-go="d_appts" style="border-radius:var(--r-lg)"><i class="ti ti-calendar" style="color:var(--teal-600);font-size:22px"></i><span style="flex:1"><span style="font-weight:600">Randevular</span><br><span class="hint">Randevu bağlantın ve uygun saatlerin</span></span><i class="ti ti-chevron-right" style="color:var(--ink-300)"></i></button>` : ''}
      <div class="card row between"><div><div style="font-weight:600">Büyük yazı</div><div class="hint">Daha büyük metin ve butonlar</div></div><button class="switch" role="switch" aria-checked="${uiGet('bigText') ? 'true' : 'false'}" data-act="toggle-bigtext" aria-label="Büyük yazı"></button></div>
      ${role === 'patient' ? `<div class="card flush mt16">
        <div class="caption" style="padding:14px 16px 2px">Verilerim ve haklarım · KVKK</div>
        <button class="list-item" data-act="export-data"><i class="ti ti-download" style="color:var(--ink-500)"></i><span style="flex:1">Verilerimi indir<br><span class="hint">Tüm verilerinin kopyası (JSON)</span></span><i class="ti ti-chevron-right" style="color:var(--ink-300)"></i></button>
        <button class="list-item" data-act="withdraw-consent"><i class="ti ti-shield-x" style="color:var(--ink-500)"></i><span style="flex:1">Sağlık verisi onayımı geri çek<br><span class="hint">İşlemeyi durdur</span></span><i class="ti ti-chevron-right" style="color:var(--ink-300)"></i></button>
        <button class="list-item" data-act="delete-account"><i class="ti ti-trash" style="color:var(--danger)"></i><span style="flex:1;color:var(--danger)">Hesabımı ve verilerimi sil<br><span class="hint">Kalıcı, geri alınamaz</span></span><i class="ti ti-chevron-right" style="color:var(--ink-300)"></i></button>
      </div>` : ''}
      <div class="card flush mt16">
        <a class="list-item" href="privacy.html" target="_blank" style="text-decoration:none"><i class="ti ti-lock" style="color:var(--ink-500)"></i><span style="flex:1">Gizlilik ve güvenlik</span><i class="ti ti-chevron-right" style="color:var(--ink-300)"></i></a>
        <a class="list-item" href="terms.html" target="_blank" style="text-decoration:none"><i class="ti ti-file-text" style="color:var(--ink-500)"></i><span style="flex:1">Kullanım koşulları</span><i class="ti ti-chevron-right" style="color:var(--ink-300)"></i></a>
      </div>
      <button class="btn btn-secondary mt16" data-act="logout"><i class="ti ti-logout"></i> Çıkış yap</button>
      ${st.cloud ? '' : '<button class="btn-ghost mt16" data-act="reset" style="display:block;margin:16px auto 0">Demoyu sıfırla</button>'}
    </section>${tabbar(role === 'doctor' ? 'd_profile' : 'p_profile', role)}`;
  }

  /* ---------- render + post-render wiring ---------- */
  function render() {
    stopCamera();
    if (timerInt) { clearInterval(timerInt); timerInt = null; }
    const route = stack[stack.length - 1];
    app.dataset.route = route; // lets CSS adapt specific screens (e.g. desktop detail layout)
    app.classList.toggle('big-text', uiGet('bigText'));
    if (S.get()) recomputeAll();
    app.innerHTML = (screens[route] || screens.welcome)();
    window.scrollTo(0, 0);

    if (route === 'd_patient') {
      const p = S.patient(params.id);
      const ctx = $('#adChart'); if (ctx && window.Chart) drawAdherence(ctx, p.history);
    }
    if (route === 'd_analytics') drawAnalytics();
    if (route === 'reg_form') wireRoleLicense();
    if (route === 'p_exercise') {
      const p = S.get().patients[0];
      wireTimer(p.program.find(x => x.id === params.eid) || p.program[0]);
    }
    if (route === 'p_verify') {
      const p = S.get().patients[0];
      startCamera(p.program.find(x => x.id === params.eid) || p.program.find(x => x.verify) || p.program[0]);
    }
  }

  function drawAdherence(ctx, data) {
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    new Chart(ctx, {
      type: 'bar',
      data: { labels: ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'], datasets: [{ data, borderRadius: 6, backgroundColor: data.map(v => v < 40 ? css('--chart-low') : v < 70 ? css('--chart-mid') : css('--chart-high')) }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: css('--line') } }, x: { grid: { display: false } } }, responsive: true, maintainAspectRatio: false }
    });
  }

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function drawAnalytics() {
    if (!window.Chart) return;
    const st = S.get();
    const c1 = $('#cmpChart');
    if (c1) new Chart(c1, {
      type: 'bar',
      data: { labels: st.patients.map(p => p.name.split(' ')[0]), datasets: [{ data: st.patients.map(p => p.adherence), borderRadius: 6, backgroundColor: st.patients.map(p => p.adherence < 40 ? css('--chart-low') : p.adherence < 70 ? css('--chart-mid') : css('--chart-high')) }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: css('--line') } }, y: { grid: { display: false } } }, responsive: true, maintainAspectRatio: false }
    });
    const c2 = $('#trendChart');
    const avgHist = [0, 1, 2, 3, 4, 5, 6].map(i => Math.round(st.patients.reduce((s, p) => s + ((p.history && p.history[i]) || 0), 0) / Math.max(1, st.patients.length)));
    if (c2) new Chart(c2, {
      type: 'line',
      data: { labels: ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'], datasets: [{ data: avgHist, borderColor: css('--teal-500'), backgroundColor: 'transparent', tension: .35, pointRadius: 3, pointBackgroundColor: css('--teal-500') }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: css('--line') } }, x: { grid: { display: false } } }, responsive: true, maintainAspectRatio: false }
    });
  }

  /* ---- exercise timer ---- */
  let timerInt = null;
  function wireTimer(e) {
    const btn = $('#tstart'), val = $('#tval'), ring = $('#tring'), lbl = $('#tlbl'), setLbl = $('#setLbl'), dots = $('#setDots'), finishBox = $('#finishBox');
    if (!btn) return;
    const sets = e.sets || 1, total = e.hold || e.reps;
    let curSet = 1, running = false, t = total;
    const paintDots = (n) => $$('.set-dot', dots).forEach((dn, i) => dn.classList.toggle('on', i < n));
    btn.onclick = () => {
      if (running) { clearInterval(timerInt); running = false; btn.innerHTML = '<i class="ti ti-player-play"></i> Devam'; return; }
      running = true; btn.innerHTML = '<i class="ti ti-player-pause"></i> Duraklat';
      timerInt = setInterval(() => {
        t--; val.textContent = t; ring.style.setProperty('--p', (1 - t / total) * 100);
        if (t <= 0) {
          clearInterval(timerInt); running = false; ring.style.setProperty('--p', 100); paintDots(curSet);
          if (curSet >= sets) {                                  // all sets done → verify this session
            val.textContent = '✓'; lbl.textContent = 'bitti'; setLbl.textContent = 'Tüm setler tamam ✓';
            btn.hidden = true; if (finishBox) finishBox.hidden = false; toast('Setler bitti, şimdi kanıtla');
          } else {                                               // next set
            curSet++; t = total; val.textContent = total; ring.style.setProperty('--p', 0);
            setLbl.textContent = 'Set ' + curSet + '/' + sets; lbl.textContent = e.hold ? 'saniye tut' : 'tekrar';
            btn.innerHTML = '<i class="ti ti-player-play"></i> Set ' + curSet + ' başlat'; toast('Set ' + (curSet - 1) + ' tamam, biraz dinlen');
          }
        }
      }, e.hold ? 1000 : 1300);
    };
  }

  /* ---- camera verification (MediaPipe pose, on-device) ---- */
  let camStream = null, camRAF = null, camLandmarker = null, camStop = false;
  function stopCamera() {
    camStop = true;
    if (camRAF) cancelAnimationFrame(camRAF), camRAF = null;
    if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  }
  async function startCamera(e) {
    camStop = false;
    const video = $('#cam'), canvas = $('#camCanvas'), hint = $('#camHint');
    if (!video) return;
    let ok = false;
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      video.srcObject = camStream; await video.play().catch(() => {});
      ok = true; hint.textContent = 'Vücudun kameraya tam görünsün';
    } catch (err) {
      hint.textContent = 'Kamera açılamadı, "Kamerasız doğrula" ile devam et.';
      return;
    }
    try {
      const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
      const fileset = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
      camLandmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task' },
        runningMode: 'VIDEO', numPoses: 1
      });
      runPose(e, video, canvas, hint);
    } catch (err) {
      hint.textContent = 'Hareket algılama yüklenemedi, "Kamerasız doğrula" ile devam et.';
    }
  }
  /* Movement-aware verification: each exercise maps to a body-signal (which joint
     moves, in which axis), normalized by torso length so it's distance-invariant.
     A short calibration captures the resting pose, then reps are counted with
     hysteresis (must return to rest before the next rep) and holds are validated
     for the prescribed seconds with a stability check. */
  const METRIC_BY_DEMO = {
    squat: 'hipVert', wallsquat: 'hipVert', lunge: 'hipVert', calfraise: 'hipVert',
    marching: 'kneeAlt', hipabduction: 'legAbd',
    bridge: 'hipBridge', legraise: 'legLift', clamshell: 'legLift', heelslide: 'legLift', sidelegraise: 'legLift',
    kneeextension: 'kneeExt',
    shoulder: 'armRaise', pendulum: 'armRaise', armraise: 'armRaise', shrug: 'shrug',
    neckTilt: 'headMove', neckRotation: 'headMove',
    balance: 'hold', generic: 'hold', catcow: 'motion', birddog: 'motion'
  };
  const THRESH = { hipVert: [.15, .06], hipBridge: [.12, .05], kneeAlt: [.14, .06], legLift: [.14, .06], legAbd: [.12, .05], armRaise: [.45, .2], shrug: [.045, .02], kneeExt: [.18, .07], headMove: [.12, .05], motion: [.7, .25] };
  function metricFor(e) { return e.metric || METRIC_BY_DEMO[e.demo] || (((e.reps || 1) > 1) ? 'motion' : 'hold'); }

  function runPose(e, video, canvas, hint) {
    const ctx = canvas.getContext('2d');
    const conns = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
    const metric = metricFor(e);
    const targetReps = e.reps || 10, targetSec = e.hold || 5;
    const hold = ((e.reps || 1) <= 1) || metric === 'hold';   // hold-validation vs rep-counting
    const [enterThr, exitThr] = THRESH[metric] || [.15, .06];
    const prog = $('#camProg'), pctEl = $('#camPct');
    const setProg = (frac, label) => { if (prog) prog.style.setProperty('--p', Math.min(100, Math.round(frac * 100))); if (pctEl) pctEl.textContent = label; };
    setProg(0, hold ? '0 sn' : '0/' + targetReps);

    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const torsoLen = (lm) => { const s = mid(lm[11], lm[12]), h = mid(lm[23], lm[24]); return Math.hypot(s.x - h.x, s.y - h.y) || 0.001; };
    const keyPts = (lm) => [lm[11], lm[12], lm[15], lm[16], lm[23], lm[24], lm[25], lm[26]];

    let base = null, calib = [], calibStart = performance.now();
    let smoothed = 0, repState = 'ready', reps = 0, heldSec = 0, lastT = performance.now(), prevPts = null;

    const motionSpeed = (lm, dt, L) => {
      if (!prevPts) return 0; const cur = keyPts(lm); let s = 0, n = 0;
      for (let i = 0; i < cur.length; i++) if (cur[i] && prevPts[i]) { s += Math.hypot(cur[i].x - prevPts[i].x, cur[i].y - prevPts[i].y); n++; }
      return n ? (s / n) / L / Math.max(dt, 0.016) : 0;
    };
    const rawSignal = (lm) => {
      const L = torsoLen(lm), s = mid(lm[11], lm[12]), h = mid(lm[23], lm[24]), b = base;
      switch (metric) {
        case 'hipVert': return (h.y - b.hipY) / L;                         // hips lower
        case 'hipBridge': return (b.hipY - h.y) / L;                       // hips rise
        case 'kneeAlt': return Math.max(b.kLY - lm[25].y, b.kRY - lm[26].y) / L;  // a knee lifts
        case 'legLift': return Math.max(b.kLY - lm[25].y, b.kRY - lm[26].y, b.aLY - lm[27].y, b.aRY - lm[28].y) / L;
        case 'legAbd': return ((Math.abs(lm[28].x - h.x) + Math.abs(lm[27].x - h.x)) - b.spread) / L;
        case 'armRaise': return ((s.y - Math.min(lm[15].y, lm[16].y)) / L) - b.armBase;  // wrist above shoulder
        case 'shrug': return (b.shY - s.y) / L;
        case 'kneeExt': return (((lm[25].y + lm[26].y) / 2 - Math.min(lm[27].y, lm[28].y)) / L) - b.kneeExt;
        case 'headMove': return Math.max(Math.abs(lm[0].x - b.noseX), Math.abs(lm[0].y - b.noseY)) / L;
        default: return 0;
      }
    };

    const loop = () => {
      if (camStop || !camLandmarker || !video.videoWidth) { if (!camStop) camRAF = requestAnimationFrame(loop); return; }
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      let res; try { res = camLandmarker.detectForVideo(video, performance.now()); } catch { camRAF = requestAnimationFrame(loop); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now(), dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
      const lm = res.landmarks && res.landmarks[0];
      if (!lm) { hint.textContent = 'Vücudun kameraya görünsün'; if (hold) heldSec = Math.max(0, heldSec - dt * 1.5); prevPts = null; camRAF = requestAnimationFrame(loop); return; }
      ctx.strokeStyle = css('--teal-500') || '#2F6A5B'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      conns.forEach(([a, b]) => { if (lm[a] && lm[b]) { ctx.beginPath(); ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height); ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height); ctx.stroke(); } });
      ctx.fillStyle = css('--teal-500') || '#2F6A5B';
      lm.forEach(pt => { ctx.beginPath(); ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 5, 0, 7); ctx.fill(); });
      const visible = lm.filter(p => (p.visibility ?? 1) > 0.5).length;
      if (visible < 16) { hint.textContent = 'Tüm vücudun kameraya sığsın'; prevPts = null; camRAF = requestAnimationFrame(loop); return; }
      const L = torsoLen(lm), s = mid(lm[11], lm[12]), h = mid(lm[23], lm[24]);

      // calibration: ~1.1s of clean frames → resting baseline
      if (!base) {
        calib.push({ hipY: h.y, shY: s.y, kLY: lm[25].y, kRY: lm[26].y, aLY: lm[27].y, aRY: lm[28].y,
          spread: Math.abs(lm[28].x - h.x) + Math.abs(lm[27].x - h.x), armBase: (s.y - Math.min(lm[15].y, lm[16].y)) / L,
          kneeExt: ((lm[25].y + lm[26].y) / 2 - Math.min(lm[27].y, lm[28].y)) / L, noseX: lm[0].x, noseY: lm[0].y });
        setProg((now - calibStart) / 1100, 'hazır…'); hint.textContent = 'Sabit dur, kalibre ediliyor…';
        if (now - calibStart > 1100 && calib.length > 8) {
          base = {}; for (const k of ['hipY', 'shY', 'kLY', 'kRY', 'aLY', 'aRY', 'spread', 'armBase', 'kneeExt', 'noseX', 'noseY']) base[k] = calib.reduce((a, c) => a + c[k], 0) / calib.length;
          setProg(0, hold ? '0 sn' : '0/' + targetReps);
        }
        prevPts = keyPts(lm); camRAF = requestAnimationFrame(loop); return;
      }

      const speed = motionSpeed(lm, dt, L);                 // before prevPts update
      const sig = (metric === 'motion') ? speed : Math.abs(rawSignal(lm));
      smoothed = smoothed * 0.7 + sig * 0.3;
      prevPts = keyPts(lm);

      if (hold) {
        let ok;
        if (e.demo === 'balance') ok = Math.abs(lm[27].y - lm[28].y) > 0.10 && speed < 0.9; // single-leg + steady
        else ok = speed < 1.2;                                                              // holding still
        if (ok) { heldSec = Math.min(targetSec, heldSec + dt); hint.textContent = e.demo === 'balance' ? 'Dengeni koru…' : 'Pozu koru…'; }
        else { heldSec = Math.max(0, heldSec - dt * 1.2); hint.textContent = e.demo === 'balance' ? 'Tek ayak üstünde dur' : 'Pozisyonu al ve sabit kal'; }
        setProg(heldSec / targetSec, heldSec.toFixed(1) + ' sn');
        if (heldSec >= targetSec) { verifySuccess(e); return; }
      } else {
        if (repState === 'ready' && smoothed > enterThr) { repState = 'active'; hint.textContent = 'Güzel, şimdi başa dön'; }
        else if (repState === 'active' && smoothed < exitThr) { repState = 'ready'; reps++; setProg(reps / targetReps, reps + '/' + targetReps); hint.textContent = reps + '/' + targetReps + ' ✓'; if (reps >= targetReps) { verifySuccess(e); return; } }
        else if (repState === 'ready' && reps === 0) hint.textContent = 'Hareketi yapmaya başla';
      }
      camRAF = requestAnimationFrame(loop);
    };
    camRAF = requestAnimationFrame(loop);
  }
  // Record one completed session. method: 'camera' (CV-attested) | 'manual' (self) | 'none' (no proof).
  function recordSession(e, method) {
    const st = S.get(); const p = st.patients[0];
    const verified = method === 'camera';
    p.sessions = p.sessions || [];
    p.sessions.push({ exId: e.id, date: todayStr(), method, verified, at: Date.now() });
    if (st.settings.gamify) p.points += verified ? 30 : (method === 'manual' ? 20 : 15);
    recomputeStats(p);
    if (S.isCloud()) {
      // verify_method column is added by the v2 migration; until applied we persist the honest
      // `verified` boolean (camera-attested ONLY — manual/none are NOT verified).
      window.FZ_API.logCompletion({ exercise_id: e.id, patient_id: p.id, verified }).catch(() => {});
      if (st.settings.gamify) window.FZ_API.setGamification(p.id, { points: p.points, streak: p.streak }).catch(() => {});
    }
    S.save();
  }
  function verifySuccess(e) {
    stopCamera();
    const st = S.get();
    recordSession(e, 'camera');
    const stage = $('#camStage');
    if (stage) stage.insertAdjacentHTML('beforeend', `<div class="verify-ok"><i class="ti ti-circle-check"></i><div style="font-size:18px;font-weight:600">Doğrulandı!</div>${st.settings.gamify ? '<div class="badge" style="background:rgba(255,255,255,.2);color:#fff">+30 puan</div>' : ''}</div>`);
    setTimeout(() => { toast('Kanıt hekime gönderildi'); if (session) sessionAdvance(); else home(); }, 1500);
  }

  /* ---- bottom sheets ---- */
  let sheetCat = 'all';
  function openSheet(html) {
    closeSheet();
    const s = document.createElement('div'); s.className = 'scrim'; s.id = 'fzSheet';
    s.innerHTML = `<div class="sheet tall"><div class="grab"></div>${html}</div>`;
    s.addEventListener('click', (ev) => { if (ev.target === s) closeSheet(); });
    document.body.appendChild(s);
  }
  function closeSheet() { const s = $('#fzSheet', document); if (s) { stopCamera(); s.remove(); } }
  // KVKK data portability (Art. 11): download a copy of all of the patient's own data as JSON.
  function exportMyData() {
    const st = S.get(); const p = (st.patients && st.patients[0]) || {};
    const data = { exportedAt: new Date().toISOString(), app: 'Fizyon', mode: st.cloud ? 'cloud' : 'demo',
      profile: { name: p.name, condition: p.condition, week: p.week },
      doctor: st.doctor ? { name: st.doctor.name } : null,
      program: p.program || [], sessions: p.sessions || [], feedback: p.couldnt || [],
      gamification: { points: p.points, streak: p.streak, journeyStage: p.journeyStage },
      adherence: p.adherence, history: p.history };
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'fizyon-verilerim-' + todayStr() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Verilerin indirildi');
    } catch (e) { toast('İndirme başarısız'); }
  }
  const confirmSheet = (title, body, yesAct, yesLabel, danger) =>
    `<h3 style="margin-bottom:4px">${esc(title)}</h3><p class="hint" style="margin-bottom:18px">${esc(body)}</p>
     <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="${yesAct}">${esc(yesLabel)}</button>
     <button class="btn btn-secondary mt8" data-act="close-sheet">Vazgeç</button>`;
  function librarySheet(pid) {
    const st = S.get();
    const presets = st.presets.filter(pr => sheetCat === 'all' || pr.cat === sheetCat);
    return `<h3 style="margin-bottom:12px">Hazır hareket ekle</h3>
      <div class="cat-row">${st.cats.map(([c, l]) => `<button class="chip ${sheetCat === c ? 'on' : ''}" data-act="set-cat" data-cat="${c}" data-id="${pid}">${l}</button>`).join('')}</div>
      ${presets.map(pr => `<button class="preset" data-act="pick-preset" data-pid="${pr.id}" data-id="${pid}"><span class="pv">${fzDemo(pr.demo)}</span><span style="flex:1"><span style="font-weight:600">${esc(pr.name)}</span><br><span class="hint">${pr.reps}×${pr.sets}${pr.hold ? ' · ' + pr.hold + ' sn' : ''}</span></span><i class="ti ti-plus" style="color:var(--teal-600);font-size:20px"></i></button>`).join('')}`;
  }
  function protocolSheet(pid) {
    const st = S.get(); const p = S.patient(pid);
    // suggest protocols matching the patient's condition region first
    const region = (p.condition || '').toLowerCase();
    const match = (c) => region.includes('diz') ? c === 'diz' : region.includes('bel') ? c === 'bel' : region.includes('omuz') ? c === 'omuz' : false;
    const list = [...st.protocols].sort((a, b) => (match(b.cat) ? 1 : 0) - (match(a.cat) ? 1 : 0));
    return `<h3 style="margin-bottom:4px">Hazır program uygula</h3><p class="hint" style="margin-bottom:14px">Tek dokunuşla tüm hareketleri ekle. Sonra düzenleyebilirsin.</p>
      ${list.map(pt => `<button class="preset" data-act="apply-protocol" data-pid="${pt.id}" data-id="${pid}" style="align-items:flex-start">
        <span class="pv" style="background:var(--teal-50);color:var(--teal-600)"><i class="ti ti-stack-2" style="font-size:22px"></i></span>
        <span style="flex:1"><span style="font-weight:600">${esc(pt.name)}</span><br><span class="hint">${esc(pt.desc)}</span>${match(pt.cat) ? ' <span class="badge teal" style="font-size:10px">önerilen</span>' : ''}</span>
        <i class="ti ti-plus" style="color:var(--teal-600);font-size:20px"></i></button>`).join('')}`;
  }
  function configSheet(pid, pr) {
    return `<h3 style="margin-bottom:4px">${esc(pr.name)}</h3><p class="hint" style="margin-bottom:14px">Hastana göre ayarla</p>
      <div class="demo-stage" style="height:120px;margin-bottom:14px">${fzDemo(pr.demo)}</div>
      <div class="num-row">
        <div class="field"><label>Tekrar</label><input class="input" id="cfgReps" type="number" value="${pr.reps}" inputmode="numeric"></div>
        <div class="field"><label>Set</label><input class="input" id="cfgSets" type="number" value="${pr.sets}" inputmode="numeric"></div>
        <div class="field"><label>Süre (sn)</label><input class="input" id="cfgHold" type="number" value="${pr.hold}" inputmode="numeric"></div>
      </div>
      <div class="field"><label>Günde kaç kez (farklı zamanlarda)</label><input class="input" id="cfgFreq" type="number" min="1" value="1" inputmode="numeric"></div>
      <div class="field"><label>Not</label><textarea id="cfgNote">${esc(pr.note)}</textarea></div>
      <div class="card row between" style="margin-bottom:14px"><div><div style="font-weight:600">Kamerayla kanıt iste</div><div class="hint">Hasta her seansı bir kez kanıtlasın</div></div><button class="switch" id="cfgVerify" role="switch" aria-checked="false" data-act="toggle-cfg-verify" aria-label="Kamerayla kanıt iste"></button></div>
      <button class="btn btn-primary" data-act="add-preset" data-pid="${pr.id}" data-id="${pid}"><i class="ti ti-plus"></i> Programa ekle</button>`;
  }
  function couldntSheet(eid) {
    const reasons = ['Ağrı oldu', 'Çok yoruldum', 'Hareketi anlamadım', 'Zamanım olmadı'];
    return `<h3 style="margin-bottom:4px">Nasıl geçti?</h3><p class="hint" style="margin-bottom:14px">Hekimine ilet, sorun değil.</p>
      ${reasons.map((r) => `<button class="chip" data-act="reason-pick" data-reason="${esc(r)}" style="display:block;width:100%;text-align:left;margin-bottom:8px">${r}</button>`).join('')}
      <div class="field" style="margin-top:10px"><label>Ağrı seviyen (0 = yok, 10 = çok)</label>
        <div class="row gap8" style="flex-wrap:wrap" id="painRow">${Array.from({ length: 11 }, (_, n) => `<button class="chip" data-act="pain-pick" data-pain="${n}" style="min-width:38px;text-align:center">${n}</button>`).join('')}</div></div>
      <div class="field mt8"><textarea id="couldntText" placeholder="Eklemek istersen…"></textarea></div>
      <button class="btn btn-primary" data-act="send-couldnt" data-eid="${eid}"><i class="ti ti-send"></i> Hekime gönder</button>`;
  }

  const toneLabel = (t) => ({ gentle: 'Nazik', normal: 'Normal', strict: 'Sıkı' }[t] || 'Normal');
  const TIMES = ['08:00', '10:00', '13:00', '18:00', '20:00'];
  const ACTIONS = [['notifyDoctor', 'Bana bildir', 'ti-bell'], ['remindPatient', 'Hastaya hatırlat', 'ti-message-dots'], ['callPatient', 'Hastayı ara', 'ti-phone'], ['messagePatient', 'Mesaj gönder', 'ti-send']];
  const actLabel = (a) => (ACTIONS.find(x => x[0] === a) || [, a])[1];
  function autoSummary(name, days, acts) {
    if (!acts || !acts.length) return `${name} ${days} gün egzersiz yapmazsa bir şey yapılmaz.`;
    return `${name} <b>${days} gün</b> egzersiz yapmazsa: ${acts.map(a => actLabel(a).toLocaleLowerCase('tr')).join(', ')}.`;
  }
  function notifSheet(p) {
    const tones = [['gentle', 'Nazik'], ['normal', 'Normal'], ['strict', 'Sıkı']];
    return `<h3 style="margin-bottom:4px">${esc(p.name)}</h3><p class="hint" style="margin-bottom:14px">Bu hastaya özel bildirim</p>
      <div class="field"><label>Ton</label><div class="row gap8">${tones.map(([v, l]) => `<button class="chip ${p.notif.tone === v ? 'on' : ''}" data-act="ntone" data-id="${p.id}" data-v="${v}">${l}</button>`).join('')}</div></div>
      <div class="field"><label>Hatırlatma saatleri</label><div class="row gap8" style="flex-wrap:wrap">${TIMES.map(t => `<button class="chip ${p.notif.times.includes(t) ? 'on' : ''}" data-act="ntime" data-id="${p.id}" data-t="${t}">${t}</button>`).join('')}</div></div>
      <div class="divider"></div>
      <div class="field"><label><i class="ti ti-robot" style="vertical-align:-2px"></i> Otomatik takip, kaç gün egzersiz yapmazsa</label><div class="row gap8">${[1, 2, 3].map(dn => `<button class="chip ${p.notif.escalateDays === dn ? 'on' : ''}" data-act="nesc" data-id="${p.id}" data-d="${dn}">${dn} gün</button>`).join('')}</div></div>
      <div class="field"><label>Otomatik aksiyon</label><div class="row gap8" style="flex-wrap:wrap">${ACTIONS.map(([a, l, ic]) => `<button class="chip ${p.notif.autoActions.includes(a) ? 'on' : ''}" data-act="nact" data-id="${p.id}" data-a="${a}"><i class="ti ${ic}"></i> ${l}</button>`).join('')}</div></div>
      <div class="card" style="background:var(--teal-50);border-color:var(--teal-100);margin-bottom:14px"><p style="color:var(--teal-700);font-size:14px;margin:0">${autoSummary(p.name.split(' ')[0], p.notif.escalateDays, p.notif.autoActions)}</p></div>
      <button class="btn btn-primary" data-act="close-sheet"><i class="ti ti-check"></i> Tamam</button>`;
  }
  function drawCardCanvas() {
    const st = S.get(); const p = st.patients[0];
    const days = p.week * 7, moves = p.week * 12, first = p.name.split(' ')[0];
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
    const x = c.getContext('2d');
    x.fillStyle = '#1F4D43'; x.fillRect(0, 0, 1080, 1080);
    x.fillStyle = 'rgba(255,255,255,0.06)'; x.beginPath(); x.arc(900, 980, 300, 0, 7); x.fill();
    x.textAlign = 'center';
    // logo badge
    x.fillStyle = 'rgba(255,255,255,0.16)'; x.beginPath(); x.roundRect(470, 130, 140, 140, 34); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 14; x.lineCap = 'round'; x.beginPath(); x.moveTo(508, 202); x.lineTo(534, 230); x.lineTo(576, 172); x.stroke();
    // text
    x.fillStyle = '#fff'; x.font = '700 80px sans-serif'; x.fillText('Harika gidiyorum!', 540, 400);
    x.font = '600 60px sans-serif'; x.fillText(first, 540, 486);
    x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = '400 38px sans-serif'; x.fillText('Fizyon ile programıma sadık kaldım', 540, 560);
    // stat pills
    const pill = (px, val, lbl) => { x.fillStyle = 'rgba(255,255,255,0.14)'; x.beginPath(); x.roundRect(px, 620, 320, 180, 28); x.fill(); x.fillStyle = '#fff'; x.font = '700 88px sans-serif'; x.fillText(val, px + 160, 720); x.fillStyle = 'rgba(255,255,255,0.8)'; x.font = '400 34px sans-serif'; x.fillText(lbl, px + 160, 768); };
    pill(190, String(moves), 'toplam hareket'); pill(570, String(days), 'gün');
    x.fillStyle = 'rgba(255,255,255,0.92)'; x.font = '400 40px sans-serif'; x.fillText(st.doctor.name + ' eşliğinde', 540, 910);
    x.fillStyle = '#fff'; x.font = '700 52px sans-serif'; x.fillText('Fizyon', 540, 1000);
    return c;
  }
  function shareCard(forceDownload) {
    const canvas = drawCardCanvas();
    canvas.toBlob((blob) => {
      const file = new File([blob], 'fizyon-basari.png', { type: 'image/png' });
      if (!forceDownload && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'Fizyon', text: 'Ev egzersiz programıma sadık kaldım! 💪 #Fizyon' }).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'fizyon-basari.png'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        if (!forceDownload) toast('Görsel indirildi');
      }
    }, 'image/png');
  }

  function inviteSheet(code) {
    return `<h3 style="margin-bottom:4px">Hasta davet et</h3><p class="hint" style="margin-bottom:14px">Hastan üye olurken bu kodu girsin, hesabı otomatik sana bağlanır.</p>
      <div class="card center" style="background:var(--teal-50);border-color:var(--teal-100)"><div class="caption" style="color:var(--teal-600)">Fizyoterapist kodun</div><div style="font-size:34px;font-weight:700;letter-spacing:5px;color:var(--teal-700);margin-top:4px" id="inviteCode">${esc(code || '-')}</div></div>
      <button class="btn btn-secondary mt8" data-act="copy-code" data-code="${esc(code || '')}"><i class="ti ti-copy"></i> Kodu kopyala</button>
      <button class="btn btn-primary mt8" data-act="close-sheet"><i class="ti ti-check"></i> Tamam</button>`;
  }
  function recordSheet(pid) {
    return `<h3 style="margin-bottom:4px">Kendi videonu kaydet</h3><p class="hint" style="margin-bottom:12px">Hastanın yaptığı hareketi kaydet</p>
      <div class="cam-stage" style="aspect-ratio:4/3;margin-bottom:12px"><video id="rvCam" autoplay playsinline muted></video><div class="cam-hint" id="rvHint">Hazır olunca kaydı başlat</div></div>
      <div class="field"><label for="rvName">Hareket adı</label><input id="rvName" class="input" value="Özel hareket"></div>
      <div class="num-row"><div class="field"><label>Tekrar</label><input id="rvReps" class="input" type="number" value="10"></div><div class="field"><label>Set</label><input id="rvSets" class="input" type="number" value="3"></div><div class="field"><label>Süre</label><input id="rvHold" class="input" type="number" value="0"></div></div>
      <button class="btn btn-accent" id="rvRec" data-act="rv-record" data-id="${pid}"><i class="ti ti-video"></i> Kaydı başlat</button>`;
  }
  async function startPreview() {
    const v = $('#rvCam', document); if (!v) return;
    camStop = false;
    try { camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }); v.srcObject = camStream; await v.play().catch(() => {}); const h = $('#rvHint', document); if (h) h.textContent = 'Hazır olunca kaydı başlat'; }
    catch (e) { const h = $('#rvHint', document); if (h) h.textContent = 'Kamera yok, demoda yine kaydedebilirsin'; }
  }
  const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const DAYS_FULL = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  function apptSheet(p) {
    return `<h3 style="margin-bottom:4px">Randevu</h3><p class="hint" style="margin-bottom:14px">${esc(p.name)} · sonraki randevu</p>
      <div class="field"><label for="apDate">Tarih</label><input class="input" id="apDate" type="date"></div>
      <div class="field"><label for="apTime">Saat</label><input class="input" id="apTime" type="time" value="14:00"></div>
      <button class="btn btn-primary" data-act="save-appt" data-id="${p.id}"><i class="ti ti-check"></i> Kaydet</button>`;
  }
  function noteSheet(p) {
    return `<h3 style="margin-bottom:4px">${esc(p.name)}'e not</h3><p class="hint" style="margin-bottom:12px">Hastanın "Bugün" ekranında görünür.</p>
      <div class="field"><textarea id="docNote" placeholder="Örn. Ağrı varsa tekrarı azalt, yarın tekrar deneyelim.">${esc(p.note || '')}</textarea></div>
      <button class="btn btn-primary" data-act="send-note" data-id="${p.id}"><i class="ti ti-send"></i> Gönder</button>`;
  }
  function clinicalSheet(p) {
    return `<h3 style="margin-bottom:12px">${esc(p.name)}, bilgiler</h3>
      <div class="field"><label for="clCond">Durum / bölge</label><input class="input" id="clCond" value="${esc(p.condition === '-' ? '' : p.condition)}" placeholder="Örn. Sol diz, menisküs"></div>
      <div class="field"><label for="clWeek">Tedavi haftası</label><input class="input" id="clWeek" type="number" min="1" value="${p.week}"></div>
      <button class="btn btn-primary" data-act="save-clinical" data-id="${p.id}"><i class="ti ti-check"></i> Kaydet</button>`;
  }
  function reminderSheet(p) {
    const granted = ('Notification' in window) && Notification.permission === 'granted';
    return `<h3 style="margin-bottom:4px">Hatırlatma</h3><p class="hint" style="margin-bottom:14px">Egzersiz hatırlatma saatlerin</p>
      <div class="row gap8" style="flex-wrap:wrap;margin-bottom:14px">${TIMES.map(t => `<button class="chip ${p.notif.times.includes(t) ? 'on' : ''}" data-act="ptime" data-t="${t}">${t}</button>`).join('')}</div>
      ${granted ? '<div class="card" style="background:var(--teal-50);border-color:var(--teal-100);margin-bottom:12px"><p style="color:var(--teal-700);font-size:14px;margin:0"><i class="ti ti-bell-check"></i> Bildirimler açık.</p></div>' : '<button class="btn btn-secondary" data-act="enable-notif" style="margin-bottom:12px"><i class="ti ti-bell"></i> Telefon bildirimine izin ver</button>'}
      <button class="btn btn-primary" data-act="close-sheet"><i class="ti ti-check"></i> Kaydet</button>`;
  }

  function editSheet(pid, ex) {
    return `<h3 style="margin-bottom:4px">Hareketi düzenle</h3><p class="hint" style="margin-bottom:14px">Hastana göre güncelle</p>
      <div class="demo-stage sm" style="height:120px;margin-bottom:14px">${fzDemo(ex.demo)}</div>
      <div class="field"><label>Hareket adı</label><input class="input" id="edName" value="${esc(ex.name)}"></div>
      <div class="num-row">
        <div class="field"><label>Tekrar</label><input class="input" id="edReps" type="number" value="${ex.reps}" inputmode="numeric"></div>
        <div class="field"><label>Set</label><input class="input" id="edSets" type="number" value="${ex.sets}" inputmode="numeric"></div>
        <div class="field"><label>Süre (sn)</label><input class="input" id="edHold" type="number" value="${ex.hold || 0}" inputmode="numeric"></div>
      </div>
      <div class="field"><label>Günde kaç kez (farklı zamanlarda)</label><input class="input" id="edFreq" type="number" min="1" value="${ex.freq || 1}" inputmode="numeric"></div>
      <div class="field"><label>Not</label><textarea id="edNote">${esc(ex.note || '')}</textarea></div>
      <div class="card row between" style="margin-bottom:14px"><div><div style="font-weight:600">Kamerayla kanıt iste</div><div class="hint">Hasta hareketi kanıtlasın</div></div><button class="switch" id="cfgVerify" role="switch" aria-checked="${ex.verify ? 'true' : 'false'}" data-act="toggle-cfg-verify" aria-label="Kamerayla kanıt iste"></button></div>
      <button class="btn btn-primary" data-act="save-ex" data-eid="${ex.id}" data-id="${pid}"><i class="ti ti-check"></i> Kaydet</button>`;
  }
  function delConfirmSheet(eid, name) {
    return `<h3 style="margin-bottom:4px">Hareketi sil?</h3><p class="hint" style="margin-bottom:18px">"${esc(name)}" hastanın programından kaldırılacak.</p>
      <button class="btn btn-danger" data-act="del-ex" data-eid="${eid}"><i class="ti ti-trash"></i> Sil</button>
      <button class="btn btn-secondary mt8" data-act="close-sheet">Vazgeç</button>`;
  }
  function slotPatientName(id) { const p = S.patient(id); return p ? p.name : 'Hasta'; }
  function bookSheet(p) {
    const st = S.get(); const url = st.doctor.bookingUrl;
    if (url) return `<h3 style="margin-bottom:4px">Randevu al</h3><p class="hint" style="margin-bottom:14px">${esc(st.doctor.name)} kendi randevu sayfasını kullanıyor.</p>
      <a class="btn btn-primary" href="${esc(url)}" target="_blank" rel="noopener"><i class="ti ti-external-link"></i> Randevu sayfasını aç</a>
      <button class="btn btn-secondary mt8" data-act="close-sheet">Kapat</button>`;
    const open = (st.slots || []).filter(s => !s.bookedBy);
    return `<h3 style="margin-bottom:4px">Uygun randevular</h3><p class="hint" style="margin-bottom:14px">Bir saat seç, randevun oluşsun.</p>
      ${open.length ? open.map(s => `<button class="slot" data-act="book-slot" data-sid="${s.id}"><span><span style="font-weight:600">${esc(s.date)}</span><br><span class="hint">${esc(s.time)}</span></span><span class="badge teal"><i class="ti ti-check"></i> Seç</span></button>`).join('') : '<p class="hint">Şu an açık randevu yok. Fizyoterapistin yeni saatler ekleyince burada görünür.</p>'}
      <button class="btn btn-secondary mt8" data-act="close-sheet">Kapat</button>`;
  }

  function wireRoleLicense() {
    const lic = $('#docLic'), link = $('#patLink');
    $$('[data-role-pick]').forEach(b => b.onclick = () => {
      $$('[data-role-pick]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      const isDoc = b.dataset.rolePick === 'doctor';
      lic.hidden = !isDoc; if (link) link.hidden = isDoc;
    });
  }

  /* ---------- global event delegation ---------- */
  let cfgVerify = false, reasonPick = null, painPick = null;
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go],[data-act],[data-reg],[data-login],[data-nav],[data-patient],[data-exercise]');
    if (!t) return;
    const st = S.get();
    const d = t.dataset;

    if (d.go) return go(d.go);
    if (d.nav) { stack = [d.nav]; return render(); }
    if (d.reg) return go('reg_form', { type: d.reg });
    if (d.login) { st.session = { role: d.login, id: d.login === 'doctor' ? 'd1' : 'p1' }; S.save(); return home(); }
    if (d.patient) return go('d_patient', { id: d.patient });
    if (d.exercise) return go('p_exercise', { eid: d.exercise });

    const act = d.act;
    if (act === 'back') return back();
    if (act === 'register') return doRegister();
    if (act === 'demo-doctor') { S.startDemo('doctor'); return home(); }
    if (act === 'demo-patient') { S.startDemo('patient'); return home(); }
    if (act === 'dologin') return doLogin(t);
    if (act === 'logout') { try { if (S.isCloud()) { window.FZ_API.unsubscribeAll(); window.FZ_API.signOut(); } } catch (e) {} S.logout(); stack = ['welcome']; return render(); }
    if (act === 'reset') { S.reset(); stack = ['welcome']; toast('Sıfırlandı'); return render(); }
    if (act === 'toggle-gamify') { st.settings.gamify = !st.settings.gamify; if (S.isCloud()) window.FZ_API.setGamification(st.patients[0].id, { gamify_enabled: st.settings.gamify }).catch(() => {}); S.save(); return render(); }
    if (act === 'toggle-bigtext') { uiSet('bigText', !uiGet('bigText')); return render(); }
    /* KVKK data-subject rights (patient) */
    if (act === 'export-data') { return exportMyData(); }
    if (act === 'withdraw-consent') { return openSheet(confirmSheet('Onayı geri çek', 'Sağlık verisi işleme onayını geri çekersen egzersiz takibin durur ve fizyoterapistin yeni verini göremez. Devam edilsin mi?', 'withdraw-consent-yes', 'Onayı geri çek', true)); }
    if (act === 'withdraw-consent-yes') { if (S.isCloud()) window.FZ_API.setConsent(false).catch(() => {}); closeSheet(); return toast('Onayın geri çekildi. İstersen tekrar açabilirsin.'); }
    if (act === 'delete-account') { return openSheet(confirmSheet('Hesabı sil', 'Hesabın ve tüm verilerin kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misin?', 'delete-account-yes', 'Evet, hesabımı sil', true)); }
    if (act === 'delete-account-yes') {
      closeSheet();
      if (S.isCloud()) { window.FZ_API.deleteAccount().then(ok => { try { window.FZ_API.unsubscribeAll(); } catch (e) {} S.logout(); stack = ['welcome']; render(); toast(ok ? 'Hesabın ve verilerin silindi' : 'Silme talebin alındı; çıkış yapıldı.'); }); return; }
      S.reset(); stack = ['welcome']; render(); return toast('Demo verilerin silindi');
    }
    if (act === 'new-patient') { if (S.isCloud()) return openSheet(inviteSheet(st.code)); return go('d_newpatient'); }
    if (act === 'create-patient') {
      const name = ($('#npName', document).value || '').trim();
      const err = $('#npErr', document);
      if (name.length < 2) { err.hidden = false; err.innerHTML = '<i class="ti ti-alert-circle"></i> Lütfen hastanın adını gir.'; return; }
      const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toLocaleUpperCase('tr');
      const id = 'p' + Date.now();
      st.patients.push({ id, name, initials, condition: ($('#npCond', document).value || '').trim() || 'Belirtilmedi', week: +$('#npWeek', document).value || 1, adherence: 0, streak: 0, points: 0, journeyStage: 1, history: [0, 0, 0, 0, 0, 0, 0], note: '', nextAppt: 'Planlanmadı', notif: { tone: 'normal', times: ['18:00'], escalateDays: 2, autoActions: ['notifyDoctor'] }, couldnt: [], program: [] });
      S.save(); stack = ['d_patients']; go('d_patient', { id }); return toast(name + ' eklendi');
    }
    if (act === 'reply-note') return openSheet(noteSheet(S.patient(d.id)));
    if (act === 'send-note') { const p = S.patient(d.id); p.note = ($('#docNote', document).value || '').trim(); if (S.isCloud()) window.FZ_API.setPatient(p.id, { note: p.note }).catch(() => {}); S.save(); closeSheet(); render(); return toast('Not gönderildi'); }
    if (act === 'edit-clinical') return openSheet(clinicalSheet(S.patient(d.id)));
    if (act === 'save-clinical') { const p = S.patient(d.id); p.condition = ($('#clCond', document).value || '').trim() || '-'; p.week = +$('#clWeek', document).value || 1; if (S.isCloud()) window.FZ_API.setPatient(p.id, { condition: p.condition === '-' ? null : p.condition, week: p.week }).catch(() => {}); S.save(); closeSheet(); render(); return toast('Güncellendi'); }
    if (act === 'edit-appt') return openSheet(apptSheet(S.patient(d.id)));
    if (act === 'save-appt') {
      const dv = $('#apDate', document).value, tv = $('#apTime', document).value || '14:00';
      const p = S.patient(d.id);
      if (dv) { const dt = new Date(dv + 'T00:00'); p.nextAppt = `${dt.getDate()} ${MONTHS[dt.getMonth()]}, ${tv}`; if (S.isCloud()) window.FZ_API.setAppointment({ patient_id: p.id, at: new Date(dv + 'T' + tv).toISOString(), created_by: st.doctor.id }).catch(() => {}); }
      S.save(); closeSheet(); render(); return toast('Randevu güncellendi');
    }

    /* appointments — external booking link + internal slots */
    if (act === 'set-booking-url') { const url = ($('#bkUrl', document).value || '').trim(); st.doctor.bookingUrl = url; if (S.isCloud()) window.FZ_API.setBookingUrl(url).catch(() => {}); S.save(); return toast('Bağlantı kaydedildi'); }
    if (act === 'add-slot') {
      const dv = $('#slDate', document).value, tv = $('#slTime', document).value || '10:00';
      if (!dv) return toast('Önce tarih seç');
      const dt = new Date(dv + 'T' + tv);
      const label = `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${DAYS_SHORT[dt.getDay()]}`;
      if (S.isCloud()) { window.FZ_API.addSlot(dt.toISOString()).then(async () => { await refreshSlots(); render(); toast('Saat eklendi'); }).catch(() => toast('Eklenemedi')); }
      else { st.slots.push({ id: 's' + Date.now(), date: label, time: tv, bookedBy: null }); S.save(); render(); toast('Saat eklendi'); }
      return;
    }
    if (act === 'del-slot') {
      if (S.isCloud()) { window.FZ_API.deleteSlot(d.sid).then(async () => { await refreshSlots(); render(); toast('Silindi'); }).catch(() => toast('Silinemedi')); }
      else { st.slots = st.slots.filter(s => s.id !== d.sid); S.save(); render(); toast('Silindi'); }
      return;
    }
    if (act === 'open-booking') return openSheet(bookSheet(st.patients[0]));
    if (act === 'book-slot') {
      const s = (st.slots || []).find(x => x.id === d.sid); const p = st.patients[0]; if (!s) return;
      closeSheet();
      if (S.isCloud()) { window.FZ_API.bookSlot(d.sid).then(async () => { await refreshSlots(); p.nextAppt = s.date + ', ' + s.time; render(); toast('Randevu alındı ✓'); }).catch(() => toast('Alınamadı')); }
      else { s.bookedBy = p.id; p.nextAppt = s.date + ', ' + s.time; S.save(); render(); toast('Randevu alındı ✓'); }
      return;
    }
    if (act === 'build') return go('d_build', { id: d.id });
    if (act === 'record-own') { openSheet(recordSheet(d.id)); startPreview(); return; }
    if (act === 'rv-record') {
      const btn = t, hint = $('#rvHint', document); btn.disabled = true; let n = 3;
      hint.textContent = 'Kayıt: 3'; hint.style.background = 'rgba(214,69,69,.7)';
      const iv = setInterval(() => {
        n--;
        if (n > 0) { hint.textContent = 'Kayıt: ' + n; return; }
        clearInterval(iv);
        const p = S.patient(d.id);
        const ex = { name: ($('#rvName', document).value || 'Özel hareket').trim(), demo: 'generic', reps: +$('#rvReps', document).value || 10, sets: +$('#rvSets', document).value || 3, hold: +$('#rvHold', document).value || 0 };
        stopCamera();
        if (S.isCloud()) {
          closeSheet();
          window.FZ_API.addExercise({ patient_id: p.id, name: ex.name, demo: ex.demo, reps: ex.reps, sets: ex.sets, hold: ex.hold, freq: 1, note: '', verify_text: null, created_by: st.doctor.id })
            .then(async () => { await refreshProgram(p.id); render(); toast('Hareket kaydedildi ✓'); }).catch(() => toast('Kaydedilemedi'));
        } else { p.program.push({ id: 'e' + Date.now(), ...ex, freq: 1, video: true, note: '', verify: null }); S.save(); closeSheet(); render(); toast('Video kaydedildi ✓'); }
      }, 800);
      return;
    }

    /* notifications */
    if (act === 'ntog') { st.settings.notif[d.k] = !st.settings.notif[d.k]; S.save(); return render(); }
    if (act === 'patient-notif') { const p = S.patient(d.id) || params.id && S.patient(params.id); return openSheet(notifSheet(p || S.patient(params.id))); }
    if (act === 'ntone') { const p = S.patient(d.id); p.notif.tone = d.v; saveNotif(p); return openSheet(notifSheet(p)); }
    if (act === 'ntime') { const p = S.patient(d.id); const i = p.notif.times.indexOf(d.t); if (i >= 0) p.notif.times.splice(i, 1); else { p.notif.times.push(d.t); p.notif.times.sort(); } saveNotif(p); return openSheet(notifSheet(p)); }
    if (act === 'nesc') { const p = S.patient(d.id); p.notif.escalateDays = +d.d; saveNotif(p); return openSheet(notifSheet(p)); }
    if (act === 'nact') { const p = S.patient(d.id); const i = p.notif.autoActions.indexOf(d.a); if (i >= 0) p.notif.autoActions.splice(i, 1); else p.notif.autoActions.push(d.a); saveNotif(p); return openSheet(notifSheet(p)); }
    if (act === 'gesc') { st.settings.notif.inactiveDays = +d.d; S.save(); return render(); }
    if (act === 'gnact') { const arr = st.settings.notif.autoActions; const i = arr.indexOf(d.a); if (i >= 0) arr.splice(i, 1); else arr.push(d.a); S.save(); return render(); }
    if (act === 'copy-code') {
      const code = d.code || '';
      if (!code) return toast('Kod yok');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(() => toast('Kod kopyalandı: ' + code)).catch(() => toast('Kod: ' + code));
      else { try { const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Kod kopyalandı: ' + code); } catch { toast('Kod: ' + code); } }
      return;
    }
    if (act === 'msg-doctor') return toast('Mesajlaşma yakında, şimdilik fizyoterapistin bildirim alır');
    if (act === 'share-card') return shareCard(false);
    if (act === 'download-card') return shareCard(true);
    if (act === 'reminder') return openSheet(reminderSheet(st.patients[0]));
    if (act === 'enable-notif') {
      if (!('Notification' in window)) return toast('Bu cihaz bildirimi desteklemiyor');
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') { try { new Notification('Fizyon', { body: 'Hatırlatmalar açık, egzersiz zamanında haber vereceğiz.', icon: 'assets/logo.svg' }); } catch (e) {} subscribePush(); toast('Bildirimler açıldı'); openSheet(reminderSheet(st.patients[0])); }
        else toast('Bildirim izni verilmedi');
      }).catch(() => toast('İzin alınamadı'));
      return;
    }
    if (act === 'ptime') { const p = st.patients[0]; const i = p.notif.times.indexOf(d.t); if (i >= 0) p.notif.times.splice(i, 1); else { p.notif.times.push(d.t); p.notif.times.sort(); } saveNotif(p); return openSheet(reminderSheet(p)); }
    if (act === 'close-sheet') { closeSheet(); return render(); }

    /* builder + library */
    if (act === 'open-protocols') return openSheet(protocolSheet(d.id));
    if (act === 'apply-protocol') {
      const pt = st.protocols.find(x => x.id === d.pid); const p = S.patient(d.id);
      const exs = pt.items.map(it => { const pr = st.presets.find(x => x.id === it.preset); return { name: pr.name, demo: pr.demo, reps: pr.reps, sets: pr.sets, hold: pr.hold, freq: pr.freq || 1, note: pr.note, verify: it.verify ? 'Hareketi yap ve kameraya göster' : null }; });
      closeSheet();
      if (S.isCloud()) {
        Promise.all(exs.map(ex => window.FZ_API.addExercise({ patient_id: p.id, name: ex.name, demo: ex.demo, reps: ex.reps, sets: ex.sets, hold: ex.hold, freq: ex.freq, note: ex.note, verify_text: ex.verify, created_by: st.doctor.id })))
          .then(async () => { await refreshProgram(p.id); render(); toast(pt.name + ' uygulandı'); }).catch(() => toast('Uygulanamadı'));
      } else { exs.forEach((ex, i) => p.program.push({ id: 'e' + (Date.now() + i), ...ex })); S.save(); render(); toast(pt.name + ' uygulandı'); }
      return;
    }
    if (act === 'open-library') { sheetCat = 'all'; return openSheet(librarySheet(d.id)); }
    if (act === 'set-cat') { sheetCat = d.cat; return openSheet(librarySheet(d.id)); }
    if (act === 'pick-preset') { cfgVerify = false; const pr = st.presets.find(x => x.id === d.pid); return openSheet(configSheet(d.id, pr)); }
    if (act === 'toggle-cfg-verify') { cfgVerify = !cfgVerify; t.setAttribute('aria-checked', cfgVerify ? 'true' : 'false'); return; }
    if (act === 'add-preset') {
      const pr = st.presets.find(x => x.id === d.pid); const p = S.patient(d.id);
      const ex = { name: pr.name, demo: pr.demo, reps: +$('#cfgReps', document).value || pr.reps, sets: +$('#cfgSets', document).value || pr.sets, hold: +$('#cfgHold', document).value || 0, freq: Math.max(1, +$('#cfgFreq', document).value || 1), note: $('#cfgNote', document).value.trim(), verify: cfgVerify ? 'Hareketi yap ve kameraya göster' : null };
      if (S.isCloud()) {
        closeSheet();
        window.FZ_API.addExercise({ patient_id: p.id, name: ex.name, demo: ex.demo, reps: ex.reps, sets: ex.sets, hold: ex.hold, freq: ex.freq, note: ex.note, verify_text: ex.verify, created_by: st.doctor.id })
          .then(async () => { await refreshProgram(p.id); render(); toast(pr.name + ' eklendi'); }).catch(() => toast('Eklenemedi'));
      } else { p.program.push({ id: 'e' + Date.now(), ...ex }); S.save(); closeSheet(); render(); toast(pr.name + ' eklendi'); }
      return;
    }
    if (act === 'del-ex-ask') { const p = S.patient(params.id); const ex = p && p.program.find(x => x.id === d.eid); return openSheet(delConfirmSheet(d.eid, ex ? ex.name : 'Hareket')); }
    if (act === 'del-ex') {
      const p = S.patient(params.id); closeSheet();
      if (S.isCloud()) { window.FZ_API.deleteExercise(d.eid).then(async () => { await refreshProgram(p.id); render(); toast('Hareket silindi'); }).catch(() => toast('Silinemedi')); }
      else { p.program = p.program.filter(x => x.id !== d.eid); S.save(); render(); toast('Hareket silindi'); }
      return;
    }
    if (act === 'edit-ex') { const p = S.patient(params.id); const ex = p.program.find(x => x.id === d.eid); if (!ex) return; cfgVerify = !!ex.verify; return openSheet(editSheet(p.id, ex)); }
    if (act === 'save-ex') {
      const p = S.patient(d.id); const ex = p.program.find(x => x.id === d.eid); if (!ex) return;
      const patch = { name: ($('#edName', document).value || ex.name).trim(), reps: +$('#edReps', document).value || ex.reps, sets: +$('#edSets', document).value || ex.sets, hold: +$('#edHold', document).value || 0, freq: Math.max(1, +$('#edFreq', document).value || 1), note: ($('#edNote', document).value || '').trim(), verify: cfgVerify ? (ex.verify || 'Hareketi yap ve kameraya göster') : null };
      if (S.isCloud()) { closeSheet(); window.FZ_API.updateExercise(d.eid, { name: patch.name, reps: patch.reps, sets: patch.sets, hold: patch.hold, freq: patch.freq, note: patch.note, verify_text: patch.verify }).then(async () => { await refreshProgram(p.id); render(); toast('Güncellendi'); }).catch(() => toast('Güncellenemedi')); }
      else { Object.assign(ex, patch); S.save(); closeSheet(); render(); toast('Güncellendi'); }
      return;
    }

    /* player + verify */
    if (act === 'start-session') { const p = st.patients[0]; const ids = p.program.filter(e => !isDoneToday(p, e)).map(e => e.id); if (!ids.length) return toast('Bugün zaten tamam'); session = { ids, i: 0 }; return go('p_exercise', { eid: ids[0], session: true }); }
    if (act === 'goverify') return go('p_verify', { eid: d.eid });
    if (act === 'complete-noverify') {
      const p = st.patients[0]; const ex = p.program.find(x => x.id === d.eid) || p.program[0];
      recordSession(ex, 'none');
      toast('Kanıtsız tamamlandı'); if (session) return sessionAdvance(); return home();
    }
    if (act === 'sim-verify') { const p = st.patients[0]; const ex = p.program.find(x => x.id === d.eid) || p.program[0]; stopCamera(); recordSession(ex, 'manual'); toast('Kamerasız tamamlandı — kaydında “kanıtsız” görünür'); if (session) return sessionAdvance(); return home(); }

    /* couldn't-do */
    if (act === 'couldnt') { reasonPick = null; painPick = null; return openSheet(couldntSheet(d.eid)); }
    if (act === 'reason-pick') { reasonPick = d.reason; $$('[data-act="reason-pick"]', document).forEach(x => x.classList.toggle('on', x === t)); return; }
    if (act === 'pain-pick') { painPick = +d.pain; $$('[data-act="pain-pick"]', document).forEach(x => x.classList.toggle('on', x === t)); return; }
    if (act === 'send-couldnt') {
      const p = st.patients[0]; const txt = ($('#couldntText', document) || {}).value || '';
      p.couldnt.unshift({ day: 'Bugün', reason: reasonPick || 'Belirtilmedi', text: txt.trim(), pain: painPick });
      if (S.isCloud()) window.FZ_API.sendFeedback({ patient_id: p.id, exercise_id: d.eid || null, reason: reasonPick || 'Belirtilmedi', note: txt.trim(), pain: painPick }).catch(() => {});
      S.save(); closeSheet(); toast('Hekimine iletildi'); if (session) return sessionAdvance(); return back();
    }
  });
  function saveNotif(p) { S.save(); if (S.isCloud()) window.FZ_API.setNotif(p.id, { tone: p.notif.tone, times: p.notif.times, inactive_days: p.notif.escalateDays, auto_actions: p.notif.autoActions }).catch(() => {}); }

  async function doLogin(btn) {
    const err = $('#liErr'); const email = ($('#liEmail').value || '').trim(); const pw = $('#liPw').value || '';
    if (!email || !pw) { err.hidden = false; err.innerHTML = '<i class="ti ti-alert-circle"></i> E-posta ve parola gerekli.'; return; }
    err.hidden = true; btn.disabled = true; btn.textContent = 'Giriş yapılıyor…';
    try {
      const { error } = await window.FZ_API.signIn({ email, password: pw });
      if (error) throw error;
      const cs = await window.__fzBuildCloudState();
      if (!cs) throw new Error('profil');
      S.loadCloud(cs); stack = [cs.session.role === 'doctor' ? 'd_patients' : 'p_today']; render(); startRealtime();
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Giriş yap';
      const m = ((e && e.message) || '').toLowerCase();
      err.hidden = false;
      err.innerHTML = '<i class="ti ti-alert-circle"></i> ' + (m.includes('confirm') ? 'Önce e-postanı doğrula.' : (m.includes('invalid') || m.includes('credential')) ? 'E-posta veya parola hatalı.' : 'Giriş başarısız.');
    }
  }

  async function doRegister() {
    const phone = params.type === 'phone';
    const err = $('#regErr');
    const name = $('#rn').value.trim();
    let msg = '';
    if (!name) msg = 'Lütfen adını gir.';
    else if (phone) { const v = $('#rp').value.replace(/\s/g, ''); if (!/^0?5\d{9}$/.test(v)) msg = 'Geçerli bir telefon numarası gir (05XX...).'; }
    else { const em = $('#re').value.trim(); const pw = $('#rpw').value; if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) msg = 'Geçerli bir e-posta gir.'; else if (pw.length < 8) msg = 'Parola en az 8 karakter olmalı.'; }
    const role = ($('[data-role-pick].on') || {}).dataset?.rolePick || 'patient';
    if (!msg && role === 'doctor' && !$('#rl').value.trim()) msg = 'Lisans numaranı gir.';
    if (!msg && !$('#consentHealth').checked) msg = 'Devam etmek için sağlık verisi açık rızası gerekli.';
    if (msg) { err.hidden = false; err.innerHTML = `<i class="ti ti-alert-circle"></i> ${esc(msg)}`; return; }
    err.hidden = true;

    // Phone OTP needs an SMS provider (Twilio/Netgsm) configured in Supabase, not yet wired.
    if (phone) { err.hidden = false; err.innerHTML = '<i class="ti ti-info-circle"></i> Telefonla kayıt için SMS sağlayıcısı gerekiyor (yakında). Şimdilik e-posta ile kayıt ol.'; return; }

    const btn = $('[data-act="register"]'); if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader"></i> Hesap oluşturuluyor…'; }
    try {
      const { data, error } = await window.FZ_API.signUp({ email: $('#re').value.trim(), password: $('#rpw').value, fullName: name, role, license: role === 'doctor' ? $('#rl').value.trim() : null, doctorCode: role === 'patient' ? ($('#rdc').value || '').trim() : null });
      if (error) throw error;
      if (data.session) {
        const cs = await window.__fzBuildCloudState();
        if (!cs) throw new Error('profil');
        S.loadCloud(cs); stack = [cs.session.role === 'doctor' ? 'd_patients' : 'p_today']; render(); startRealtime();
        toast('Hesabın oluşturuldu');
      } else {
        // email confirmation required (secure default)
        replace('reg_done', { email: $('#re').value.trim() });
      }
    } catch (e) {
      if (btn) { btn.disabled = false; btn.innerHTML = 'Devam et'; }
      err.hidden = false;
      const m = (e && e.message || '').toLowerCase();
      err.innerHTML = `<i class="ti ti-alert-circle"></i> ${esc(m.includes('already') ? 'Bu e-posta zaten kayıtlı.' : m.includes('fetch') || m.includes('network') ? 'Bağlantı yok. Demo modunu deneyebilirsin.' : 'Kayıt başarısız: ' + (e.message || 'bilinmeyen hata'))}`;
    }
  }

  /* ---------- cloud state assembly ---------- */
  const initialsOf = (name) => ((name || '').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toLocaleUpperCase('tr')) || '?';
  const mapEx = (e) => ({ id: e.id, name: e.name, demo: e.demo || 'generic', video: !!e.video_url, reps: e.reps, sets: e.sets, hold: e.hold, freq: e.freq || 1, note: e.note || '', verify: e.verify_text, done: false });
  const mapSessions = (comps) => (comps || []).map(c => ({ exId: c.exercise_id, date: (c.done_at || '').slice(0, 10), method: c.verify_method || (c.verified ? 'camera' : 'none'), verified: !!c.verified, at: c.done_at }));

  async function buildPatient(p) {
    const api = window.FZ_API;
    const [program, notif, gam, comps, appts, fb] = await Promise.all([
      api.program(p.id), api.getNotif(p.id), api.getGamification(p.id), api.completionsFor(p.id), api.appointmentsFor(p.id), api.feedbackFor(p.id)
    ]);
    const doneSet = new Set((comps || []).map(c => c.exercise_id));
    let nextAppt = 'Planlanmadı';
    if (appts && appts[0]) { const d = new Date(appts[0].at); nextAppt = `${d.getDate()} ${MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
    const obj = {
      id: p.id, name: p.full_name || 'İsimsiz', initials: initialsOf(p.full_name), condition: p.condition || '-', week: p.week || 1,
      adherence: 0, streak: 0, points: gam ? gam.points : 0, journeyStage: gam ? gam.journey_stage : 1,
      history: [0, 0, 0, 0, 0, 0, 0], note: p.note || '', nextAppt,
      notif: notif ? { tone: notif.tone || 'normal', times: notif.times || ['18:00'], escalateDays: notif.inactive_days || 2, autoActions: notif.auto_actions || ['notifyDoctor'] } : { tone: 'normal', times: ['18:00'], escalateDays: 2, autoActions: ['notifyDoctor'] },
      couldnt: (fb || []).map(f => ({ day: '', reason: f.reason || '', text: f.note || '', pain: f.pain })),
      sessions: mapSessions(comps),
      program: (program || []).map(e => ({ ...mapEx(e), done: doneSet.has(e.id) }))
    };
    recomputeStats(obj);   // adherence / 7-day history / streak from REAL completions — fixes the cloud-0 bug
    return obj;
  }

  async function buildCloudState() {
    const api = window.FZ_API, seed = S.seedRef;
    const profile = await api.myProfile();
    if (!profile) return null;
    const base = {
      session: { role: profile.role, id: profile.id, cloud: true }, cloud: true, code: profile.code || null,
      settings: { gamify: true, notif: structuredClone(seed.settings.notif) },
      presets: structuredClone(seed.presets), cats: structuredClone(seed.cats), badges: structuredClone(seed.badges), protocols: structuredClone(seed.protocols),
      doctor: { id: '', name: '', license: '', bookingUrl: '' }, patients: [], slots: []
    };
    if (profile.role === 'doctor') {
      base.doctor = { id: profile.id, name: profile.full_name || 'Fizyoterapist', license: profile.license_no || '', bookingUrl: profile.booking_url || '' };
      const [pts, slots] = await Promise.all([api.myPatients(), api.mySlots()]);
      base.patients = await Promise.all((pts || []).map(buildPatient));
      base.slots = (slots || []).map(mapSlot);
    } else {
      const doc = await api.myDoctor();
      base.doctor = doc ? { id: profile.doctor_id, name: doc.full_name || 'Fizyoterapist', license: doc.license_no || '', bookingUrl: doc.booking_url || '' } : { id: '', name: 'Fizyoterapist atanmadı', license: '', bookingUrl: '' };
      const self = await buildPatient(profile);
      base.patients = [self];
      if (profile.doctor_id) { const slots = await api.openSlots(profile.doctor_id); base.slots = (slots || []).map(mapSlot); }
      const g = await api.getGamification(profile.id); if (g) base.settings.gamify = g.gamify_enabled;
    }
    return base;
  }
  async function refreshProgram(pid) {
    const prog = await window.FZ_API.program(pid);
    const comps = await window.FZ_API.completionsFor(pid);
    const doneSet = new Set((comps || []).map(c => c.exercise_id));
    const p = S.patient(pid); if (p) p.program = (prog || []).map(e => ({ ...mapEx(e), done: doneSet.has(e.id) }));
  }
  function mapSlot(s) { const d = new Date(s.at); return { id: s.id, at: s.at, date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${DAYS_SHORT[d.getDay()]}`, time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, bookedBy: s.booked_by || null }; }
  async function refreshSlots() {
    const st = S.get(); if (!S.isCloud() || !st) return;
    if (st.session.role === 'doctor') { const rows = await window.FZ_API.mySlots(); st.slots = (rows || []).map(mapSlot); }
    else if (st.doctor.id) { const rows = await window.FZ_API.openSlots(st.doctor.id); st.slots = (rows || []).map(mapSlot); }
  }
  window.__fzBuildCloudState = buildCloudState; // used by handlers

  /* ---------- realtime: instant doctor↔patient sync ---------- */
  let rtTimer = null;
  async function startRealtime() {
    if (!S.isCloud()) return;
    try { await window.FZ_API.unsubscribeAll(); } catch (e) {}
    const st = S.get(); if (!st) return;
    const onChange = () => { if (rtTimer) clearTimeout(rtTimer); rtTimer = setTimeout(refreshFromCloud, 450); };
    try {
      if (st.session.role === 'patient') await window.FZ_API.subscribePatient(st.patients[0].id, onChange);
      else await window.FZ_API.subscribeDoctor(onChange);
    } catch (e) {}
  }
  async function refreshFromCloud() {
    if (!S.isCloud()) return;
    try {
      const cur = S.get();
      const cs = await buildCloudState(); if (!cs) return;
      cs.settings.gamify = cur.settings.gamify;       // keep local UI prefs
      S.loadCloud(cs);
      const route = stack[stack.length - 1];
      const passive = ['d_patients', 'd_patient', 'd_analytics', 'd_notifs', 'd_profile', 'd_appts', 'p_today', 'p_journey', 'p_profile'];
      // don't disrupt an open sheet, a running camera, or the in-progress player
      if (!document.getElementById('fzSheet') && route !== 'p_verify' && route !== 'p_exercise' && passive.includes(route)) {
        render();
        if (cur.session && cur.session.role === 'patient') toast('Fizyoterapistin güncelledi');
      }
    } catch (e) {}
  }

  /* ---------- web push (real reminders sent by supabase/functions/send-reminders) ---------- */
  function urlB64ToUint8(s) { const pad = '='.repeat((4 - s.length % 4) % 4); const b = (s + pad).replace(/-/g, '+').replace(/_/g, '/'); const raw = atob(b); return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); }
  async function subscribePush() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      const key = (window.FZ_CONFIG || {}).vapidPublic;
      if (!key) return;                       // VAPID not configured yet — local notifications still work
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8(key) });
      if (S.isCloud()) await window.FZ_API.savePushSubscription(sub.toJSON());
    } catch (e) {}
  }

  /* boot */
  stack = ['welcome']; render();
  (async function boot() {
    try {
      const sess = await window.FZ_API.session();
      if (sess) { const cs = await buildCloudState(); if (cs) { S.loadCloud(cs); stack = [cs.session.role === 'doctor' ? 'd_patients' : 'p_today']; render(); startRealtime(); return; } }
    } catch (e) { /* offline / not signed in */ }
    if (S.resumeDemo()) { const st = S.get(); stack = [st.session.role === 'doctor' ? 'd_patients' : 'p_today']; render(); }
  })();
})();
