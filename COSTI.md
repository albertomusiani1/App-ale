# Quanto costa Noi Due, davvero

Analisi dei piani gratuiti, di cosa succede quando si sfora e di quanto durano
nel vostro caso concreto: due persone, qualche viaggio all'anno, foto.

> **In breve:** l'app può restare gratuita per anni. L'unico limite che
> incontrerete davvero è **1 GB di foto su Supabase**, e ci arriverete
> intorno ai 3.000 scatti. Per pubblicare il sito conviene **Cloudflare Pages**
> invece di Netlify: per un'app come questa è gratis senza limiti di traffico.

---

## 1 · Il messaggio di Netlify: cosa significa

> *Albiberto is now running on operational credits. Your published sites are
> still live, but production deploys and Agent Runners are paused.*

**Non devi togliere niente.** Il sito pubblicato resta online. Quello che è
bloccato è la *pubblicazione di nuove versioni*.

Dal 2026 Netlify non conta più banda e minuti di build separatamente: c'è un
unico gettone, il **credito**, che si spende su cinque voci — deploy di
produzione, calcolo, banda, richieste web e inferenza AI.

| | Piano gratuito Netlify |
|---|---|
| Crediti al mese | **300**, non si accumulano |
| Costo di un deploy di produzione | **15 crediti** |
| Deploy al mese, quindi | **circa 20** |
| In alternativa, in sola banda | circa 15 GB |
| Quando finiscono | tetto rigido, si aspetta il ciclo successivo |

Gli **operational credits** sono un fondo di riserva separato: servono solo a
**tenere in piedi i siti già pubblicati** e non si possono spendere per i
deploy. È esattamente quello che dice il messaggio: il sito vive, gli
aggiornamenti no.

Quindi:

- ❌ non serve cancellare il sito;
- ❌ non serve pagare;
- ✅ o aspetti il rinnovo del ciclo di fatturazione, ✅ oppure sposti il sito su
  Cloudflare Pages (vedi sotto), che per questo tipo di app non ha questo
  problema.

### Un dubbio legittimo: hai davvero consumato 300 crediti?

Venti deploy in un mese si fanno in fretta se hai collegato il deploy
automatico e hai fatto molte modifiche. Ma da luglio 2026 **molti utenti del
piano gratuito segnalano lo stesso banner con i crediti ancora interi** — sul
forum di Netlify ci sono decine di discussioni intitolate "stuck on operational
credits ... despite 30/30 credits available".

Vale la pena controllare: **Team → Usage & Billing**. Se i crediti risultano
ancora disponibili, non è un tuo consumo ed è il caso di aprire una richiesta
sul forum di supporto chiedendo di sbloccare il flag. Se invece risultano
consumati, è semplicemente il tetto del piano gratuito.

---

## 2 · Cloudflare Pages: perché conviene per questa app

Noi Due è un sito **completamente statico** che parla con Supabase: file HTML,
JavaScript e CSS, nessun codice che gira sul server dell'hosting. È
esattamente lo scenario in cui Cloudflare Pages è gratuito sul serio.

| | Netlify Free | Cloudflare Pages Free |
|---|---|---|
| Traffico | ~15 GB (a crediti) | **illimitato** |
| Richieste | a crediti | **illimitate** |
| Pubblicazioni al mese | ~20 | **500** |
| Blocco a fine crediti | sì | non previsto |
| Dominio personalizzato + HTTPS | sì | sì |

Per un sito statico Cloudflare non misura la banda: i limiti sopra, con due
utenti, non li sfiorerete mai. La procedura è nel [SETUP.md](SETUP.md), sezione
*Pubblicare su Cloudflare Pages*, ed è la stessa lunghezza di quella Netlify.

Il repository contiene già `public/_redirects`, che va bene per entrambi: puoi
tenere i due hosting in parallelo senza toccare il codice.

---

## 3 · Supabase: i limiti veri e quanto durano

| Risorsa | Piano gratuito | Cosa significa per voi |
|---|---|---|
| Database | 500 MB | L'app ci scrive solo testo. Un viaggio completo di tappe e note occupa circa 1 KB: **migliaia di viaggi** prima di accorgersene. Non è questo il limite. |
| Foto (storage) | **1 GB** | ⬅ **Il vero limite.** L'app ricomprime ogni foto a ~300 KB, quindi **circa 3.000 foto**. |
| Traffico in uscita | 5 GB al mese | Circa 17.000 aperture di foto al mese. In due non ci arrivate. |
| Utenti attivi | 50.000 al mese | Voi siete 2. |
| Progetti attivi | 2 | Ne usate 1. |
| Backup | ❌ nessuno | Vedi sotto: è la cosa a cui fare attenzione. |

### Quanto dura 1 GB

| Se caricate... | 1 GB finisce in |
|---|---|
| 20 foto al mese | ~13 anni |
| 50 foto al mese | ~5 anni |
| 150 foto al mese (viaggiatori accaniti) | ~1 anno e mezzo |

### Le due cose da sapere

**Il progetto va in pausa dopo 7 giorni di inattività.** È la regola del piano
gratuito. Se per una settimana nessuno dei due apre l'app, il database si
ferma e l'app smette di caricare i dati finché non lo riattivi con un clic dal
pannello Supabase (**Restore project**). Non si perde nulla, ma è una seccatura
se capita mentre sei fuori. Usandola anche solo una volta a settimana non
succede mai.

**Non ci sono backup automatici.** Questa è la cosa che mi preoccupa di più,
più dei limiti di spazio: se cancelli per sbaglio un viaggio con dentro
trecento foto, nel piano gratuito non c'è un "torna a ieri". Se l'app diventa
l'archivio dei vostri ricordi, vale la pena salvare ogni tanto una copia delle
foto altrove — o passare al piano Pro, che include i backup giornalieri.

### Quando pagare, semmai

Supabase Pro costa **25 $ al mese** e alza lo spazio foto a 100 GB con backup
giornalieri per 7 giorni. Ha senso solo quando avrete superato il GB di foto,
cioè fra qualche anno.

Prima di pagare ci sono due strade più economiche:

1. **Archiviare**: scaricare le foto dei viaggi più vecchi e toglierle
   dall'app, tenendo nelle note il riferimento a dove sono finite.
2. **Spostare solo le foto su Cloudflare R2**, che offre 10 GB gratuiti
   permanenti e non fa pagare il traffico in uscita. È un intervento di codice
   — si tocca solo `src/lib/db.ts` — ma è fattibile quando servirà.

---

## 4 · Il conto totale

| | Oggi | Fra 5 anni, uso intenso |
|---|---|---|
| Hosting (Cloudflare Pages) | 0 € | 0 € |
| Dati e foto (Supabase Free) | 0 € | 0 € o 25 $/mese se superate 1 GB di foto |
| Dominio personalizzato (facoltativo) | 0 € | ~12 €/anno se volete `noidue.it` |

**Non serve pagare niente per partire, e con ogni probabilità nemmeno dopo.**

---

*Numeri verificati a settembre 2026. I piani cambiano: se qualcosa non torna,
la fonte buona è sempre la pagina prezzi ufficiale del servizio.*
