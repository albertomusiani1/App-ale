# Mettere Noi Due online — guida passo passo

Serve una mezz'ora, una volta sola. Non serve saper programmare: sono tutti
copia-incolla. Alla fine avrai un indirizzo tipo `noidue.netlify.app` che tu e
lei aggiungete alla schermata home del telefono.

Il giro è questo:

```
GitHub (il codice)  →  l'hosting (pubblica il sito)  →  Supabase (dati e foto)
```

Per l'hosting ci sono due strade, entrambe gratuite. **Cloudflare Pages** è
quella che consiglio: per un sito come questo non ha limiti di traffico né di
pubblicazioni. **Netlify** funziona altrettanto bene, ma il piano gratuito
concede circa 20 pubblicazioni al mese e poi si ferma fino al mese dopo.
Il confronto con i numeri sta in [COSTI.md](COSTI.md).

---

## Parte 1 · Supabase (dati, foto e password)

### 1.1 Crea il progetto

1. Vai su **https://supabase.com** e registrati (il piano gratuito basta e avanza).
2. **New project**. Dai un nome (`noi-due`), scegli una password per il database
   — **salvala da qualche parte**, anche se non la userai quasi mai — e come
   regione scegli **West EU (Ireland)** o **Central EU (Frankfurt)**: sono le più
   vicine all'Italia, quindi le più veloci.
3. Aspetta due minuti che finisca di crearsi.

### 1.2 Crea le tabelle

1. Nel menù a sinistra: **SQL Editor** → **New query**.
2. Apri il file [`supabase/schema.sql`](supabase/schema.sql) di questo repository,
   copia **tutto** il contenuto e incollalo nell'editor.
3. Premi **Run** (in basso a destra).
4. Deve comparire *Success. No rows returned*. È fatta: tabelle, regole di
   sicurezza e spazio per le foto sono pronti.

> Lo script si può rieseguire quante volte vuoi senza rompere niente.

### 1.3 Crea l'account che userete in due

Qui sta il trucco dell'accesso: **un solo account per tutti e due**, e la sua
password è la "password di coppia" che digiterete all'avvio.

1. Menù a sinistra: **Authentication** → **Users** → **Add user** →
   **Create new user**.
2. Email: una qualsiasi che ricorderete, anche inventata purché abbia la forma
   giusta — per esempio `noi@noidue.it`.
3. Password: **quella che userete voi due**. Sceglila lunga, non `123456`.
4. Spunta **Auto Confirm User** (altrimenti aspetta una mail di conferma che non
   arriverà mai).
5. **Create user**.

### 1.4 Copia le due chiavi

