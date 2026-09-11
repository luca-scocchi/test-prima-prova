import { STANDARD_TOTAL, SECTIONS } from '../data/sections.js'
import { getHistory, getWeakTopics } from '../lib/storage.js'
import { bankStats } from '../lib/quiz.js'

export default function Home({
  resumeAvailable,
  onResume,
  onStartFull,
  onGoCustom,
  onStartReview,
  llmEnabled
}) {
  const history = getHistory()
  const weak = getWeakTopics()
  const stats = bankStats()
  const bankTotal = stats.reduce((a, s) => a + s.available, 0)
  const best = history.length ? Math.max(...history.map((h) => h.pct)) : null
  const last = history[0]

  return (
    <div className="home">
      <section className="hero">
        <h1>Preparati alla prova scritta</h1>
        <p className="hero-sub">
          Simulazione fedele dell'esame <strong>AI Solution Architect</strong>: {SECTIONS.length}{' '}
          sezioni ufficiali, distribuzione e difficoltà identiche all'esame, ma con{' '}
          <strong>domande sempre nuove</strong>.
        </p>
        {llmEnabled && (
          <div className="badge-ai">✨ Modalità AI attiva — domande generate al volo</div>
        )}
      </section>

      {resumeAvailable && (
        <div className="resume-banner">
          <span>Hai una simulazione in corso.</span>
          <button className="btn btn-primary" onClick={onResume}>
            Riprendi ▶
          </button>
        </div>
      )}

      <section className="mode-grid">
        <button className="mode-card mode-card-primary" onClick={onStartFull}>
          <div className="mode-icon">📝</div>
          <h3>Simulazione completa</h3>
          <p>{STANDARD_TOTAL} domande con la distribuzione ufficiale dell'esame, in 90 minuti.</p>
          <span className="mode-cta">Inizia ora →</span>
        </button>

        <button className="mode-card" onClick={onGoCustom}>
          <div className="mode-icon">🎛️</div>
          <h3>Simulazione personalizzata</h3>
          <p>Scegli quante domande fare e quante per ogni sezione.</p>
          <span className="mode-cta">Configura →</span>
        </button>

        <button
          className={'mode-card' + (weak.length ? '' : ' mode-card-disabled')}
          onClick={onStartReview}
        >
          <div className="mode-icon">🔁</div>
          <h3>Ripasso errori</h3>
          <p>
            {weak.length
              ? 'Nuove domande sugli argomenti in cui hai sbagliato di più.'
              : 'Completa una simulazione per sbloccare il ripasso mirato.'}
          </p>
          <span className="mode-cta">{weak.length ? 'Ripassa →' : 'Bloccato'}</span>
        </button>
      </section>

      <section className="stats-row">
        <div className="stat-tile">
          <span className="stat-num">{bankTotal}</span>
          <span className="stat-label">domande nella banca</span>
        </div>
        <div className="stat-tile">
          <span className="stat-num">{history.length}</span>
          <span className="stat-label">simulazioni svolte</span>
        </div>
        <div className="stat-tile">
          <span className="stat-num">{best != null ? best + '%' : '—'}</span>
          <span className="stat-label">miglior risultato</span>
        </div>
        <div className="stat-tile">
          <span className="stat-num">{last ? last.pct + '%' : '—'}</span>
          <span className="stat-label">ultimo risultato</span>
        </div>
      </section>

      <section className="sections-preview">
        <h4>Le {SECTIONS.length} sezioni dell'esame</h4>
        <ol className="sections-list">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <span className="sec-name">{s.name}</span>
              <span className="sec-count">{s.examCount}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
