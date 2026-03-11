// ══════════════════════════════════════════════════════
//  SUBMIT — Envío de respuestas al webhook de Apps Script
//  (versión v2 — usa State.getCurrentQuestions())
// ══════════════════════════════════════════════════════

const Submitter = (() => {

  function buildRows(mod, nombre, entidad) {
    const qs = State.getCurrentQuestions();

    return qs
      .filter(q => State.isAnswered(q.id))
      .map(q => {
        const raw = State.getResponse(q.id);

        // Respuesta puede ser { respuesta, evidencia } o valor directo
        let respuesta, evidencia;
        if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'respuesta' in raw) {
          respuesta = raw.respuesta;
          evidencia = raw.evidencia || '';
        } else {
          respuesta = raw;
          evidencia = '';
        }

        return {
          timestamp:        new Date().toISOString(),
          nombre,
          entidad,
          modulo:           mod,
          id_pregunta:      q.id,
          codigo:           q.codigo,
          pregunta:         q.texto,
          tipo:             q.tipo,
          respuesta:        Array.isArray(respuesta) ? respuesta.join(' | ') : String(respuesta ?? ''),
          requiere_evidencia: q.evidencia ? 'SI' : 'NO',
          evidencia:        evidencia,
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

    await fetch(CONFIG.WEBHOOK_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ rows }),
    });

    State.markModuleSaved(mod);
    return true;
  }

  return { send };
})();