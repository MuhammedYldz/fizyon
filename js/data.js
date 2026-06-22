/* Seed/demo data + persistence layer. Demo only: local-first, no real backend.
   In production this is replaced by an authenticated API (see DESIGN.md §5). */
window.FZ = (function () {
  const KEY = 'fizyon.state.v1';

  const seed = {
    session: null, // {role:'doctor'|'patient', id}
    settings: { gamify: true, notif: { push: true, sms: false, email: false, quietFrom: '22:00', quietTo: '07:00', inactiveDays: 2, autoActions: ['notifyDoctor', 'remindPatient'] } },
    doctor: { id: 'd1', name: 'Fzt. Elif Aydın', license: 'TR-FT-20431' },
    patients: [
      { id: 'p1', name: 'Ayşe Kaya', initials: 'AK', condition: 'Sol diz — menisküs', week: 3, adherence: 82,
        streak: 6, points: 540, journeyStage: 2,
        history: [60, 80, 100, 40, 90, 100, 82],
        note: 'Bugün dengeye ağırlık ver. Acele etme 🙂',
        nextAppt: '28 Haziran, 14:00',
        notif: { tone: 'normal', times: ['18:00'], escalateDays: 2, autoActions: ['notifyDoctor', 'remindPatient'] },
        couldnt: [{ day: 'Perşembe', reason: 'Ağrı oldu', text: 'Diz arkasında keskin ağrı, 2. sette bıraktım.' }],
        program: [
          { id: 'e1', name: 'Düz bacak kaldırma', demo: 'legraise', reps: 12, sets: 3, hold: 0, done: true,
            note: 'Yavaş kaldır, beli yere yapışık tut.', verify: null },
          { id: 'e2', name: 'Mini squat', demo: 'squat', reps: 10, sets: 3, hold: 30, done: false,
            note: 'Dizini öne taşıma, ağrı olursa dur.', verify: 'Tek ayak üstünde 5 sn denge' },
          { id: 'e3', name: 'Tek ayak denge', demo: 'balance', reps: 1, sets: 3, hold: 5, done: false,
            note: 'Sabit bir noktaya bak.', verify: 'Tek ayak üstünde 5 sn denge' }
        ] },
      { id: 'p2', name: 'Mert Demir', initials: 'MD', condition: 'Sağ omuz — sıkışma', week: 1, adherence: 41,
        streak: 1, points: 120, journeyStage: 1, history: [40, 0, 60, 50, 40, 0, 41],
        note: 'Ağrısız aralıkta çalış.', nextAppt: '26 Haziran, 11:00',
        notif: { tone: 'gentle', times: ['10:00', '19:00'], escalateDays: 1, autoActions: ['remindPatient'] },
        couldnt: [], program: [] },
      { id: 'p3', name: 'Selin Yıldız', initials: 'SY', condition: 'Bel — disk', week: 5, adherence: 23,
        streak: 0, points: 60, journeyStage: 1, history: [20, 0, 0, 40, 0, 30, 23],
        note: 'Lütfen günde bir kez deneyelim.', nextAppt: '1 Temmuz, 09:30',
        notif: { tone: 'strict', times: ['08:00', '13:00', '20:00'], escalateDays: 1, autoActions: ['notifyDoctor', 'remindPatient', 'callPatient'] },
        couldnt: [{ day: 'Pazartesi', reason: 'Zamanım olmadı', text: '' }], program: [] }
    ],
    presets: [
      { id: 'pr1', name: 'Mini squat', demo: 'squat', cat: 'diz', reps: 10, sets: 3, hold: 0, note: 'Dizini öne taşıma, sırtın düz.' },
      { id: 'pr2', name: 'Düz bacak kaldırma', demo: 'legraise', cat: 'diz', reps: 12, sets: 3, hold: 0, note: 'Beli yere yapışık tut.' },
      { id: 'pr3', name: 'Tek ayak denge', demo: 'balance', cat: 'diz', reps: 1, sets: 3, hold: 5, note: 'Sabit bir noktaya bak.' },
      { id: 'pr4', name: 'Köprü', demo: 'bridge', cat: 'bel', reps: 10, sets: 3, hold: 3, note: 'Kalçanı yukarı kaldır, karnını sık.' },
      { id: 'pr5', name: 'Kedi-deve', demo: 'bridge', cat: 'bel', reps: 8, sets: 2, hold: 0, note: 'Omurganı yavaşça yuvarla.' },
      { id: 'pr6', name: 'Omuz dış rotasyon', demo: 'shoulder', cat: 'omuz', reps: 12, sets: 3, hold: 0, note: 'Dirseğini gövdene yakın tut.' },
      { id: 'pr7', name: 'Pendulum', demo: 'shoulder', cat: 'omuz', reps: 15, sets: 2, hold: 0, note: 'Kolunu gevşek bırak, sallandır.' },
      { id: 'pr8', name: 'Duvar squat', demo: 'squat', cat: 'genel', reps: 8, sets: 3, hold: 10, note: 'Sırtın duvara yaslı, 90 derece.' }
    ],
    cats: [['all', 'Tümü'], ['diz', 'Diz'], ['bel', 'Bel'], ['omuz', 'Omuz'], ['genel', 'Genel']],
    badges: [
      { id: 'b1', name: 'İlk adım', icon: 'ti-shoe', got: true },
      { id: 'b2', name: '7 gün seri', icon: 'ti-flame', got: false },
      { id: 'b3', name: 'Kanıt ustası', icon: 'ti-shield-check', got: false },
      { id: 'b4', name: 'Hedef avcısı', icon: 'ti-target-arrow', got: false }
    ]
  };

  let state = load();

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (!s) return structuredClone(seed);
      s.settings = s.settings || {};
      if (!s.settings.notif) s.settings.notif = structuredClone(seed.settings.notif);
      if (s.settings.notif.inactiveDays === undefined) { s.settings.notif.inactiveDays = 2; s.settings.notif.autoActions = ['notifyDoctor', 'remindPatient']; }
      if (s.settings.gamify === undefined) s.settings.gamify = true;
      if (!s.presets) s.presets = structuredClone(seed.presets);
      if (!s.cats) s.cats = structuredClone(seed.cats);
      (s.patients || []).forEach(p => { if (p.notif && !p.notif.autoActions) p.notif.autoActions = ['notifyDoctor']; });
      return s;
    } catch { return structuredClone(seed); }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function reset() { state = structuredClone(seed); save(); }

  return {
    get: () => state, save, reset,
    patient: (id) => state.patients.find(p => p.id === id),
    seedRef: seed
  };
})();
