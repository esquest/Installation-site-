import * as THREE from 'three'
import type { Rep } from './data'

// The gallery wall. Every rep is a kraft-paper template taped to a plaster
// wall; hanging a rep peels the template and drops a framed artwork in its
// place. A laser level sweeps the wall on load. Pointer parallax, hover lift,
// click to select. Pauses when offscreen.

type Opts = { hung: Set<string>; reduced: boolean; onSelect: (id: string) => void }

type Item = {
  rep: Rep
  group: THREE.Group
  pivot: THREE.Group
  template: THREE.Mesh
  tapes: THREE.Mesh[]
  frame: THREE.Group
  w: number
  h: number
  baseRot: number
  hover: number
  hung: boolean
  pop: number
}

type Tween = { start: number; dur: number; fn: (t: number) => void; done?: () => void }

const ART = ['#FF5A36', '#FFC21A', '#1FB5D6', '#FF8FB1', '#2F7DF6', '#1C1B19', '#F4F1E8', '#3BB273']
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeBack = (t: number) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const css = (name: string, fallback: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? line + ' ' + w : w
    if (ctx.measureText(next).width > maxW && line) { lines.push(line); line = w } else line = next
  }
  if (line) lines.push(line)
  return lines
}

function kraftTexture(rep: Rep, w: number, h: number) {
  const W = Math.round(420 * w), H = Math.round(420 * h)
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#C8995F'; ctx.fillRect(0, 0, W, H)
  // Paper fibers
  for (let i = 0; i < 900; i++) {
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(90,60,25,.10)' : 'rgba(255,235,200,.10)'
    ctx.lineWidth = Math.random() * 1.4
    const x = Math.random() * W, y = Math.random() * H, a = Math.random() * Math.PI
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); ctx.stroke()
  }
  ctx.fillStyle = '#3A2614'
  ctx.font = '700 76px "Bricolage Grotesque", system-ui, sans-serif'
  ctx.fillText(rep.id, 34, 100)
  // Nail mark, as an installer pencils it
  ctx.strokeStyle = '#3A2614'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(W / 2 - 12, 40); ctx.lineTo(W / 2 + 12, 64); ctx.moveTo(W / 2 + 12, 40); ctx.lineTo(W / 2 - 12, 64); ctx.stroke()
  ctx.font = '700 58px "Kalam", "Comic Sans MS", cursive'
  const lines = wrap(ctx, rep.t, W - 68)
  lines.forEach((l, i) => ctx.fillText(l, 34, 190 + i * 64))
  // Level line and minutes at the foot
  ctx.globalAlpha = 0.6; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(34, H - 66); ctx.lineTo(W - 34, H - 66); ctx.stroke()
  ctx.globalAlpha = 1
  ctx.font = '700 40px "Kalam", cursive'
  ctx.fillText(`${rep.min} min`, 34, H - 26)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}

