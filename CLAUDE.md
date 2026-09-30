# LoviDovi — appunti di progetto

App di coppia (PWA) di Alberto e Alessia. Il resto della documentazione sta in
[README.md](README.md), [SETUP.md](SETUP.md) e [COSTI.md](COSTI.md).

## L'app online

**https://app-ale.alberto-musiani1.workers.dev**

Questo link va messo in fondo a ogni risposta, così è sempre a portata di mano
senza doverlo ripescare.

## Dove vive

| | |
|---|---|
| Codice | GitHub, branch `claude/couple-gamification-app-5p9slb` |
| Pubblicazione | Cloudflare Workers, progetto `app-ale` |
| Dati e foto | Supabase, progetto `App-Ale` (regione West EU) |

## Pubblicare una modifica

1. Push sul branch: Cloudflare compila da solo.
2. Se il build non parte: **Deployments → Retry build**.
3. Se lo schema del database è cambiato, **prima** va rilanciato
   `supabase/schema.sql` dall'SQL Editor di Supabase: le colonne nuove non si
   creano da sole, e l'app dà errore appena prova a scriverci.
4. Sul telefono serve una ricarica forzata (`Ctrl+Shift+R`): il service worker
   tiene in cache la versione precedente.

## Da controllare

- **La bollicina dei modi di dire** (segnalata il 30 settembre 2026, le
  celebrazioni invece funzionano). Nel collaudo compariva regolarmente, quindi
  il sospetto è il telefono: i timer si fermano quando l'app va in secondo
  piano. Ora il conto riparte a ogni ritorno in primo piano, e in Impostazioni
  c'è "Provala adesso" con una riga che dice perché non si vede. Se ancora non
  compare, il pulsante distingue i due casi: se con quello si vede, il problema
  è il timer; se non si vede nemmeno così, è il componente.

## Cose da ricordare

- Le tre variabili (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_COUPLE_EMAIL`) stanno in **Settings → Build → Variables and secrets**,
  non fra quelle del Worker: servono durante la compilazione.
- I testi dell'app sono in prima persona plurale ("noi"), non "voi".
- Le frasi con personalità stanno in `src/lib/copy.ts` e si riscrivono dalle
  Impostazioni; i pulsanti e le etichette dei campi restano fuori di proposito.
- La palette porta anche il colore del testo da scrivere sopra ogni tinta
  (`on`): sul giallo il bianco non si legge.
- La persona scelta in **Impostazioni → Noi due → Questa app è un regalo per**
  è quella che riceve la presentazione di benvenuto (la prima volta su quel
  telefono) e che vede le impostazioni ridotte: solo chi usa il telefono, modi
  di dire, frasi, foto, richieste di modifica e stato dei dati. All'altro
  restano tutti i comandi. La scelta sta in `settings.texts` (mappa già
  condivisa fra i due telefoni) e il segno di "già vista" in localStorage:
  nessuna delle due cose richiede una colonna nuova, quindi nessuna migrazione.
