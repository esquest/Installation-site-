import { createRoot } from 'react-dom/client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Copy, Lock, LockOpen, RotateCcw, Star, X, Dices } from 'lucide-react'
import { REPS, TRACKS, REELS, REFS, REF_TAGS, type Rep } from './data'
import { createWall } from './scene'
import EsqRep from './demo/EsqRep'
import './styles.css'

const KEY = 'esq-deck-hung-v2'
const STAR_KEY = 'esq-deck-stars-v1'
const load = (k: string): string[] => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } }
const save = (k: string, v: string[]) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private window */ } }
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key) } catch { setCopied('select:' + key) }
    setTimeout(() => setCopied(null), 1600)
  }
  return { copied, copy }
}

function CopyButton({ id, text, label = 'Copy prompt', solid = false }: { id: string; text: string; label?: string; solid?: boolean }) {
  const { copied, copy } = useCopy()
  const ok = copied === id
  const failed = copied === 'select:' + id
  return (
    <button type="button" className={'btn' + (solid ? ' btn--solid' : '')} onClick={() => copy(id, text)}>
      {ok ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      <span>{ok ? 'Copied' : failed ? 'Select the text and copy it' : label}</span>
    </button>
  )
}

function Wall({ hung, selected, onSelect, api }: { hung: Set<string>; selected: string | null; onSelect: (id: string) => void; api: React.MutableRefObject<ReturnType<typeof createWall> | null> }) {
  const host = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!host.current || api.current) return
    let cancelled = false
    const fonts = Promise.all([document.fonts.load('700 64px "Bricolage Grotesque"'), document.fonts.load('700 58px "Kalam"')]).catch(() => null)
    const timeout = new Promise((r) => setTimeout(r, 1500))
    Promise.race([fonts, timeout]).then(() => {
      if (cancelled || !host.current || api.current) return
      try { api.current = createWall(host.current, REPS, { hung, reduced, onSelect }) } catch { setFailed(true) }
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { api.current?.select(selected) }, [selected, api])
  return (
    <div className="wall" ref={host} aria-label="Gallery wall of reps. Each template is a rep; the list below has the same reps.">
      <p className="wall__hint">Drag to look around. Tap a template.</p>
      {failed && <p className="wall__fallback">This browser can’t draw the 3D wall. Every rep is in the list below.</p>}
    </div>
  )
}

function Panel({ rep, hung, onClose, onToggle, onStep }: { rep: Rep; hung: boolean; onClose: () => void; onToggle: () => void; onStep: (d: number) => void }) {
  return (
    <aside className="panel" aria-label={`Rep ${rep.id}`}>
      <div className="panel__top">
        <span className="panel__id">{rep.id}</span>
        <span className="panel__track">{TRACKS[rep.track].name}</span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>
      <h3 className="panel__title">{rep.t}</h3>
      <p className="panel__meta"><span>{rep.min} min</span><span className="dot" aria-hidden /> <span>{rep.skill}</span></p>
      <p className="panel__why">{rep.why}</p>
      <pre className="prompt"><code>{rep.p}</code></pre>
      <div className="panel__actions">
        <CopyButton id={'p-' + rep.id} text={rep.p} />
        <button type="button" className={'btn btn--hang' + (hung ? ' is-hung' : '')} onClick={onToggle}>
          {hung ? <RotateCcw size={16} aria-hidden /> : <Check size={16} aria-hidden />}
          <span>{hung ? 'Take it down' : 'Hang it'}</span>
        </button>
      </div>
      <div className="panel__step">
        <button type="button" className="icon-btn" onClick={() => onStep(-1)} aria-label="Previous rep"><ChevronLeft size={18} /></button>
        <button type="button" className="icon-btn" onClick={() => onStep(1)} aria-label="Next rep"><ChevronRight size={18} /></button>
      </div>
    </aside>
  )
}

function DemoBlock() {
  const [run, setRun] = useState(0)
  const [touch, setTouch] = useState(false)
  useEffect(() => { setTouch(matchMedia('(pointer: coarse)').matches) }, [])
  return (
    <div className="demo">
      <div className="demo__stage"><EsqRep key={run} touch={touch} /></div>
      <div className="demo__foot">
        <p>Example run: you send a prompt, Claude asks one question, makes three fixes to a page and commits them on a branch.</p>
        <button type="button" className="btn" onClick={() => setRun((n) => n + 1)}><RotateCcw size={16} aria-hidden /><span>Replay</span></button>
      </div>
    </div>
  )
}

type ReelKey = keyof typeof REELS
const REEL_KEYS: ReelKey[] = ['medium', 'influence', 'twist']
const REEL_LABEL: Record<ReelKey, string> = { medium: 'Make', influence: 'Shaped by', twist: 'Where it' }

function Reel({ k, value, spinning, locked, onLock, delay }: { k: ReelKey; value: number; spinning: boolean; locked: boolean; onLock: () => void; delay: number }) {
  const list = REELS[k]
  const H = 64
  const strip = [...list, ...list, ...list]
  const target = list.length + value
  return (
    <div className={'reel' + (locked ? ' is-locked' : '')}>
      <span className="reel__label">{REEL_LABEL[k]}</span>
      <div className="reel__window">
        <div className="reel__strip" style={{ transform: `translateY(${-target * H}px)`, transitionDuration: spinning && !locked && !reduced ? `${900 + delay}ms` : '0ms' }}>
          {strip.map((w, i) => <span key={i} className="reel__item">{w}</span>)}
        </div>
      </div>
      <button type="button" className="reel__lock" onClick={onLock} aria-pressed={locked}>
        {locked ? <Lock size={14} aria-hidden /> : <LockOpen size={14} aria-hidden />}<span>{locked ? 'Locked' : 'Lock'}</span>
      </button>
    </div>
  )
}

function StudioLab() {
  const [vals, setVals] = useState<Record<ReelKey, number>>({ medium: 0, influence: 7, twist: 5 })
  const [locks, setLocks] = useState<Record<ReelKey, boolean>>({ medium: false, influence: false, twist: false })
  const [spinning, setSpinning] = useState(false)
  const [round, setRound] = useState(0)
  const [tag, setTag] = useState('All')
  const [stars, setStars] = useState<string[]>(() => load(STAR_KEY))

  const spin = () => {
    setSpinning(true)
    setVals((v) => {
      const next = { ...v }
      for (const k of REEL_KEYS) if (!locks[k]) { let n = v[k]; while (n === v[k]) n = Math.floor(Math.random() * REELS[k].length); next[k] = n }
      return next
    })
    setRound((r) => r + 1)
    setTimeout(() => setSpinning(false), reduced ? 0 : 1500)
  }

  const sentence = `A studio that makes ${REELS.medium[vals.medium]}, shaped by ${REELS.influence[vals.influence]}, where every project ${REELS.twist[vals.twist]}.`
  const prompt = `Use the brainstorming skill. Help me shape a creative studio: ${sentence} Ask me one question at a time, then give me a name shortlist, a one-line pitch, three first projects, and five references to study.`

  const toggleStar = (n: string) => setStars((s) => { const next = s.includes(n) ? s.filter((x) => x !== n) : [...s, n]; save(STAR_KEY, next); return next })
  const shown = REFS.filter((r) => tag === 'All' || r.tags.includes(tag))
  const board = `Make me a moodboard brief that mixes ${stars.join(', ')}. For each, name the one move I should borrow. Then suggest a palette, two typefaces and three first sketches for my studio.`

  return (
    <>
      <div className="machine" data-round={round}>
        <div className="reels">
          {REEL_KEYS.map((k, i) => (
            <Reel key={k} k={k} value={vals[k]} spinning={spinning} locked={locks[k]} delay={i * 250} onLock={() => setLocks((l) => ({ ...l, [k]: !l[k] }))} />
          ))}
        </div>
        <button type="button" className="lever" onClick={spin} disabled={spinning}>
          <Dices size={22} aria-hidden /><span>{spinning ? 'Spinning' : 'Spin an idea'}</span>
        </button>
        <div className="idea" aria-live="polite">
          <p className="idea__line">{sentence}</p>
          <pre className="prompt"><code>{prompt}</code></pre>
          <CopyButton id="idea" text={prompt} label="Copy brainstorm prompt" solid />
        </div>
      </div>

      <div className="refs-head">
        <h3>Reference wall</h3>
        <p>Designers, artists and movements worth stealing from. Pin the ones you like and Claude will mix them into a moodboard brief.</p>
      </div>
      <div className="chips" role="group" aria-label="Filter references">
        {REF_TAGS.map((t) => <button type="button" key={t} className="chip" aria-pressed={tag === t} onClick={() => setTag(t)}>{t}</button>)}
      </div>
      <div className="refs">
        {shown.map((r, i) => (
          <article key={r.name} className="ref" data-tone={i % 5}>
            <header>
              <h4>{r.name}</h4>
              <button type="button" className="icon-btn ref__pin" aria-pressed={stars.includes(r.name)} aria-label={(stars.includes(r.name) ? 'Unpin ' : 'Pin ') + r.name} onClick={() => toggleStar(r.name)}>
                <Star size={18} fill={stars.includes(r.name) ? 'currentColor' : 'none'} aria-hidden />
              </button>
            </header>
            <p className="ref__who">{r.who}</p>
            <p className="ref__look">{r.look}</p>
            <div className="ref__foot">
              <span className="ref__tags">{r.tags.join(' · ')}</span>
              <CopyButton id={'r-' + r.name} text={`Show me how ${r.name} (${r.who}) would approach my studio's next project. List 5 moves I can borrow and 1 I shouldn't copy.`} label="Ask Claude" />
            </div>
          </article>
        ))}
      </div>
      <div className="tray" data-empty={stars.length === 0 || undefined}>
        {stars.length === 0 ? (
          <p>Pin two or three references to build a moodboard prompt.</p>
        ) : (
          <>
            <p><b>{stars.length} pinned:</b> {stars.join(', ')}</p>
            <CopyButton id="board" text={board} label="Copy moodboard prompt" solid />
          </>
        )}
      </div>
    </>
  )
}

function App() {
  const [hung, setHung] = useState<Set<string>>(() => new Set(load(KEY)))
  const [selected, setSelected] = useState<string | null>(null)
  const api = useRef<ReturnType<typeof createWall> | null>(null)
  const rep = useMemo(() => REPS.find((r) => r.id === selected) ?? null, [selected])
  const next = REPS.find((r) => !hung.has(r.id))

  const toggle = (id: string) => {
    setHung((h) => {
      const n = new Set(h)
      const on = !n.has(id)
      on ? n.add(id) : n.delete(id)
      save(KEY, [...n])
      api.current?.setHung(id, on)
      return n
    })
  }
  const step = (d: number) => {
    const i = REPS.findIndex((r) => r.id === selected)
    setSelected(REPS[(i + d + REPS.length) % REPS.length]!.id)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="top">
        <span className="wordmark">Esquest <em>Skill Deck</em></span>
        <span className="tally"><b>{hung.size}</b>/{REPS.length} hung</span>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <h1>Hang what you learn.</h1>
          <p>Every rep is a paper template taped to the wall. Do the rep, press Hang it, and it turns into a framed piece. Click any template to open it.</p>
          {next && <button type="button" className="btn btn--solid btn--big" onClick={() => { setSelected(next.id); document.querySelector('.wall-wrap')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }) }}>Start with {next.id}: {next.t}</button>}
        </div>
        <div className="wall-wrap">
          <Wall hung={hung} selected={selected} onSelect={setSelected} api={api} />
          {rep && <Panel rep={rep} hung={hung.has(rep.id)} onClose={() => setSelected(null)} onToggle={() => toggle(rep.id)} onStep={step} />}
        </div>
      </section>

      <section className="band band--how">
        <div className="inner how">
          <div className="how__copy">
            <h2>How a rep works</h2>
            <p>Copy the prompt, paste it into Claude Code, answer its questions, and let it do the work. When it’s done, come back and hang the frame.</p>
          </div>
          <DemoBlock />
        </div>
      </section>

      <section className="band">
        <div className="inner">
          <h2>All reps</h2>
          <div className="tracks">
            {(['A', 'C'] as const).map((t) => (
              <div key={t} className="track">
                <h3>{TRACKS[t].name}</h3>
                <p>{TRACKS[t].blurb}</p>
                <ul>
                  {REPS.filter((r) => r.track === t).map((r) => (
                    <li key={r.id} className={hung.has(r.id) ? 'is-hung' : ''}>
                      <input type="checkbox" id={'chk-' + r.id} checked={hung.has(r.id)} onChange={() => toggle(r.id)} />
                      <label htmlFor={'chk-' + r.id}><span className="li__id">{r.id}</span> {r.t}</label>
                      <span className="li__min">{r.min} min</span>
                      <button type="button" className="link" onClick={() => { setSelected(r.id); document.querySelector('.wall-wrap')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }) }}>Open</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="note">More tracks are coming. Your progress is saved in this browser only.</p>
        </div>
      </section>

      <section className="band band--lab" id="lab">
        <div className="inner">
          <h2>Studio Lab</h2>
          <p className="lede">Shape the creative studio you want to run. Spin for a starting idea, lock what you like, spin again, then hand it to Claude.</p>
          <StudioLab />
        </div>
      </section>

      <footer className="foot">Esquest Skill Deck. Built with Claude Code, three.js and Stageshow.</footer>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