function artTexture(kind: number, w: number, h: number) {
  const W = 512, H = Math.round(512 * (h / w))
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d')!
  const [tomato, sun, pool, pink, blue, ink, bone, green] = ART
  switch (kind % 8) {
    case 0: { // Albers: nested squares
      const cols = [sun, tomato, pink, bone]
      cols.forEach((col, i) => { const s = 1 - i * 0.22; x.fillStyle = col; const sw = W * s, sh = H * s; x.fillRect((W - sw) / 2, (H - sh) * 0.75, sw, sh) })
      break
    }
    case 1: { // A pool in flat California light
      x.fillStyle = pool; x.fillRect(0, 0, W, H)
      x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 6; x.lineCap = 'round'
      for (let r = 0; r < 14; r++) { x.beginPath(); for (let i = 0; i <= 40; i++) { const px = (i / 40) * W; const py = (r + 0.5) * (H / 14) + Math.sin(i * 0.7 + r) * 8; i ? x.lineTo(px, py) : x.moveTo(px, py) } x.stroke() }
      x.fillStyle = bone; x.fillRect(0, H * 0.82, W, H * 0.18)
      break
    }
    case 2: { // Memphis
      x.fillStyle = pink; x.fillRect(0, 0, W, H)
      x.fillStyle = sun; x.beginPath(); x.arc(W * 0.7, H * 0.3, W * 0.18, 0, Math.PI * 2); x.fill()
      x.fillStyle = pool; x.beginPath(); x.moveTo(W * 0.15, H * 0.85); x.lineTo(W * 0.45, H * 0.45); x.lineTo(W * 0.6, H * 0.85); x.fill()
      x.strokeStyle = ink; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath()
      for (let i = 0; i <= 30; i++) { const px = W * 0.1 + (i / 30) * W * 0.8; const py = H * 0.18 + Math.sin(i * 1.1) * 18; i ? x.lineTo(px, py) : x.moveTo(px, py) } x.stroke()
      x.fillStyle = ink; for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(W * 0.66 + (i % 6) * 22, H * 0.62 + Math.floor(i / 6) * 22, 4, 0, Math.PI * 2); x.fill() }
      break
    }
    case 3: { // Hard-edge curve
      x.fillStyle = bone; x.fillRect(0, 0, W, H)
      x.fillStyle = tomato; x.beginPath(); x.moveTo(0, H); x.quadraticCurveTo(W * 0.15, H * 0.1, W, H * 0.25); x.lineTo(W, H); x.fill()
      break
    }
    case 4: { // Bauhaus primaries
      x.fillStyle = bone; x.fillRect(0, 0, W, H)
      x.fillStyle = blue; x.beginPath(); x.arc(W * 0.35, H * 0.4, W * 0.24, 0, Math.PI * 2); x.fill()
      x.fillStyle = sun; x.fillRect(W * 0.5, H * 0.45, W * 0.36, W * 0.36)
      x.fillStyle = tomato; x.beginPath(); x.moveTo(W * 0.12, H * 0.92); x.lineTo(W * 0.42, H * 0.6); x.lineTo(W * 0.62, H * 0.92); x.fill()
      x.fillStyle = ink; x.fillRect(W * 0.08, H * 0.12, W * 0.84, 8)
      break
    }
    case 5: { // Op-art waves
      x.fillStyle = bone; x.fillRect(0, 0, W, H)
      x.fillStyle = ink
      for (let s = 0; s < 18; s++) { x.beginPath(); const y0 = (s / 18) * H; for (let i = 0; i <= 50; i++) { const px = (i / 50) * W; x.lineTo(px, y0 + Math.sin(i * 0.35 + s * 0.4) * 10) } for (let i = 50; i >= 0; i--) { const px = (i / 50) * W; x.lineTo(px, y0 + H / 36 + Math.sin(i * 0.35 + s * 0.4) * 10) } x.fill() }
      break
    }
    case 6: { // A word over a sunset
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#203A8F'); g.addColorStop(0.55, tomato); g.addColorStop(1, sun)
      x.fillStyle = g; x.fillRect(0, 0, W, H)
      x.fillStyle = bone; x.font = '800 120px "Bricolage Grotesque", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
      x.fillText('HUNG', W / 2, H / 2)
      break
    }
    default: { // A field of light
      const g = x.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * 0.7); g.addColorStop(0, '#FFE7F0'); g.addColorStop(0.45, pink); g.addColorStop(1, '#6B3FA0')
      x.fillStyle = g; x.fillRect(0, 0, W, H)
      x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(W * 0.3, H * 0.3, W * 0.4, H * 0.4)
      void green
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

function buildFrame(w: number, h: number, kind: number) {
  const g = new THREE.Group()
  const wood = new THREE.MeshStandardMaterial({ color: kind % 3 === 0 ? 0xb38b5d : kind % 3 === 1 ? 0x1b1b1b : 0xf2f0ea, roughness: 0.55 })
  const t = 0.07, d = 0.07
  const parts: [number, number, number, number][] = [[w + t * 2, t, 0, h / 2 + t / 2], [w + t * 2, t, 0, -h / 2 - t / 2], [t, h, -w / 2 - t / 2, 0], [t, h, w / 2 + t / 2, 0]]
  for (const [pw, ph, px, py] of parts) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, d), wood); m.position.set(px, py, d / 2); m.castShadow = true; g.add(m)
  }
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.9 }))
  mat.position.z = 0.012; mat.receiveShadow = true; g.add(mat)
  const aw = w * 0.78, ah = h * 0.78
  const art = new THREE.Mesh(new THREE.PlaneGeometry(aw, ah), new THREE.MeshStandardMaterial({ map: artTexture(kind, aw, ah), roughness: 0.8 }))
  art.position.z = 0.016; g.add(art)
  // A backer slab so the frame throws a shadow onto the wall
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), new THREE.MeshStandardMaterial({ color: 0xdedbd2 }))
  back.position.z = 0.002; back.castShadow = true; g.add(back)
  return g
}

