import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { copyFor } from '../lib/kinds'
import { CategorySheet } from '../components/CategorySheet'
import { PageTitle } from '../components/ui'
import { Glitter } from '../components/Magic'

/**
 * La griglia con tutte le categorie, comprese quelle che avete creato voi.
 * È qui che la barra in basso "scarica" tutto quello che non ci sta.
 */
export function AllCategoriesPage() {
  const { data } = useApp()
  const [creating, setCreating] = useState(false)

  const categories = [...data.categories].sort((a, b) => a.sort - b.sort)

  return (
    <div className="pb-4">
      <PageTitle
        emoji="🗂️"
        title="Tutte le categorie"
        subtitle="Tutto quello che collezioniamo"
        color="custom"
        action={
          <Link
            to="/impostazioni"
            aria-label="Impostazioni"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft active:scale-90"
          >
            ⚙️
          </Link>
        }
      />

      <ul className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const c = colorOf(category.color)
          const copy = copyFor(category.kind)
          const all = data.items.filter((i) => i.categoryId === category.id)
          const done = all.filter((i) => i.status === 'done').length

          const summary =
            category.kind === 'goals'
              ? `${data.achievements.filter((a) => a.unlockedAt).length} / ${data.achievements.length} sbloccati`
              : `${all.length - done} ${copy.wishTab.toLowerCase()} · ${done} ${copy.doneTab.toLowerCase()}`

          return (
            <li key={category.id}>
              <motion.div whileTap={{ scale: 0.96 }} className="h-full">
                <Link
                  to={`/c/${category.id}`}
                  className="relative flex h-full flex-col overflow-hidden rounded-3xl p-4 shadow-soft"
                  style={{ background: c.soft, border: `1px solid ${c.hex}22` }}
                >
                  <Glitter count={6} seed={category.id.length} />
                  <span className="relative text-3xl" aria-hidden>
                    {category.emoji}
                  </span>
                  <span
                    className="relative mt-2 block font-display text-lg font-bold leading-tight"
                    style={{ color: c.ink }}
                  >
                    {category.name}
                  </span>
                  <span className="relative mt-0.5 block text-xs font-semibold" style={{ color: c.ink, opacity: 0.75 }}>
                    {summary}
                  </span>
                </Link>
              </motion.div>
            </li>
          )
        })}

        <li>
          <button
            onClick={() => setCreating(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-black/12 px-4 py-8 text-muted active:scale-95"
          >
            <span className="text-3xl" aria-hidden>
              ＋
            </span>
            <span className="text-sm font-semibold">Nuova categoria</span>
          </button>
        </li>
      </ul>

      <Link to="/impostazioni" className="btn-ghost mt-5 w-full">
        ⚙️ Impostazioni, modi di dire e frasi
      </Link>

      <CategorySheet open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
