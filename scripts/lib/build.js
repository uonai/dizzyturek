'use strict'

const fs = require('fs')
const feeds = require('./fetch.js')

// Node runs these; the page never does, so they stay out of both artifacts.
const bench = ['build.js', 'fetch.js']

const styles = fs.readdirSync('./links').filter((file) => { return file.indexOf('.css') > 0 })
const id = process.cwd().split('/').slice(-1)[0]

const mimes = { woff: 'font/woff', woff2: 'font/woff2', jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif' }

function cleanup (txt) {
  const lines = txt.split('\n')
  let output = ''
  for (const line of lines) {
    if (line.trim() === '') { continue }
    if (line.trim().substr(0, 2) === '//') { continue }
    if (line.indexOf('/*') > -1 && line.indexOf('*/') > -1) { continue }
    output += line + '\n'
  }
  return output
}

// The release is one file that runs from file://, so every font and picture
// is folded in as a data uri on the way out.

function embed (path) {
  const ext = path.split('.').pop()
  return `data:${mimes[ext]};base64,${fs.readFileSync(path).toString('base64')}`
}

function inline (txt) {
  return txt
    .replace(/url\("fonts\/([\w-]+\.\w+)"\)/g, (m, file) => { return `url("${embed('./links/fonts/' + file)}")` })
    // Quoted, so that a comment mentioning a file by name is left alone. The
    // build rewriting prose was a good way to lose a sentence.
    .replace(/(['"])media\/([\w-]+\.\w+)\1/g, (m, quote, file) => {
      if (fs.existsSync('./media/' + file)) { return `${quote}${embed('./media/' + file)}${quote}` }
      console.warn('Build', `Missing ./media/${file}, left as a path.`)
      return m
    })
}

const head = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="color-scheme" content="dark">
    <meta name="theme-color" content="#0000a8">
    <meta name="description" content="Dizzy Turek — public domain playwright, Chicago. Plays, Provincialistics, prose elsewhere.">
    <title>dizzy turek</title>`

const boot = `      const client = new Client()
      client.install(document.body)
      window.addEventListener('load', () => {
        client.start()
      })`

// The feed is pulled before the file listing is taken, so a post that landed
// this morning is in the build the same way a font is.

async function build () {
  if (process.env.SKIP_FETCH) {
    console.log('Build', 'SKIP_FETCH set, building from what is already held.')
  } else {
    const feed = await feeds.collect()
    if (feed.fetched || !fs.existsSync('./scripts/feed.js')) { feeds.emit(feed) } else { console.warn('Build', 'Nothing came back. Keeping the last feed.js.') }
  }
  if (!fs.existsSync('./scripts/feed.js')) { feeds.emit({ fetched: null, images: [], log: [], fragments: [] }) }

  const libs = fs.readdirSync('./scripts/lib').filter((file) => { return file.indexOf('.js') > 0 && bench.indexOf(file) < 0 })
  const scripts = fs.readdirSync('./scripts').filter((file) => { return file.indexOf('.js') > 0 })

  // Create debug

  fs.writeFileSync('debug.html', `${head}
    ${styles.reduce((acc, item) => { return `${acc}<link rel="stylesheet" type="text/css" href="links/${item}"/>\n    ` }, '')}
  </head>
  <body>
    ${libs.reduce((acc, item) => { return `${acc}<script type="text/javascript" src="scripts/lib/${item}"></script>\n    ` }, '')}
    ${scripts.reduce((acc, item) => { return `${acc}<script type="text/javascript" src="scripts/${item}"></script>\n    ` }, '')}
    <script>
${boot}
    </script>
  </body>
</html>`)

  // Create release

  fs.writeFileSync('index.html', cleanup(`${head}
  </head>
  <body>
    <script>
      ${libs.reduce((acc, item) => { return `${acc}// Including Library ${item}\n\n${fs.readFileSync('./scripts/lib/' + item, 'utf8')}\n` }, '')}
      ${scripts.reduce((acc, item) => { return `${acc}// Including Script ${item}\n\n${inline(fs.readFileSync('./scripts/' + item, 'utf8'))}\n` }, '')}
${boot}
    </script>
    <style>
    ${styles.reduce((acc, item) => { return `${acc}/* Including Style ${item} */\n\n${inline(fs.readFileSync('./links/' + item, 'utf8'))}\n` }, '')}
    </style>
  </body>
</html>`))

  const weight = Math.round(fs.statSync('index.html').size / 1024)
  console.log('Build', `${id}: ${libs.length} libs, ${scripts.length} scripts, ${styles.length} styles, ${weight}kb.`)
  // One file is the point, but one file has to arrive over a phone connection.
  if (weight > 4096) {
    console.warn('Build', `${weight}kb is a lot to send to a phone. Hold fewer pictures with HOLD_ART=24 ./push.sh, or drop THUMB in scripts/lib/fetch.js.`)
  }
}

build().catch((err) => { console.error('Build', err); process.exit(1) })
