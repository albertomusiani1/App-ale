import type { ColorKey } from '../types'

/**
 * Tailwind non sa generare classi costruite a runtime (`bg-cat-${x}` non esiste),
 * quindi i colori delle categorie li usiamo come valori inline partendo da qui.
 * Le tinte sono scelte per restare distinguibili a colpo d'occhio sul calendario,
 * anche nei puntini da 6 pixel.
 */
export const PALETTE: Record<ColorKey, { hex: string; soft: string; ink: string; label: string }> = {
  agenda: { hex: '#E8638C', soft: '#FDE7EE', ink: '#8E2B4C', label: 'Rosa' },
  trips: { hex: '#2E7DD1', soft: '#E1EEFB', ink: '#14507F', label: 'Blu' },
  places: { hex: '#E8833A', soft: '#FDEEE0', ink: '#8A4712', label: 'Arancio' },
  goals: { hex: '#F0B429', soft: '#FEF3DA', ink: '#8A6100', label: 'Oro' },
  outings: { hex: '#17A398', soft: '#DEF4F1', ink: '#0A5E57', label: 'Turchese' },
  screen: { hex: '#8B5CF6', soft: '#EDE6FE', ink: '#4C2A9E', label: 'Viola' },
  custom: { hex: '#A6192E', soft: '#F9E2E5', ink: '#6B0F1D', label: 'Rosso' },
}

export const COLOR_KEYS = Object.keys(PALETTE) as ColorKey[]

export const colorOf = (key: ColorKey) => PALETTE[key] ?? PALETTE.custom
