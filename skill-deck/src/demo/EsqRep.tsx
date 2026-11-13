import { Bar, Check, Collapse, Field, Phone, Stage, Text, Window, type Act } from '../../kit'
import './rep.css'

// One rep, start to finish, in Claude Code: the owner sends the rep's
// prompt; Claude asks one multiple-choice question; it reads the site, then
// works through three fixes in turn; Commit on a branch confirms on itself.
// Copied from ai-cards: the card opens in the thread, the answered question
// stays as the record, the button changes on itself.
//
// Real strings: the prompt, the question, three choices, the reading line,
// three fixes, the button.

const CHOICES = ['More booking texts', 'Sharper look', 'Faster on phones']
const FIXES = ['Text-a-photo button above the fold', 'Bigger tap target on the phone number', 'Service list readable on phones']

type S = { pick: number | null; phase: 'ask' | 'read' | 'fix'; done: number; commit: 'idle' | 'busy' | 'done' }

const initial: S = { pick: null, phase: 'ask', done: 0, commit: 'idle' }
const poster: S = { pick: 0, phase: 'fix', done: 3, commit: 'done' }

async function script(a: Act<S>) {
  await a.wait(1000)
  a.mark('pick')
  await a.click({ at: 'choice-0', x: 0.85, y: 0.7 })
  a.put({ pick: 0 })
  await a.wait(500)
  a.mark('read')
  a.put({ phase: 'read' })
  await a.wait(1300)
  a.mark('fixes')
  a.put({ phase: 'fix' })
  await a.wait(900)
  for (let i = 1; i <= FIXES.length; i++) {
    a.put({ done: i })
    await a.wait(650)
  }
  await a.wait(300)
  a.mark('commit')
  await a.click({ at: 'commit', x: 0.78, y: 0.7 })
  a.put({ commit: 'busy' })
  await a.wait(1100)
  a.mark('done')
  a.put({ commit: 'done' })
  await a.move({ wide: { x: 540, y: 430 }, compact: { x: 320, y: 400 } })
  await a.wait(2600)
}

function Thread({ s }: { s: S }) {
  return (
    <div className="esr-thread">
              {[[150, '72%', '50%']].map(([q, a1, a2], i) => (
                <div className="esr-past" key={i}>
                  <Bar w={q!} h={30} r={15} tone={1} className="esr-past-q" />
                  <Bar w={a1!} h={8} r={4} tone={2} />
                  <Bar w={a2!} h={8} r={4} tone={2} />
                </div>
              ))}
              <div className="esr-q"><Text>/impeccable audit index.html</Text></div>
              <div className="esr-a">
                <Text className="esr-line">What should the fixes go after first?</Text>
                <div className="esr-choices" data-answered={s.pick !== null || undefined}>
                  {CHOICES.map((c, i) => (
                    <span key={c} className="esr-choice" data-target={`choice-${i}`} data-cursor="pointer" data-on={s.pick === i || undefined}>
                      <span className="esr-choice__mark"><Check on={s.pick === i} size={14} /></span>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="esr-reply">
                <Collapse open={s.phase === 'read'}>
                  <Text className="esr-thinking">Reading index.html</Text>
                </Collapse>
                <Collapse open={s.phase === 'fix'} reveal="drop">
                  <div className="esr-a">
                    <Text className="esr-line">Three fixes, ranked by bookings:</Text>
                    <div className="esr-fixes">
                      {FIXES.map((f, i) => (
                        <span key={f} className="esr-fix" data-wait={s.done <= i || undefined}>
                          <Check on={s.done > i} pending={s.done === i} size={16} />
                          <span className="esr-fix__text">{f}</span>
                        </span>
                      ))}
                      <span className="esr-book" data-target="commit" data-cursor="pointer" data-ready={s.done >= FIXES.length ? '' : undefined} data-done={s.commit === 'done' || undefined}>
                        <span className="esr-layer" data-on={s.done < FIXES.length || undefined}>Fixing</span>
                        <span className="esr-layer" data-on={(s.done >= FIXES.length && s.commit === 'idle') || undefined}>Commit on a branch</span>
                        <span className="esr-layer" data-on={s.commit === 'busy' || undefined}><Check on={false} pending size={16} /></span>
                        <span className="esr-layer" data-on={s.commit === 'done' || undefined}><Check on={s.commit === 'done'} size={16} />Committed</span>
                      </span>
                    </div>
                  </div>
                </Collapse>
              </div>
            </div>
  )
}

export default function EsqRep({ touch = false }: { touch?: boolean }) {
  return (
    <Stage width={600} height={540} compact={{ below: 560, width: 358, height: 420 }} initial={initial} poster={poster} script={script} play="once" cursor={{ at: { wide: { x: 540, y: 430 }, compact: { x: 320, y: 400 } }, style: touch ? 'touch' : 'real' }} className="esr" accent="#C96442">
      {(s, _rect, layout) =>
        layout === 'compact' ? (
          <Phone width={326} className="esr-phone">
            <div className="esr-app">
              <div className="esr-apptitle">Claude Code</div>
              <Thread s={s} />
            </div>
          </Phone>
        ) : (
          <Window title="Claude Code" className="esr-win">
            <div className="esr-body">
              <Thread s={s} />
              <Field className="esr-composer" value="" placeholder="Reply to Claude" />
            </div>
          </Window>
        )
      }
    </Stage>
  )
}
