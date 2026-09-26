import { createContext } from 'react'

/** @type {import('react').Context<((options: string | import('../hooks/useToast').ToastOptions) => void) | null>} */
export const ToastContext = createContext(null)
