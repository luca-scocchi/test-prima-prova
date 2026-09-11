import { useState } from 'react'
import { SECTIONS } from '../data/sections.js'
import { bankStats } from '../lib/quiz.js'

const PRESETS = [10, 20, 30]

export default function ConfigScreen({ onBack, onStart, defaultDistribution, distributeProportional }) {
  const [dist, setDist] = useState(defaultDistribution)
  const stats = Object.fromEntries(bankStats().map((s) => [s.id, s.available]))

  const total = SECTIONS.reduce((a, s) => a + (dist[s.id] || 0), 0)

  const setCount = (id, value) => {
    const max = stats[id] ?? 0
    const v = Math.max(0, Math.min(max, value))
    setDist((d) => ({ ...d, [id]: v }))
  }

  const applyPreset = (n) => setDist(distributeProportional(n))

  return (
    <div className="config">
      <div className="config-head">
        <button className="btn btn-ghost" onClick={onBack}>
          ← Indietro
        </button>
        <h2>Configura simulazione</h2>
      </div>

      <div className="config-total-card">
        <div className="config-total-num">
          <span>{total}</span>
          <small>domande totali</small>
        </div>
        <div className="preset-row">
          {PRESETS.map((n) => (
            <button
              key={n}
              className={'chip' + (total === n ? ' chip-active' : '')}
              onClick={() => applyPreset(n)}
            >
              {n}
            </button>
          ))}
          <button className="chip" onClick={() => applyPreset(total)} title="Ridistribuisci mantenendo le proporzioni">
            ⚖️ Proporzionale
          </button>
        </div>
      </div>

      <p className="config-hint">
        Le domande vengono distribuite mantenendo il più possibile la proporzione ufficiale
        dell'esame. Puoi regolare ogni sezione con i pulsanti + e −.
      </p>

      <ul className="config-list">
        {SECTIONS.map((s, i) => {
          const val = dist[s.id] || 0
          const max = stats[s.id] ?? 0
          return (
            <li key={s.id} className="config-row">
              <span className="config-order">{i + 1}</span>
              <div className="config-name">
                <span>{s.name}</span>
                <small>
                  esame: {s.examCount} · disponibili: {max}
                </small>
              </div>
              <div className="stepper">
                <button
                  className="step-btn"
                  onClick={() => setCount(s.id, val - 1)}
                  disabled={val <= 0}
                  aria-label={'Diminuisci ' + s.name}
                >
                  −
                </button>
                <input
                  className="step-input"
                  type="number"
                  min="0"
                  max={max}
                  value={val}
                  onChange={(e) => setCount(s.id, parseInt(e.target.value || '0', 10))}
                />
                <button
                  className="step-btn"
                  onClick={() => setCount(s.id, val + 1)}
                  disabled={val >= max}
                  aria-label={'Aumenta ' + s.name}
                >
                  +
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="config-footer">
        <div className="config-footer-total">
          Totale: <strong>{total}</strong> domande
        </div>
        <button
          className="btn btn-primary btn-lg"
          disabled={total === 0}
          onClick={() => onStart(dist)}
        >
          Inizia simulazione ▶
        </button>
      </div>
    </div>
  )
}
