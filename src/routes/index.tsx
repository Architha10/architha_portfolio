import { createFileRoute } from '@tanstack/react-router'
import {
  useEffect, useRef, useState,
  type AnchorHTMLAttributes, type CSSProperties, type MouseEvent,
  type PointerEvent, type ReactNode,
} from 'react'
import {
  type Cert, certs, experience, liveProjects, otherProjects,
  profile, skills, stats, ticker,
} from '#/assets/portfolio'

/* Runs before first paint so the saved / system theme never flashes. */
const themeScript = `try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t}catch(e){}`

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Architha Chiluvoju — Full-Stack Developer' },
      { name: 'description', content: 'Full-stack developer (Java Spring Boot, React, PostgreSQL) building secure enterprise systems: RBAC, document management and applicant tracking.' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap' },
    ],
    scripts: [{ children: themeScript }],
  }),
  component: Home,
})

/* ---------------- helpers ---------------- */

/* --d = hero entrance delay step, --i = section stagger step (used by the CSS) */
const delay = (n: number) => ({ '--d': n }) as CSSProperties
const idx = (n: number) => ({ '--i': n }) as CSSProperties

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------- hooks ---------------- */

type Theme = 'dark' | 'light'
type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> }
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')
  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) || 'dark')
  }, [])

  /* Switches theme with a circular reveal that expands from the clicked button. */
  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    const apply = () => {
      root.dataset.theme = next
      try { localStorage.setItem('theme', next) } catch { /* storage unavailable */ }
      setTheme(next)
    }

    const doc = document as ViewTransitionDoc
    if (!doc.startViewTransition || prefersReducedMotion()) return apply()

    const x = e.clientX
    const y = e.clientY
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    root.classList.add('vt')
    const transition = doc.startViewTransition(apply)
    transition.ready.then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' },
      ),
    ).catch(() => {})
    transition.finished.finally(() => root.classList.remove('vt'))
  }
  return { theme, toggle }
}

function useScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      if (bar.current) bar.current.style.width = `${max > 0 ? (h.scrollTop / max) * 100 : 0}%`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return bar
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [ids])
  return active
}

/* Threshold is low on purpose: tall sections on phones may never reach 15% visible. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect() }
    }, { threshold: 0.08 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen] as const
}

/* Element drifts toward the cursor. Disabled on touch and reduced motion. */
function useMagnet<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(pointer: coarse)').matches || prefersReducedMotion()) return
    const move = (e: globalThis.PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--tx', `${(e.clientX - r.left - r.width / 2) * strength}px`)
      el.style.setProperty('--ty', `${(e.clientY - r.top - r.height / 2) * strength}px`)
    }
    const reset = () => { el.style.removeProperty('--tx'); el.style.removeProperty('--ty') }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', reset)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', reset)
    }
  }, [strength])
  return ref
}

/* ---------------- small components ---------------- */

function MagnetA({ strength, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { strength?: number }) {
  const ref = useMagnet<HTMLAnchorElement>(strength)
  return <a ref={ref} {...props} />
}

function Reveal({ id, children }: { id?: string; children: ReactNode }) {
  const [ref, seen] = useInView<HTMLElement>()
  return (
    <section id={id} ref={ref} className={`sec reveal ${seen ? 'in' : ''}`}>
      <div className="wrap">{children}</div>
    </section>
  )
}

/* The headline slides up from behind a mask once its section enters the viewport. */
function Heading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div className="label">{label}</div>
      <h2><span className="mask"><span className="mask-in">{children}</span></span></h2>
    </>
  )
}

function Stat({ num, label }: { num: string; label: string }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const target = parseInt(num, 10)
  const suffix = num.replace(/\d+/, '')
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!seen) return
    if (prefersReducedMotion()) { setN(target); return }
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 1200, 1)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, target])
  return (
    <div ref={ref} className="stat">
      <b>{n}{suffix}</b>
      <span>{label}</span>
    </div>
  )
}

