const LETTERS = ['A', 'B', 'C', 'D']

export default function ReviewErrors({ result, onBack }) {
  const { questions, answers } = result
  const wrongItems = questions
    .map((q, i) => ({ q, given: answers[i], i }))
    .filter(({ q, given }) => given !== q.correctAnswer)

  return (
    <div className="review">
      <div className="review-head">
        <button className="btn btn-ghost" onClick={onBack}>
          ← Torna al risultato
        </button>
        <h2>Rivedi gli errori ({wrongItems.length})</h2>
      </div>

      {wrongItems.length === 0 && (
        <p className="review-empty">Nessun errore in questa simulazione. Complimenti! 🎉</p>
      )}

      <ol className="review-list">
        {wrongItems.map(({ q, given, i }) => (
          <li key={i} className="review-card">
            <div className="review-card-top">
              <span className="pill pill-section">{q.section}</span>
              <span className="pill pill-topic">{q.topic}</span>
            </div>
            <h3 className="review-question">{q.question}</h3>
            {q.code && <pre className="code-block">{q.code}</pre>}

            <ul className="review-options">
              {q.options.map((opt, oi) => {
                let cls = 'review-option'
                if (oi === q.correctAnswer) cls += ' review-option-correct'
                else if (oi === given) cls += ' review-option-wrong'
                return (
                  <li key={oi} className={cls}>
                    <span className="option-letter">{LETTERS[oi]}</span>
                    <span>{opt}</span>
                    {oi === q.correctAnswer && <span className="review-tag">corretta</span>}
                    {oi === given && oi !== q.correctAnswer && (
                      <span className="review-tag review-tag-bad">tua risposta</span>
                    )}
                  </li>
                )
              })}
              {given == null && (
                <li className="review-option review-option-wrong">
                  <span className="option-letter">—</span>
                  <span>Nessuna risposta data</span>
                </li>
              )}
            </ul>

            <div className="review-explanation">
              <span className="feedback-explanation-label">Spiegazione</span>
              {q.explanation}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
