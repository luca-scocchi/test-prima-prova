// =====================================================================
//  STRUTTURA UFFICIALE DELL'ESAME — AI SOLUTION ARCHITECT (ITS)
// ---------------------------------------------------------------------
//  Fonte VINCOLANTE: le 3 simulazioni ufficiali (file A / B / C).
//  - 19 sezioni, in QUESTO ordine esatto (non mescolare, non accorpare).
//  - `examCount` = numero di domande della sezione nella prova standard
//    da 30 domande (distribuzione identica nei 3 file ufficiali).
//  - Le domande dell'esame usano 3 opzioni (A/B/C): manteniamo lo stile.
//  NON sostituire questi nomi con categorie tipo "Python", "Cloud", "AI".
// =====================================================================

export const SECTIONS = [
  {
    id: 'technical_english',
    name: 'Technical English',
    examCount: 5,
    difficulty: 'easy',
    review:
      'Ripassa la terminologia AI/ML di base in inglese (model, inference, regression, accuracy, parameter, deployment, scalability, latency). Sono definizioni brevi: memorizza il significato di ogni termine chiave.'
  },
  {
    id: 'sicurezza_prevenzione',
    name: 'Sicurezza e prevenzione',
    examCount: 1,
    difficulty: 'easy',
    review:
      'Ripassa i concetti del D.Lgs. 81/2008: definizione di rischio e pericolo, figure della sicurezza (datore di lavoro, RSPP, RLS, medico competente, preposto) e obblighi come il DVR.'
  },
  {
    id: 'matematica_algebra_lineare',
    name: 'Matematica e Algebra Lineare',
    examCount: 1,
    difficulty: 'hard',
    review:
      'Ripassa il calcolo matriciale: prodotto tra matrici, determinante, matrice inversa e aggiunta (adjugate), matrice identità e trasposta. Esercitati a svolgere i calcoli a mano su matrici 2x2.'
  },
  {
    id: 'probabilita_statistica',
    name: 'Probabilità e statistica, Modelli statistici',
    examCount: 1,
    difficulty: 'hard',
    review:
      'Ripassa media/mediana/moda/quartili, il teorema di Bayes (probabilità a priori e a posteriori), studio di funzione (punti critici, massimi e minimi) e distribuzioni di probabilità di base.'
  },
  {
    id: 'fondamenti_programmazione',
    name: 'Fondamenti di programmazione',
    examCount: 2,
    difficulty: 'medium',
    review:
      'Ripassa i fondamenti (Python/pseudocodice): tipi di dato e mutabilità (liste, dizionari), slicing, list comprehension, funzioni vs procedure, ricorsione, complessità algoritmica (O grande) e concetti OOP come il polimorfismo.'
  },
  {
    id: 'database_sql_nosql',
    name: 'Database SQL e NoSQL',
    examCount: 2,
    difficulty: 'medium',
    review:
      'Ripassa SQL (SELECT, INSERT, UPDATE, DELETE, JOIN), chiavi primarie ed esterne, normalizzazione, e le differenze con i database NoSQL (documenti in MongoDB, dati non strutturati, scalabilità).'
  },
  {
    id: 'web_frontend',
    name: 'Applicazioni WEB – frontend',
    examCount: 1,
    difficulty: 'medium',
    review:
      'Ripassa HTML (struttura, <!DOCTYPE html>, tag semantici) e CSS (selettori di tag/classe/id, specificità, box model). Ricorda la differenza tra selettore di classe (.) e di id (#).'
  },
  {
    id: 'backend',
    name: 'Applicazioni Backend',
    examCount: 1,
    difficulty: 'easy',
    review:
      'Ripassa il ruolo del backend (logica applicativa e dati), i framework come Flask (app.run(), routing), l\'interazione con il database e la separazione tra frontend e backend.'
  },
  {
    id: 'devops_container',
    name: 'Introduzione a Devops e Container',
    examCount: 1,
    difficulty: 'easy',
    review:
      'Ripassa Git (add, commit, push, pull), i container Docker (ambienti isolati e riproducibili, immagini) e le pipeline CI/CD (build, test, deploy).'
  },
  {
    id: 'lab_applicazioni_smart',
    name: 'Laboratorio di applicazioni smart',
    examCount: 1,
    difficulty: 'medium',
    review:
      'Ripassa le API REST (metodi HTTP GET/POST/PUT/DELETE, idempotenza, codici di stato 2xx/4xx/5xx) e i parametri degli LLM come la temperatura.'
  },
  {
    id: 'introduzione_ai',
    name: "Introduzione all'AI",
    examCount: 2,
    difficulty: 'easy',
    review:
      'Ripassa le definizioni fondamentali: cos\'è l\'AI, differenza tra Machine Learning e programmazione tradizionale, apprendimento supervisionato/non supervisionato, reti neurali, LLM e overfitting.'
  },
  {
    id: 'machine_learning',
    name: 'Machine Learning',
    examCount: 2,
    difficulty: 'medium',
    review:
      'Ripassa gli algoritmi: clustering (k-means, gerarchico), PCA, SOM, regole associative (lift, support, confidence), training/validation/test set e la regolarizzazione.'
  },
  {
    id: 'deep_learning',
    name: 'Deep learning e reti neurali',
    examCount: 2,
    difficulty: 'medium',
    review:
      'Ripassa le reti neurali: funzioni di attivazione (non linearità), pesi e bias, epoca, backpropagation, dropout, overfitting, CNN (convoluzione, pooling).'
  },
  {
    id: 'ai_generativa_base',
    name: 'AI Generativa base',
    examCount: 1,
    difficulty: 'medium',
    review:
      'Ripassa i concetti base dell\'AI generativa: architettura Transformer, allucinazioni, GPTs personalizzati, prompt, token.'
  },
  {
    id: 'ai_generativa',
    name: 'Ai Generativa',
    examCount: 2,
    difficulty: 'medium',
    review:
      'Ripassa il self-attention nei Transformer, le tecniche di prompting (Chain-of-Thought, zero-shot, role prompting), il knowledge cutoff, gli agenti AI (ragionamento strategico) e Teachable Machine.'
  },
  {
    id: 'cognitive_computing',
    name: 'Cognitive computing',
    examCount: 2,
    difficulty: 'medium',
    review:
      'Ripassa la definizione di cognitive computing e le sue fasi (percezione, rappresentazione, attenzione, decisione...), l\'image processing (filtri, kernel/matrice di convoluzione) e il modello di colore RGB additivo.'
  },
  {
    id: 'cloud_ai_1',
    name: "Piattaforme CLOUD per l'Ai – Parte 1",
    examCount: 1,
    difficulty: 'medium',
    review:
      'Ripassa i servizi AI di Azure: Cognitive/Language Services (analisi del sentiment, LUIS, traduzione, OCR), Azure Machine Learning Studio e i servizi cloud gestiti.'
  },
  {
    id: 'cloud_ai_2',
    name: "Piattaforme CLOUD per l'Ai – Parte 2",
    examCount: 1,
    difficulty: 'medium',
    review:
      'Ripassa il Well-Architected Framework di Azure (affidabilità, sicurezza, ottimizzazione costi, eccellenza operativa, efficienza prestazionale), Azure OpenAI Service e i pattern architetturali (containerizzazione, RAG).'
  },
  {
    id: 'laboratorio_rag',
    name: 'Laboratorio RAG',
    examCount: 1,
    difficulty: 'medium',
    review:
      'Ripassa RAG (Retrieval Augmented Generation): embedding e spazio vettoriale, cosine similarity, vector database, chunking e metadata dei chunk.'
  }
]

// Somma delle domande nella simulazione standard = 30 (verificato dai file).
export const STANDARD_TOTAL = SECTIONS.reduce((s, sec) => s + sec.examCount, 0)

export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map((s) => [s.id, s]))
export const SECTION_BY_NAME = Object.fromEntries(SECTIONS.map((s) => [s.name, s]))

// Ordine ufficiale (indice) per ogni nome di sezione — usato per non mescolare le sezioni.
export const SECTION_ORDER = Object.fromEntries(SECTIONS.map((s, i) => [s.name, i]))
