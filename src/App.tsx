import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button, ColorModeToggle, Icon, LogoMark, TextArea, TextField, Wordmark } from '@keenvector/kvcl'
import type { ApiError, IconName } from '@keenvector/kvcl'
import { leads } from './api'
import './site.css'

// KeenPlaza's marketing site (ADR 0016): one page — what KeenPlaza is, what a store gets, plans, and a
// contact form that creates a lead the platform team works in the super admin portal. Copy comes
// from keenplaza-claude/README.md (owner decision 2026-09-17). Public, no login, no tenant.
// Motion is CSS + IntersectionObserver only; everything settles to its final state under
// prefers-reduced-motion.

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:5173'
const WORDS = ['buy', 'book', 'install', 'repair', 'maintain']
// The prototype's `.container`: centred, 1320px, 24px gutters.
const CONTAINER = 'mx-auto w-full max-w-[1320px] px-6'
/** kvcl fields carry a bottom margin for stacked forms; the lead form is a grid with its own gap. */
const FIELD = { marginBottom: 0 }
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
/** Inline CSS custom property, e.g. cssVar('--d', '80ms'). */
const cssVar = (name: string, value: string | number) => ({ [name]: value }) as CSSProperties

const FEATURES: { icon: IconName; title: string; text: string; size?: 'big' | 'wide' }[] = [
  { icon: 'globe', title: 'Your own online store', text: 'A storefront on your subdomain or your own domain, with your colours, your home page and your catalog: products, variants, brands, categories, specifications.', size: 'big' },
  { icon: 'percent', title: 'Pricing that sells', text: 'Offers on products or whole categories, coupon codes, GST per category, free-above delivery. Every total is computed server-side.' },
  { icon: 'box', title: 'Stock you can trust', text: 'Per-warehouse ledger, checkout holds that expire on their own, low-stock alerts, transfers.' },
  { icon: 'card', title: 'Cash or online', text: 'Cash on delivery and online payment through your own Razorpay account. Turn either off per store.' },
  { icon: 'truck', title: 'Delivery, tracked', text: 'Blue Dart booking and tracking, or any courier by hand. Orders move to shipped, out for delivery and delivered on their own; customers see the timeline.', size: 'wide' },
  { icon: 'undo', title: 'Returns and refunds', text: 'Customers request a return within 7 days; you accept or decline. Online orders refund automatically.' },
  { icon: 'tools', title: 'Services, coming', text: 'Bookings, slots and professionals in the same cart: buy the AC, book the installation, one timeline.' },
  { icon: 'shield', title: 'Login with WhatsApp OTP', text: 'No passwords for you or your customers. A code on WhatsApp signs everyone in.' }
]

const STORE_TYPES = ['Kirana & grocery', 'Fashion', 'Electronics', 'Home & kitchen', 'Beauty', 'AC & appliance service', 'Salons', 'Repairs', 'Furniture', 'Pharmacy', 'Books & stationery', 'Sports']

const STATS = [
  { n: 8, suffix: '', label: 'modules in one admin' },
  { n: 7, suffix: '', label: 'order steps, tracked live' },
  { n: 1, suffix: ' day', label: 'from call to live store' },
  { n: 0, suffix: '', label: 'passwords to remember' }
]

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'phone', title: 'Tell us about your business', text: 'Leave your WhatsApp number below. We call back within a working day.' },
  { icon: 'palette', title: 'We set up your store with you', text: 'Your catalog, colours, domain, payments and couriers, done together.' },
  { icon: 'zap', title: 'Start selling the same week', text: 'Share your link. Orders, stock and delivery run from one admin.' }
]

const ORDER = ['Awaiting payment', 'Paid · ₹31,099 online', 'Confirmed', 'Packed', 'Shipped · Delhivery', 'Out for delivery', 'Delivered']

const FAQ = [
  { q: 'Do I need my own Razorpay account?', a: 'Yes for online payments: you connect your keys in Settings → Payments and money settles straight to you. Cash on delivery works without it.' },
  { q: 'Can I use my own domain?', a: 'Yes. Add it under Online store → Domains, point a CNAME at your KeenPlaza subdomain, and verify.' },
  { q: 'How do customers log in?', a: 'With a one-time code on WhatsApp. No passwords, nothing to reset.' },
  { q: 'What does it cost to start?', a: 'Nothing. Every store starts on Starter; plan prices apply once billing launches.' }
]

