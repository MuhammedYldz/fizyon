/* Fizyon cloud API — Supabase Auth + data access.
   Lazy-loads supabase-js (ESM) on first use. All reads/writes are RLS-guarded.
   Screens can migrate from local demo state (FZ) to these calls incrementally. */
(function () {
  let _c = null;
  async function client() {
    if (_c) return _c;
    const m = await import('https://esm.sh/@supabase/supabase-js@2.45.0');
    _c = m.createClient(window.FZ_CONFIG.url, window.FZ_CONFIG.anon, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return _c;
  }
  async function uid() { const c = await client(); const { data } = await c.auth.getUser(); return data.user ? data.user.id : null; }

  window.FZ_API = {
    client,
    /* ---- auth ---- */
    async signUp({ email, password, fullName, role, license, doctorCode }) {
      const c = await client();
      return c.auth.signUp({ email, password, options: { data: { full_name: fullName, role, license_no: license || null, doctor_code: doctorCode || null, consent_health: true, consent_at: new Date().toISOString() } } });
    },
    async signIn({ email, password }) { const c = await client(); return c.auth.signInWithPassword({ email, password }); },
    async signOut() { const c = await client(); return c.auth.signOut(); },
    async session() { const c = await client(); const { data } = await c.auth.getSession(); return data.session; },
    async myProfile() { const c = await client(); const id = await uid(); if (!id) return null; const { data } = await c.from('profiles').select('*').eq('id', id).single(); return data; },
    async setConsent() { const c = await client(); const id = await uid(); if (!id) return; return c.from('profiles').update({ consent_health: true, consent_at: new Date().toISOString() }).eq('id', id); },

    /* ---- data layer (RLS enforced server-side) ---- */
    async myDoctor() { const c = await client(); const p = await this.myProfile(); if (!p || !p.doctor_id) return null; const { data } = await c.from('profiles').select('full_name,license_no').eq('id', p.doctor_id).single(); return data; },
    async myPatients() { const c = await client(); const id = await uid(); const { data } = await c.from('profiles').select('*').eq('doctor_id', id); return data || []; },
    async program(patientId) { const c = await client(); const { data } = await c.from('exercises').select('*').eq('patient_id', patientId).order('position'); return data || []; },
    async addExercise(ex) { const c = await client(); return c.from('exercises').insert(ex); },
    async deleteExercise(id) { const c = await client(); return c.from('exercises').delete().eq('id', id); },
    async logCompletion(row) { const c = await client(); return c.from('completions').insert(row); },
    async sendFeedback(row) { const c = await client(); return c.from('feedback').insert(row); },
    async getNotif(patientId) { const c = await client(); const { data } = await c.from('notif_settings').select('*').eq('patient_id', patientId).single(); return data; },
    async setNotif(patientId, patch) { const c = await client(); return c.from('notif_settings').update(patch).eq('patient_id', patientId); },
    async setAppointment(row) { const c = await client(); return c.from('appointments').insert(row); },
    async getGamification(patientId) { const c = await client(); const { data } = await c.from('gamification').select('*').eq('patient_id', patientId).single(); return data; },
    async setGamification(patientId, patch) { const c = await client(); return c.from('gamification').update(patch).eq('patient_id', patientId); },
    async completionsFor(patientId) { const c = await client(); const { data } = await c.from('completions').select('exercise_id,verified,done_at').eq('patient_id', patientId); return data || []; },
    async appointmentsFor(patientId) { const c = await client(); const { data } = await c.from('appointments').select('at').eq('patient_id', patientId).order('at', { ascending: false }).limit(1); return data || []; },
    async feedbackFor(patientId) { const c = await client(); const { data } = await c.from('feedback').select('reason,note,created_at').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(10); return data || []; },
    async audit(action, target) { const c = await client(); const id = await uid(); if (!id) return; return c.from('audit_log').insert({ actor_id: id, action, target }); }
  };
})();
