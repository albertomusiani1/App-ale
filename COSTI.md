# Quanto costa LoviDovi, davvero

Analisi dei piani gratuiti, di cosa succede quando si sfora e di quanto durano
nel vostro caso concreto: due persone, qualche viaggio all'anno, foto.

> **In breve:** l'app può restare gratuita per anni. L'unico limite che
> incontrerete davvero è **1 GB di foto su Supabase**, e ci arriverete
> intorno ai 3.000 scatti. Per pubblicare il sito conviene **Cloudflare**
> invece di Netlify: per un'app come questa è gratis senza limiti di traffico,
> e non ha il tetto di pubblicazioni mensili che ha bloccato Netlify.

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
| Crediti al mese | **300** dal 1º agosto 2026, non si accumulano |
| Costo di un deploy di produzione | **15 crediti** |
| Pubblicazioni al mese, quindi | **circa 20** |
| In alternativa, in sola banda | circa 15 GB |
| Quando finiscono | tetto rigido, si aspetta il ciclo successivo |

Attenzione a una confusione facile: **i crediti non si pagano per ogni sito,
si pagano per ogni pubblicazione.** Il numero di siti non c'entra. Venti
pubblicazioni sono venti volte che premi "aggiorna il sito", che sia sempre
lo stesso sito o venti siti diversi.

### Stare online costa crediti?

Quasi niente, ma non esattamente zero. I crediti si spendono su cinque voci:
pubblicazioni, calcolo, **banda**, **richieste web** e inferenza AI. Un sito
fermo, che nessuno apre, non consuma nulla; un sito visitato consuma in
proporzione a quanto traffico genera.

Nel vostro caso il traffico è trascurabile: l'app pesa circa 450 KB e viene
messa in cache dal service worker, le foto non passano nemmeno da qui (stanno
su Supabase). Due persone che la aprono ogni giorno fanno **pochi MB al mese**,
contro i ~15 GB che i 300 crediti coprirebbero. In pratica: quasi tutto il
consumo viene dalle pubblicazioni, non dai visitatori.

Gli **operational credits** sono un fondo di riserva separato, che Netlify
tiene proprio per coprire questo: servono a **mantenere online i siti già
pubblicati** quando il saldo principale è finito, e non si possono spendere
per le pubblicazioni. È esattamente quello che dice il messaggio: il sito
vive, gli aggiornamenti no.

Quindi:

- ❌ non serve cancellare il sito;
- ❌ non serve pagare;
- ✅ o aspetti il rinnovo del ciclo di fatturazione, ✅ oppure sposti il sito su
  Cloudflare (vedi sotto), che per questo tipo di app non ha questo
  problema.

### Se vedi 30 crediti invece di 300

Il piano gratuito dovrebbe accreditarne **300 al mese**. Diversi utenti — e a
settembre 2026 è il caso anche di questo account — vedono invece **30**, con
un triangolino di avviso accanto, e le pubblicazioni bloccate.

Sul forum di Netlify ci sono decine di discussioni con lo stesso identico
quadro, che risalgono a luglio 2026: *"Free plan stuck on operational credits
— production deploys paused with 30/30 credits available"*, *"Credits showing:
30 credits available (Free plan)"*. Il saldo mostrato resta intero e i deploy
restano bloccati lo stesso.

**Non è un tuo consumo.** Le opzioni sono due:

1. Aprire una discussione sul **forum di supporto Netlify** (è il canale per
   il piano gratuito: non c'è assistenza via ticket) indicando il nome del
   team e chiedendo di sbloccare il flag e ripristinare l'accredito corretto.
2. Non aspettare e pubblicare su **Cloudflare**, dove il problema non
   si pone. È quello che consiglio: il lavoro è già pronto nel repository.

Se invece i crediti risultassero effettivamente consumati, allora è
semplicemente il tetto del piano gratuito e basta aspettare il ciclo
successivo — nel tuo caso il **29 settembre**.

---

## 2 · Cloudflare: perché conviene per questa app

LoviDovi è un sito **completamente statico** che parla con Supabase: file HTML,
JavaScript e CSS, nessun codice che gira sul server dell'hosting. È
esattamente lo scenario in cui Cloudflare è gratuito sul serio, perché **le
richieste ai file statici non vengono né contate né fatturate**, su nessun
piano. Si paga solo quando c'è del codice che gira lato server, e qui non ce
n'è.

| | Netlify Free | Cloudflare Free |
|---|---|---|
| Traffico | ~15 GB (a crediti) | **illimitato** |
| Richieste ai file statici | a crediti | **illimitate, non fatturate** |
| Pubblicazioni al mese | ~20 | 3.000 minuti di build, cioè **oltre mille** |
| Blocco a fine crediti | sì | non previsto |
| Dominio personalizzato + HTTPS | sì | sì |

Il build di LoviDovi dura poco più di un minuto: i 3.000 minuti inclusi sono
un tetto che non vedrete mai.

> **Nota sul nome.** Cloudflare ha spostato anche i siti statici sotto
> **Workers**: la vecchia sezione "Pages" non è più il punto di partenza per
> un progetto nuovo. Cambia il percorso nel pannello, non la sostanza né i
> costi. La procedura aggiornata è nel [SETUP.md](SETUP.md), *Opzione A*.

Il repository contiene `wrangler.jsonc` (per Cloudflare) e `netlify.toml` (per
Netlify), ognuno con il proprio modo di dichiarare il routing della single page
app: puoi tenere i due hosting in parallelo senza toccare il codice.

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
| Hosting (Cloudflare) | 0 € | 0 € |
| Dati e foto (Supabase Free) | 0 € | 0 € o 25 $/mese se superate 1 GB di foto |
| Dominio personalizzato (facoltativo) | 0 € | ~12 €/anno se volete `noidue.it` |

**Non serve pagare niente per partire, e con ogni probabilità nemmeno dopo.**

---

*Numeri verificati a settembre 2026. I piani cambiano: se qualcosa non torna,
la fonte buona è sempre la pagina prezzi ufficiale del servizio.*
