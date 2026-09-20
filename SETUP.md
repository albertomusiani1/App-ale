# Mettere Noi Due online — guida passo passo

Serve una mezz'ora, una volta sola. Non serve saper programmare: sono tutti
copia-incolla. Alla fine avrai un indirizzo tipo `noidue.netlify.app` che tu e
lei aggiungete alla schermata home del telefono.

Il giro è questo:

```
GitHub (il codice)  →  Netlify (pubblica il sito)  →  Supabase (dati e foto)
```

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

## Parte 2 · Netlify (pubblicare l'app)

### 2.1 Collega il repository

1. Vai su **https://app.netlify.com** e accedi.
2. **Add new site** → **Import an existing project** → **GitHub**.
3. Autorizza Netlify e scegli il repository **App-ale**.
4. Nella schermata di configurazione, **branch to deploy**: scegli il branch su
   cui sta il codice (`claude/couple-gamification-app-5p9slb`, oppure `main` se
   lo hai già unito).
5. Build command e publish directory dovrebbero già essere giusti — li legge da
   `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`

### 2.2 Metti le tre variabili

**Prima di fare il deploy**, clicca su **Add environment variables** (o, se hai
già pubblicato: **Site configuration** → **Environment variables**) e aggiungi
queste tre, una per volta:

| Nome | Valore |
|---|---|
| `VITE_SUPABASE_URL` | il Project URL copiato al punto 1.4 |
| `VITE_SUPABASE_ANON_KEY` | la chiave anon copiata al punto 1.4 |
| `VITE_COUPLE_EMAIL` | l'email dell'account creato al punto 1.3 |

I nomi vanno scritti **esattamente così**, maiuscole comprese.

### 2.3 Pubblica

1. **Deploy site**. Il primo build richiede un paio di minuti.
2. Quando è verde, apri l'indirizzo che ti dà Netlify.
3. Se vuoi un nome più carino: **Site configuration** → **Change site name** →
   per esempio `noi-due-alberto`.

> Da qui in poi ogni volta che il codice cambia su GitHub, Netlify ripubblica da
> solo. Non devi rifare niente.

### 2.4 Se hai cambiato le variabili dopo aver pubblicato

Le variabili vengono lette **durante il build**, non quando apri il sito: dopo
averle modificate devi rifare il deploy. **Deploys** → **Trigger deploy** →
**Clear cache and deploy site**.

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
Niente. Netlify gratis copre 100 GB di traffico al mese, Supabase gratis dà
500 MB di database e 1 GB di foto. Per due persone è tantissimo: l'app
ricomprime ogni foto a circa 300 KB, quindi 1 GB sono all'incirca **3.000 foto**.

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