const PLANS = [
  { name: 'Starter', price: 'Free', blurb: 'Open your store and take your first orders.', points: ['1 store, 1 warehouse', 'Cash on delivery', 'Platform subdomain', 'WhatsApp OTP login'] },
  { name: 'Growth', price: '₹1,999', per: '/ mo', blurb: 'Everything a growing store needs.', points: ['Online payments (your Razorpay)', 'Courier integration', 'Custom domain', 'Offers, coupons, GST rules', 'Staff roles'], featured: true },
  { name: 'Scale', price: 'Talk to us', blurb: 'Many warehouses, marketplaces, services.', points: ['Multiple warehouses', 'Marketplace listings', 'Services marketplace', 'Priority support'] }
]

// Adds .is-in to every .reveal once it scrolls into view (all at once under reduced motion).
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (reducedMotion()) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    // A zero-height viewport (some embeds, headless renders) never intersects; show everything.
    if (!window.innerHeight) els.forEach((el) => el.classList.add('is-in'))
    return () => io.disconnect()
  }, [])
}

function WordRotator() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reducedMotion()) return
    const t = window.setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200)
    return () => window.clearInterval(t)
  }, [])
  return (
    <>
      <span className="sr-only">buy, book, install, repair and maintain.</span>
      <span className="mk-rotator" aria-hidden="true">
        <span key={WORDS[i]} className="mk-word">{WORDS[i]}.</span>
      </span>
    </>
  )
}

// Counts from 0 to n once the number is on screen.
function CountUp({ n, suffix }: { n: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [v, setV] = useState(n)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion() || n === 0) return
    setV(0)
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 900)
        setV(Math.round(n * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [n])
  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  )
}

