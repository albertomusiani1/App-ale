import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { randomId } from '../lib/image'
import { CAT } from '../lib/seed'
import { markWelcomeSeen } from '../lib/welcome'
import type { ColorKey, Item } from '../types'
import { Confetti, FloatingHearts, Glitter } from './Magic'
import { Input, TextArea } from './ui'

/**
 * La prima volta che Alessia entra, l'app non la lascia davanti a un
 * calendario vuoto: le fa qualche domanda e si riempie mentre risponde.
 *
 * Ogni risposta finisce dove finirebbe passando dai form normali — un viaggio
 * è un viaggio, un modo di dire è un modo di dire — quindi non c'è nessun
 * percorso speciale da mantenere: se domani cambia il form dei viaggi, cambia
 * anche quello che nasce da qui.
 *
 * Tutte le domande si possono saltare. È un regalo, non un modulo.
 */
export function Welcome({ onDone }: { onDone: () => void }) {
  const { data, updateSettings, saveItem, saveQuote, saveSaying } = useApp()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)

  // Le risposte restano qui finché non si arriva in fondo: così tornare
  // indietro non perde niente e non si scrive a metà.
  const [anniversary, setAnniversary] = useState(data.settings.anniversary ?? '')
  const [trip, setTrip] = useState('')
  const [sushi, setSushi] = useState('')
  const [screen, setScreen] = useState('')
  const [outing, setOuting] = useState('')
  const [quote, setQuote] = useState('')
  const [quoteSong, setQuoteSong] = useState('')
  const [saying, setSaying] = useState('')
  const [sayingMeaning, setSayingMeaning] = useState('')

  const lei = data.settings.nameB || 'amore'
  const lui = data.settings.nameA || 'lui'

  const newItem = (categoryId: string, title: string, meta: Record<string, string> = {}): Item => ({
    id: randomId(),
    categoryId,
    title: title.trim(),
    subtitle: '',
    status: 'wish',
    startDate: null,
    endDate: null,
    notes: '',
    ratingA: null,
    ratingB: null,
    meta,
    coverPhotoId: null,
    lat: null,
    lng: null,
    visits: 0,
    createdAt: new Date().toISOString(),
  })

  /** Scrive tutto quello che è stato riempito, e ignora il resto. */
  async function salva() {
    setBusy(true)
    try {
      if (anniversary) await updateSettings({ anniversary })
      if (trip.trim()) await saveItem(newItem(CAT.trips, trip))
      if (sushi.trim())
        await saveItem(newItem(CAT.places, sushi, { type: 'Ristorante', cuisine: 'Giapponese' }))
      if (screen.trim()) await saveItem(newItem(CAT.screen, screen))
      if (outing.trim()) await saveItem(newItem(CAT.outings, outing))
      if (quote.trim())
        await saveQuote({
          id: randomId(),
          text: quote.trim(),
          song: quoteSong.trim(),
          era: '',
          createdAt: new Date().toISOString(),
        })
      if (saying.trim())
        await saveSaying({
          id: randomId(),
          text: saying.trim(),
          author: 'both',
          meaning: sayingMeaning.trim(),
          createdAt: new Date().toISOString(),
        })
    } finally {
      setBusy(false)
    }
  }

  const steps: WelcomeStep[] = [
    {
      emoji: '💛',
      title: `Ciao ${lei}`,
      text: `${lui} ti ha costruito un posto dove tenere le nostre cose: i viaggi, i posti dove mangiamo, le sciocchezze che ci diciamo. Adesso è vuoto. Riempiamolo insieme, ci vogliono due minuti.`,
      color: 'agenda',
    },
    {
      emoji: '📅',
      title: 'Da quando stiamo insieme?',
      text: 'Da qui l app conta gli anni, e ogni anniversario si fa vivo da solo.',
      color: 'goals',
      field: (
        <Input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
      ),
    },
    {
      emoji: '✈️',
      title: 'Il primo viaggio',
      text: 'Uno che vogliamo fare. Non deve essere realistico, deve essere nostro.',
      color: 'trips',
      field: (
        <Input
          value={trip}
          placeholder="Giappone, Lisbona, un weekend in montagna..."
          onChange={(e) => setTrip(e.target.value)}
        />
      ),
    },
    {
      emoji: '🍣',
      title: 'Il primo sushi',
      text: 'Il giapponese dove vogliamo andare. Quando ci saremo stati, si sblocca un traguardo — e tanto paga sempre Albi.',
      color: 'places',
      field: (
        <Input
          value={sushi}
          placeholder="Il nome del locale"
          onChange={(e) => setSushi(e.target.value)}
        />
      ),
    },
    {
      emoji: '🍿',
      title: 'Cosa guardiamo?',
      text: 'Un film o una serie da vedere insieme. Quello che rimandiamo da mesi va benissimo.',
      color: 'screen',
      field: (
        <Input
          value={screen}
          placeholder="Un titolo"
          onChange={(e) => setScreen(e.target.value)}
        />
      ),
    },
    {
      emoji: '🎡',
      title: 'La prossima avventura',
      text: 'Un concerto, un parco, una mostra, una gita. Qualcosa da fare, non da guardare.',
      color: 'outings',
      field: (
        <Input
          value={outing}
          placeholder="Mirabilandia, un concerto, le terme..."
          onChange={(e) => setOuting(e.target.value)}
        />
      ),
    },
    {
      emoji: '🎤',
      title: 'Una frase che ci rappresenta',
      text: 'Un verso, una battuta, una dedica. Salterà fuori nei momenti belli, quando sblocchiamo qualcosa.',
      color: 'screen',
      field: (
        <>
          <TextArea
            value={quote}
            placeholder="La frase"
            onChange={(e) => setQuote(e.target.value)}
          />
          <Input
            className="mt-2"
            value={quoteSong}
            placeholder="Di che canzone è? (facoltativo)"
            onChange={(e) => setQuoteSong(e.target.value)}
          />
        </>
      ),
    },
    {
      emoji: '🗯️',
      title: 'Il nostro primo modo di dire',
      text: 'Una di quelle frasi che diciamo solo noi e che nessun altro capirebbe. Ogni tanto ricomparirà da sola sullo schermo.',
      color: 'agenda',
      field: (
        <>
          <Input
            value={saying}
            placeholder="Come lo diciamo"
            onChange={(e) => setSaying(e.target.value)}
          />
          <Input
            className="mt-2"
            value={sayingMeaning}
            placeholder="Cosa vuol dire, o com è nato (facoltativo)"
            onChange={(e) => setSayingMeaning(e.target.value)}
          />
        </>
      ),
    },
    {
      emoji: '💛',
      title: 'Ecco com è fatta',
      color: 'agenda',
      text: '',
      presentation: true,
    },
  ]

  const current = steps[step]
  const last = step === steps.length - 1
  const c = colorOf(current.color)

  async function avanti() {
    if (last) {
      await salva()
      markWelcomeSeen('b')
      // Niente festeggiamento inventato qui: appena la data dell'anniversario
      // è salvata, il traguardo degli anni insieme scatta da solo e si prende
      // la scena. Un "benvenuta" generico gli finirebbe sotto — e comunque
      // "Sei anni. Chi l avrebbe detto" è un accoglienza migliore.
      onDone()
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <Glitter count={22} />
      {step === 0 && <FloatingHearts count={10} />}
      {last && <Confetti pieces={50} />}

      <div
        className="mx-auto flex min-h-dvh max-w-lg flex-col px-6"
        style={{ paddingTop: 'calc(28px + var(--safe-top))', paddingBottom: 'calc(24px + var(--safe-bottom))' }}
      >
        {/* Quanto manca */}
        <div className="mb-8 flex shrink-0 gap-1.5" aria-hidden>
          {steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{ background: i <= step ? c.hex : 'rgba(0,0,0,0.08)' }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="mb-4 text-6xl" aria-hidden>
              {current.emoji}
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight">{current.title}</h1>
            {current.text && <p className="mt-2 leading-relaxed text-muted">{current.text}</p>}

            {current.field && <div className="mt-6">{current.field}</div>}

            {current.presentation && <Presentation />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 shrink-0 space-y-2">
          <button
            onClick={() => void avanti()}
            disabled={busy}
            className="btn w-full shadow-lift"
            style={{ background: c.hex, color: c.on }}
          >
            {busy ? 'Un attimo…' : last ? '💛 Portami nella nostra app' : 'Avanti'}
          </button>

          {!last && (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="w-full py-2 text-sm font-semibold text-muted underline"
            >
              {step === 0 ? 'Salto la presentazione' : 'Lo faccio dopo'}
            </button>
          )}
          {step > 0 && !last && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="w-full py-1 text-xs text-muted"
            >
              ‹ indietro
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface WelcomeStep {
  emoji: string
  title: string
  text: string
  color: ColorKey
  field?: ReactNode
  presentation?: boolean
}

/** L'ultima schermata: cosa c'è dentro l'app, in cinque righe. */
function Presentation() {
  const voci: [string, string, string, ColorKey][] = [
    ['📅', 'Il calendario', 'Tutto quello che ci aspetta, con un puntino colorato per tipo.', 'agenda'],
    ['✈️', 'I viaggi', 'Con le tappe, i giorni, la mappa e le foto di ogni giornata.', 'trips'],
    ['🍝', 'Posti e uscite', 'Provati e da provare, con i voti di tutti e due.', 'places'],
    ['🏆', 'I traguardi', 'Crescono da soli mentre viviamo. Alcuni li spuntiamo a mano.', 'goals'],
    ['🗯️', 'I modi di dire', 'Ricompaiono a sorpresa, così non ce li dimentichiamo.', 'screen'],
  ]
  return (
    <ul className="mt-5 space-y-2.5 overflow-y-auto">
      {voci.map(([emoji, titolo, testo, color]) => {
        const c = colorOf(color)
        return (
          <li
            key={titolo}
            className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl"
              style={{ background: c.soft }}
              aria-hidden
            >
              {emoji}
            </span>
            <span className="min-w-0">
              <span className="block font-bold">{titolo}</span>
              <span className="block text-sm leading-snug text-muted">{testo}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
