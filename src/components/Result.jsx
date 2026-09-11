import { SECTION_BY_NAME } from '../data/sections.js'

function fmtDuration(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m} min ${r} s` : `${r} s`
}

function ring(pct) {
  const r = 52
  const c = 2 * Math.PI * r
  const off = c * (1 - pct / 100)
  const color = pct >= 70 ? 'var(--ok)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)'
  return (
    <svg className="score-ring" viewBox="0 0 120 120" width="140" height="140">
      <circle cx="60" cy="60" r={r} className="ring-bg" />
      <circle
        cx="60"
        cy="60"
        r={r}
        className="ring-fg"
        style={{ strokeDasharray: c, strokeDashoffset: off, stroke: color }}
      />
      <text x="60" y="56" className="ring-pct">
        {pct}%
      </text>
      <text x="60" y="78" className="ring-sub">
        risultato
      </text>
    </svg>
  )
}

export default function Result({ result, onReviewErrors, onHome, onRetry }) {
  const { correct, total, pct, elapsedMs, sections } = result
  const wrong = total - correct

  // Punti deboli: sezioni sotto il 70%, ordinate dalla peggiore.
  const weak = sections
    .filter((s) => s.pct < 70)
    .sort((a, b) => a.pct - b.pct)

  const dot = (p) => (p < 50 ? '🔴' : p < 70 ? '🟠' : '🟢')

  return (
    <div className="result">
      <section className="result-hero">
        {ring(pct)}
        <div className="result-hero-info">
          <h2>Risultato</h2>
          <div className="result-score">
            {correct} / {total}
          </div>
          <div className="result-meta">
            <span className="tag tag-ok">✓ {correct} corrette</span>
            <span className="tag tag-bad">✗ {wrong} errate</span>
            <span className="tag">⏱ {fmtDuration(elapsedMs)}</span>
          </div>
        </div>
      </section>

      <div className="result-actions">
        {wrong > 0 && (
          <button className="btn btn-primary" onClick={onReviewErrors}>
            Rivedi gli errori ({wrong})
          </button>
        )}
        <button className="btn btn-secondary" onClick={onRetry}>
          Nuova simulazione
        </button>
        <button className="btn btn-ghost" onClick={onHome}>
          Torna alla home
        </button>
      </div>

      <section className="panel">
        <h3>Risultato per sezione</h3>
        <ul className="section-scores">
          {sections.map((s) => (
            <li key={s.section} className="section-score-row">
              <span className="section-score-name">{s.section}</span>
              <div className="section-score-bar">
                <div
                  className="section-score-fill"
                  style={{
                    width: s.pct + '%',
                    background:
                      s.pct >= 70 ? 'var(--ok)' : s.pct >= 50 ? 'var(--warn)' : 'var(--bad)'
                  }}
                />
              </div>
              <span className="section-score-val">
                {s.correct}/{s.total} · {s.pct}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      {weak.length > 0 ? (
        <section className="panel weak-panel">
          <h3>I tuoi punti deboli</h3>
          <p className="weak-intro">Ecco cosa conviene ripassare, dalla priorità più alta:</p>
          <ul className="weak-list">
            {weak.map((s) => {
              const meta = SECTION_BY_NAME[s.section]
              return (
                <li key={s.section} className="weak-item">
                  <div className="weak-head">
                    <span className="weak-dot">{dot(s.pct)}</span>
                    <span className="weak-name">{s.section}</span>
                    <span className="weak-pct">{s.pct}%</span>
                  </div>
                  {meta && <p className="weak-review">{meta.review}</p>}
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <section className="panel weak-panel">
          <h3>Ottimo lavoro! 🎉</h3>
          <p className="weak-intro">
            Nessuna sezione sotto il 70%. Continua ad allenarti per consolidare i risultati.
          </p>
        </section>
      )}
    </div>
  )
}
