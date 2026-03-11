// ══════════════════════════════════════════════════════
//  MODULES — Pantalla de selección de módulo
// ══════════════════════════════════════════════════════

const MODULE_NAMES = {
  CCP: 'Control de Corrupción y Protección',
  CIN: 'Control Interno',
  DJU: 'Defensa Jurídica',
  EMI: 'Emisiones y Medio Ambiente',
  FIN: 'Financiero',
  FOR: 'Fortalecimiento Organizacional',
  GCI: 'Gestión Ciudadana',
  GDI: 'Gestión de la Información',
  GDO: 'Gestión Documental',
  GTH: 'Gestión del Talento Humano',
  INT: 'Integridad',
  PCI: 'Participación Ciudadana',
  PER: 'Percepción',
  PLA: 'Planeación',
  SDI: 'Seguridad Digital',
  SEC: 'Servicio al Ciudadano',
  SYE: 'Seguimiento y Evaluación',
  THI: 'Tecnologías de la Información',
  TRA: 'Transparencia',
};

const ModulesScreen = (() => {

  function buildCard(mod, total) {
    const { answered, pct } = State.getProgress(mod);
    const cls = pct === 100 ? 'done' : pct > 0 ? 'partial' : '';
    const progHTML = pct > 0
      ? `<span class="mod-prog ${pct < 100 ? 'partial' : ''}">${pct}%</span>`
      : '';

    return `
      <div class="mod-card ${cls}" data-mod="${mod}" role="button" tabindex="0"
           aria-label="Módulo ${mod}: ${MODULE_NAMES[mod] || mod}, ${total} preguntas">
        <div class="mod-code">${mod}</div>
        <div class="mod-name">${MODULE_NAMES[mod] || mod}</div>
        <div class="mod-footer">
          <span class="mod-count">${total} preguntas</span>
          ${progHTML}
        </div>
      </div>`;
  }

  function render() {
    const grid  = document.getElementById('mod-grid');
    const index = State.getIndex();   // [{ modulo, total }]

    grid.innerHTML = index.map(({ modulo, total }) =>
      buildCard(modulo, total)
    ).join('');

    // Single delegated listener
    grid.addEventListener('click',   onCardClick);
    grid.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') onCardClick(e);
    });
  }

  function onCardClick(e) {
    const card = e.target.closest('.mod-card');
    if (!card) return;
    App.openModule(card.dataset.mod);   // nombre check is inside App.openModule
  }

  function refresh() {
    State.getIndex().forEach(({ modulo, total }) => {
      const card = document.querySelector(`.mod-card[data-mod="${modulo}"]`);
      if (!card) return;
      const { pct } = State.getProgress(modulo);
      card.className = `mod-card ${pct === 100 ? 'done' : pct > 0 ? 'partial' : ''}`;
      const prog = card.querySelector('.mod-prog');
      if (pct > 0) {
        if (prog) {
          prog.textContent = pct + '%';
          prog.className   = `mod-prog ${pct < 100 ? 'partial' : ''}`;
        } else {
          card.querySelector('.mod-footer').insertAdjacentHTML(
            'beforeend',
            `<span class="mod-prog ${pct < 100 ? 'partial' : ''}">${pct}%</span>`
          );
        }
      }
    });
  }

  function getNombre()  { return document.getElementById('inp-nombre').value.trim(); }
  function getEntidad() { return document.getElementById('inp-entidad').value.trim(); }

  return { render, refresh, getNombre, getEntidad };
})();