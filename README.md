# Psicologa Etica

Questo progetto fornisce un semplice sito statico con un diario personale.

## Avvio dell'applicazione

1. Installare le dipendenze:
   ```bash
   npm install
   ```
2. Avviare il server:
   ```bash
   node server.js
   ```

Il server ascolterà sulla porta `3000`. Il sito è disponibile all'indirizzo `http://localhost:3000`.


Gli utenti possono registrarsi inserendo la propria email e poi effettuare il login per accedere al calendario personale.

Ogni giorno è rappresentato nel calendario e, se esiste una nota, il giorno viene evidenziato.
Le note possono essere create o modificate solo nella giornata corrente; quelle passate restano visibili ma non modificabili.
Tutti i dati vengono memorizzati nel file `db.json`.