const Line = ({ i = 0, children }: { i?: number; children: ReactNode }) => (
  <div style={{ paddingLeft: i * 20 }}>{children}</div>
)

const icon = { className: 'ic', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const DownloadIcon = () => <svg {...icon}><path d="M12 3v12m0 0-4-4m4 4 4-4M4 20h16" /></svg>
const SunIcon = () => <svg {...icon} width={18} height={18}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" /></svg>
const MoonIcon = () => <svg {...icon} width={18} height={18}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
const CopyIcon = () => <svg {...icon}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
const CheckIcon = () => <svg {...icon}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>

/* What the work actually covers, taken from the three shipped systems. */
const pillars = [
  {
    title: 'Access & identity',
    text: 'Role-based access, JWT sessions and OTP login, with petitions and audit trails so every permission change is approved and recorded.',
    icon: <svg {...icon}><path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3z" /><path d="m9 12 2 2 4-4" /></svg>,
  },
  {
    title: 'Documents & workflows',
    text: 'Multi-level approvals, version control and an in-house storage layer that replaced a paid service and cut storage costs by 60%.',
    icon: <svg {...icon}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>,
  },
  {
    title: 'Notifications & pipelines',
    text: 'Schedulers and Node.js services that reach people on WhatsApp, SMS, calls, Zoom and Meet, plus a resume parser feeding a hiring pipeline.',
    icon: <svg {...icon}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>,
  },
]

/* Email as a link, with a one-tap copy that confirms in place. */
function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setDone(true)
      setTimeout(() => setDone(false), 1800)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }
  return (
    <>
      <a className="inline" href={`mailto:${email}`}>{email}</a>
      <button type="button" className={`copy ${done ? 'done' : ''}`} onClick={copy} aria-label="Copy email address">
        {done ? <CheckIcon /> : <CopyIcon />}
      </button>
      <span className="sr" role="status">{done ? 'Email copied' : ''}</span>
    </>
  )
}

/* Shows the site screenshot; falls back to a skeleton if it fails to load. */
function Shot({ srcs, host, alt }: { srcs: string[]; host: string; alt: string }) {
  const [i, setI] = useState(0)
  return (
    <div className="mock">
      <div className="mock-bar"><i /><i /><i /><span>{host}</span></div>
      {i < srcs.length ? (
        <img className="shot" src={srcs[i]} alt={alt} loading="lazy" onError={() => setI(i + 1)} />
      ) : (
        <div className="mock-body"><b /><b /><b /><u /></div>
      )}
    </div>
  )
}

