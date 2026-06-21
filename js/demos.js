/* Looped "gray body" exercise demos — pure SVG+CSS, work offline.
   Placeholder for a doctor's own recorded video or a future 3D/AI clip.
   Animations are defined in styles.css under .fz-demo--{key}. */
(function () {
  const standing = (key) => `
    <svg class="fz-demo fz-demo--${key}" viewBox="0 0 120 175" aria-hidden="true">
      <g class="d-legs">
        <rect class="seg d-legL" x="49" y="96" width="10" height="62" rx="5"/>
        <rect class="seg d-legR" x="61" y="96" width="10" height="62" rx="5"/>
      </g>
      <g class="d-body">
        <g class="d-arms">
          <rect class="seg" x="32" y="58" width="10" height="42" rx="5"/>
          <rect class="seg" x="78" y="58" width="10" height="42" rx="5"/>
        </g>
        <rect class="seg" x="46" y="50" width="28" height="54" rx="13"/>
        <circle class="seg" cx="60" cy="31" r="15"/>
      </g>
    </svg>`;

  const reclined = (key) => `
    <svg class="fz-demo fz-demo--${key}" viewBox="0 0 178 120" aria-hidden="true">
      <line x1="14" y1="92" x2="164" y2="92" stroke="var(--line)" stroke-width="4" stroke-linecap="round"/>
      <g class="d-legL"><rect class="seg" x="96" y="60" width="60" height="12" rx="6"/></g>
      <g class="d-hips"><rect class="seg" x="40" y="58" width="62" height="22" rx="11"/></g>
      <g class="d-legR"><rect class="seg" x="96" y="62" width="58" height="12" rx="6"/></g>
      <circle class="seg" cx="26" cy="62" r="14"/>
    </svg>`;

  const map = { squat: standing, balance: standing, shoulder: standing, generic: standing, legraise: reclined, bridge: reclined };

  window.fzDemo = function (key) {
    const k = map[key] ? key : 'generic';
    return (map[k] || standing)(k);
  };
})();
