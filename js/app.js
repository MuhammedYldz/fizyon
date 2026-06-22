/* Fizyon app core — vanilla SPA: state, router, screens. */
(function () {
  const app = document.getElementById('app');
  const S = window.FZ;
  let stack = ['welcome'];       // navigation stack
  let params = {};               // current route params

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = app) => root.querySelector(sel);
  const $$ = (sel, root = app) => [...root.querySelectorAll(sel)];

  function go(route, p = {}) { params = p; stack.push(route); render(); }
  function replace(route, p = {}) { params = p; stack[stack.length - 1] = route; render(); }
  function back() { if (stack.length > 1) { stack.pop(); render(); } }
  function home() { const st = S.get(); stack = [st.session.role === 'doctor' ? 'd_patients' : 'p_today']; render(); }

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
      return `<section class="screen center fade" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
        <img src="assets/logo.svg" width="84" height="84" style="border-radius:20px;margin:0 auto 22px" alt="">
        <h1>Fizyon</h1>
        <p class="muted mt8" style="font-size:18px">Egzersizini yap. Kanıtla. İyileş.</p>
        <p class="hint mt8" style="max-width:300px;margin:8px auto 0">Fizyoterapistinin verdiği ev programını takip et, kamerayla kanıtla, ilerlemeni gör.</p>
        <div class="stack mt24" style="max-width:320px;margin:24px auto 0;width:100%">
          <button class="btn btn-primary" data-go="reg_type">Üye ol</button>
          <button class="btn btn-secondary" data-go="login">Giriş yap</button>
          <button class="btn-ghost" data-go="demo_pick" style="margin:6px auto 0"><i class="ti ti-eye"></i> Demo olarak gez</button>
        </div>
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
            <span><span class="ot">Telefon (SMS kodu) ile</span><br><span class="od">Numaranı doğrula — parola yok, daha az uğraş.</span></span>
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
        <div class="card" style="background:var(--warn-bg);border-color:transparent;margin-bottom:16px"><p style="color:var(--warn);font-size:14px;margin:0"><i class="ti ti-flask"></i> Demo modu — örnek verilerle gezinirsin, gerçek hesap oluşmaz.</p></div>
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
      const list = st.patients.map(p => `
        <button class="list-item" data-patient="${p.id}">
          <span class="avatar">${esc(p.initials)}</span>
          <span style="flex:1"><span style="font-weight:600">${esc(p.name)}</span><br><span class="hint">${esc(p.condition)} · ${p.week}. hafta</span></span>
          <span class="badge ${adherenceColor(p.adherence)}">%${p.adherence}</span>
          <i class="ti ti-chevron-right" style="color:var(--ink-300)"></i>
        </button>`).join('');
      return `<div class="appbar"><div class="brand"><img src="assets/logo.svg" alt="">Fizyon</div><div class="spacer"></div><span class="hint">${esc(st.doctor.name)}</span></div>
        <section class="screen">
          <div class="row between" style="margin-bottom:6px"><h1>Hastalarım</h1><span class="badge teal">${st.patients.length}</span></div>
          <p class="muted" style="margin-bottom:14px">Bugün takip edilmesi gerekenler önce gösterilir.</p>
          <div class="card flush">${list}</div>
          <button class="btn btn-primary mt16" data-act="new-patient"><i class="ti ti-plus"></i> Yeni hasta ekle</button>
        </section>
        ${tabbar('d_patients', 'doctor')}`;
    },

    d_patient() {
      const p = S.patient(params.id); if (!p) { return screens.d_patients(); }
      const couldnt = p.couldnt.map(c => `<div class="card" style="border-color:var(--warn)"><span class="badge warn"><i class="ti ti-message-2"></i> "Yapamadım" · ${esc(c.day)}</span><p class="mt8">${esc(c.reason)}${c.text ? ' — ' + esc(c.text) : ''}</p></div>`).join('') || '<p class="hint">Henüz bildirim yok.</p>';
      return `${appbar(p.name, { back: true, right: `<button class="back" data-act="patient-notif" aria-label="Bildirim ayarı"><i class="ti ti-bell"></i></button>` })}
        <section class="screen">
          <div class="row" style="margin-bottom:16px"><span class="avatar lg">${esc(p.initials)}</span>
            <div><div style="font-weight:600;font-size:18px">${esc(p.name)}</div><div class="hint">${esc(p.condition)} · ${p.week}. hafta</div>
            <div class="mt8"><span class="badge ${adherenceColor(p.adherence)}">%${p.adherence} uyum</span> <span class="badge coral"><i class="ti ti-flame"></i> ${p.streak} gün</span></div></div></div>

          <h3 style="margin-bottom:8px">Son 7 gün</h3>
          <div class="card"><div style="position:relative;height:160px"><canvas id="adChart"></canvas></div></div>

          <div class="row between" style="margin:18px 0 8px"><h3>Program</h3><button class="btn btn-primary sm" data-act="build" data-id="${p.id}"><i class="ti ti-plus"></i> Düzenle</button></div>
          ${p.program.length ? p.program.map(e => `<div class="card"><div class="row between"><div><div style="font-weight:600">${esc(e.name)}</div><div class="hint">${e.reps}×${e.sets}${e.hold ? ' · ' + e.hold + ' sn' : ''}</div></div><i class="ti ${e.done ? 'ti-circle-check' : 'ti-circle'}" style="font-size:22px;color:${e.done ? 'var(--teal-600)' : 'var(--ink-300)'}"></i></div>${e.verify ? `<div class="badge teal mt8"><i class="ti ti-shield-check"></i> Kanıt: ${esc(e.verify)}</div>` : ''}</div>`).join('') : '<p class="hint">Henüz program yok. "Düzenle" ile ekle.</p>'}

          <h3 style="margin:18px 0 8px">Geri bildirim</h3>
          ${couldnt}

          <button class="list-item card mt16" data-act="edit-appt" data-id="${p.id}" style="border-radius:var(--r-lg)"><div style="flex:1"><div class="caption">Sonraki randevu</div><div style="font-weight:600">${esc(p.nextAppt)}</div></div><i class="ti ti-calendar-event" style="font-size:24px;color:var(--teal-600)"></i></button>
        </section>`;
    },

    d_build() {
      const p = S.patient(params.id); if (!p) return screens.d_patients();
      const list = p.program.length ? p.program.map(e => `
        <div class="card">
          <div class="row between">
            <div class="row"><span class="pv" style="width:46px;height:46px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden">${fzDemo(e.demo)}</span>
              <div><div style="font-weight:600">${esc(e.name)}</div><div class="hint">${e.reps}×${e.sets}${e.hold ? ' · ' + e.hold + ' sn' : ''}</div></div></div>
            <button class="btn-ghost" data-act="del-ex" data-eid="${e.id}" aria-label="Sil"><i class="ti ti-trash" style="color:var(--danger);font-size:20px"></i></button>
          </div>${e.verify ? `<div class="badge teal mt8"><i class="ti ti-shield-check"></i> Kanıt: ${esc(e.verify)}</div>` : ''}
        </div>`).join('') : '<p class="hint" style="margin-bottom:8px">Henüz hareket yok. Aşağıdan ekle.</p>';
      return `${appbar('Program', { back: true })}
        <section class="screen">
          <div class="row between" style="margin-bottom:8px"><h3>${esc(p.name)}</h3><span class="hint"><i class="ti ti-device-floppy" style="vertical-align:-2px"></i> otomatik kayıt</span></div>
          ${list}
          <button class="btn btn-secondary mt8" data-act="open-library" data-id="${p.id}"><i class="ti ti-list-search"></i> Hazır hareket ekle</button>
          <button class="btn btn-secondary mt8" data-act="record-own" data-id="${p.id}"><i class="ti ti-video"></i> Kendi videonu kaydet</button>
          <button class="btn btn-primary mt24" data-act="back"><i class="ti ti-check"></i> Bitir</button>
        </section>`;
    },

    d_newpatient() {
      return `${appbar('Yeni hasta', { back: true })}
        <section class="screen">
          <p class="muted" style="margin-bottom:16px">Birkaç bilgiyle başla — programı sonra eklersin.</p>
          <div class="field"><label for="npName">Ad soyad</label><input class="input" id="npName" placeholder="Hasta adı" autocomplete="off"></div>
          <div class="field"><label for="npCond">Durum / bölge</label><input class="input" id="npCond" placeholder="Örn. Sol diz — menisküs"></div>
          <div class="field"><label for="npWeek">Tedavi haftası</label><input class="input" id="npWeek" type="number" value="1" min="1" inputmode="numeric"></div>
          <div class="err-msg" id="npErr" hidden></div>
          <button class="btn btn-primary mt8" data-act="create-patient"><i class="ti ti-check"></i> Hasta oluştur</button>
        </section>`;
    },

    d_analytics() {
      const st = S.get();
      const avg = Math.round(st.patients.reduce((s, p) => s + p.adherence, 0) / st.patients.length);
      const atRisk = st.patients.filter(p => p.adherence < 50).length;
      return `${appbar('Analiz')}
        <section class="screen">
          <div class="num-row" style="margin-bottom:12px">
            <div class="stat" style="flex:1"><div class="l">Ortalama uyum</div><div class="v">%${avg}</div></div>
            <div class="stat" style="flex:1"><div class="l">Risk altında</div><div class="v" style="color:var(--danger)">${atRisk}</div></div>
          </div>
          <div class="card"><h3 style="margin-bottom:10px">Hasta uyum karşılaştırması</h3><div style="position:relative;height:200px"><canvas id="cmpChart"></canvas></div></div>
          <div class="card"><h3 style="margin-bottom:10px">Haftalık trend</h3><div style="position:relative;height:180px"><canvas id="trendChart"></canvas></div></div>
        </section>
        ${tabbar('d_analytics', 'doctor')}`;
    },
    d_notifs() {
      const st = S.get(); const n = st.settings.notif;
      const chTog = (k, l) => `<div class="row between" style="margin-bottom:10px"><span>${l}</span><button class="chip ${n[k] ? 'on' : ''}" data-act="ntog" data-k="${k}">${n[k] ? 'Açık' : 'Kapalı'}</button></div>`;
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
    d_profile() { return profile('doctor'); },

    /* Patient */
    p_today() {
      const st = S.get(); const p = st.patients[0];
      const done = p.program.filter(e => e.done).length;
      const items = p.program.map(e => `
        <button class="list-item" data-exercise="${e.id}">
          <i class="ti ${e.done ? 'ti-circle-check' : 'ti-circle'}" style="font-size:24px;color:${e.done ? 'var(--teal-600)' : 'var(--ink-300)'}"></i>
          <span style="flex:1"><span style="font-weight:600">${esc(e.name)}</span><br><span class="hint">${e.reps}×${e.sets}${e.hold ? ' · ' + e.hold + ' sn' : ''}</span></span>
          ${e.verify ? '<span class="badge teal"><i class="ti ti-shield-check"></i></span>' : ''}
          <i class="ti ti-player-play" style="font-size:20px;color:var(--teal-600)"></i>
        </button>`).join('');
      const docInit = st.doctor.name.replace('Fzt.', '').trim().split(' ').map(w => w[0]).join('').slice(0, 2);
      return `<div class="appbar"><div class="brand"><img src="assets/logo.svg" alt="">Fizyon</div><div class="spacer"></div>${st.settings.gamify ? `<span class="badge coral"><i class="ti ti-flame"></i> ${p.streak}</span>` : ''}</div>
        <section class="screen">
          <div class="card row between" style="margin-bottom:16px">
            <div class="row"><span class="avatar" style="background:var(--teal-600);color:#fff">${esc(docInit)}</span><div><div class="caption">Fizyoterapistin</div><div style="font-weight:600;font-size:17px">${esc(st.doctor.name)}</div></div></div>
            <button class="btn-ghost" data-act="msg-doctor" aria-label="Mesaj gönder"><i class="ti ti-message-2" style="font-size:24px"></i></button>
          </div>
          <h1>Bugün</h1>
          <p class="muted" style="margin-bottom:14px">Salı · ${p.program.length} hareket · ~10 dk · ${done}/${p.program.length} tamam</p>
          <div class="bar" style="margin-bottom:16px"><i style="width:${p.program.length ? done / p.program.length * 100 : 0}%"></i></div>
          <div class="card" style="background:var(--teal-50);border-color:var(--teal-100)">
            <span class="caption" style="color:var(--teal-600)"><i class="ti ti-quote"></i> ${esc(S.get().doctor.name)}</span>
            <p class="mt8" style="color:var(--teal-700)">${esc(p.note)}</p>
          </div>
          <div class="card flush mt16">${items}</div>
          <div class="row gap8 mt16 hint" style="align-items:center"><i class="ti ti-bell"></i> Hatırlatma: her gün ${esc(p.notif.times[0])} · <button class="btn-ghost" data-act="reminder" style="font-size:14px">değiştir</button></div>
        </section>
        ${tabbar('p_today', 'patient')}`;
    },

    p_exercise() {
      const p = S.get().patients[0];
      const e = p.program.find(x => x.id === params.eid) || p.program[0];
      const idx = p.program.indexOf(e) + 1;
      return `${appbar(e.name, { back: true })}
        <section class="screen">
          <p class="muted" style="margin-bottom:12px">${idx}/${p.program.length} · ${e.reps}×${e.sets}${e.hold ? ' · ' + e.hold + ' sn tut' : ''}</p>
          <div class="demo-stage" style="height:230px">
            <span class="badge teal demo-src"><i class="ti ti-${e.video ? 'video' : 'sparkles'}"></i> ${e.video ? 'Hekimin kaydı' : 'Hazır animasyon'}</span>
            ${fzDemo(e.demo)}
          </div>
          ${e.note ? `<div class="card mt16" style="background:var(--teal-50);border-color:var(--teal-100)"><span class="caption" style="color:var(--teal-600)"><i class="ti ti-bulb"></i> Hekim notu</span><p class="mt8" style="color:var(--teal-700)">${esc(e.note)}</p></div>` : ''}
          <div class="card mt16 center">
            <div class="timer-ring" id="tring"><div class="inner"><span class="timer" id="tval">${e.hold || e.reps}</span><span class="hint" id="tlbl">${e.hold ? 'saniye tut' : 'tekrar'}</span></div></div>
            <button class="btn btn-primary mt16" id="tstart" style="max-width:200px;margin-left:auto;margin-right:auto"><i class="ti ti-player-play"></i> Başlat</button>
          </div>
          ${e.verify
            ? `<button class="btn btn-accent mt16" data-act="goverify" data-eid="${e.id}"><i class="ti ti-shield-check"></i> Kamerayla kanıtla</button>`
            : `<button class="btn btn-primary mt16" data-act="complete-ex" data-eid="${e.id}"><i class="ti ti-check"></i> Tamamladım</button>`}
          <button class="btn btn-secondary mt8" data-act="couldnt" data-eid="${e.id}"><i class="ti ti-mood-sad"></i> Yapamadım</button>
        </section>`;
    },

    p_verify() {
      const p = S.get().patients[0];
      const e = p.program.find(x => x.id === params.eid) || p.program.find(x => x.verify) || p.program[0];
      return `${appbar('Kanıtla', { back: true })}
        <section class="screen">
          <p class="muted" style="margin-bottom:12px"><i class="ti ti-shield-check" style="color:var(--teal-600);vertical-align:-2px"></i> ${esc(e.verify || 'Hareketi yap ve kameraya göster')}</p>
          <div class="cam-stage" id="camStage">
            <div class="cam-live"><span class="dot"></span> CANLI</div>
            <div class="ring cam-prog" id="camProg" style="--p:0"><span id="camPct">0%</span></div>
            <video id="cam" autoplay playsinline muted></video>
            <canvas id="camCanvas"></canvas>
            <div class="cam-hint" id="camHint">Kamera başlatılıyor…</div>
          </div>
          <p class="hint center mt16"><i class="ti ti-lock" style="vertical-align:-2px"></i> Görüntü cihazından çıkmaz — analiz telefonda yapılır. Sadece sonuç hekime gönderilir.</p>
          <button class="btn btn-secondary mt8" data-act="sim-verify" data-eid="${e.id}"><i class="ti ti-device-mobile-check"></i> Kamerasız doğrula (demo)</button>
        </section>`;
    },

    p_journey() {
      const st = S.get(); const p = st.patients[0];
      if (!st.settings.gamify) return `${appbar('Yolculuk')}<section class="screen"><div class="card center" style="padding:40px 20px"><i class="ti ti-confetti" style="font-size:40px;color:var(--ink-300)"></i><p class="muted mt16">Oyunlaştırma kapalı. Motivasyon için açabilirsin.</p><button class="btn btn-primary mt16" data-act="toggle-gamify" style="max-width:220px;margin:16px auto 0"><i class="ti ti-player-play"></i> Aç</button></div></section>${tabbar('p_journey', 'patient')}`;
      const stages = ['Başlangıç', 'Hareket', 'Güçlenme', 'Dönüş', 'Tam iyileşme'];
      const goalPct = Math.min(100, Math.round(p.program.filter(e => e.done).length / Math.max(1, p.program.length) * 100));
      return `${appbar('Yolculuk')}
        <section class="screen">
          <div class="card" style="background:var(--coral-50);border-color:var(--coral-100)">
            <div class="row between"><div><div class="caption" style="color:var(--coral-600)">Puanın</div><div style="font-size:28px;font-weight:600;color:var(--coral-600)">${p.points}</div></div>
            <div class="row gap16"><div class="center"><div style="font-size:22px;font-weight:600"><i class="ti ti-flame" style="color:var(--coral-500)"></i> ${p.streak}</div><div class="hint">gün seri</div></div></div></div>
          </div>
          <button class="btn btn-accent mt16" data-go="p_achievement"><i class="ti ti-award"></i> Başarı kartını gör & paylaş</button>
          <h3 style="margin:18px 0 8px">Haftalık hedef</h3>
          <div class="card"><div class="row between" style="margin-bottom:8px"><span class="muted">Bu haftaki egzersizler</span><span style="font-weight:600">%${goalPct}</span></div><div class="bar"><i style="width:${goalPct}%"></i></div>${goalPct >= 100 ? '<div class="badge coral mt8"><i class="ti ti-gift"></i> Hedef tamam — ödül açıldı!</div>' : ''}</div>
          <h3 style="margin:18px 0 8px">İyileşme yolun · diz</h3>
          <div class="card"><div class="row between">${stages.map((s, i) => `<div class="center" style="flex:1"><div style="width:30px;height:30px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;background:${i < p.journeyStage ? 'var(--teal-600)' : i === p.journeyStage ? 'var(--coral-500)' : 'var(--bg)'};color:${i <= p.journeyStage ? '#fff' : 'var(--ink-300)'};font-size:13px;font-weight:600">${i < p.journeyStage ? '<i class="ti ti-check"></i>' : i + 1}</div><div class="hint" style="font-size:10px;margin-top:4px">${s}</div></div>`).join('')}</div></div>
          <h3 style="margin:18px 0 8px">Ödüller</h3>
          <div class="grid2">${st.badges.map(b => `<div class="reward ${b.got ? '' : 'locked'}"><span class="rc"><i class="ti ${b.icon}"></i></span><span style="font-size:13px;font-weight:500">${esc(b.name)}</span></div>`).join('')}</div>
        </section>
        ${tabbar('p_journey', 'patient')}`;
    },

    p_achievement() {
      const st = S.get(); const p = st.patients[0];
      const days = p.week * 7, moves = p.week * 12, first = p.name.split(' ')[0];
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
          <p class="hint center mt16">Kartta hastalık adı yok — istediğin yerde paylaşabilirsin.</p>
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
      ${role === 'doctor' && st.cloud ? `<div class="card row between"><div><div class="caption">Fizyoterapist kodun</div><div style="font-weight:700;letter-spacing:3px;font-size:18px;color:var(--teal-700)">${esc(st.code || '—')}</div></div><button class="btn sm btn-secondary" data-act="new-patient"><i class="ti ti-user-plus"></i> Davet</button></div>` : ''}
      ${role === 'patient' ? `<div class="card row between"><div><div style="font-weight:600">Oyunlaştırma</div><div class="hint">Puan, seri ve ödülleri göster</div></div><button class="chip ${st.settings.gamify ? 'on' : ''}" data-act="toggle-gamify">${st.settings.gamify ? 'Açık' : 'Kapalı'}</button></div>` : ''}
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
      data: { labels: ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'], datasets: [{ data, borderRadius: 6, backgroundColor: data.map(v => v < 40 ? css('--danger') : v < 70 ? css('--warn') : css('--teal-500')) }] },
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
      data: { labels: st.patients.map(p => p.name.split(' ')[0]), datasets: [{ data: st.patients.map(p => p.adherence), borderRadius: 6, backgroundColor: st.patients.map(p => p.adherence < 40 ? css('--danger') : p.adherence < 70 ? css('--warn') : css('--teal-500')) }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: css('--line') } }, y: { grid: { display: false } } }, responsive: true, maintainAspectRatio: false }
    });
    const c2 = $('#trendChart');
    if (c2) new Chart(c2, {
      type: 'line',
      data: { labels: ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'], datasets: [{ data: st.patients[0].history, borderColor: css('--teal-500'), backgroundColor: 'transparent', tension: .35, pointRadius: 3, pointBackgroundColor: css('--teal-500') }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: css('--line') } }, x: { grid: { display: false } } }, responsive: true, maintainAspectRatio: false }
    });
  }

  /* ---- exercise timer ---- */
  let timerInt = null;
  function wireTimer(e) {
    const btn = $('#tstart'), val = $('#tval'), ring = $('#tring'), lbl = $('#tlbl');
    if (!btn) return;
    const total = e.hold || e.reps;
    let running = false, t = total;
    btn.onclick = () => {
      if (running) { clearInterval(timerInt); running = false; btn.innerHTML = '<i class="ti ti-player-play"></i> Devam'; return; }
      running = true; btn.innerHTML = '<i class="ti ti-player-pause"></i> Duraklat';
      timerInt = setInterval(() => {
        t--; val.textContent = t; ring.style.setProperty('--p', (1 - t / total) * 100);
        if (t <= 0) { clearInterval(timerInt); running = false; t = total; val.textContent = total; ring.style.setProperty('--p', 100); lbl.textContent = 'tamam!'; btn.innerHTML = '<i class="ti ti-refresh"></i> Tekrar'; toast('Set tamamlandı'); }
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
      hint.textContent = 'Kamera açılamadı — "Kamerasız doğrula" ile devam et.';
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
      hint.textContent = 'Hareket algılama yüklenemedi — "Kamerasız doğrula" ile devam et.';
    }
  }
  function runPose(e, video, canvas, hint) {
    const ctx = canvas.getContext('2d');
    let held = 0; const need = 28; // ~ a few seconds of a clear pose
    const loop = () => {
      if (camStop || !camLandmarker || !video.videoWidth) { if (!camStop) camRAF = requestAnimationFrame(loop); return; }
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      let res; try { res = camLandmarker.detectForVideo(video, performance.now()); } catch { camRAF = requestAnimationFrame(loop); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lm = res.landmarks && res.landmarks[0];
      if (lm) {
        const conns = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
        ctx.strokeStyle = css('--teal-500') || '#149A7E'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        conns.forEach(([a, b]) => { if (lm[a] && lm[b]) { ctx.beginPath(); ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height); ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height); ctx.stroke(); } });
        ctx.fillStyle = css('--teal-500') || '#149A7E';
        lm.forEach(pt => { ctx.beginPath(); ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 5, 0, 7); ctx.fill(); });
        const visible = lm.filter(p => (p.visibility ?? 1) > 0.6).length;
        if (visible > 20) { held++; hint.textContent = 'Harika — pozu koru…'; }
        else { held = Math.max(0, held - 1); hint.textContent = 'Tüm vücudun görünsün'; }
        const pct = Math.min(100, Math.round(held / need * 100));
        const prog = $('#camProg'), pctEl = $('#camPct'); if (prog) prog.style.setProperty('--p', pct); if (pctEl) pctEl.textContent = pct + '%';
        if (held >= need) { verifySuccess(e); return; }
      } else { hint.textContent = 'Vücudun kameraya görünsün'; }
      camRAF = requestAnimationFrame(loop);
    };
    camRAF = requestAnimationFrame(loop);
  }
  function verifySuccess(e) {
    stopCamera();
    const st = S.get(); const p = st.patients[0];
    const ex = p.program.find(x => x.id === e.id); if (ex) { ex.done = true; ex.verifiedAt = Date.now(); }
    if (st.settings.gamify) { p.points += 30; }
    if (S.isCloud()) {
      window.FZ_API.logCompletion({ exercise_id: e.id, patient_id: p.id, verified: true }).catch(() => {});
      if (st.settings.gamify) window.FZ_API.setGamification(p.id, { points: p.points }).catch(() => {});
    }
    S.save();
    const stage = $('#camStage');
    if (stage) stage.insertAdjacentHTML('beforeend', `<div class="verify-ok"><i class="ti ti-circle-check"></i><div style="font-size:18px;font-weight:600">Doğrulandı!</div>${st.settings.gamify ? '<div class="badge" style="background:rgba(255,255,255,.2);color:#fff">+30 puan</div>' : ''}</div>`);
    setTimeout(() => { home(); toast('Kanıt hekime gönderildi'); }, 1500);
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
  function librarySheet(pid) {
    const st = S.get();
    const presets = st.presets.filter(pr => sheetCat === 'all' || pr.cat === sheetCat);
    return `<h3 style="margin-bottom:12px">Hazır hareket ekle</h3>
      <div class="cat-row">${st.cats.map(([c, l]) => `<button class="chip ${sheetCat === c ? 'on' : ''}" data-act="set-cat" data-cat="${c}" data-id="${pid}">${l}</button>`).join('')}</div>
      ${presets.map(pr => `<button class="preset" data-act="pick-preset" data-pid="${pr.id}" data-id="${pid}"><span class="pv">${fzDemo(pr.demo)}</span><span style="flex:1"><span style="font-weight:600">${esc(pr.name)}</span><br><span class="hint">${pr.reps}×${pr.sets}${pr.hold ? ' · ' + pr.hold + ' sn' : ''}</span></span><i class="ti ti-plus" style="color:var(--teal-600);font-size:20px"></i></button>`).join('')}`;
  }
  function configSheet(pid, pr) {
    return `<h3 style="margin-bottom:4px">${esc(pr.name)}</h3><p class="hint" style="margin-bottom:14px">Hastana göre ayarla</p>
      <div class="demo-stage" style="height:120px;margin-bottom:14px">${fzDemo(pr.demo)}</div>
      <div class="num-row">
        <div class="field"><label>Tekrar</label><input class="input" id="cfgReps" type="number" value="${pr.reps}" inputmode="numeric"></div>
        <div class="field"><label>Set</label><input class="input" id="cfgSets" type="number" value="${pr.sets}" inputmode="numeric"></div>
        <div class="field"><label>Süre (sn)</label><input class="input" id="cfgHold" type="number" value="${pr.hold}" inputmode="numeric"></div>
      </div>
      <div class="field"><label>Not</label><textarea id="cfgNote">${esc(pr.note)}</textarea></div>
      <div class="card row between" style="margin-bottom:14px"><div><div style="font-weight:600">Kamerayla kanıt iste</div><div class="hint">Hasta hareketi kanıtlasın</div></div><button class="chip" id="cfgVerify" data-act="toggle-cfg-verify">Kapalı</button></div>
      <button class="btn btn-primary" data-act="add-preset" data-pid="${pr.id}" data-id="${pid}"><i class="ti ti-plus"></i> Programa ekle</button>`;
  }
  function couldntSheet(eid) {
    const reasons = ['Ağrı oldu', 'Çok yoruldum', 'Hareketi anlamadım', 'Zamanım olmadı'];
    return `<h3 style="margin-bottom:4px">Zorlandın mı?</h3><p class="hint" style="margin-bottom:14px">Hekimine ilet — sorun değil.</p>
      ${reasons.map((r, i) => `<button class="chip" data-act="reason-pick" data-reason="${esc(r)}" style="display:block;width:100%;text-align:left;margin-bottom:8px">${r}</button>`).join('')}
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
      <div class="field"><label><i class="ti ti-robot" style="vertical-align:-2px"></i> Otomatik takip — kaç gün egzersiz yapmazsa</label><div class="row gap8">${[1, 2, 3].map(dn => `<button class="chip ${p.notif.escalateDays === dn ? 'on' : ''}" data-act="nesc" data-id="${p.id}" data-d="${dn}">${dn} gün</button>`).join('')}</div></div>
      <div class="field"><label>Otomatik aksiyon</label><div class="row gap8" style="flex-wrap:wrap">${ACTIONS.map(([a, l, ic]) => `<button class="chip ${p.notif.autoActions.includes(a) ? 'on' : ''}" data-act="nact" data-id="${p.id}" data-a="${a}"><i class="ti ${ic}"></i> ${l}</button>`).join('')}</div></div>
      <div class="card" style="background:var(--teal-50);border-color:var(--teal-100);margin-bottom:14px"><p style="color:var(--teal-700);font-size:14px;margin:0">${autoSummary(p.name.split(' ')[0], p.notif.escalateDays, p.notif.autoActions)}</p></div>
      <button class="btn btn-primary" data-act="close-sheet"><i class="ti ti-check"></i> Tamam</button>`;
  }
  function drawCardCanvas() {
    const st = S.get(); const p = st.patients[0];
    const days = p.week * 7, moves = p.week * 12, first = p.name.split(' ')[0];
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
    const x = c.getContext('2d');
    x.fillStyle = '#0E7C66'; x.fillRect(0, 0, 1080, 1080);
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
    return `<h3 style="margin-bottom:4px">Hasta davet et</h3><p class="hint" style="margin-bottom:14px">Hastan üye olurken bu kodu girsin — hesabı otomatik sana bağlanır.</p>
      <div class="card center" style="background:var(--teal-50);border-color:var(--teal-100)"><div class="caption" style="color:var(--teal-600)">Fizyoterapist kodun</div><div style="font-size:34px;font-weight:700;letter-spacing:5px;color:var(--teal-700);margin-top:4px">${esc(code || '—')}</div></div>
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
    catch (e) { const h = $('#rvHint', document); if (h) h.textContent = 'Kamera yok — demoda yine kaydedebilirsin'; }
  }
  const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  function apptSheet(p) {
    return `<h3 style="margin-bottom:4px">Randevu</h3><p class="hint" style="margin-bottom:14px">${esc(p.name)} · sonraki randevu</p>
      <div class="field"><label for="apDate">Tarih</label><input class="input" id="apDate" type="date"></div>
      <div class="field"><label for="apTime">Saat</label><input class="input" id="apTime" type="time" value="14:00"></div>
      <button class="btn btn-primary" data-act="save-appt" data-id="${p.id}"><i class="ti ti-check"></i> Kaydet</button>`;
  }
  function reminderSheet(p) {
    return `<h3 style="margin-bottom:4px">Hatırlatma</h3><p class="hint" style="margin-bottom:14px">Egzersiz hatırlatma saatlerin</p>
      <div class="row gap8" style="flex-wrap:wrap;margin-bottom:16px">${TIMES.map(t => `<button class="chip ${p.notif.times.includes(t) ? 'on' : ''}" data-act="ptime" data-t="${t}">${t}</button>`).join('')}</div>
      <button class="btn btn-primary" data-act="close-sheet"><i class="ti ti-check"></i> Kaydet</button>`;
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
  let cfgVerify = false, reasonPick = null;
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
    if (act === 'logout') { try { if (S.isCloud()) window.FZ_API.signOut(); } catch (e) {} S.logout(); stack = ['welcome']; return render(); }
    if (act === 'reset') { S.reset(); stack = ['welcome']; toast('Sıfırlandı'); return render(); }
    if (act === 'toggle-gamify') { st.settings.gamify = !st.settings.gamify; if (S.isCloud()) window.FZ_API.setGamification(st.patients[0].id, { gamify_enabled: st.settings.gamify }).catch(() => {}); S.save(); return render(); }
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
    if (act === 'edit-appt') return openSheet(apptSheet(S.patient(d.id)));
    if (act === 'save-appt') {
      const dv = $('#apDate', document).value, tv = $('#apTime', document).value || '14:00';
      const p = S.patient(d.id);
      if (dv) { const dt = new Date(dv + 'T00:00'); p.nextAppt = `${dt.getDate()} ${MONTHS[dt.getMonth()]}, ${tv}`; if (S.isCloud()) window.FZ_API.setAppointment({ patient_id: p.id, at: new Date(dv + 'T' + tv).toISOString(), created_by: st.doctor.id }).catch(() => {}); }
      S.save(); closeSheet(); render(); return toast('Randevu güncellendi');
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
          window.FZ_API.addExercise({ patient_id: p.id, name: ex.name, demo: ex.demo, reps: ex.reps, sets: ex.sets, hold: ex.hold, note: '', verify_text: null, created_by: st.doctor.id })
            .then(async () => { await refreshProgram(p.id); render(); toast('Hareket kaydedildi ✓'); }).catch(() => toast('Kaydedilemedi'));
        } else { p.program.push({ id: 'e' + Date.now(), ...ex, video: true, note: '', verify: null, done: false }); S.save(); closeSheet(); render(); toast('Video kaydedildi ✓'); }
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
    if (act === 'msg-doctor') return toast('Mesajlaşma yakında — şimdilik fizyoterapistin bildirim alır');
    if (act === 'share-card') return shareCard(false);
    if (act === 'download-card') return shareCard(true);
    if (act === 'reminder') return openSheet(reminderSheet(st.patients[0]));
    if (act === 'ptime') { const p = st.patients[0]; const i = p.notif.times.indexOf(d.t); if (i >= 0) p.notif.times.splice(i, 1); else { p.notif.times.push(d.t); p.notif.times.sort(); } saveNotif(p); return openSheet(reminderSheet(p)); }
    if (act === 'close-sheet') { closeSheet(); return render(); }

    /* builder + library */
    if (act === 'open-library') { sheetCat = 'all'; return openSheet(librarySheet(d.id)); }
    if (act === 'set-cat') { sheetCat = d.cat; return openSheet(librarySheet(d.id)); }
    if (act === 'pick-preset') { cfgVerify = false; const pr = st.presets.find(x => x.id === d.pid); return openSheet(configSheet(d.id, pr)); }
    if (act === 'toggle-cfg-verify') { cfgVerify = !cfgVerify; t.textContent = cfgVerify ? 'Açık' : 'Kapalı'; t.classList.toggle('on', cfgVerify); return; }
    if (act === 'add-preset') {
      const pr = st.presets.find(x => x.id === d.pid); const p = S.patient(d.id);
      const ex = { name: pr.name, demo: pr.demo, reps: +$('#cfgReps', document).value || pr.reps, sets: +$('#cfgSets', document).value || pr.sets, hold: +$('#cfgHold', document).value || 0, note: $('#cfgNote', document).value.trim(), verify: cfgVerify ? 'Hareketi yap ve kameraya göster' : null };
      if (S.isCloud()) {
        closeSheet();
        window.FZ_API.addExercise({ patient_id: p.id, name: ex.name, demo: ex.demo, reps: ex.reps, sets: ex.sets, hold: ex.hold, note: ex.note, verify_text: ex.verify, created_by: st.doctor.id })
          .then(async () => { await refreshProgram(p.id); render(); toast(pr.name + ' eklendi'); }).catch(() => toast('Eklenemedi'));
      } else { p.program.push({ id: 'e' + Date.now(), ...ex, done: false }); S.save(); closeSheet(); render(); toast(pr.name + ' eklendi'); }
      return;
    }
    if (act === 'del-ex') {
      const p = S.patient(params.id);
      if (S.isCloud()) { window.FZ_API.deleteExercise(d.eid).then(async () => { await refreshProgram(p.id); render(); toast('Hareket silindi'); }).catch(() => toast('Silinemedi')); }
      else { p.program = p.program.filter(x => x.id !== d.eid); S.save(); render(); toast('Hareket silindi'); }
      return;
    }

    /* player + verify */
    if (act === 'goverify') return go('p_verify', { eid: d.eid });
    if (act === 'complete-ex') {
      const p = st.patients[0]; const ex = p.program.find(x => x.id === d.eid); if (ex) ex.done = true; if (st.settings.gamify) p.points += 20;
      if (S.isCloud()) window.FZ_API.logCompletion({ exercise_id: d.eid, patient_id: p.id, verified: false }).catch(() => {});
      S.save(); home(); return toast('Tamamlandı');
    }
    if (act === 'sim-verify') { const p = st.patients[0]; return verifySuccess(p.program.find(x => x.id === d.eid) || p.program[0]); }

    /* couldn't-do */
    if (act === 'couldnt') { reasonPick = null; return openSheet(couldntSheet(d.eid)); }
    if (act === 'reason-pick') { reasonPick = d.reason; $$('[data-act="reason-pick"]', document).forEach(x => x.classList.toggle('on', x === t)); return; }
    if (act === 'send-couldnt') {
      const p = st.patients[0]; const txt = ($('#couldntText', document) || {}).value || '';
      p.couldnt.unshift({ day: 'Bugün', reason: reasonPick || 'Belirtilmedi', text: txt.trim() });
      if (S.isCloud()) window.FZ_API.sendFeedback({ patient_id: p.id, exercise_id: d.eid || null, reason: reasonPick || 'Belirtilmedi', note: txt.trim() }).catch(() => {});
      S.save(); closeSheet(); back(); return toast('Hekimine iletildi');
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
      S.loadCloud(cs); stack = [cs.session.role === 'doctor' ? 'd_patients' : 'p_today']; render();
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

    // Phone OTP needs an SMS provider (Twilio/Netgsm) configured in Supabase — not yet wired.
    if (phone) { err.hidden = false; err.innerHTML = '<i class="ti ti-info-circle"></i> Telefonla kayıt için SMS sağlayıcısı gerekiyor (yakında). Şimdilik e-posta ile kayıt ol.'; return; }

    const btn = $('[data-act="register"]'); if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader"></i> Hesap oluşturuluyor…'; }
    try {
      const { data, error } = await window.FZ_API.signUp({ email: $('#re').value.trim(), password: $('#rpw').value, fullName: name, role, license: role === 'doctor' ? $('#rl').value.trim() : null, doctorCode: role === 'patient' ? ($('#rdc').value || '').trim() : null });
      if (error) throw error;
      if (data.session) {
        await window.FZ_API.setConsent();
        const st = S.get(); st.session = { role, id: role === 'doctor' ? 'd1' : 'p1', cloud: true }; S.save();
        toast('Hesabın oluşturuldu (bulut)'); home();
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
  const mapEx = (e) => ({ id: e.id, name: e.name, demo: e.demo || 'generic', video: !!e.video_url, reps: e.reps, sets: e.sets, hold: e.hold, note: e.note || '', verify: e.verify_text, done: false });

  async function buildPatient(p) {
    const api = window.FZ_API;
    const [program, notif, gam, comps, appts] = await Promise.all([
      api.program(p.id), api.getNotif(p.id), api.getGamification(p.id), api.completionsFor(p.id), api.appointmentsFor(p.id)
    ]);
    const doneSet = new Set((comps || []).map(c => c.exercise_id));
    let nextAppt = 'Planlanmadı';
    if (appts && appts[0]) { const d = new Date(appts[0].at); nextAppt = `${d.getDate()} ${MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
    return {
      id: p.id, name: p.full_name || 'İsimsiz', initials: initialsOf(p.full_name), condition: p.condition || '—', week: p.week || 1,
      adherence: 0, streak: gam ? gam.streak : 0, points: gam ? gam.points : 0, journeyStage: gam ? gam.journey_stage : 1,
      history: [0, 0, 0, 0, 0, 0, 0], note: '', nextAppt,
      notif: notif ? { tone: notif.tone || 'normal', times: notif.times || ['18:00'], escalateDays: notif.inactive_days || 2, autoActions: notif.auto_actions || ['notifyDoctor'] } : { tone: 'normal', times: ['18:00'], escalateDays: 2, autoActions: ['notifyDoctor'] },
      couldnt: [],
      program: (program || []).map(e => ({ ...mapEx(e), done: doneSet.has(e.id) }))
    };
  }

  async function buildCloudState() {
    const api = window.FZ_API, seed = S.seedRef;
    const profile = await api.myProfile();
    if (!profile) return null;
    const base = {
      session: { role: profile.role, id: profile.id, cloud: true }, cloud: true, code: profile.code || null,
      settings: { gamify: true, notif: structuredClone(seed.settings.notif) },
      presets: structuredClone(seed.presets), cats: structuredClone(seed.cats), badges: structuredClone(seed.badges),
      doctor: { id: '', name: '', license: '' }, patients: []
    };
    if (profile.role === 'doctor') {
      base.doctor = { id: profile.id, name: profile.full_name || 'Fizyoterapist', license: profile.license_no || '' };
      const pts = await api.myPatients();
      base.patients = await Promise.all((pts || []).map(buildPatient));
    } else {
      const doc = await api.myDoctor();
      base.doctor = doc ? { id: profile.doctor_id, name: doc.full_name || 'Fizyoterapist', license: doc.license_no || '' } : { id: '', name: 'Fizyoterapist atanmadı', license: '' };
      const self = await buildPatient(profile);
      self.couldnt = (await api.feedbackFor(profile.id)).map(f => ({ day: '', reason: f.reason || '', text: f.note || '' }));
      base.patients = [self];
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
  window.__fzBuildCloudState = buildCloudState; // used by handlers

  /* boot */
  stack = ['welcome']; render();
  (async function boot() {
    try {
      const sess = await window.FZ_API.session();
      if (sess) { const cs = await buildCloudState(); if (cs) { S.loadCloud(cs); stack = [cs.session.role === 'doctor' ? 'd_patients' : 'p_today']; render(); return; } }
    } catch (e) { /* offline / not signed in */ }
    if (S.resumeDemo()) { const st = S.get(); stack = [st.session.role === 'doctor' ? 'd_patients' : 'p_today']; render(); }
  })();
})();
