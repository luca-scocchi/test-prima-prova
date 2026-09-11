// =====================================================================
//  Generazione domande a runtime con LLM (modalità IBRIDA, opzionale) (§18)
//  - Di default l'app usa la banca statica verificata.
//  - Se l'utente attiva l'AI e inserisce una API key, per ogni sezione le
//    domande vengono generate al volo, evitando quelle già usate.
//  - In caso di errore/timeout si torna automaticamente alla banca statica.
//  Provider supportati: Anthropic (Claude) e OpenAI. La chiamata parte dal
//  browser: la key resta solo in localStorage sul dispositivo dell'utente.
// =====================================================================

import { SECTION_BY_ID } from '../data/sections.js'
import bank from '../data/questions.json'

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .trim()

// Esempi di calibrazione + testi da evitare, presi dalla banca statica.
function sectionContext(sectionName) {
  const qs = bank.filter((q) => q.section === sectionName)
  const examples = qs.slice(0, 4).map((q) => ({
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation
  }))
  const topics = [...new Set(qs.map((q) => q.topic))]
  const avoid = qs.map((q) => q.question)
  return { examples, topics, avoid }
}

function buildPrompt({ section, count }) {
  const { examples, topics, avoid } = sectionContext(section.name)
  const isEnglish = section.id === 'technical_english'
  const lang = isEnglish
    ? 'Le domande e le opzioni di questa sezione sono in INGLESE (come nell\'esame).'
    : 'Le domande e le opzioni sono in ITALIANO.'
  return `Sei un docente che prepara la prova scritta dell'ITS "AI Solution Architect".
Genera ESATTAMENTE ${count} domande NUOVE a scelta multipla per la sezione: "${section.name}".

REGOLE VINCOLANTI:
- ${lang}
- Ogni domanda ha ESATTAMENTE 3 opzioni (A/B/C), come nell'esame reale.
- Difficoltà da rispettare: "${section.difficulty}". Mantieni lo stesso livello degli esempi, né più facile né più difficile.
- Le domande devono verificare gli stessi concetti degli esempi ma essere DAVVERO NUOVE: non parafrasare, non cambiare solo numeri/nomi.
- La risposta corretta deve essere distribuita a caso tra le 3 posizioni (non sempre la stessa).
- IMPORTANTE: la risposta corretta NON deve essere sistematicamente l'opzione più lunga (errore classico). Varia la lunghezza; a volte l'opzione corretta è la più corta.
- Le opzioni sbagliate devono essere plausibili, non ridicole.
- La spiegazione è breve (2-5 frasi) e riguarda il concetto specifico della domanda. Per matematica/statistica/codice mostra i passaggi o il ragionamento.
- Non ripetere concetti già coperti da questi testi esistenti: ${JSON.stringify(avoid).slice(0, 1500)}
- Topics tipici della sezione: ${JSON.stringify(topics)}
- Se serve mostrare codice o una matrice, mettilo nel campo "code" (testo, con a capo \\n), non dentro "question".

ESEMPI DI CALIBRAZIONE (stile e difficoltà da imitare, NON da copiare):
${JSON.stringify(examples, null, 1)}

Rispondi SOLO con un array JSON valido, senza testo prima o dopo, in questo formato:
[
  {
    "topic": "string breve e specifico",
    "difficulty": "easy|medium|hard",
    "question": "testo della domanda",
    "code": "opzionale, codice o matrice, oppure ometti",
    "options": ["opzione A", "opzione B", "opzione C"],
    "correctAnswer": 0,
    "explanation": "spiegazione breve"
  }
]`
}

function extractJson(text) {
  if (!text) return null
  let t = text.trim()
  // togli eventuali fence ```json ... ```
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()
  const start = t.indexOf('[')
  const end = t.lastIndexOf(']')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(t.slice(start, end + 1))
  } catch {
    return null
  }
}

async function callAnthropic({ apiKey, model, prompt }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!res.ok) throw new Error('Anthropic API error ' + res.status + ': ' + (await res.text()))
  const data = await res.json()
  return data.content?.map((c) => c.text).join('') || ''
}

async function callOpenAI({ apiKey, model, prompt }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Rispondi sempre e solo con JSON valido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8
    })
  })
  if (!res.ok) throw new Error('OpenAI API error ' + res.status + ': ' + (await res.text()))
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function validate(items, sectionName, existingNorms) {
  const out = []
  const seen = new Set(existingNorms)
  for (const it of items || []) {
    if (!it || typeof it.question !== 'string') continue
    if (!Array.isArray(it.options) || it.options.length !== 3) continue
    if (it.options.some((o) => typeof o !== 'string' || !o.trim())) continue
    const ca = Number(it.correctAnswer)
    if (!Number.isInteger(ca) || ca < 0 || ca > 2) continue
    const key = norm(it.question)
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      section: sectionName,
      topic: it.topic || sectionName,
      difficulty: it.difficulty || 'medium',
      question: it.question.trim(),
      code: it.code ? String(it.code) : undefined,
      options: it.options.map((o) => o.trim()),
      correctAnswer: ca,
      explanation: it.explanation || ''
    })
  }
  return out
}

// Genera `count` domande per una sezione. Lancia un'eccezione in caso di errore.
export async function generateForSection(sectionId, count, settings) {
  const section = SECTION_BY_ID[sectionId]
  const prompt = buildPrompt({ section, count })
  const caller = settings.llmProvider === 'openai' ? callOpenAI : callAnthropic
  const raw = await caller({
    apiKey: settings.llmApiKey,
    model: settings.llmModel,
    prompt
  })
  const parsed = extractJson(raw)
  const existingNorms = bank.filter((q) => q.section === section.name).map((q) => norm(q.question))
  const items = validate(parsed, section.name, existingNorms)
  return items.map((q, i) => ({ ...q, id: `${sectionId}_ai_${Date.now()}_${i}` }))
}

// Verifica veloce che la key sia utilizzabile.
export async function testConnection(settings) {
  const caller = settings.llmProvider === 'openai' ? callOpenAI : callAnthropic
  const raw = await caller({
    apiKey: settings.llmApiKey,
    model: settings.llmModel,
    prompt: 'Rispondi solo con: [{"topic":"test","difficulty":"easy","question":"1+1?","options":["1","2","3"],"correctAnswer":1,"explanation":"1+1=2"}]'
  })
  const parsed = extractJson(raw)
  if (!parsed) throw new Error('Risposta non valida dal modello.')
  return true
}
