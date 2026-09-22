import type { CategoryKind } from '../types'

/**
 * Ogni tipo di categoria parla una lingua diversa: un viaggio ha una meta,
 * un ristorante un indirizzo, un film un regista. Qui teniamo le etichette
 * in un posto solo, così i form restano uno.
 */
export interface KindCopy {
  /** Come si chiama un singolo elemento. */
  one: string
  /** Al plurale. */
  many: string
  titleLabel: string
  titlePlaceholder: string
  subtitleLabel: string
  subtitlePlaceholder: string
  notesLabel: string
  notesPlaceholder: string
  wishTab: string
  doneTab: string
  /** Se true la scheda mostra i due voti a cuori. */
  rated: boolean
  /** Valori suggeriti per `meta.type` (es. ristorante / bar). */
  types?: string[]
  typeLabel?: string
  /** Valori suggeriti per `meta.cuisine`: solo i posti dove si mangia. */
  cuisines?: string[]
  /** Se true la scheda tiene il conto di quante volte ci siamo tornati. */
  counted?: boolean
}

export const KIND_COPY: Record<CategoryKind, KindCopy> = {
  trips: {
    one: 'viaggio',
    many: 'viaggi',
    titleLabel: 'Dove andiamo?',
    titlePlaceholder: 'Giappone, Lisbona, Norvegia...',
    subtitleLabel: 'Stato o zona',
    subtitlePlaceholder: 'Portogallo · Europa',
    notesLabel: 'Note e idee',
    notesPlaceholder: 'Cosa ci piacerebbe vedere, dritte, link, budget...',
    wishTab: 'Da fare',
    doneTab: 'Fatti',
    rated: true,
  },
  places: {
    one: 'posto',
    many: 'posti',
    titleLabel: 'Nome del posto',
    titlePlaceholder: 'Trattoria da Nino',
    subtitleLabel: 'Dove si trova',
    subtitlePlaceholder: 'Via Roma 12, Bologna',
    notesLabel: 'Note',
    notesPlaceholder: 'Cosa prendere, quanto si spende, chi ce l ha consigliato...',
    wishTab: 'Da provare',
    doneTab: 'Provati',
    rated: true,
    typeLabel: 'Che posto è',
    types: ['Ristorante', 'Pizzeria', 'Bar', 'Cocktail bar', 'Gelateria', 'Pasticceria', 'Street food', 'Altro'],
    cuisines: [
      'Giapponese',
      'Italiana',
      'Cinese',
      'Indiana',
      'Messicana',
      'Coreana',
      'Thai',
      'Pesce',
      'Carne',
      'Vegetariana',
      'Fusion',
      'Altro',
    ],
    counted: true,
  },
  screen: {
    one: 'titolo',
    many: 'titoli',
    titleLabel: 'Titolo',
    titlePlaceholder: 'Il favoloso mondo di Amélie',
    subtitleLabel: 'Regista o piattaforma',
    subtitlePlaceholder: 'Netflix · Jean-Pierre Jeunet',
    notesLabel: 'Note',
    notesPlaceholder: 'Perché lo vogliamo vedere, a che episodio siamo...',
    wishTab: 'Da vedere',
    doneTab: 'Visti',
    rated: true,
    typeLabel: 'Film o serie',
    types: ['Film', 'Serie TV', 'Documentario', 'Anime'],
  },
  generic: {
    one: 'uscita',
    many: 'uscite',
    titleLabel: 'Cosa facciamo',
    titlePlaceholder: 'Mirabilandia, concerto, mostra...',
    subtitleLabel: 'Dove',
    subtitlePlaceholder: 'Ravenna',
    notesLabel: 'Note',
    notesPlaceholder: 'Biglietti, orari, cosa portare...',
    wishTab: 'Da fare',
    doneTab: 'Fatte',
    rated: true,
  },
  goals: {
    one: 'achievement',
    many: 'achievement',
    titleLabel: 'Titolo',
    titlePlaceholder: 'Primo weekend da soli',
    subtitleLabel: '',
    subtitlePlaceholder: '',
    notesLabel: 'Descrizione',
    notesPlaceholder: '',
    wishTab: 'Da sbloccare',
    doneTab: 'Sbloccati',
    rated: false,
  },
}

export const copyFor = (kind: CategoryKind) => KIND_COPY[kind] ?? KIND_COPY.generic
