/* Looped exercise demos — clean "gray body" figures, pure SVG+CSS, work offline.
   A placeholder for a doctor's own recorded video / future 3D clip.
   Each figure exposes named limb groups (.d-head, .d-armL/R, .d-legL/R, .d-hips,
   .d-spine, .d-shin) so styles.css can both ANIMATE and HIGHLIGHT (teal) the limb
   that a given exercise works. Animations live in styles.css under .fz-demo--{key}. */
(function () {
  const dot = (x, y, r) => `<circle class="joint" cx="${x}" cy="${y}" r="${r || 3.4}"/>`;

  // Standing figure (squats, balance, arms, neck, marching, calf raises…)
  const standing = (key) => `
    <svg class="fz-demo fz-demo--${key}" viewBox="-16 -34 152 232" aria-hidden="true">
      <ellipse class="d-shadow" cx="60" cy="184" rx="30" ry="4.5"/>
      <g class="d-legs">
        <g class="d-legL"><rect class="seg" x="49" y="100" width="11" height="76" rx="5.5"/></g>
        <g class="d-legR"><rect class="seg" x="60" y="100" width="11" height="76" rx="5.5"/></g>
      </g>
      <g class="d-hips"><rect class="seg" x="46" y="90" width="28" height="17" rx="8.5"/></g>
      <g class="d-body">
        <g class="d-arms">
          <g class="d-armL"><rect class="seg" x="37" y="50" width="10" height="46" rx="5"/></g>
          <g class="d-armR"><rect class="seg" x="73" y="50" width="10" height="46" rx="5"/></g>
        </g>
        <rect class="seg" x="46" y="44" width="28" height="50" rx="13"/>
        <g class="d-head"><circle class="seg" cx="60" cy="26" r="14"/></g>
      </g>
      ${dot(47, 52)}${dot(73, 52)}${dot(54, 100, 3)}${dot(66, 100, 3)}${dot(54, 140)}${dot(66, 140)}
    </svg>`;

  // Reclined figure, head to the left (bridge, leg raise, clamshell, heel slide…)
  const reclined = (key) => `
    <svg class="fz-demo fz-demo--${key}" viewBox="-8 -22 208 150" aria-hidden="true">
      <line class="d-floor" x1="10" y1="98" x2="182" y2="98"/>
      <g class="d-head"><circle class="seg" cx="28" cy="66" r="14"/></g>
      <rect class="seg d-torso" x="40" y="58" width="68" height="22" rx="11"/>
      <g class="d-hips"><rect class="seg" x="100" y="55" width="24" height="27" rx="11"/></g>
      <g class="d-legR"><rect class="seg" x="118" y="58" width="60" height="13" rx="6.5"/></g>
      <g class="d-legL"><rect class="seg" x="118" y="70" width="60" height="13" rx="6.5"/></g>
      ${dot(112, 67, 3.4)}${dot(150, 64, 3)}${dot(150, 76, 3)}
    </svg>`;

  // Seated figure (knee extension, seated work)
  const seated = (key) => `
    <svg class="fz-demo fz-demo--${key}" viewBox="-10 -20 172 184" aria-hidden="true">
      <ellipse class="d-shadow" cx="78" cy="150" rx="34" ry="4.5"/>
      <path class="d-chair" d="M56 88 H118 M118 88 V150 M56 88 V60" fill="none"/>
      <g class="d-head"><circle class="seg" cx="62" cy="24" r="13"/></g>
      <rect class="seg" x="49" y="36" width="26" height="54" rx="13"/>
      <g class="d-armR"><rect class="seg" x="40" y="44" width="9" height="40" rx="4.5"/></g>
      <rect class="seg" x="62" y="86" width="46" height="13" rx="6.5"/>
      <g class="d-shin"><rect class="seg" x="100" y="96" width="13" height="48" rx="6.5"/></g>
      ${dot(62, 50)}${dot(106, 92, 3.4)}
    </svg>`;

  // Quadruped figure, on hands & knees (cat-cow, bird-dog)
  const quad = (key) => `
    <svg class="fz-demo fz-demo--${key}" viewBox="-8 -26 204 164" aria-hidden="true">
      <line class="d-floor" x1="8" y1="116" x2="180" y2="116"/>
      <g class="d-head"><circle class="seg" cx="40" cy="56" r="13"/></g>
      <g class="d-spine"><rect class="seg" x="50" y="48" width="86" height="17" rx="8.5"/></g>
      <g class="d-armL"><rect class="seg" x="56" y="62" width="11" height="52" rx="5.5"/></g>
      <g class="d-armR"><rect class="seg" x="120" y="62" width="11" height="52" rx="5.5"/></g>
      ${dot(58, 58)}${dot(128, 58)}
    </svg>`;

  // key -> figure template
  const map = {
    squat: standing, wallsquat: standing, balance: standing, lunge: standing,
    calfraise: standing, marching: standing, shoulder: standing, pendulum: standing,
    armraise: standing, shrug: standing, neckTilt: standing, neckRotation: standing,
    hipabduction: standing, generic: standing,
    legraise: reclined, bridge: reclined, clamshell: reclined, heelslide: reclined,
    sidelegraise: reclined,
    kneeextension: seated,
    catcow: quad, birddog: quad
  };

  window.fzDemo = function (key) {
    const k = map[key] ? key : 'generic';
    return (map[k] || standing)(k);
  };
})();
