/* Seed/demo data + persistence layer. Demo only: local-first, no real backend.
   In production this is replaced by an authenticated API (see DESIGN.md §5). */
window.FZ = (function () {
  const KEY = 'fizyon.state.v1';

  const seed = {
    session: null, // {role:'doctor'|'patient', id}
    settings: { gamify: true, notif: { push: true, sms: false, email: false, quietFrom: '22:00', quietTo: '07:00', inactiveDays: 2, autoActions: ['notifyDoctor', 'remindPatient'] } },
    doctor: { id: 'd1', name: 'Fzt. Elif Aydın', license: 'TR-FT-20431', bookingUrl: '' },
    patients: [
      { id: 'p1', name: 'Ayşe Kaya', initials: 'AK', condition: 'Sol diz, menisküs', week: 3, adherence: 82,
        streak: 6, points: 540, journeyStage: 2,
        history: [60, 80, 100, 40, 90, 100, 82],
        note: 'Bugün dengeye ağırlık ver. Acele etme 🙂',
        nextAppt: '28 Haziran, 14:00',
        notif: { tone: 'normal', times: ['18:00'], escalateDays: 2, autoActions: ['notifyDoctor', 'remindPatient'] },
        couldnt: [{ day: 'Perşembe', reason: 'Ağrı oldu', text: 'Diz arkasında keskin ağrı, 2. sette bıraktım.' }],
        sessions: [],
        program: [
          { id: 'e1', name: 'Düz bacak kaldırma', demo: 'legraise', reps: 12, sets: 3, hold: 0, freq: 1,
            note: 'Yavaş kaldır, beli yere yapışık tut.', verify: null },
          { id: 'e2', name: 'Mini squat', demo: 'squat', reps: 10, sets: 3, hold: 30, freq: 2,
            note: 'Dizini öne taşıma, ağrı olursa dur.', verify: 'Tek ayak üstünde 5 sn denge' },
          { id: 'e3', name: 'Tek ayak denge', demo: 'balance', reps: 1, sets: 3, hold: 5, freq: 1,
            note: 'Sabit bir noktaya bak.', verify: 'Tek ayak üstünde 5 sn denge' }
        ] },
      { id: 'p2', name: 'Mert Demir', initials: 'MD', condition: 'Sağ omuz, sıkışma', week: 1, adherence: 41,
        streak: 1, points: 120, journeyStage: 1, history: [40, 0, 60, 50, 40, 0, 41],
        note: 'Ağrısız aralıkta çalış.', nextAppt: '26 Haziran, 11:00',
        notif: { tone: 'gentle', times: ['10:00', '19:00'], escalateDays: 1, autoActions: ['remindPatient'] },
        couldnt: [], sessions: [], program: [] },
      { id: 'p3', name: 'Selin Yıldız', initials: 'SY', condition: 'Bel, disk', week: 5, adherence: 23,
        streak: 0, points: 60, journeyStage: 1, history: [20, 0, 0, 40, 0, 30, 23],
        note: 'Lütfen günde bir kez deneyelim.', nextAppt: '1 Temmuz, 09:30',
        notif: { tone: 'strict', times: ['08:00', '13:00', '20:00'], escalateDays: 1, autoActions: ['notifyDoctor', 'remindPatient', 'callPatient'] },
        couldnt: [{ day: 'Pazartesi', reason: 'Zamanım olmadı', text: '' }], sessions: [], program: [] }
    ],
    // Internal appointment slots a physiotherapist opens; a patient books one (demo: local).
    slots: [
      { id: 's1', date: '26 Haziran Per', time: '14:00', bookedBy: null },
      { id: 's2', date: '26 Haziran Per', time: '15:00', bookedBy: null },
      { id: 's3', date: '27 Haziran Cum', time: '10:30', bookedBy: null },
      { id: 's4', date: '30 Haziran Pzt', time: '11:00', bookedBy: null }
    ],
    presets: [
      /* Diz */
      { id: 'pr1', name: 'Mini squat', demo: 'squat', cat: 'diz', reps: 10, sets: 3, hold: 0, note: 'Dizini öne taşıma, sırtın düz.' },
      { id: 'pr2', name: 'Düz bacak kaldırma', demo: 'legraise', cat: 'diz', reps: 12, sets: 3, hold: 0, note: 'Beli yere yapışık tut.' },
      { id: 'pr3', name: 'Tek ayak denge', demo: 'balance', cat: 'diz', reps: 1, sets: 3, hold: 5, note: 'Sabit bir noktaya bak.' },
      { id: 'pr4', name: 'Duvar squat', demo: 'wallsquat', cat: 'diz', reps: 8, sets: 3, hold: 10, note: 'Sırtın duvara yaslı, 90 derece.' },
      { id: 'pr5', name: 'Otur-kalk', demo: 'squat', cat: 'diz', reps: 10, sets: 3, hold: 0, note: 'Sandalyeden kollarını kullanmadan kalk.' },
      { id: 'pr6', name: 'Oturarak diz açma', demo: 'kneeextension', cat: 'diz', reps: 12, sets: 3, hold: 2, note: 'Bacağını düz uzat, 2 sn bekle.' },
      { id: 'pr7', name: 'Topuk kaydırma', demo: 'heelslide', cat: 'diz', reps: 10, sets: 2, hold: 0, note: 'Topuğunu yavaşça kalçana çek.' },
      { id: 'pr8', name: 'Yerinde adımlama', demo: 'marching', cat: 'diz', reps: 16, sets: 2, hold: 0, note: 'Dizini kalça hizasına kaldır.' },

      /* Bel */
      { id: 'pr9',  name: 'Köprü', demo: 'bridge', cat: 'bel', reps: 10, sets: 3, hold: 3, note: 'Kalçanı yukarı kaldır, karnını sık.' },
      { id: 'pr10', name: 'Kedi-deve', demo: 'catcow', cat: 'bel', reps: 8, sets: 2, hold: 0, note: 'Omurganı yavaşça yuvarla.' },
      { id: 'pr11', name: 'Kuş-köpek', demo: 'birddog', cat: 'bel', reps: 8, sets: 3, hold: 3, note: 'Karşı kol ve bacağı uzat, dengede kal.' },
      { id: 'pr12', name: 'Pelvik eğim', demo: 'bridge', cat: 'bel', reps: 12, sets: 2, hold: 0, note: 'Belini yere yapıştır, karnını çek.' },
      { id: 'pr13', name: 'Diz göğse çekme', demo: 'legraise', cat: 'bel', reps: 10, sets: 2, hold: 5, note: 'Dizini nazikçe göğsüne çek.' },

      /* Omuz */
      { id: 'pr14', name: 'Omuz dış rotasyon', demo: 'shoulder', cat: 'omuz', reps: 12, sets: 3, hold: 0, note: 'Dirseğini gövdene yakın tut.' },
      { id: 'pr15', name: 'Pendulum', demo: 'pendulum', cat: 'omuz', reps: 15, sets: 2, hold: 0, note: 'Kolunu gevşek bırak, sallandır.' },
      { id: 'pr16', name: 'Kol öne kaldırma', demo: 'armraise', cat: 'omuz', reps: 10, sets: 3, hold: 0, note: 'Kolunu ağrısız aralıkta kaldır.' },
      { id: 'pr17', name: 'Duvar tırmanma', demo: 'armraise', cat: 'omuz', reps: 10, sets: 2, hold: 0, note: 'Parmaklarınla duvarda yukarı yürü.' },
      { id: 'pr18', name: 'Skapula sıkıştırma', demo: 'shrug', cat: 'omuz', reps: 12, sets: 3, hold: 3, note: 'Kürek kemiklerini birbirine yaklaştır.' },

      /* Boyun */
      { id: 'pr19', name: 'Boyun yana eğme', demo: 'neckTilt', cat: 'boyun', reps: 8, sets: 2, hold: 5, note: 'Kulağını omzuna yaklaştır, zorlamadan.' },
      { id: 'pr20', name: 'Boyun çevirme', demo: 'neckRotation', cat: 'boyun', reps: 8, sets: 2, hold: 3, note: 'Başını yavaşça yana çevir.' },
      { id: 'pr21', name: 'Omuz silkme', demo: 'shrug', cat: 'boyun', reps: 10, sets: 2, hold: 0, note: 'Omuzlarını kulaklarına kaldır, indir.' },

      /* Kalça */
      { id: 'pr22', name: 'Yan bacak kaldırma', demo: 'hipabduction', cat: 'kalca', reps: 12, sets: 3, hold: 0, note: 'Bacağını yana aç, gövdeni sabit tut.' },
      { id: 'pr23', name: 'Clamshell', demo: 'clamshell', cat: 'kalca', reps: 12, sets: 3, hold: 0, note: 'Topuklar birleşik, üst dizini aç.' },
      { id: 'pr24', name: 'Glute köprü', demo: 'bridge', cat: 'kalca', reps: 12, sets: 3, hold: 3, note: 'Kalçanı tepede 3 sn sık.' },

      /* Genel */
      { id: 'pr25', name: 'Topuk yükseltme', demo: 'calfraise', cat: 'genel', reps: 15, sets: 3, hold: 0, note: 'Parmak ucuna yüksel, yavaş in.' },
      { id: 'pr26', name: 'Hamle (lunge)', demo: 'lunge', cat: 'genel', reps: 10, sets: 3, hold: 0, note: 'Öne adım at, arka diz yere yaklaşsın.' },
      { id: 'pr27', name: 'Ayakta denge', demo: 'balance', cat: 'genel', reps: 1, sets: 3, hold: 8, note: 'Tek ayakta sabit dur.' },
      { id: 'pr28', name: 'Hareketlilik / esneme', demo: 'generic', cat: 'genel', reps: 1, sets: 1, hold: 30, note: 'Nazikçe esne, nefesini tut ma.' }
    ],
    cats: [['all', 'Tümü'], ['diz', 'Diz'], ['bel', 'Bel'], ['omuz', 'Omuz'], ['boyun', 'Boyun'], ['kalca', 'Kalça'], ['genel', 'Genel']],
    // Ready-made protocols, a doctor applies a full program in one tap.
    protocols: [
      { id: 'pt_diz1', name: 'Diz · Erken dönem (Hafta 1-2)', cat: 'diz', desc: '3 hareket · nazik başlangıç',
        items: [{ preset: 'pr2' }, { preset: 'pr6' }, { preset: 'pr3', verify: true }] },
      { id: 'pt_diz2', name: 'Diz · Güçlendirme (Hafta 3+)', cat: 'diz', desc: '4 hareket · denge + kuvvet',
        items: [{ preset: 'pr1', verify: true }, { preset: 'pr4' }, { preset: 'pr8', verify: true }, { preset: 'pr3', verify: true }] },
      { id: 'pt_bel1', name: 'Bel · Stabilizasyon', cat: 'bel', desc: '3 hareket · çekirdek',
        items: [{ preset: 'pr9', verify: true }, { preset: 'pr11' }, { preset: 'pr10' }] },
      { id: 'pt_omuz1', name: 'Omuz · Mobilite', cat: 'omuz', desc: '3 hareket · sıkışma sonrası',
        items: [{ preset: 'pr15' }, { preset: 'pr16', verify: true }, { preset: 'pr18' }] },
      { id: 'pt_boyun1', name: 'Boyun · Gevşeme', cat: 'boyun', desc: '3 hareket · masa başı',
        items: [{ preset: 'pr19' }, { preset: 'pr20' }, { preset: 'pr21' }] },
      { id: 'pt_kalca1', name: 'Kalça · Güçlendirme', cat: 'kalca', desc: '3 hareket · stabilite',
        items: [{ preset: 'pr22', verify: true }, { preset: 'pr23' }, { preset: 'pr24', verify: true }] },
      { id: 'pt_genel1', name: 'Genel · Günlük hareketlilik', cat: 'genel', desc: '3 hareket · bakım',
        items: [{ preset: 'pr25' }, { preset: 'pr27', verify: true }, { preset: 'pr28' }] }
    ],
    badges: [
      { id: 'b1', name: 'İlk adım', icon: 'ti-shoe', got: true },
      { id: 'b2', name: '7 gün seri', icon: 'ti-flame', got: false },
      { id: 'b3', name: 'Kanıt ustası', icon: 'ti-shield-check', got: false },
      { id: 'b4', name: 'Hedef avcısı', icon: 'ti-target-arrow', got: false }
    ]
  };

  let state = null; // set by startDemo()/resumeDemo()/loadCloud() during boot

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (!s) return structuredClone(seed);
      s.settings = s.settings || {};
      if (!s.settings.notif) s.settings.notif = structuredClone(seed.settings.notif);
      if (s.settings.notif.inactiveDays === undefined) { s.settings.notif.inactiveDays = 2; s.settings.notif.autoActions = ['notifyDoctor', 'remindPatient']; }
      if (s.settings.gamify === undefined) s.settings.gamify = true;
      // Always refresh the static exercise library/protocols from seed so new content ships to returning users.
      s.presets = structuredClone(seed.presets);
      s.cats = structuredClone(seed.cats);
      s.protocols = structuredClone(seed.protocols);
      if (!s.slots) s.slots = structuredClone(seed.slots);
      if (s.doctor && s.doctor.bookingUrl === undefined) s.doctor.bookingUrl = '';
      (s.patients || []).forEach(p => { if (p.notif && !p.notif.autoActions) p.notif.autoActions = ['notifyDoctor']; if (!Array.isArray(p.sessions)) p.sessions = []; });
      return s;
    } catch { return structuredClone(seed); }
  }
  // Demo mode persists locally; cloud mode keeps health data in memory only (privacy).
  let mode = null; // 'demo' | 'cloud'
  function save() { if (mode === 'demo') localStorage.setItem(KEY, JSON.stringify(state)); }
  function reset() { localStorage.removeItem(KEY); state = null; mode = null; }

  return {
    get: () => state,
    save, reset,
    mode: () => mode,
    isCloud: () => mode === 'cloud',
    patient: (id) => state && state.patients.find(p => p.id === id),
    seedRef: seed,
    // start/resume the local demo experience
    startDemo(role) {
      mode = 'demo'; state = load(); state.cloud = false; state.session = { role, id: role === 'doctor' ? 'd1' : 'p1' };
      // seed one of today's sessions (unverified) for the demo patient, so history/log has content
      if (!state._demoSeeded) {
        const today = new Date().toISOString().slice(0, 10);
        const p1 = state.patients.find(p => p.id === 'p1');
        if (p1 && (!p1.sessions || !p1.sessions.length)) p1.sessions = [{ exId: 'e1', date: today, verified: false, at: Date.now() }];
        state._demoSeeded = true;
      }
      save();
    },
    resumeDemo() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.session) { mode = 'demo'; state = load(); return true; } } catch {} return false; },
    // load a cloud-built state (real account)
    loadCloud(obj) { mode = 'cloud'; state = obj; },
    logout() { localStorage.removeItem(KEY); state = null; mode = null; }
  };
})();
