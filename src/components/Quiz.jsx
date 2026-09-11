import { useEffect, useMemo, useState } from 'react'

const LETTERS = ['A', 'B', 'C', 'D']

function fmtTime(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function Quiz({ sim, onAnswer, onNext, onFinish, onQuit }) {
  const { questions, answers, index, startedAt } = sim
  const q = questions[index]
  const isLast = index === questions.length - 1

  const [selected, setSelected] = useState(answers[index])
  const [confirmed, setConfirmed] = useState(answers[index] != null)
  const [now, setNow] = useState(Date.now())

  // Tempo assegnato proporzionale: 3 minuti a domanda (come 90'/30).
  const allotted = questions.length * 3 * 60 * 1000
  const remaining = allotted - (now - startedAt)

  useEffect(() => {
    setSelected(answers[index])
    setConfirmed(answers[index] != null)
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const confirm = () => {
    if (selected == null) return
    onAnswer(index, selected)
    setConfirmed(true)
  }

  const next = () => {
    if (isLast) onFinish()
    else onNext()
  }

  const correct = confirmed && selected === q.correctAnswer
  const progressPct = useMemo(
    () => Math.round(((index + (confirmed ? 1 : 0)) / questions.length) * 100),
    [index, confirmed, questions.length]
  )

  return (
    <div className="quiz">
      <div className="quiz-topline">
        <span className="pill pill-section">{q.section}</span>
        <div className="quiz-topline-right">
          <span className={'timer' + (remaining < 60000 ? ' timer-danger' : '')}>
            ⏱ {fmtTime(remaining)}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onQuit}>
            Esci
          </button>
        </div>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-label">
          Domanda <strong>{index + 1}</strong> / {questions.length}
        </div>
        <div className="progressbar">
          <div className="progressbar-fill" style={{ width: progressPct + '%' }} />
        </div>
      </div>

      <div className="question-card">
        <h2 className="question-text">{q.question}</h2>
        {q.code && <pre className="code-block">{q.code}</pre>}

        <div className="options">
          {q.options.map((opt, i) => {
            const isSel = selected === i
            const isCorrect = i === q.correctAnswer
            let cls = 'option'
            if (confirmed) {
              if (isCorrect) cls += ' option-correct'
              else if (isSel) cls += ' option-wrong'
              else cls += ' option-dim'
            } else if (isSel) {
              cls += ' option-selected'
            }
            return (
              <button
                key={i}
                className={cls}
                disabled={confirmed}
                onClick={() => setSelected(i)}
              >
                <span className="option-letter">{LETTERS[i]}</span>
                <span className="option-body">{opt}</span>
                {confirmed && isCorrect && <span className="option-flag">✓</span>}
                {confirmed && isSel && !isCorrect && <span className="option-flag">✗</span>}
              </button>
            )
          })}
        </div>

        {!confirmed && (
          <button className="btn btn-primary btn-lg btn-block" disabled={selected == null} onClick={confirm}>
            Conferma risposta
          </button>
        )}

        {confirmed && (
          <div className={'feedback ' + (correct ? 'feedback-ok' : 'feedback-ko')}>
            <div className="feedback-head">
              {correct ? '✓ Risposta corretta' : '✗ Risposta errata'}
            </div>
            {!correct && (
              <div className="feedback-correct">
                La risposta corretta è: <strong>{LETTERS[q.correctAnswer]}</strong>
              </div>
            )}
            <div className="feedback-explanation">
              <span className="feedback-explanation-label">Spiegazione</span>
              {q.explanation}
            </div>
            <button className="btn btn-primary btn-lg btn-block" onClick={next}>
              {isLast ? 'Vedi risultato →' : 'Continua →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
