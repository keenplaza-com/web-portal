# KeenPlaza Web Portal

KeenPlaza's own marketing/advertisement site. Its only job is bringing in leads: businesses
that may become tenants
([ADR 0016](../docs/02_ADR/0016-client-roles-marketing-site-and-tenant-storefront.md)).
Public, no login.

## Status

Built 2026-09-17: one page in `src/App.tsx` — hero, features, plans, contact form. The form is
the only API call (`leadsApi.create` → public `POST /v1/leads`); leads are worked in the super
admin portal (Leads → contacted / drop / Convert to tenant). Copy comes from
`keenplaza-claude/README.md`; edit the `FEATURES` and `PLANS` arrays to change it. `.env`:
`VITE_GATEWAY_URL`, `VITE_ADMIN_URL` (the "Store login" link).

## Run

```bash
cd ../kvcl/plaza && npm run build
cd ../web-portal
npm install
npm run dev     # http://localhost:5175
```

## Target stack

React 19 + Vite + TypeScript, using [`kvcl/plaza`](../kvcl/plaza).