export function createWall(host: HTMLElement, reps: Rep[], opts: Opts) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  host.appendChild(renderer.domElement)
  renderer.domElement.setAttribute('aria-hidden', 'true')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)

  const wallMat = new THREE.MeshStandardMaterial({ color: css('--wall', '#E8EBE7'), roughness: 0.95 })
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), wallMat)
  wall.receiveShadow = true
  scene.add(wall)

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8cbb8, 1.1)
  scene.add(hemi)
  const sunLight = new THREE.DirectionalLight(0xfff3e2, 2.2)
  sunLight.position.set(-4, 6, 8)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.set(2048, 2048)
  sunLight.shadow.camera.left = -10; sunLight.shadow.camera.right = 10; sunLight.shadow.camera.top = 8; sunLight.shadow.camera.bottom = -8
  sunLight.shadow.radius = 6
  sunLight.shadow.bias = -0.0005
  scene.add(sunLight)

  const tapeMat = new THREE.MeshStandardMaterial({ color: css('--tape', '#2F7DF6'), roughness: 0.7, transparent: true, opacity: 0.92 })

  const SIZES: [number, number][] = [[1.15, 1.45], [1.45, 1.05], [1.2, 1.2], [1.05, 1.4], [1.4, 1.1], [1.25, 1.0]]
  const items: Item[] = reps.map((rep, i) => {
    const [w, h] = SIZES[i % SIZES.length]!
    const group = new THREE.Group()
    const pivot = new THREE.Group(); pivot.position.y = h / 2
    const template = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: kraftTexture(rep, w, h), roughness: 1, transparent: true }))
    template.position.set(0, -h / 2, 0.02); template.castShadow = true
    template.userData.id = rep.id
    pivot.add(template)
    const tapes = [-1, 1].map((side) => {
      const t = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.1), tapeMat.clone())
      t.position.set(side * (w / 2 - 0.06), -0.02, 0.03); t.rotation.z = side * -0.65
      pivot.add(t); return t
    })
    group.add(pivot)
    const frame = buildFrame(w * 0.96, h * 0.96, i)
    frame.visible = false
    frame.traverse((o) => { o.userData.id = rep.id })
    group.add(frame)
    scene.add(group)
    return { rep, group, pivot, template, tapes, frame, w, h, baseRot: (Math.random() - 0.5) * 0.06, hover: 0, hung: false, pop: opts.reduced ? 1 : 0 }
  })

  // Laser level line
  const laser = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.018), new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }))
  laser.position.z = 0.05
  scene.add(laser)

  // Dust in the light
  const dustCount = 260
  const dustGeo = new THREE.BufferGeometry()
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) { dustPos[i * 3] = (Math.random() - 0.5) * 16; dustPos[i * 3 + 1] = (Math.random() - 0.5) * 9; dustPos[i * 3 + 2] = Math.random() * 4 + 0.3 }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xfff1d6, size: 0.025, transparent: true, opacity: 0.55, depthWrite: false }))
  scene.add(dust)

  // Confetti bursts when a frame is hung
  const bursts: { pts: THREE.Points; vel: Float32Array; born: number }[] = []
  function burst(at: THREE.Vector3) {
    const n = 70, pos = new Float32Array(n * 3), vel = new Float32Array(n * 3), col = new Float32Array(n * 3)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      pos.set([at.x, at.y, at.z + 0.2], i * 3)
      const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 2.5
      vel.set([Math.cos(a) * s, Math.sin(a) * s + 1.5, Math.random() * 2], i * 3)
      c.set(ART[i % 5]!); col.set([c.r, c.g, c.b], i * 3)
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, depthWrite: false }))
    scene.add(pts); bursts.push({ pts, vel, born: performance.now() })
  }

  // Tweens
  const tweens: Tween[] = []
  const tween = (dur: number, fn: (t: number) => void, done?: () => void) => {
    if (opts.reduced) { fn(1); done?.(); return }
    tweens.push({ start: performance.now(), dur, fn, done })
  }

  // Layout
  let view = { w: 10, h: 6, cx: 0, cy: 0, dist: 12 }
  let compact = false
  let maxPan = 0
  let pan = 0
  let firstLayout = true
  function layout() {
    const W = host.clientWidth, H = host.clientHeight
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    compact = camera.aspect < 0.95
    const cols = compact ? 5 : camera.aspect > 1.35 ? 5 : 4
    const cell = 1.85
    const rows = Math.ceil(items.length / cols)
    items.forEach((it, i) => {
      const r = Math.floor(i / cols), c = i % cols
      const inRow = Math.min(cols, items.length - r * cols)
      const x = (c - (inRow - 1) / 2) * cell + ((i * 37) % 7 - 3) * 0.03
      const y = ((rows - 1) / 2 - r) * cell + ((i * 53) % 5 - 2) * 0.05
      it.group.position.set(x, y, 0)
    })
    const totalW = cols * cell, totalH = rows * cell
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const dist = compact ? (totalH / 2 / tan) * 1.06 : Math.max(totalH / 2 / tan, totalW / 2 / (tan * camera.aspect)) * 1.08
    view = { w: totalW, h: totalH, cx: 0, cy: 0, dist }
    maxPan = compact ? Math.max(0, totalW / 2 - dist * tan * camera.aspect + 0.3) : 0
    pan = firstLayout ? -maxPan : Math.max(-maxPan, Math.min(maxPan, pan))
    firstLayout = false
    laser.scale.x = 1
  }
  layout()

  // Camera target, eased each frame
  const camGoal = new THREE.Vector3(pan, 0, view.dist)
  const lookGoal = new THREE.Vector3(pan, 0, 0)
  const look = new THREE.Vector3(pan, 0, 0)
  camera.position.set(pan, -0.4, view.dist * 1.25)
  let selected: string | null = null
  function aim() {
    const it = items.find((i) => i.rep.id === selected)
    if (it && host.clientWidth > 760) {
      const p = it.group.position
      const d = Math.max(4.2, view.dist * 0.55)
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const shift = d * tan * camera.aspect * 0.42 // keep the template left of the panel
      camGoal.set(p.x + shift, p.y, d); lookGoal.set(p.x + shift, p.y, 0)
    } else {
      if (it && compact) pan = Math.max(-maxPan, Math.min(maxPan, it.group.position.x))
      camGoal.set(pan, it && compact ? it.group.position.y * 0.15 : 0, view.dist); lookGoal.set(pan, camGoal.y, 0)
    }
  }

  // Pointer
  const pointer = new THREE.Vector2(9, 9)
  const par = new THREE.Vector2()
  const ray = new THREE.Raycaster()
  let hoverId: string | null = null
  const pick = (e: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(pointer, camera)
    const hits = ray.intersectObjects(items.flatMap((i) => (i.hung ? [i.frame] : [i.template])), true)
    return (hits[0]?.object.userData.id as string | undefined) ?? null
  }
  renderer.domElement.addEventListener('pointermove', (e) => {
    hoverId = pick(e)
    renderer.domElement.style.cursor = hoverId ? 'pointer' : 'default'
  })
  renderer.domElement.addEventListener('pointerleave', () => { hoverId = null; pointer.set(9, 9) })
  let drag: { x: number; pan: number; moved: boolean } | null = null
  renderer.domElement.addEventListener('pointerdown', (e) => { if (compact) drag = { x: e.clientX, pan, moved: false } })
  addEventListener('pointermove', (e) => {
    if (!drag) return
    const dx = e.clientX - drag.x
    if (Math.abs(dx) > 6) drag.moved = true
    const worldPerPx = (2 * view.dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / host.clientHeight
    pan = Math.max(-maxPan, Math.min(maxPan, drag.pan - dx * worldPerPx))
    camGoal.x = pan; lookGoal.x = pan
  })
  addEventListener('pointerup', () => { setTimeout(() => { drag = null }, 0) })
  renderer.domElement.addEventListener('click', (e) => { if (drag?.moved) return; const id = pick(e); if (id) opts.onSelect(id) })

  // Hang and unhang
  function setHung(id: string, on: boolean, animate = true) {
    const it = items.find((i) => i.rep.id === id)
    if (!it || it.hung === on) return
    it.hung = on
    const run = animate ? tween : (_d: number, fn: (t: number) => void, done?: () => void) => { fn(1); done?.() }
    if (on) {
      it.frame.visible = true
      run(1300, (t) => {
        const peel = easeOut(Math.min(1, t / 0.55))
        it.pivot.rotation.x = -1.7 * peel
        ;(it.template.material as THREE.MeshStandardMaterial).opacity = 1 - peel
        it.tapes.forEach((tp) => { (tp.material as THREE.MeshStandardMaterial).opacity = 0.92 * (1 - peel) })
        const drop = Math.max(0, (t - 0.25) / 0.75)
        it.frame.position.y = (1 - easeBack(Math.min(1, drop))) * 0.9
        it.frame.position.z = 0.02
        it.frame.scale.setScalar(0.92 + 0.08 * easeOut(drop))
        it.frame.rotation.z = drop > 0 ? 0.09 * Math.exp(-4 * drop) * Math.sin(16 * drop) : 0
      }, () => { it.pivot.visible = false })
      if (animate && !opts.reduced) setTimeout(() => burst(it.group.position.clone()), 700)
    } else {
      it.pivot.visible = true
      run(700, (t) => {
        const e = easeOut(t)
        it.frame.position.y = e * 0.6
        it.frame.scale.setScalar(1 - 0.15 * e)
        it.pivot.rotation.x = -1.7 * (1 - e)
        ;(it.template.material as THREE.MeshStandardMaterial).opacity = e
        it.tapes.forEach((tp) => { (tp.material as THREE.MeshStandardMaterial).opacity = 0.92 * e })
      }, () => { it.frame.visible = false })
    }
  }
  opts.hung.forEach((id) => setHung(id, true, false))

  // Intro: the laser sweeps down, templates pop up as it passes
  const introStart = performance.now()
  const introDur = opts.reduced ? 0 : 1600

  function recolor() {
    const dark = document.documentElement.dataset.theme === 'dark' || (document.documentElement.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
    // A gallery after hours: the lit wall reads lighter than the page around it
    wallMat.color.set(dark ? '#5A5F5B' : css('--wall', '#E8EBE7'))
    hemi.intensity = dark ? 0.9 : 1.1
    sunLight.intensity = dark ? 2.0 : 2.2
    scene.background = new THREE.Color(dark ? '#2A2D2B' : css('--wall', '#E8EBE7'))
  }
  recolor()
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor)
  new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  let visible = true
  new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; if (visible) loop() }).observe(host)
  new ResizeObserver(() => { layout(); aim() }).observe(host)

  let raf = 0
  let last = performance.now()
  function loop() {
    cancelAnimationFrame(raf)
    if (!visible) return
    raf = requestAnimationFrame(loop)
    const now = performance.now()
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now

    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i]!
      const t = Math.min(1, (now - tw.start) / tw.dur)
      tw.fn(t)
      if (t >= 1) { tweens.splice(i, 1); tw.done?.() }
    }

    // Intro
    const it01 = introDur ? Math.min(1, (now - introStart) / introDur) : 1
    const top = view.h / 2 + 1, bottom = -view.h / 2 - 1
    const laserY = top + (bottom - top) * easeOut(it01)
    laser.position.y = laserY
    ;(laser.material as THREE.MeshBasicMaterial).opacity = it01 < 1 ? 0.9 * Math.sin(Math.PI * it01) + 0.1 : Math.max(0, (laser.material as THREE.MeshBasicMaterial).opacity - dt * 2)

    items.forEach((it) => {
      if (it.pop < 1 && it.group.position.y + it.h / 2 > laserY) it.pop = Math.min(1, it.pop + dt * 3.2)
      const s = easeBack(it.pop)
      const lift = it.rep.id === hoverId || it.rep.id === selected ? 1 : 0
      it.hover += (lift - it.hover) * Math.min(1, dt * 10)
      it.group.scale.setScalar(Math.max(0.0001, s) * (1 + it.hover * 0.04))
      it.group.position.z = it.hover * (it.rep.id === selected ? 0.06 : 0.16)
      it.group.rotation.z = it.baseRot * (1 - it.hover)
      if (it.rep.id === hoverId && !opts.reduced) { it.group.rotation.y = pointer.x * 0.05; it.group.rotation.x = -pointer.y * 0.05 } else { it.group.rotation.y *= 0.9; it.group.rotation.x *= 0.9 }
    })

    // Dust drift
    const p = dustGeo.attributes.position as THREE.BufferAttribute
    if (!opts.reduced) {
      for (let i = 0; i < dustCount; i++) {
        let y = p.getY(i) + dt * 0.08
        if (y > 4.5) y = -4.5
        p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(now * 0.0003 + i) * dt * 0.03)
      }
      p.needsUpdate = true
    }

    // Bursts
    for (let b = bursts.length - 1; b >= 0; b--) {
      const br = bursts[b]!
      const age = (now - br.born) / 1000
      const bp = br.pts.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < bp.count; i++) {
        br.vel[i * 3 + 1]! -= 6 * dt
        bp.setXYZ(i, bp.getX(i) + br.vel[i * 3]! * dt, bp.getY(i) + br.vel[i * 3 + 1]! * dt, bp.getZ(i) + br.vel[i * 3 + 2]! * dt)
      }
      bp.needsUpdate = true
      ;(br.pts.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - age / 1.4)
      if (age > 1.4) { scene.remove(br.pts); br.pts.geometry.dispose(); bursts.splice(b, 1) }
    }

    // Camera with pointer parallax
    if (!opts.reduced && pointer.x < 2) par.lerp(pointer, dt * 3); else par.lerp(new THREE.Vector2(), dt * 3)
    const k = Math.min(1, dt * (opts.reduced ? 60 : 3.2))
    camera.position.x += (camGoal.x + par.x * 0.35 - camera.position.x) * k
    camera.position.y += (camGoal.y + par.y * 0.25 - camera.position.y) * k
    camera.position.z += (camGoal.z - camera.position.z) * k
    look.lerp(lookGoal, k)
    camera.lookAt(look)

    renderer.render(scene, camera)
  }
  loop()

  return {
    isCompact: () => compact,
    setHung: (id: string, on: boolean) => setHung(id, on, true),
    select: (id: string | null) => { selected = id; aim() },
  }
}
