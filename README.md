# Simulatore prova scritta — ITS "AI Solution Architect"

Web app per esercitarsi sulla **prima prova scritta** del percorso ITS *AI Solution Architect*.
Struttura, sezioni, distribuzione e difficoltà sono **fedeli alle simulazioni ufficiali**, ma le
domande sono **completamente nuove** (le domande dei file ufficiali non vengono mai riproposte).

## Come avviarlo

Serve [Node.js](https://nodejs.org) (versione 18 o superiore).

```bash
cd simulatore-esame
npm install
npm run dev
```

Poi apri il link che compare nel terminale (di solito `http://localhost:5173`).

Per creare la versione ottimizzata da distribuire:

```bash
npm run build      # genera la cartella dist/
npm run preview    # anteprima della build
```

## Cosa fa

- **Simulazione completa** — 30 domande con la distribuzione ufficiale dell'esame (90 minuti).
- **Simulazione personalizzata** — scegli il numero totale di domande e quante per ogni sezione
  (pulsanti + / −). La proporzione delle sezioni viene mantenuta automaticamente.
- **Ripasso errori** — genera nuove domande sugli argomenti in cui hai sbagliato di più.
- **Una domanda alla volta**, con valutazione immediata, risposta corretta e mini-spiegazione
  (per matematica/statistica/codice la spiegazione mostra i passaggi).
- **Risultato finale** con punteggio, tempo, statistiche per sezione, analisi dei punti deboli e
  revisione di tutti gli errori.
- **Tema chiaro/scuro**, responsive su PC, tablet e smartphone.
- **Salvataggio locale** (localStorage): risultati, statistiche, domande già viste e progresso.

## Le 19 sezioni (ordine ufficiale)

1. Technical English · 2. Sicurezza e prevenzione · 3. Matematica e Algebra Lineare ·
4. Probabilità e statistica, Modelli statistici · 5. Fondamenti di programmazione ·
6. Database SQL e NoSQL · 7. Applicazioni WEB – frontend · 8. Applicazioni Backend ·
9. Introduzione a Devops e Container · 10. Laboratorio di applicazioni smart ·
11. Introduzione all'AI · 12. Machine Learning · 13. Deep learning e reti neurali ·
14. AI Generativa base · 15. Ai Generativa · 16. Cognitive computing ·
17. Piattaforme CLOUD per l'Ai – Parte 1 · 18. Piattaforme CLOUD per l'Ai – Parte 2 ·
19. Laboratorio RAG

Distribuzione standard (30 domande): Technical English 5, le altre 1 o 2 domande a sezione —
identica ai file ufficiali.

## Domande sempre nuove (modalità AI opzionale)

Di default l'app usa una **banca di domande verificata** inclusa nel progetto
(`src/data/questions.json`): funziona offline, senza costi e senza configurazione.

In alternativa puoi attivare la **generazione con AI** da *Impostazioni → Domande generate con AI*:
inserendo una tua API key (Anthropic o OpenAI), a ogni simulazione le domande vengono generate al
volo. La chiave resta salvata **solo sul tuo dispositivo** (localStorage) e la richiesta parte
direttamente dal browser; in caso di errore l'app torna automaticamente alla banca statica.

## Struttura del progetto

```
src/
  data/
    sections.js       # le 19 sezioni ufficiali, ordine e distribuzione (fonte vincolante)
    questions.json    # la banca di domande (una struttura dati separata dai componenti)
  lib/
    quiz.js           # distribuzione, assemblaggio, anti-duplicazione, valutazione
    storage.js        # persistenza su localStorage
    llm.js            # generazione opzionale con LLM (modalità ibrida)
  components/         # schermate React (Home, Config, Quiz, Result, ReviewErrors, Settings…)
  App.jsx            # orchestrazione delle schermate
  styles.css         # tema chiaro/scuro, responsive
```

Ogni domanda ha questa forma:

```json
{
  "id": "fondamenti_programmazione_003",
  "section": "Fondamenti di programmazione",
  "topic": "Complessità algoritmica",
  "difficulty": "medium",
  "question": "...",
  "options": ["...", "...", "..."],
  "correctAnswer": 1,
  "explanation": "..."
}
```

Il campo `section` usa **esattamente** il nome ufficiale della sezione.
