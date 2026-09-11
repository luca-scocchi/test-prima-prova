// =====================================================================
//  Persistenza su localStorage (§22)
//  Salva: risultati, errori, statistiche, domande già usate, progresso,
//  impostazioni (tema + configurazione LLM opzionale).
// =====================================================================

const KEYS = {
  seen: 'sim_seen_ids', // id domande già mostrate (anti-duplicazione tra simulazioni)
  history: 'sim_history', // storico dei risultati
  errorLog: 'sim_error_log', // errori aggregati per sezione/topic (per "Ripasso errori")
  progress: 'sim_progress', // simulazione in corso (per riprendere dopo un refresh)
  settings: 'sim_settings' // tema, provider LLM, api key, ecc.
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage pieno o non disponibile: ignora */
  }
}

/* ------------------------- Domande già viste ------------------------- */
export function getSeenIds() {
  return new Set(read(KEYS.seen, []))
}
export function addSeenIds(ids) {
  const set = getSeenIds()
  ids.forEach((id) => set.add(id))
  write(KEYS.seen, [...set])
}
export function resetSeenIds() {
  write(KEYS.seen, [])
}

/* ---------------------------- Storico ------------------------------- */
export function getHistory() {
  return read(KEYS.history, [])
}
export function addHistory(result) {
  const h = getHistory()
  h.unshift(result)
  write(KEYS.history, h.slice(0, 50))
}
export function clearHistory() {
  write(KEYS.history, [])
}

/* ------------------- Log errori per sezione/topic ------------------- */
// Struttura: { [sectionName]: { total, wrong, topics: { [topic]: {total, wrong} } } }
export function getErrorLog() {
  return read(KEYS.errorLog, {})
}
export function recordAttempt(questions, answers) {
  const log = getErrorLog()
  questions.forEach((q, i) => {
    const sec = (log[q.section] = log[q.section] || { total: 0, wrong: 0, topics: {} })
    sec.total += 1
    const topic = (sec.topics[q.topic] = sec.topics[q.topic] || { total: 0, wrong: 0 })
    topic.total += 1
    const wrong = answers[i] !== q.correctAnswer
    if (wrong) {
      sec.wrong += 1
      topic.wrong += 1
    }
  })
  write(KEYS.errorLog, log)
}
// Sezioni/topic in cui l'utente sbaglia di più (per il ripasso mirato).
export function getWeakTopics() {
  const log = getErrorLog()
  const out = []
  for (const [section, data] of Object.entries(log)) {
    for (const [topic, td] of Object.entries(data.topics)) {
      if (td.wrong > 0) out.push({ section, topic, wrong: td.wrong, total: td.total })
    }
  }
  return out.sort((a, b) => b.wrong - a.wrong)
}
export function clearErrorLog() {
  write(KEYS.errorLog, {})
}

/* ----------------------- Progresso in corso ------------------------ */
export function saveProgress(state) {
  write(KEYS.progress, state)
}
export function getProgress() {
  return read(KEYS.progress, null)
}
export function clearProgress() {
  try {
    localStorage.removeItem(KEYS.progress)
  } catch {
    /* ignore */
  }
}

/* --------------------------- Impostazioni -------------------------- */
const DEFAULT_SETTINGS = {
  theme: 'dark',
  llmEnabled: false,
  llmProvider: 'anthropic', // 'anthropic' | 'openai'
  llmModel: '',
  llmApiKey: ''
}
export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) }
}
export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch }
  write(KEYS.settings, next)
  return next
}

/* --------------------------- Reset totale -------------------------- */
export function resetAll() {
  Object.values(KEYS).forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  })
}
