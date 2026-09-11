import { useEffect, useState, useCallback } from 'react'
import { SECTIONS, STANDARD_TOTAL, SECTION_BY_ID, SECTION_ORDER } from './data/sections.js'
import {
  standardDistribution,
  distributeProportional,
  buildSimulation,
  buildReviewSimulation,
  grade
} from './lib/quiz.js'
import { generateForSection } from './lib/llm.js'
import * as store from './lib/storage.js'

import Home from './components/Home.jsx'
import ConfigScreen from './components/ConfigScreen.jsx'
import Quiz from './components/Quiz.jsx'
import Result from './components/Result.jsx'
import ReviewErrors from './components/ReviewErrors.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import Loading from './components/Loading.jsx'

export default function App() {
  const [screen, setScreen] = useState('home') // home | config | loading | quiz | result | review
  const [settings, setSettings] = useState(store.getSettings())
  const [showSettings, setShowSettings] = useState(false)
  const [sim, setSim] = useState(null) // { mode, questions, answers, index, startedAt }
  const [result, setResult] = useState(null)
  const [loadInfo, setLoadInfo] = useState({ label: '', done: 0, total: 0 })
  const [resumeAvailable, setResumeAvailable] = useState(false)

  // Applica il tema.
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  // Controlla se c'è una simulazione da riprendere.
  useEffect(() => {
    const p = store.getProgress()
    setResumeAvailable(!!(p && p.questions && p.index < p.questions.length))
  }, [])

  const updateSettings = (patch) => setSettings(store.saveSettings(patch))

  // Costruisce l'elenco domande (statico o via LLM in modalità ibrida).
  const assemble = useCallback(
    async (distribution, mode) => {
      const seenIds = store.getSeenIds()
      const useLLM = settings.llmEnabled && settings.llmApiKey
      if (!useLLM) {
        return mode === 'review'
          ? buildReviewSimulation(distribution.weakTopics, distribution.total, { seenIds })
          : buildSimulation(distribution, { seenIds })
      }
      // Modalità ibrida: genera per sezione con l'LLM, fallback alla banca statica.
      const perSection =
        mode === 'review'
          ? reviewDistributionToCounts(distribution)
          : distribution
      const sectionIds = SECTIONS.map((s) => s.id).filter((id) => (perSection[id] || 0) > 0)
      const total = sectionIds.reduce((a, id) => a + perSection[id], 0)
      setLoadInfo({ label: 'Preparazione…', done: 0, total })
      let done = 0
      const collected = []
      for (const id of sectionIds) {
        const count = perSection[id]
        setLoadInfo({ label: `Genero: ${SECTION_BY_ID[id].name}`, done, total })
        try {
          const qs = await generateForSection(id, count, settings)
          if (qs.length >= count) {
            collected.push(...qs.slice(0, count))
          } else {
            // completa con la banca statica
            const fill = buildSimulation({ [id]: count - qs.length }, { seenIds })
            collected.push(...qs, ...fill)
          }
        } catch (e) {
          console.warn('LLM fallita per', id, e)
          collected.push(...buildSimulation({ [id]: count }, { seenIds }))
        }
        done += count
        setLoadInfo({ label: SECTION_BY_ID[id].name, done, total })
      }
      collected.sort(
        (a, b) => (SECTION_ORDER[a.section] ?? 999) - (SECTION_ORDER[b.section] ?? 999)
      )
      return collected
    },
    [settings]
  )

  const startSimulation = useCallback(
    async (distribution, mode) => {
      setScreen('loading')
      const questions = await assemble(distribution, mode)
      if (!questions.length) {
        alert('Nessuna domanda disponibile per questa configurazione.')
        setScreen('home')
        return
      }
      const newSim = {
        mode,
        questions,
        answers: new Array(questions.length).fill(null),
        index: 0,
        startedAt: Date.now()
      }
      setSim(newSim)
      store.saveProgress(newSim)
      setScreen('quiz')
    },
    [assemble]
  )

  const onStartFull = () => startSimulation(standardDistribution(), 'full')

  const onStartCustom = (distribution) => startSimulation(distribution, 'custom')

  const onStartReview = () => {
    const weak = store.getWeakTopics()
    if (!weak.length) {
      alert('Non ci sono ancora errori da ripassare. Completa prima una simulazione.')
      return
    }
    const total = Math.min(15, Math.max(5, weak.length))
    startSimulation({ weakTopics: weak, total }, 'review')
  }

  const onResume = () => {
    const p = store.getProgress()
    if (p) {
      setSim(p)
      setScreen('quiz')
    }
  }

  // Salva la risposta e il progresso.
  const onAnswer = (index, choice) => {
    setSim((prev) => {
      const answers = [...prev.answers]
      answers[index] = choice
      const next = { ...prev, answers }
      store.saveProgress(next)
      return next
    })
  }

  const onNext = () => {
    setSim((prev) => {
      const next = { ...prev, index: prev.index + 1 }
      store.saveProgress(next)
      return next
    })
  }

  const onFinish = () => {
    const elapsed = Date.now() - sim.startedAt
    const graded = grade(sim.questions, sim.answers)
    store.recordAttempt(sim.questions, sim.answers)
    store.addSeenIds(sim.questions.map((q) => q.id).filter((id) => !String(id).includes('_ai_')))
    store.addHistory({
      date: new Date().toISOString(),
      mode: sim.mode,
      correct: graded.correct,
      total: graded.total,
      pct: graded.pct,
      elapsedMs: elapsed
    })
    store.clearProgress()
    setResult({ ...graded, elapsedMs: elapsed, questions: sim.questions, answers: sim.answers, mode: sim.mode })
    setResumeAvailable(false)
    setScreen('result')
  }

  const onQuit = () => {
    if (confirm('Vuoi uscire dalla simulazione? Il progresso resta salvato per riprenderla.')) {
      setScreen('home')
      setResumeAvailable(true)
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" onClick={() => setScreen('home')} role="button" tabIndex={0}>
          <span className="brand-mark">AI</span>
          <div className="brand-text">
            <strong>Simulazione — AI Solution Architect</strong>
            <small>Prova scritta ITS · {STANDARD_TOTAL} domande · 90 minuti</small>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-btn"
            title="Cambia tema"
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          >
            {settings.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="icon-btn" title="Impostazioni" onClick={() => setShowSettings(true)}>
            ⚙️
          </button>
        </div>
      </header>

      <main className="content">
        {screen === 'home' && (
          <Home
            resumeAvailable={resumeAvailable}
            onResume={onResume}
            onStartFull={onStartFull}
            onGoCustom={() => setScreen('config')}
            onStartReview={onStartReview}
            llmEnabled={settings.llmEnabled && !!settings.llmApiKey}
          />
        )}

        {screen === 'config' && (
          <ConfigScreen
            onBack={() => setScreen('home')}
            onStart={onStartCustom}
            defaultDistribution={standardDistribution()}
            distributeProportional={distributeProportional}
          />
        )}

        {screen === 'loading' && <Loading info={loadInfo} usingLLM={settings.llmEnabled && !!settings.llmApiKey} />}

        {screen === 'quiz' && sim && (
          <Quiz
            sim={sim}
            onAnswer={onAnswer}
            onNext={onNext}
            onFinish={onFinish}
            onQuit={onQuit}
          />
        )}

        {screen === 'result' && result && (
          <Result
            result={result}
            onReviewErrors={() => setScreen('review')}
            onHome={() => setScreen('home')}
            onRetry={() => (result.mode === 'review' ? onStartReview() : onStartFull())}
          />
        )}

        {screen === 'review' && result && (
          <ReviewErrors result={result} onBack={() => setScreen('result')} />
        )}
      </main>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <footer className="footer">
        <span>
          Struttura, sezioni e distribuzione fedeli alle simulazioni ufficiali. Domande generate
          nuove. Buono studio! 📘
        </span>
      </footer>
    </div>
  )
}

// Converte la distribuzione "review" (weakTopics+total) in conteggi per sezione,
// necessari alla generazione LLM per sezione.
function reviewDistributionToCounts(distribution) {
  const { weakTopics, total } = distribution
  const bySection = {}
  weakTopics.forEach((w) => {
    bySection[w.section] = (bySection[w.section] || 0) + w.wrong
  })
  const entries = Object.entries(bySection)
  const sum = entries.reduce((a, [, v]) => a + v, 0)
  const counts = {}
  let assigned = 0
  entries.forEach(([name, wrong]) => {
    const sec = SECTIONS.find((s) => s.name === name)
    if (!sec) return
    const n = Math.max(1, Math.round((wrong / sum) * total))
    counts[sec.id] = n
    assigned += n
  })
  return counts
}
