// ══════════════════════════════════════════════════════
//  SUBMIT — Envío de respuestas al webhook de Apps Script
// ══════════════════════════════════════════════════════

const Submitter = (() => {

  function buildRows(mod, nombre, entidad) {
    const qs = State.getByModule(mod);

    return qs
      .filter(q => State.isAnswered(q.id))
      .map(q => {
        const val = State.getResponse(q.id);
        return {
          timestamp:   new Date().toISOString(),
          nombre,
          entidad,
          modulo:      mod,
          id_pregunta: q.id,
          codigo:      q.codigo,
          pregunta:    q.texto,
          tipo:        q.tipo,
          respuesta:   Array.isArray(val) ? val.join(' | ') : String(val),
        };
      });
  }

  async function send(mod, nombre, entidad) {
    if (!CONFIG.WEBHOOK_URL) {
      UI.toast('Configura WEBHOOK_URL en config.js', 'warn');
      return false;
    }

    const rows = buildRows(mod, nombre, entidad);
    if (rows.length === 0) {
      UI.toast('No hay respuestas para guardar', 'warn');
      return false;
    }

    // Apps Script requires mode: 'no-cors' — response body won't be readable
    await fetch(CONFIG.WEBHOOK_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ rows }),
    });

    // Assume success (no-cors can't read response)
    State.markModuleSaved(mod);
    return true;
  }

  return { send };
})();