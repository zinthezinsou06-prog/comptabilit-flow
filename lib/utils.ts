import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencySymbol: string = "€") {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR', // Utilisé uniquement pour le formatage numérique si on voulait la vraie devise, mais on va customiser le symbole
    currencyDisplay: 'symbol',
  }).format(amount).replace('€', currencySymbol)
}
