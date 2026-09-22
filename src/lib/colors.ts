import type { ColorKey } from '../types'

/**
 * Tailwind non sa generare classi costruite a runtime (`bg-cat-${x}` non esiste),
 * quindi i colori delle categorie li usiamo come valori inline partendo da qui.
 * Le tinte sono scelte per restare distinguibili a colpo d'occhio sul calendario,
 * anche nei puntini da 6 pixel.
 *
 * `on` è il colore del testo da scrivere SOPRA la tinta piena. Non è sempre
 * bianco: sul giallo il bianco non si legge, e il giallo è il nostro colore
 * principale, quindi lì ci va un marrone scuro.
 */
export const PALETTE: Record<
  ColorKey,
  { hex: string; soft: string; ink: string; on: string; label: string }
> = {
  agenda: { hex: '#F5B301', soft: '#FFF4D6', ink: '#7A5600', on: '#3D2B00', label: 'Giallo' },
  trips: { hex: '#2E7DD1', soft: '#E1EEFB', ink: '#14507F', on: '#FFFFFF', label: 'Blu' },
  places: { hex: '#E8833A', soft: '#FDEEE0', ink: '#8A4712', on: '#FFFFFF', label: 'Arancio' },
  goals: { hex: '#E8638C', soft: '#FDE7EE', ink: '#8E2B4C', on: '#FFFFFF', label: 'Rosa' },
  outings: { hex: '#17A398', soft: '#DEF4F1', ink: '#0A5E57', on: '#FFFFFF', label: 'Turchese' },
  screen: { hex: '#8B5CF6', soft: '#EDE6FE', ink: '#4C2A9E', on: '#FFFFFF', label: 'Viola' },
  custom: { hex: '#A6192E', soft: '#F9E2E5', ink: '#6B0F1D', on: '#FFFFFF', label: 'Rosso' },
}

export const COLOR_KEYS = Object.keys(PALETTE) as ColorKey[]

export const colorOf = (key: ColorKey) => PALETTE[key] ?? PALETTE.custom