1. **Project Settings** (l'ingranaggio in basso a sinistra) → **Data API**.
   Copia il **Project URL** (`https://qualcosa.supabase.co`).
2. **Project Settings** → **API Keys**. Copia la chiave **anon / public**.
   È lunghissima, è normale.

> ⚠️ La chiave `service_role` **non va usata** e non va messa da nessuna parte:
> scavalca tutte le regole di sicurezza. Serve solo la `anon`.

Tieni aperta questa pagina, ti servono fra un minuto.

---

## Parte 2 · Pubblicare l'app

Scegli **una** delle due. Puoi anche tenerle tutte e due: il repository
funziona su entrambe senza modifiche.

### Opzione A · Cloudflare Pages — consigliata

1. Vai su **https://dash.cloudflare.com** e registrati (gratis).
2. Nel menù a sinistra: **Workers & Pages** → **Create** → scheda **Pages** →
   **Connect to Git**.
3. Autorizza GitHub e scegli il repository **App-ale**.
4. Compila così:
   - **Production branch**: il branch dove sta il codice
     (`claude/couple-gamification-app-5p9slb`, oppure `main` se l'hai unito);
   - **Framework preset**: `Vite`;
   - **Build command**: `npm run build`;
   - **Build output directory**: `dist`.
5. Apri **Environment variables** e aggiungi le tre righe della tabella qui
   sotto, **prima** di lanciare il build.
6. **Save and Deploy**. Un paio di minuti e hai un indirizzo
   `nome-progetto.pages.dev`.

Per cambiare il nome: **Settings** → **General** → il progetto si può
rinominare, oppure aggiungi un dominio tuo da **Custom domains**.

### Opzione B · Netlify

1. Vai su **https://app.netlify.com** e accedi.
2. **Add new site** → **Import an existing project** → **GitHub**.
3. Autorizza Netlify e scegli il repository **App-ale**.
4. **Branch to deploy**: il branch dove sta il codice.
5. Build command e publish directory li legge già da `netlify.toml`
   (`npm run build` e `dist`).
6. Aggiungi le tre variabili qui sotto e poi **Deploy site**.

Per un nome più carino: **Site configuration** → **Change site name**.

> ⚠️ Se a un certo punto Netlify ti dice *"running on operational credits,
> production deploys are paused"*, vuol dire che hai esaurito i 300 crediti
> mensili del piano gratuito: il sito resta online ma non pubblica più
> aggiornamenti fino al ciclo successivo. Spiegato per bene in
> [COSTI.md](COSTI.md).

### Le tre variabili d'ambiente

Valgono per entrambi gli hosting, con gli stessi nomi:

| Nome | Valore |
|---|---|
| `VITE_SUPABASE_URL` | il Project URL copiato al punto 1.4 |
| `VITE_SUPABASE_ANON_KEY` | la chiave anon copiata al punto 1.4 |
| `VITE_COUPLE_EMAIL` | l'email dell'account creato al punto 1.3 |

I nomi vanno scritti **esattamente così**, maiuscole comprese.

### Se cambi le variabili dopo aver pubblicato

Vengono lette **durante il build**, non quando apri il sito: dopo averle
modificate serve una nuova pubblicazione.

- Cloudflare Pages: **Deployments** → sull'ultimo, **Retry deployment**.
- Netlify: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**.

> Da qui in poi, ogni volta che il codice cambia su GitHub il sito si
> ripubblica da solo. Non devi rifare niente.

---

## Parte 3 · Installarla sul telefono

### iPhone

1. Apri l'indirizzo **con Safari** (con Chrome non funziona l'installazione).
2. Tocca il pulsante **Condividi** (il quadrato con la freccia in su).
3. Scorri e scegli **Aggiungi a Home**.
4. Da lì in poi si apre a schermo intero, con la sua icona, come un'app.

### Android

1. Apri l'indirizzo con Chrome.
2. Menù (tre puntini) → **Installa app** (o **Aggiungi a schermata Home**).

Fatelo tutti e due. Al primo avvio ognuno digita la password di coppia e poi
sceglie chi è.

---

## Parte 4 · Le prime cose da fare dentro l'app

1. **Impostazioni** (⚙️ in alto a destra nella schermata "Tutte"):
   - i vostri nomi;
   - **la data da quando state insieme** — è quella che sblocca gli achievement
     anniversario, compreso quello dei 6 anni;
2. Sempre nelle impostazioni, **Foto dei pop-up**: carica le immagini che vuoi
   far comparire nelle celebrazioni.
3. **Frasi per i pop-up**: aggiungi i versi che preferite.
4. **I nostri modi di dire**: questi sono i vostri, quelli che ogni tanto
   riaffiorano da soli sullo schermo.

---

## Domande che verranno

**Quanto costa?**
Niente. Cloudflare Pages non misura il traffico di un sito statico, e Supabase
gratis dà 500 MB di database e 1 GB di foto. L'app ricomprime ogni scatto a
circa 300 KB, quindi 1 GB sono all'incirca **3.000 foto**. L'analisi completa,
con quanto durano i limiti e quando converrebbe pagare, è in
[COSTI.md](COSTI.md).

**Un progetto Supabase gratuito si mette in pausa?**
Sì, dopo una settimana senza nessun accesso. Basta riaprire l'app (o il pannello
Supabase) e riparte. Usandola normalmente non succede.

**Le foto sono private?**
Sì. Stanno in un bucket privato: l'app genera indirizzi firmati solo dopo il
login e senza autenticazione non si legge niente, nemmeno conoscendo il link.

**Ho sbagliato la password, come la cambio?**
Supabase → **Authentication** → **Users** → i tre puntini sull'utente →
**Reset password**.

**Posso usarla senza Supabase?**
Sì: senza le variabili d'ambiente l'app parte in modalità locale e salva tutto
sul telefono. Funziona tutto, ma **non c'è sincronizzazione**: tu vedi i tuoi
dati, lei i suoi.

**Come la provo sul mio computer?**
```bash
npm install
cp .env.example .env   # e riempi i tre valori
npm run dev
```
