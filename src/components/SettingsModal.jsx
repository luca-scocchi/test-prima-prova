import { useState } from 'react'
import { testConnection } from '../lib/llm.js'
import { resetSeenIds, clearHistory, clearErrorLog, resetAll } from '../lib/storage.js'

export default function SettingsModal({ settings, onChange, onClose }) {
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState(null)

  const doTest = async () => {
    setTesting(true)
    setTestMsg(null)
    try {
      await testConnection(settings)
      setTestMsg({ ok: true, text: 'Connessione riuscita ✓' })
    } catch (e) {
      setTestMsg({ ok: false, text: 'Errore: ' + (e.message || 'connessione fallita') })
    } finally {
      setTesting(false)
    }
  }

  const modelPlaceholder =
    settings.llmProvider === 'openai' ? 'gpt-4o-mini (default)' : 'claude-sonnet-5 (default)'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Impostazioni</h2>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <section className="settings-section">
            <h4>Aspetto</h4>
            <div className="setting-row">
              <label>Tema</label>
              <div className="segmented">
                <button
                  className={settings.theme === 'light' ? 'seg-active' : ''}
                  onClick={() => onChange({ theme: 'light' })}
                >
                  ☀️ Chiaro
                </button>
                <button
                  className={settings.theme === 'dark' ? 'seg-active' : ''}
                  onClick={() => onChange({ theme: 'dark' })}
                >
                  🌙 Scuro
                </button>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h4>Domande generate con AI (opzionale)</h4>
            <p className="settings-note">
              Di default l'app usa la banca di domande verificata (offline, gratis). Attivando l'AI,
              a ogni simulazione vengono generate domande <strong>sempre nuove</strong>. Serve una
              tua API key: resta salvata <strong>solo su questo dispositivo</strong> (localStorage) e
              la richiesta parte dal browser.
            </p>

            <div className="setting-row">
              <label>Genera con AI</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.llmEnabled}
                  onChange={(e) => onChange({ llmEnabled: e.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            {settings.llmEnabled && (
              <>
                <div className="setting-row">
                  <label>Provider</label>
                  <div className="segmented">
                    <button
                      className={settings.llmProvider === 'anthropic' ? 'seg-active' : ''}
                      onClick={() => onChange({ llmProvider: 'anthropic' })}
                    >
                      Anthropic (Claude)
                    </button>
                    <button
                      className={settings.llmProvider === 'openai' ? 'seg-active' : ''}
                      onClick={() => onChange({ llmProvider: 'openai' })}
                    >
                      OpenAI
                    </button>
                  </div>
                </div>

                <div className="setting-col">
                  <label>Modello</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder={modelPlaceholder}
                    value={settings.llmModel}
                    onChange={(e) => onChange({ llmModel: e.target.value })}
                  />
                </div>

                <div className="setting-col">
                  <label>API key</label>
                  <input
                    type="password"
                    className="text-input"
                    placeholder={settings.llmProvider === 'openai' ? 'sk-…' : 'sk-ant-…'}
                    value={settings.llmApiKey}
                    onChange={(e) => onChange({ llmApiKey: e.target.value })}
                  />
                </div>

                <div className="setting-row">
                  <button className="btn btn-secondary btn-sm" onClick={doTest} disabled={testing || !settings.llmApiKey}>
                    {testing ? 'Verifico…' : 'Verifica connessione'}
                  </button>
                  {testMsg && (
                    <span className={testMsg.ok ? 'test-ok' : 'test-ko'}>{testMsg.text}</span>
                  )}
                </div>
              </>
            )}
          </section>

          <section className="settings-section">
            <h4>Dati e statistiche</h4>
            <p className="settings-note">
              I risultati, gli errori e le domande già viste sono salvati sul tuo dispositivo.
            </p>
            <div className="danger-row">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  resetSeenIds()
                  alert('Storico domande viste azzerato: potranno ricomparire nelle simulazioni.')
                }}
              >
                Azzera domande viste
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (confirm('Cancellare storico risultati e log errori?')) {
                    clearHistory()
                    clearErrorLog()
                    alert('Statistiche cancellate.')
                  }
                }}
              >
                Cancella statistiche
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (confirm('Ripristinare TUTTO ai valori iniziali? Verranno cancellati risultati, errori, impostazioni e progresso.')) {
                    resetAll()
                    location.reload()
                  }
                }}
              >
                Reset completo
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
