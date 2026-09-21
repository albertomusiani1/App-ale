# 💗 LoviDovi

Un'app di coppia: il calendario della vostra vita insieme, i viaggi con tappe e
foto, i posti dove avete mangiato, le uscite, i film, i traguardi da sbloccare e
i vostri modi di dire che ogni tanto riaffiorano da soli sullo schermo.

È una **PWA**: si apre da un link e si installa sulla home del telefono come
un'app vera, senza passare dagli store.

> **Per metterla online: [SETUP.md](SETUP.md).** Mezz'ora di copia-incolla,
> niente codice.
>
> **Quanto costa e quanto durano i piani gratuiti: [COSTI.md](COSTI.md).**

---

## Cosa c'è dentro

### 📅 Il calendario
La schermata principale. Ogni giorno mostra dei puntini colorati, uno per
categoria, così capisci a colpo d'occhio cosa c'è senza aprire niente. Puoi
scrivere impegni a mano, e **tutto quello che ha una data finisce qui da solo**:
un viaggio dal 12 al 23 luglio occupa quei giorni senza che tu debba ricopiarlo.

In cima, il contatore di quanto state insieme e i giorni che mancano al prossimo
anniversario.

### ✈️ Viaggi
Quelli fatti e quelli che vorreste fare. Ogni viaggio ha:
- meta, date, note e idee per quando lo organizzerete;
- **tappe**: per ognuna scegli quanti giorni ci state, e l'app crea da sola una
  scheda per ogni giornata da riempire;
- una **mappa** con le tappe numerate e collegate, e i chilometri fra la prima
  e l'ultima;
- foto caricate dal telefono, per il viaggio, per ogni tappa e anche per la
  singola giornata;
- una foto di copertina a scelta.

### 🗺️ Mappe, e import da Wanderlog
Ogni posto può avere una posizione: la cerchi per nome o la scegli toccando la
mappa. Da lì:
- **mappa del viaggio**, con le tappe in ordine;
- **mappa-mondo** (`🌍 La nostra mappa`) con tutto quello che avete segnato,
  filtrabile per categoria e per fatti / da fare;
- **vista a mappa** anche nelle liste, per vedere cosa c'è vicino.

Se usate già **Wanderlog**, non si ricomincia da capo: esportate il viaggio in
**KML, KMZ, GPX o CSV** e lo caricate nell'app. In una categoria viaggi diventa
un viaggio con le sue tappe; altrove diventa una scheda per ogni posto.
Funziona anche con gli export di Google My Maps, che usano gli stessi formati.

### 💬 Le vostre parole
Il nome dell'app e una quarantina di frasi — le celebrazioni, i messaggi delle
liste vuote, i titoli — si riscrivono dalle Impostazioni, senza toccare il
codice e senza ripubblicare niente. Svuoti un campo e torna com'era.

### 🍝 Ristoranti & Bar
Posti provati e posti da provare, con il tipo di locale, l'indirizzo, le note
(cosa prendere, quanto si spende) e **due voti a cuori separati**, uno per
ciascuno.

### 🎡 Uscite & Avventure
Mirabilandia, concerti, mostre, gite. Da fare e fatte, con foto e voti.

### 🎬 Cinema & Serie
La watchlist condivisa: da vedere e visti, film o serie, con i voti di entrambi.

### 🏆 Achievement
25 traguardi di partenza. Alcuni **si sbloccano da soli** contando i vostri dati
(anniversari da 1 a 10 anni, primo viaggio, 10 posti provati, 20 tappe
percorse...), altri li spuntate voi quando succedono. E potete inventarne di
nuovi.

Quando ne scatta uno arriva il pop-up con coriandoli, una frase a sorpresa e una
foto dalla vostra galleria.

### ➕ Categorie vostre
Il pulsante al centro della barra crea categorie nuove: concerti, regali,
ricette, quello che vi pare. Scegli nome, icona, colore e come deve funzionare
(lista semplice, oppure con tappe come i viaggi, o con i voti come i ristoranti).

### 🗯️ I vostri modi di dire
Nelle impostazioni c'è la sezione dove salvarli, con il significato e chi li
dice. Ogni tanto ricompaiono da soli in fondo allo schermo, così non li
dimenticate. La frequenza si regola (o si spegne).

---

## I colori

Una tinta per categoria, scelte per restare riconoscibili anche nei puntini da
sei pixel del calendario:

| | Categoria | Colore |
|---|---|---|
| 🌸 | Impegni | rosa `#E8638C` |
| ✈️ | Viaggi | blu `#2E7DD1` |
| 🍝 | Ristoranti & Bar | arancio `#E8833A` |
| 🏆 | Achievement | oro `#F0B429` |
| 🎡 | Uscite & Avventure | turchese `#17A398` |
| 🎬 | Cinema & Serie | viola `#8B5CF6` |
| ❤️ | Categorie vostre | rosso `#A6192E` |

---

## Com'è fatta

- **React + TypeScript + Vite**, PWA con service worker.
- **Tailwind CSS** per lo stile, **Framer Motion** per le animazioni.
- **Supabase** per dati, autenticazione e foto — con una modalità locale di
  riserva che permette di usare l'app anche senza cloud configurato.
- **Leaflet** per le mappe, su sfondi CARTO/OpenStreetMap: niente chiavi da
  gestire, e la libreria si scarica solo quando una mappa compare davvero.
- **Nominatim** (OpenStreetMap) per cercare i posti per nome.

```
src/
├── lib/          modello dati, colori, date, calendario, achievement
│   ├── db.ts     il layer di persistenza: cloud Supabase o locale
│   ├── copy.ts   le frasi riscrivibili dalle Impostazioni
│   ├── geo.ts    ricerca dei posti e distanze
│   └── wanderlog.ts  lettura di KML, KMZ, GPX e CSV
├── store/        stato dell'app (AppStore) e accesso (AuthContext)
├── components/   pannelli, form, foto, animazioni, pop-up
└── pages/        calendario, categorie, dettaglio, achievement, impostazioni
supabase/
└── schema.sql    tabelle, regole di sicurezza e storage: da incollare e basta

wrangler.jsonc    come pubblicare su Cloudflare
netlify.toml      come pubblicare su Netlify
```

### Un paio di scelte che vale la pena conoscere

**Un solo modello per tutte le categorie.** Viaggi, ristoranti, uscite e film
sono la stessa struttura (`Item`) con etichette diverse. È il motivo per cui
creare una categoria nuova funziona subito, senza scrivere altro codice.

**Il calendario non duplica niente.** Le voci con una data non vengono
"copiate" nel calendario: il calendario le ricalcola ogni volta dai dati. Così
non possono andare fuori sincrono.

**Le foto si ricomprimono prima di partire.** Una foto da telefono pesa 3-5 MB;
l'app la ridimensiona a 1600px e la manda a circa 300 KB. Nessuna differenza
visibile sullo schermo, ma lo spazio gratuito dura più o meno dieci volte tanto.

**Il bucket delle foto è privato.** Gli indirizzi sono firmati e generati dopo
il login: senza password non si vede niente, nemmeno avendo il link. Gli
indirizzi vengono però ricordati fino alla scadenza: rifirmarli a ogni avvio
cambierebbe la query string e il browser riscaricherebbe foto che ha già,
bruciando il traffico incluso nel piano gratuito.

---

## Comandi

```bash
npm install      # la prima volta
npm run dev      # sviluppo su http://localhost:5173
npm run build    # build di produzione in dist/
npm run preview  # guarda il risultato del build
npm run typecheck
```

Senza il file `.env` l'app parte comunque, in modalità locale: utile per
provarla prima di collegare il cloud.
