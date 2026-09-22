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

## Cose da ricordare

- Le tre variabili (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_COUPLE_EMAIL`) stanno in **Settings → Build → Variables and secrets**,
  non fra quelle del Worker: servono durante la compilazione.
- I testi dell'app sono in prima persona plurale ("noi"), non "voi".
- Le frasi con personalità stanno in `src/lib/copy.ts` e si riscrivono dalle
  Impostazioni; i pulsanti e le etichette dei campi restano fuori di proposito.
- La palette porta anche il colore del testo da scrivere sopra ogni tinta
  (`on`): sul giallo il bianco non si legge.