// Cursor spotlight on the bento cards: writes the pointer position into CSS vars.
function spotlight(e: PointerEvent<HTMLElement>) {
  const card = (e.target as HTMLElement).closest<HTMLElement>('.mk-bento-card')
  if (!card) return
  const r = card.getBoundingClientRect()
  card.style.setProperty('--mx', `${e.clientX - r.left}px`)
  card.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function Brand({ slogan = false }: { slogan?: boolean }) {
  return (
    <a href="#top" className="mk-logo">
      <LogoMark variant="tile" size={slogan ? 40 : 34} />
      <Wordmark slogan={slogan} />
    </a>
  )
}

export function App() {
  useReveal()
  return (
    <>
      <header className="mk-header">
        <div className={`${CONTAINER} mk-header-row`}>
          <Brand />
          <nav className="mk-nav" aria-label="Main">
            <a href="#features" className="mk-link">Features</a>
            <a href="#how" className="mk-link">How it works</a>
            <a href="#plans" className="mk-link">Plans</a>
            <a href="#faq" className="mk-link">FAQ</a>
            <ColorModeToggle />
            <Button as="a" href={ADMIN_URL} size="sm" variant="outline" className="mk-hide-sm">Store login</Button>
            <Button as="a" href="#contact" size="sm" className="mk-shine">Start free</Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mk-hero" id="top">
          <div className="mk-aurora" aria-hidden="true"><i /><i /><i /></div>
          <div className="mk-grid-bg" aria-hidden="true" />
          <div className={`${CONTAINER} mk-hero-grid`}>
            <div>
              <span className="mk-pill mk-in" style={cssVar('--d', '0ms')}>
                <span className="mk-dot" /> Commerce + services, one platform
              </span>
              <h1 className="mk-h1 mk-in" style={cssVar('--d', '80ms')}>
                Everything your customers want to <WordRotator />
              </h1>
              <p className="mk-lead mk-in" style={cssVar('--d', '160ms')}>
                KeenPlaza runs your online store: catalog, stock, pricing, payments, delivery and returns, built for Indian businesses. Your brand, your domain, your Razorpay, your couriers.
              </p>
              <div className="mk-ctas mk-in" style={cssVar('--d', '240ms')}>
                <Button as="a" href="#contact" size="lg" className="mk-shine" iconEnd={<Icon name="chevron" size={18} />}>
                  Start your store
                </Button>
                <Button as="a" href="#features" size="lg" variant="outline" className="mk-glass-btn">See what you get</Button>
              </div>
              <ul className="mk-badges mk-in" style={cssVar('--d', '320ms')}>
                <li><Icon name="pin" size={14} /> Built for India: ₹, GST, WhatsApp</li>
                <li><Icon name="shield" size={14} /> Your data stays yours</li>
                <li><Icon name="zap" size={14} /> Live in a day</li>
              </ul>
            </div>

            <div className="mk-hero-visual mk-in" style={cssVar('--d', '200ms')}>
              <div className="mk-float mk-float-a" aria-hidden="true">
                <span className="mk-float-ic mk-ic-green"><Icon name="wallet" size={16} /></span>
                <span><b>₹31,099</b><small>Paid via UPI</small></span>
              </div>
              <div className="mk-float mk-float-b" aria-hidden="true">
                <span className="mk-float-ic mk-ic-orange"><Icon name="truck" size={16} /></span>
                <span><b>AWB booked</b><small>Blue Dart · 2 days</small></span>
              </div>
              <div className="mk-order mk-glass">
                <div className="mk-order-head">
                  <div>
                    <small>Order</small>
                    <b>#1C162AB9</b>
                  </div>
                  <span className="mk-delivered">Delivered</span>
                </div>
                <ol className="mk-steps">
                  {ORDER.map((step, i) => (
                    <li key={step} style={cssVar('--i', i)}>
                      <i><Icon name="check" size={10} /></i>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mk-order-note">Every step recorded, visible to you and the customer.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mk-marquee" aria-label="Built for every kind of store">
          <div className="mk-marquee-track">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 || undefined}>
                {STORE_TYPES.map((t) => (
                  <li key={t}><span className="mk-dot mk-dot-static" />{t}</li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        <section className="mk-section" id="features">
          <div className={CONTAINER}>
            <div className="mk-head reveal">
              <span className="mk-eyebrow">What a store gets</span>
              <h2 className="mk-h2">Run the whole business <span className="mk-grad">from one admin</span></h2>
              <p className="mk-sub">Every module talks to the others: an order holds stock, prices come from your offers, delivery updates the timeline.</p>
            </div>
            <div className="mk-bento" onPointerMove={spotlight}>
              {FEATURES.map((f, i) => (
                <article key={f.title} className={'mk-bento-card reveal' + (f.size ? ` is-${f.size}` : '')} style={{ transitionDelay: `${(i % 4) * 70}ms` }}>
                  <div className="mk-feature-icon"><Icon name={f.icon} size={22} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                  {f.size === 'big' ? <StoreMock /> : null}
                  {f.size === 'wide' ? <RouteMock /> : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-stats-wrap">
          <div className={`${CONTAINER} mk-stats`}>
            {STATS.map((s, i) => (
              <div key={s.label} className="mk-stat reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <b className="mk-grad"><CountUp n={s.n} suffix={s.suffix} /></b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mk-section" id="how">
          <div className={CONTAINER}>
            <div className="mk-head mk-head-center reveal">
              <span className="mk-eyebrow">How it works</span>
              <h2 className="mk-h2">From a phone call to your first order</h2>
            </div>
            <ol className="mk-how reveal">
              {STEPS.map((s, i) => (
                <li key={s.title} style={cssVar('--i', i)}>
                  <span className="mk-how-num"><Icon name={s.icon} size={22} /></span>
                  <small>Step {i + 1}</small>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mk-section mk-section-alt" id="plans">
          <div className={CONTAINER}>
            <div className="mk-head mk-head-center reveal">
              <span className="mk-eyebrow">Plans</span>
              <h2 className="mk-h2">Start free, pay when you grow</h2>
            </div>
            <div className="mk-plans">
              {PLANS.map((p, i) => (
                <div key={p.name} className={'mk-plan reveal' + (p.featured ? ' is-featured' : '')} style={{ transitionDelay: `${i * 90}ms` }}>
                  {p.featured ? <span className="mk-plan-flag">Most popular</span> : null}
                  <b className="mk-plan-name">{p.name}</b>
                  <div className="mk-plan-price">
                    {p.price}
                    {p.per ? <small>{p.per}</small> : null}
                  </div>
                  <p className="mk-plan-blurb">{p.blurb}</p>
                  <ul>
                    {p.points.map((pt) => (
                      <li key={pt}><Icon name="check" size={14} /> {pt}</li>
                    ))}
                  </ul>
                  <Button as="a" href="#contact" variant={p.featured ? 'primary' : 'outline'} className={'mt-auto' + (p.featured ? ' mk-shine' : '')}>
                    {p.price === 'Talk to us' ? 'Contact us' : 'Get started'}
                  </Button>
                </div>
              ))}
            </div>
            <p className="mk-note">Plan prices are indicative until billing launches; every store starts on Starter.</p>
          </div>
        </section>

        <section className="mk-section" id="faq">
          <div className={`${CONTAINER} mk-faq`}>
            <div className="reveal">
              <span className="mk-eyebrow">Questions</span>
              <h2 className="mk-h2">Before you start</h2>
              <p className="mk-sub">Anything else? Ask on the form below and we answer on WhatsApp.</p>
            </div>
            <div className="mk-faq-list">
              {FAQ.map((f, i) => (
                <details key={f.q} className="mk-faq-item reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                  <summary>{f.q}<span className="mk-faq-plus" aria-hidden="true" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section" id="contact">
          <div className={CONTAINER}>
            <div className="mk-cta-band reveal">
              <div className="mk-aurora mk-aurora-soft" aria-hidden="true"><i /><i /><i /></div>
              <div className="mk-contact">
                <div>
                  <span className="mk-eyebrow">Talk to us</span>
                  <h2 className="mk-h2">Tell us about your business</h2>
                  <p className="mk-lead">Leave your number. We call back on WhatsApp within a working day, set up your store with you, and you're selling the same week.</p>
                  <ul className="mk-checks">
                    <li><Icon name="check" size={16} /> No card, no setup fee</li>
                    <li><Icon name="check" size={16} /> Your Razorpay, your money</li>
                    <li><Icon name="check" size={16} /> Real people, on WhatsApp</li>
                  </ul>
                </div>
                <LeadForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mk-footer">
        <div className={`${CONTAINER} mk-footer-row`}>
          <Brand slogan />
          <span>© {new Date().getFullYear()} KeenPlaza · Commerce + services super app</span>
          <span className="mk-footer-links">
            <a href="#features">Features</a>
            <a href="#plans">Plans</a>
            <a href={ADMIN_URL}>Store login</a>
          </span>
        </div>
      </footer>
    </>
  )
}

// Little storefront drawing inside the big bento card: tiles rise one by one.
function StoreMock() {
  return (
    <div className="mk-store" aria-hidden="true">
      <div className="mk-store-bar"><i /><i /><i /><span>yourstore.in</span></div>
      <div className="mk-store-hero" />
      <div className="mk-store-grid">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} style={cssVar('--i', n)}><span /><b /><em /></div>
        ))}
      </div>
    </div>
  )
}

// Courier route in the wide bento card: the path draws itself, the truck rides it.
function RouteMock() {
  return (
    <div className="mk-route" aria-hidden="true">
      <svg viewBox="0 0 400 70" preserveAspectRatio="none">
        <path className="mk-route-bg" d="M10 50 C 90 10, 150 70, 210 35 S 330 10, 390 30" />
        <path className="mk-route-line" d="M10 50 C 90 10, 150 70, 210 35 S 330 10, 390 30" pathLength={1} />
      </svg>
      <span className="mk-route-pin mk-route-from">Warehouse</span>
      <span className="mk-route-pin mk-route-to">Customer</span>
      <span className="mk-route-truck"><Icon name="truck" size={16} /></span>
    </div>
  )
}

function LeadForm() {
  const [form, setForm] = useState({ name: '', phone: '', business: '', city: '', message: '' })
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const send = useMutation({ mutationFn: () => leads.create({ ...form, phone: form.phone.replace(/\s+/g, '') }) })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    send.mutate()
  }
  if (send.isSuccess) {
    return (
      <div className="mk-form mk-glass mk-form-done" role="status">
        <div className="mk-tick"><Icon name="check" size={30} /></div>
        <b>Thanks, {form.name.split(' ')[0]}!</b>
        <p className="text-fg-muted">We'll message {form.phone} on WhatsApp within a working day.</p>
      </div>
    )
  }
  const phoneOk = /^\+[1-9]\d{7,14}$/.test(form.phone.replace(/\s+/g, ''))
  return (
    <form className="mk-form mk-glass" onSubmit={submit} id="lead-form">
      <TextField id="lead-name" label="Your name" style={FIELD} value={form.name} onChange={set('name')} required maxLength={120} autoComplete="name" />
      <TextField
        id="lead-phone"
        label="WhatsApp number"
        style={FIELD}
        type="tel"
        value={form.phone}
        onChange={set('phone')}
        placeholder="+91 98765 43210"
        required
        autoComplete="tel"
        hint={form.phone && !phoneOk ? <span className="mk-hint">Include the country code, like +91.</span> : undefined}
      />
      <TextField id="lead-business" label="Business name" style={FIELD} value={form.business} onChange={set('business')} required maxLength={120} autoComplete="organization" />
      <TextField id="lead-city" label="City" style={FIELD} value={form.city} onChange={set('city')} maxLength={80} autoComplete="address-level2" />
      <TextArea id="lead-message" label="What do you sell? (optional)" className="mk-field-full" style={FIELD} rows={3} value={form.message} onChange={set('message')} maxLength={2000} />
      {send.isError ? <div className="mk-error" role="alert">{(send.error as ApiError).message}</div> : null}
      <Button type="submit" size="lg" className="mk-field-full mk-shine" disabled={send.isPending || !form.name || !form.business || !phoneOk}>
        {send.isPending ? 'Sending\u2026' : 'Request a callback'}
      </Button>
      <small className="mk-field-full mk-form-foot">We use your number only to call you back about KeenPlaza.</small>
    </form>
  )
}
