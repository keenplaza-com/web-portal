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

## Deploy (Vercel — keenplaza.in, keenplaza.com)

Hosted on Vercel, like keenvector.in; the domains stay registered at Hostinger. Vercel builds every push
to `master` using `vercel.json`: it clones the public kvcl repo into `.kvcl`, points the dependency at it
(only on Vercel — locally it stays `../../kvcl`), and builds with `.env.production`.

Two Vercel projects build the same repo, one per domain, so each serves the site itself (no
cross-domain redirect): `keenplaza-web` → `keenplaza.in`, `keenplaza-com` → `keenplaza.com`; each
`www.` redirects to its own apex. `VITE_SITE_URL` (the build's own address: canonical, og:url,
`robots.txt`, `sitemap.xml` from `vite.config.ts`) is `https://keenplaza.in` in `.env.production`; the
`keenplaza-com` project overrides it in its Environment Variables. The production build has **no gateway**: no public API yet, so the contact
section offers WhatsApp and a call (`VITE_CONTACT_PHONE`) instead of the lead form, and "Store login"
points at `https://admin.keenplaza.in` (not live yet). Set `VITE_GATEWAY_URL` in `.env.production` once
the API is public and the form comes back.

DNS at Hostinger (hPanel → Domains → DNS): either nameservers `ns1.vercel-dns.com` / `ns2.vercel-dns.com`
(as keenvector.in does), or the A / CNAME records the Vercel Domains page shows.
