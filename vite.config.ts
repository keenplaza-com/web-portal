import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// robots.txt and sitemap.xml name this build's own domain (keenplaza.in or keenplaza.com).
function seoFiles(site: string): Plugin {
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n` })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc></url>\n</urlset>\n` })
    }
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), seoFiles(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || 'https://keenplaza.in')],
  // kvcl is linked from ../../kvcl, which has its own node_modules: force one React instance.
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5175 }
}))
