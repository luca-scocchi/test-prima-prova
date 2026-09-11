// =====================================================================
//  Motore della simulazione
//  - distribuzione delle domande per sezione (proporzionale all'esame)
//  - assemblaggio nell'ORDINE UFFICIALE delle sezioni (§4)
//  - randomizzazione delle domande DENTRO ogni sezione
//  - anti-duplicazione tramite le domande già viste (§18)
//  - shuffle delle opzioni a runtime (elimina qualsiasi bias di posizione)
// =====================================================================

import { SECTIONS, SECTION_ORDER } from '../data/sections.js'
import bank from '../data/questions.json'

/* --------------------------- utilità ------------------------------ */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Raggruppa la banca per nome-sezione.
const bankBySection = (() => {
  const map = {}
  for (const q of bank) {
    ;(map[q.section] = map[q.section] || []).push(q)
  }
  return map
})()

export function bankStats() {
  return SECTIONS.map((s) => ({
    id: s.id,
    name: s.name,
    available: (bankBySection[s.name] || []).length
  }))
}

/* -------------------- distribuzione per sezione -------------------- */
// Distribuisce `total` domande mantenendo il più possibile la proporzione
// ufficiale (examCount). Metodo del resto più grande (largest remainder).
export function distributeProportional(total) {
  const weights = SECTIONS.map((s) => s.examCount)
  const sumW = weights.reduce((a, b) => a + b, 0)
  const raw = weights.map((w) => (w / sumW) * total)
  const base = raw.map((x) => Math.floor(x))
  let assigned = base.reduce((a, b) => a + b, 0)
  let remainder = total - assigned
  // Assegna le domande restanti alle sezioni con la parte frazionaria più alta.
  const order = raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac)
  let k = 0
  while (remainder > 0 && order.length) {
    base[order[k % order.length].i] += 1
    remainder -= 1
    k += 1
  }
  const out = {}
  SECTIONS.forEach((s, i) => {
    out[s.id] = base[i]
  })
  return out
}

// Distribuzione standard: esattamente quella dei file ufficiali (30 domande).
export function standardDistribution() {
  const out = {}
  SECTIONS.forEach((s) => {
    out[s.id] = s.examCount
  })
  return out
}

/* --------------------- selezione delle domande -------------------- */
// Sceglie `count` domande dalla sezione, preferendo quelle non ancora viste.
function pickFromSection(sectionName, count, { seenIds, avoidIds, topics } = {}) {
  let pool = bankBySection[sectionName] || []
  if (topics && topics.size) {
    const filtered = pool.filter((q) => topics.has(q.topic))
    if (filtered.length >= count) pool = filtered
  }
  const avoid = avoidIds || new Set()
  const seen = seenIds || new Set()
  const candidates = pool.filter((q) => !avoid.has(q.id))
  const unseen = shuffle(candidates.filter((q) => !seen.has(q.id)))
  const already = shuffle(candidates.filter((q) => seen.has(q.id)))
  const ordered = [...unseen, ...already]
  return ordered.slice(0, Math.min(count, ordered.length))
}

// Mischia le opzioni di una domanda e rimappa l'indice della risposta corretta.
function shuffleOptions(q) {
  const idx = q.options.map((_, i) => i)
  const order = shuffle(idx)
  const options = order.map((i) => q.options[i])
  const correctAnswer = order.indexOf(q.correctAnswer)
  return { ...q, options, correctAnswer }
}

/* ---------------------- costruzione simulazione ------------------- */
// distribution: { [sectionId]: count }
// Ritorna un array di domande nell'ordine ufficiale delle sezioni,
// con le domande randomizzate dentro ogni sezione e le opzioni mischiate.
export function buildSimulation(distribution, { seenIds } = {}) {
  const questions = []
  for (const s of SECTIONS) {
    const count = distribution[s.id] || 0
    if (count <= 0) continue
    const picked = pickFromSection(s.name, count, { seenIds })
    picked.forEach((q) => questions.push(shuffleOptions(q)))
  }
  // Le sezioni sono già in ordine; garantiamo comunque la stabilità dell'ordine.
  questions.sort((a, b) => {
    const oa = SECTION_ORDER[a.section] ?? 999
    const ob = SECTION_ORDER[b.section] ?? 999
    return oa - ob
  })
  return questions
}

// Simulazione di ripasso errori (§15): domande NUOVE sulle sezioni/topic
// dove l'utente ha sbagliato di più. Non ripropone la domanda sbagliata:
// pesca altre domande della banca sugli stessi concetti.
export function buildReviewSimulation(weakTopics, total, { seenIds } = {}) {
  if (!weakTopics.length) return []
  // Peso per sezione = numero di errori.
  const bySection = {}
  for (const w of weakTopics) {
    bySection[w.section] = bySection[w.section] || { wrong: 0, topics: new Set() }
    bySection[w.section].wrong += w.wrong
    bySection[w.section].topics.add(w.topic)
  }
  const entries = Object.entries(bySection)
  const sumWrong = entries.reduce((a, [, v]) => a + v.wrong, 0)
  // Ripartizione proporzionale agli errori, con almeno 1 domanda per sezione debole.
  let counts = entries.map(([name, v]) => ({
    name,
    topics: v.topics,
    n: Math.max(1, Math.round((v.wrong / sumWrong) * total))
  }))
  // Aggiusta al totale richiesto.
  let sum = counts.reduce((a, c) => a + c.n, 0)
  while (sum > total) {
    const big = counts.filter((c) => c.n > 1).sort((a, b) => b.n - a.n)[0]
    if (!big) break
    big.n -= 1
    sum -= 1
  }
  while (sum < total) {
    counts.sort((a, b) => b.n - a.n)
    counts[0].n += 1
    sum += 1
  }
  const questions = []
  for (const c of counts) {
    const picked = pickFromSection(c.name, c.n, { seenIds, topics: c.topics })
    picked.forEach((q) => questions.push(shuffleOptions(q)))
  }
  questions.sort((a, b) => {
    const oa = SECTION_ORDER[a.section] ?? 999
    const ob = SECTION_ORDER[b.section] ?? 999
    return oa - ob
  })
  return questions
}

/* ------------------------- valutazione ---------------------------- */
export function grade(questions, answers) {
  const perSection = {}
  let correct = 0
  questions.forEach((q, i) => {
    const sec = (perSection[q.section] = perSection[q.section] || {
      section: q.section,
      total: 0,
      correct: 0
    })
    sec.total += 1
    if (answers[i] === q.correctAnswer) {
      correct += 1
      sec.correct += 1
    }
  })
  const sections = SECTIONS.filter((s) => perSection[s.name]).map((s) => {
    const d = perSection[s.name]
    return { ...d, pct: Math.round((d.correct / d.total) * 100) }
  })
  return {
    correct,
    total: questions.length,
    pct: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    sections
  }
}
