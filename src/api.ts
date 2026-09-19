import { createHttpClient, leadsApi } from '@keenvector/kvcl'

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8080'
export const http = createHttpClient(GATEWAY_URL)
export const leads = leadsApi(http) // the only call the marketing site makes
