// ══════════════════════════════════════════════════════
//  FORM — Renderizado del formulario e interacción
// ══════════════════════════════════════════════════════

const FormScreen = (() => {

  // ── HTML helpers ───────────────────────────────────

  function esc(s) {
    return String(s || '')
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

  function buildMultiple(q, isUnique) {
    const sel = isUnique
      ? (State.getResponse(q.id) ? [State.getResponse(q.id)] : [])
      : (Array.isArray(State.getResponse(q.id)) ? State.getResponse(q.id) : []);

    const type = isUnique ? 'radio' : 'checkbox';

    return `<div class="opts">${q.opciones.map(op => {
      const checked = sel.includes(op);
      return `
        <label class="opt${checked ? ' sel' : ''}">
          <input type="${type}" name="q${q.id}" value="${esc(op)}"${checked ? ' checked' : ''}>
          <span class="opt-lbl">${esc(op)}</span>
        </label>`;
    }).join('')}</div>`;
  }

  function buildTextarea(q) {
    const val = State.getResponse(q.id) || '';
    return `<textarea class="q-textarea"
      placeholder="Escribe tu respuesta…"
      data-qid="${q.id}">${esc(val)}</textarea>`;
  }

  function buildNumber(q) {
    const val = State.getResponse(q.id) || '';
    return `<input type="number" class="q-number"
      value="${esc(val)}"
      placeholder="Ingresa un número"
      data-qid="${q.id}">`;
  }

  function buildCard(q) {
    const answered = State.isAnswered(q.id);
    let input = '';

    switch (q.tipo) {
      case 'Selección múltiple':
      case 'Selección múltiple numérica':
        input = buildMultiple(q, false); break;
      case 'Selección única':
        input = buildMultiple(q, true); break;
      case 'Abierta numérica':
        input = buildNumber(q); break;
      default:
        input = buildTextarea(q);
    }

    return `
      <div class="q-card${answered ? ' answered' : ''}" id="qc${q.id}">
        <div class="q-top">
          <span class="q-badge">${esc(q.codigo)}</span>
          <span class="q-text">${esc(q.texto)}</span>
        </div>
        <div class="q-type-label">${esc(q.tipo)}</div>
        ${input}
      </div>`;
  }

  // ── Progress helpers ────────────────────────────────

  function updateProgress() {
    const mod  = State.getCurrentModule();
    const { answered, total, pct } = State.getProgress(mod);

    document.getElementById('prog-fill').style.width = pct + '%';
    document.getElementById('prog-label').textContent = `${answered} de ${total} respondidas`;
    document.getElementById('prog-pct').textContent   = pct + '%';
    document.getElementById('bar-ans').textContent    = answered;
    document.getElementById('bar-pend').textContent   = total - answered;
  }

  // ── Event delegation handler ────────────────────────

  function onInteraction(e) {
    const target = e.target;

    // Checkbox / radio
    if (target.matches('input[type="checkbox"], input[type="radio"]')) {
      const name  = target.name;               // "q<id>"
      const qId   = parseInt(name.slice(1));
      const isChk = target.type === 'checkbox';

      if (isChk) {
        const vals = [...document.querySelectorAll(`input[name="${name}"]:checked`)]
                       .map(i => i.value);
        State.setResponse(qId, vals);
      } else {
        State.setResponse(qId, target.value);
        // Toggle .sel on all siblings
        document.querySelectorAll(`input[name="${name}"]`).forEach(r =>
          r.closest('.opt').classList.toggle('sel', r.checked)
        );
      }

      // Toggle .sel on the clicked option
      if (isChk) target.closest('.opt').classList.toggle('sel', target.checked);

      refreshCard(qId);
      updateProgress();
    }

    // Textarea / number — use 'input' event instead (handled separately)
  }

  function onTextInput(e) {
    const target = e.target;
    if (!target.dataset.qid) return;
    const qId = parseInt(target.dataset.qid);
    State.setResponse(qId, target.value.trim());
    refreshCard(qId);
    updateProgress();
  }

  function refreshCard(qId) {
    const card = document.getElementById('qc' + qId);
    if (card) card.classList.toggle('answered', State.isAnswered(qId));
  }

  // ── Public API ──────────────────────────────────────

  function render(mod) {
    const qs = State.getByModule(mod);

    // Header
    document.getElementById('f-title').textContent =
      `Módulo ${mod} — ${MODULE_NAMES[mod] || ''}`;
    document.getElementById('f-subtitle').textContent =
      `${qs.length} preguntas · ${MODULE_NAMES[mod] || ''}`;

    // Questions
    const list = document.getElementById('q-list');
    list.innerHTML = qs.map(buildCard).join('');

    // Attach single delegated listener
    list.addEventListener('change', onInteraction);
    list.addEventListener('input',  onTextInput);

    updateProgress();
  }

  function reset() {
    const list = document.getElementById('q-list');
    list.innerHTML = '';
  }

  return { render, reset, updateProgress };
})();
