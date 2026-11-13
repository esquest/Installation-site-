// Bundles the Skill Deck into one self-contained HTML file (dist/skill-deck.html)
// so it can be published as a claude.ai Artifact. Run: npm run build
import { build } from 'esbuild'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const result = await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  write: false,
  outdir: 'dist',
  jsx: 'automatic',
  target: 'es2020',
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '"https://example.invalid/"' },
  loader: { '.svg': 'dataurl', '.png': 'dataurl' },
  logLevel: 'warning',
})

const js = result.outputFiles.find((f) => f.path.endsWith('.js')).text
const css = result.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? ''
const shell = readFileSync('src/shell.html', 'utf8')
const html = shell
  .replace('/*__CSS__*/', () => css.replace(/<\/style/gi, '<\\/style'))
  .replace('/*__JS__*/', () => js.replace(/<\/script/gi, '<\\/script'))
mkdirSync('dist', { recursive: true })
writeFileSync('dist/skill-deck.html', html)
console.log(`dist/skill-deck.html ${(html.length / 1024).toFixed(0)} KB`)
