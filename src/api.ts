import { createHttpClient, leadsApi } from '@keenvector/kvcl'

// No gateway configured (the static production build before the backend is public) means no lead
// form: the site offers WhatsApp and a phone call instead (App.tsx, DirectContact).
const GATEWAY_URL = (import.meta.env.VITE_GATEWAY_URL as string | undefined) ?? ''
export const leadsOnline = GATEWAY_URL !== ''
export const http = createHttpClient(GATEWAY_URL || 'http://localhost:8080')
export const leads = leadsApi(http) // the only call the marketing site makes