/* Compact credential row: seal (or thumbnail for image certificates) · title · issuer · open link. */
function CertCard({ c }: { c: Cert }) {
  return (
    <a
      className="card cert-card spot"
      href={c.file}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View certificate: ${c.name}`}
    >
      {c.preview
        ? <img className="cert-thumb" src={c.preview} alt="" loading="lazy" />
        : <span className="seal" aria-hidden>{c.issuer.charAt(0)}</span>}
      <div className="cert-info">
        <h3>{c.name}</h3>
        <div className="issuer"><b>{c.issuer}</b> · {c.kind}</div>
      </div>
      <span className="cert-go" aria-hidden>↗</span>
    </a>
  )
}

/* ---------------- page ---------------- */

const NAV = ['about', 'skills', 'experience', 'projects', 'certifications', 'contact']
const SECTIONS = ['top', ...NAV] // 'top' lets the nav clear its highlight while on the hero

function Home() {
  const { theme, toggle } = useTheme()
  const progress = useScrollProgress()
  const active = useActiveSection(SECTIONS)
  const tilt = useRef<HTMLDivElement>(null)

  /* one handler gives every .spot card its cursor spotlight */
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('.spot')
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  const tiltMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tilt.current
    if (!el || prefersReducedMotion()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
  }
  const tiltReset = () => { if (tilt.current) tilt.current.style.transform = '' }

  return (
    <div className="pf" onPointerMove={onPointerMove}>
      <div ref={progress} className="progress" />
      <div className="amb" />

      <nav className="nav">
        <div className="nav-in">
          <a href="#top" className="logo">Architha<i>.</i></a>
          <div className="links">
            {NAV.map((s) => (
              <a key={s} href={`#${s}`} className={active === s ? 'on' : ''}>
                {s[0].toUpperCase() + s.slice(1)}
              </a>
            ))}
          </div>
          <div className="nav-r">
            <MagnetA className="nav-cta" href={profile.resumeHref} download strength={0.3}>
              <DownloadIcon />Resume
            </MagnetA>
            <button type="button" className="toggle" onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </nav>

      <header id="top" className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="avail rise" style={delay(0)}><i />Open to full-stack roles · {profile.location}</div>
              <h1 className="rise" style={delay(1)}>Architha <em>Chiluvoju</em></h1>
              <div className="role rise" style={delay(2)}>
                Full-Stack Developer — <b>Spring Boot</b> · <b>React</b> · <b>PostgreSQL</b>
              </div>
              <p className="lede rise" style={delay(3)}>{profile.lede}</p>
              <div className="cta rise" style={delay(4)}>
                <MagnetA className="btn primary" href={profile.resumeHref} download>
                  <DownloadIcon />Download resume
                </MagnetA>
                <MagnetA className="btn" href="#projects">View my work →</MagnetA>
              </div>
            </div>

            {/* the wrapper carries the entrance; the inner card keeps the cursor tilt */}
            <div className="rise" style={delay(3)}>
              <div ref={tilt} className="card code-card" onPointerMove={tiltMove} onPointerLeave={tiltReset}>
                <div className="win"><i /><i /><i /><span>architha.ts</span></div>
                <div className="code">
                  <Line><span className="c">// who I am</span></Line>
                  <Line><span className="k">const</span> architha = {'{'}</Line>
                  <Line i={1}>role: <span className="k">'Full-Stack Developer'</span>,</Line>
                  <Line i={1}>stack: [<span className="k">'Spring Boot'</span>, <span className="k">'React'</span>, <span className="k">'PostgreSQL'</span>],</Line>
                  <Line i={1}>focus: <span className="k">'RBAC · Documents · Workflows'</span>,</Line>
                  <Line i={1}>experience: <span className="k">'3 years'</span>,</Line>
                  <Line i={1}>available: <span className="k">true</span>,</Line>
                  <Line>{'}'}</Line>
                </div>
              </div>
            </div>
          </div>

          <div className="ticker rise" style={delay(6)} aria-hidden>
            <div className="track">
              {[...ticker, ...ticker].map((t, i) => <span key={i}>{t}</span>)}
            </div>
          </div>
        </div>
      </header>

      <Reveal id="about">
        <Heading label="01 — About">Software that <em>enterprises</em> trust.</Heading>
        <div className="about">
          <div className="st" style={idx(0)}>
            <p className="about-lead">Three years building the systems organizations actually run on.</p>
            <p>At Ada Insys I worked across the stack — Spring Boot and Spring Security on the backend, React and React Query on the front — shipping platforms for role management, document handling and applicant tracking.</p>
            <p>I'm strongest in the quiet, critical layer: authentication, permissions, audit trails and notification pipelines. I replaced a paid third-party document service with an internal API layer and cut storage costs by 60%.</p>
            <p>Beyond client work, I design and ship complete websites end to end — two of them are <a className="inline" href="#projects">live below</a>.</p>
          </div>
          <dl className="card facts st" style={idx(1)}>
            <div><dt>Based in</dt><dd>{profile.location}</dd></div>
            <div><dt>Role</dt><dd>Full-Stack Developer</dd></div>
            <div><dt>Experience</dt><dd>Oct 2022 – Sep 2025</dd></div>
            <div><dt>Education</dt><dd>B.Tech IT — JNTUH, 2021</dd></div>
            <div><dt>Status</dt><dd><i className="dot" />Open to roles &amp; freelance</dd></div>
            <div><dt>Email</dt><dd><CopyEmail email={profile.email} /></dd></div>
          </dl>
        </div>

        <div className="pillars">
          {pillars.map((p, k) => (
            <div key={p.title} className="st" style={idx(k + 2)}>
              <div className="card pillar spot">
                <span className="pillar-ic">{p.icon}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="stats card spot st" style={idx(5)}>
          {stats.map((s) => <Stat key={s.label} {...s} />)}
        </div>
      </Reveal>

      <Reveal id="skills">
        <Heading label="02 — Toolkit">The stack I <em>reach for.</em></Heading>
        <div className="skills" style={{ marginTop: 0 }}>
          {skills.map((g, k) => (
            <div key={g.title} className="st" style={idx(k)}>
              <div className="card skill spot">
                <h3>{g.title}</h3>
                <div className="chips">{g.items.map((i) => <span key={i}>{i}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal id="experience">
        <Heading label="03 — Experience">Systems I've <em>shipped.</em></Heading>
        <div className="job st" style={idx(0)}>
          <h3>Software Developer · Ada Insys Pvt Ltd</h3>
          <span>Oct 2022 — Sep 2025 · Hyderabad</span>
        </div>
        {experience.map((e, k) => (
          <article className="entry st" style={idx(k + 1)} key={e.id}>
            <div className="no">{e.id}</div>
            <div>
              <h4>{e.title}</h4>
              <div className="sub">{e.sub}</div>
              <ul>{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
              <div className="chips">{e.stack.map((s) => <span key={s}>{s}</span>)}</div>
            </div>
          </article>
        ))}
      </Reveal>

      <Reveal id="projects">
        <Heading label="04 — Selected work">Live on the <em>web.</em></Heading>
        <div className="projs">
          {liveProjects.map((p, k) => (
            <div key={p.name} className="st" style={idx(k)}>
              <a className="card proj spot" href={p.url} target="_blank" rel="noopener noreferrer">
                <Shot srcs={[p.image]} host={new URL(p.url).host} alt={`${p.name} website screenshot`} />
                <div className="meta">
                  <h3>{p.name}<span className="live">LIVE</span></h3>
                  <p>{p.desc}</p>
                  <div className="chips" style={{ marginBottom: 20 }}>{p.tags.map((x) => <span key={x}>{x}</span>)}</div>
                  <span className="visit">Visit site</span>
                </div>
              </a>
            </div>
          ))}
        </div>
        <div className="more">
          {otherProjects.map((p, k) => (
            <div key={p.name} className="st" style={idx(k)}><b>{p.name}</b><span>{p.desc}</span></div>
          ))}
        </div>
      </Reveal>

      <Reveal id="certifications">
        <Heading label="05 — Learning">Certifications &amp; <em>credentials.</em></Heading>
        <div className="certs">
          {certs.map((c, k) => (
            <div key={c.name} className="st" style={idx(k)}>
              <CertCard c={c} />
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal id="contact">
        <div className="card contact spot st">
          <div className="label" style={{ position: 'relative' }}>06 — Contact</div>
          <h2><span className="mask"><span className="mask-in">Let's build something <em>reliable.</em></span></span></h2>
          <p>Open to full-stack roles and freelance builds. Reach out by email or grab my resume.</p>
          <div className="cta">
            <MagnetA className="btn primary" href={`mailto:${profile.email}`}>Email me →</MagnetA>
            <MagnetA className="btn" href={profile.resumeHref} download><DownloadIcon />Resume</MagnetA>
            <MagnetA className="btn" href={profile.phoneHref}>{profile.phone}</MagnetA>
          </div>
        </div>
      </Reveal>

      <footer className="foot">© {new Date().getFullYear()} {profile.name}</footer>
    </div>
  )
}