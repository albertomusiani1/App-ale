import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from './store/AppStore'
import { useAuth } from './store/AuthContext'
import { BottomNav } from './components/BottomNav'
import { AddSheet } from './components/AddSheet'
import { CelebrationOverlay } from './components/Celebration'
import { ExamPrompt } from './components/ExamPrompt'
import { SayingBubble } from './components/SayingBubble'
import { PulsingHeart } from './components/Magic'
import { CalendarPage } from './pages/CalendarPage'
import { CategoryPage } from './pages/CategoryPage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { AllCategoriesPage } from './pages/AllCategoriesPage'
import { PlansPage } from './pages/PlansPage'
import { WorldMapPage } from './pages/WorldMapPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage, WhoAreYou } from './pages/LoginPage'
import { Welcome } from './components/Welcome'
import { takeWelcomeRequest, welcomeSeen, welcomeTarget } from './lib/welcome'

export default function App() {
  const { signedIn, loading } = useAuth()

  if (loading) return <Splash />
  if (!signedIn) return <LoginPage />

  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <PulsingHeart />
      <p className="font-display text-lg text-muted">Un attimo...</p>
    </div>
  )
}

function Shell() {
  const { data, loading, error, warning } = useApp()
  const { me } = useAuth()
  const location = useLocation()
  const [addOpen, setAddOpen] = useState(false)
  /**
   * Va ricalcolato a ogni render, non deciso una volta sola: quando questo
   * componente nasce lei non ha ancora scelto chi è, quindi `me` è vuoto e
   * una condizione congelata direbbe per sempre "niente presentazione".
   */
  const [welcomeChiuso, setWelcomeChiuso] = useState(false)
  /** Richiesta esplicita dalle impostazioni: vale per chiunque, una volta sola. */
  const [richiesto] = useState(takeWelcomeRequest)
  const destinatario = welcomeTarget(data.settings.texts)
  const mostraWelcome =
    !welcomeChiuso && (richiesto || (me === destinatario && !welcomeSeen(me)))

  if (loading) return <Splash />
  if (!me) return <WhoAreYou nameA={data.settings.nameA} nameB={data.settings.nameB} />
  // La presentazione è per lei, la prima volta che entra su questo telefono.
  if (mostraWelcome) return <Welcome person={me} onDone={() => setWelcomeChiuso(true)} />

  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      {error && (
        <div
          role="alert"
          className="sticky top-0 z-40 bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          {error}
        </div>
      )}

      {/* Un avviso è giallo e non rosso: c'è qualcosa da sistemare, ma niente
          è rotto, e usare il colore dell'allarme per entrambi li svuota. */}
      {!error && warning && (
        <div
          role="status"
          className="sticky top-0 z-40 bg-[#FFF0C2] px-4 py-2 text-center text-sm font-semibold text-[#7A5600]"
        >
          ⚠️ {warning}
        </div>
      )}

      <main
        className="px-4"
        style={{
          paddingTop: 'calc(16px + var(--safe-top))',
          // Lo spazio sotto tiene il contenuto sopra la barra e il pulsante ＋.
          paddingBottom: 'calc(110px + var(--safe-bottom))',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            <Routes location={location}>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/c/:categoryId" element={<CategoryPage />} />
              <Route path="/c/:categoryId/:itemId" element={<ItemDetailPage />} />
              <Route path="/tutte" element={<AllCategoriesPage />} />
              <Route path="/mappa" element={<WorldMapPage />} />
              <Route path="/impegni" element={<PlansPage />} />
              <Route path="/impostazioni" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <SayingBubble />
      <BottomNav onAdd={() => setAddOpen(true)} />
      <AddSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <CelebrationOverlay />
      <ExamPrompt />
    </div>
  )
}
