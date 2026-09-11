export default function Loading({ info, usingLLM }) {
  const pct = info.total ? Math.round((info.done / info.total) * 100) : 0
  return (
    <div className="loading">
      <div className="spinner" />
      <h3>{usingLLM ? 'Generazione domande con AI…' : 'Preparazione simulazione…'}</h3>
      {usingLLM && (
        <>
          <p className="loading-label">{info.label}</p>
          <div className="progressbar loading-bar">
            <div className="progressbar-fill" style={{ width: pct + '%' }} />
          </div>
          <p className="loading-sub">
            {info.done} / {info.total} domande — può richiedere qualche istante.
          </p>
        </>
      )}
    </div>
  )
}
