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

## Deploy to Hostinger (keenplaza.in, keenplaza.com)

Static files only. `keenplaza.in` is the one address; `keenplaza.com` and every `www` 301 to it
(`public/.htaccess`, checked against Apache 2.4 on 2026-09-30).

The production build (`.env.production`) has **no gateway**: there is no public API yet, so the
contact section shows WhatsApp and a phone call (`VITE_CONTACT_PHONE`) instead of the lead form,
and "Store login" points at `https://admin.keenplaza.in` (not live yet). Set `VITE_GATEWAY_URL`
there once the API is public and the form comes back.

```bash
npm run build                       # uses .env.production
cd dist && zip -qr ../deploy/keenplaza.in-public_html.zip .    # includes .htaccess
```

In hPanel:
1. Both domains' DNS on Hostinger (nameservers `ns1/ns2.dns-parking.com`), or A records to the
   hosting IP shown in hPanel.
2. **Websites → Add website** for `keenplaza.in`; **Security → SSL** → install the free SSL for
   `keenplaza.in` and `www.keenplaza.in` *before* uploading (the .htaccess forces https).
3. **Files → File Manager → `domains/keenplaza.in/public_html`**: delete the placeholder
   `default.php`/`index.html`, upload `keenplaza.in-public_html.zip`, **Extract** here, delete the zip.
   Turn on "show hidden files" to confirm `.htaccess` is there.
4. `keenplaza.com`: either **Domains → Redirects** → 301 to `https://keenplaza.in`, or add it as a
   website, install its SSL, and upload `keenplaza.com-public_html.zip` (just the .htaccess).
5. Check: `https://keenplaza.in` loads; `http://keenplaza.com/x` lands on `https://keenplaza.in/x`.
   A redirect loop means the server doesn't report https: remove the `RewriteCond %{HTTPS} off`
   line from `.htaccess` in File Manager.
