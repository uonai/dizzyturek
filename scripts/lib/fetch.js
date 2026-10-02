'use strict'

// Build-time only. Node runs this; the browser never sees it — build.js keeps
// it out of both artifacts.
//
// Three sources, two different problems:
//
//   are.na    a real json api. Public channels need no key, so there is no
//             credential in this project and none in the release.
//
//   substack  has no public api. What it has is a set of undocumented
//             endpoints that could change without warning, and none of them
//             send CORS headers — which is the whole reason this runs here at
//             build time and not in the page. Better a build that warns than
//             a window that is empty in someone's browser.
//
// Every source is walked to the end of its pagination. Taking the first page
// and calling it the archive is how half the notes went missing.
//
// What it collects lands in scripts/feed.js. If a fetch fails the build keeps
// going and library.js falls back to the records written by hand, so the site
// is never down because someone else's api is.

const fs = require('fs')

// The channel slug is the last part of are.na/<user>/<slug>. Leave it empty
// and the are.na half is skipped; the images written by hand stand in.
const ARENA_CHANNEL = process.env.ARENA_CHANNEL || 'dizzy-website-inspo'
const SUBSTACK_HOST = process.env.SUBSTACK_HOST || 'stgod.substack.com'
const SUBSTACK_USER = process.env.SUBSTACK_USER || '10302032' // for the notes fallback

const PER = 100       // page size asked of are.na
const PAGE = 50       // page size asked of substack
const PAGES = 40      // pages to walk per source before deciding it is looping
const CEILING = 1000  // records per directory. A backstop, not a target
const EXCERPT = 420   // characters of a post kept here. The post is not ours
const THUMB = 560     // px wide. Substack resizes for us, so holding many is cheap
const TIMEOUT = 20000

// 0 holds every picture. Set it to a number to hold that many and link the
// rest — the lever to pull if index.html gets too heavy to love.
const HOLD_ART = Number(process.env.HOLD_ART || 0)

// Substack's api endpoints sit behind a filter that turns away anything that
// does not look like a browser: a polite custom agent gets 403 while the rss
// feed is served happily. So this asks the way a browser asks. Same
// publication either way, read at the rate a person would read it.
const AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

// ------------------------------------------------------------------ wire

async function get (url, binary = false) {
  const res = await fetch(url, {
    headers: {
      'user-agent': AGENT,
      accept: binary ? 'image/avif,image/webp,image/*,*/*;q=0.8' : 'application/json, application/rss+xml, text/xml, text/html;q=0.9, */*;q=0.8',
      'accept-language': 'en-US,en;q=0.9'
    },
    signal: AbortSignal.timeout(TIMEOUT),
    redirect: 'follow'
  })
  if (!res.ok) { throw new Error(`${res.status} ${res.statusText} — ${url}`) }
  return binary ? Buffer.from(await res.arrayBuffer()) : res.text()
}

async function json (url) { return JSON.parse(await get(url)) }

// Walk a paginated endpoint to its end. `page` builds the url for a given
// index, `read` pulls the list out of whatever came back. It stops when a page
// comes back empty, or repeats the page before it.
async function walk (name, page, read = (body) => { return body }) {
  const all = []
  let last = ''
  for (let i = 0; i < PAGES; i++) {
    let got = null
    try { got = read(await json(page(i, all))) } catch (err) { console.warn('Fetch', `${name} page ${i + 1}: ${err.message}`); break }
    if (!Array.isArray(got) || !got.length) { break }
    const print = JSON.stringify(got[0])
    if (print === last) { break }
    last = print
    all.push(...got)
    if (all.length >= CEILING) { console.warn('Fetch', `${name}: stopped at ${CEILING}.`); break }
  }
  return all
}

// ------------------------------------------------------------------ pictures

// Substack resizes on request, so a wall of notes does not have to mean a wall
// of full-size originals inside index.html.
function thumb (url, width = THUMB) {
  if (!url || url.indexOf('substackcdn.com/image/fetch') > -1) { return url }
  return `https://substackcdn.com/image/fetch/w_${width},c_limit,q_auto:good/${encodeURIComponent(url)}`
}

// Bring a picture down into media/ so the release stays one file. If it cannot
// be reached, hand back the url and let the page load it over the network —
// the right picture either way.
async function hold (url, name, spare = '') {
  if (!fs.existsSync('./media')) { fs.mkdirSync('./media') }
  for (const candidate of [url, spare].filter(Boolean)) {
    try {
      const bytes = await get(candidate, true)
      // A resizer can hand back a format the url never mentioned, and a data
      // uri with the wrong mime does not render. Believe the bytes.
      const file = `${name}.${sniff(bytes) || extension(candidate)}`
      fs.writeFileSync(`./media/${file}`, bytes)
      // The file name travels with the record. After the build the src is a
      // data uri with no name left in it, and the boot screen needs one.
      return { src: `media/${file}`, file, custody: 'G0' }
    } catch (err) { console.warn('Fetch', `Could not hold ${name}: ${err.message}`) }
  }
  return { src: spare || url, file: '', custody: 'G3' }
}

function sniff (b) {
  if (b.length < 12) { return '' }
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) { return 'jpg' }
  if (b[0] === 0x89 && b.toString('latin1', 1, 4) === 'PNG') { return 'png' }
  if (b.toString('latin1', 0, 3) === 'GIF') { return 'gif' }
  if (b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') { return 'webp' }
  if (b.toString('latin1', 4, 8) === 'ftyp' && b.toString('latin1', 8, 12).indexOf('avif') > -1) { return 'avif' }
  return ''
}

function extension (url) {
  const match = `${url}`.split('?')[0].match(/\.(jpe?g|png|gif|webp|avif)$/i)
  return match ? match[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg'
}

// ------------------------------------------------------------------ are.na

async function images () {
  if (!ARENA_CHANNEL) { console.log('Fetch', 'No ARENA_CHANNEL set, keeping the images written by hand.'); return [] }
  const contents = await walk(
    'are.na',
    (i) => { return `https://api.are.na/v2/channels/${encodeURIComponent(ARENA_CHANNEL)}/contents?per=${PER}&page=${i + 1}` },
    (body) => { return body.contents || [] }
  )
  const blocks = contents.filter((block) => { return block && block.class === 'Image' && block.image }).reverse()

  const held = []
  for (let i = 0; i < blocks.length; i++) {
    const image = blocks[i].image
    const src = (image.display && image.display.url) || (image.large && image.large.url) || (image.original && image.original.url)
    if (!src) { continue }
    const n = String(i + 1).padStart(3, '0')
    const shot = (!HOLD_ART || i < HOLD_ART) ? await hold(src, `arena-${n}`) : { src, file: '', custody: 'G3' }
    held.push({ src: shot.src, file: shot.file, label: `Image ${n} · ${caption(blocks[i])} · ${shot.custody}` })
  }
  console.log('Fetch', `are.na: ${held.length} images out of ${contents.length} blocks in ${ARENA_CHANNEL}.`)
  return held
}

function caption (block) {
  const words = text(block.title || block.description || '').toLowerCase()
  if (!words) { return 'untitled' }
  return words.length > 34 ? `${words.slice(0, 33).trimEnd()}…` : words
}

// ------------------------------------------------------------------ posts

// The archive endpoint pages properly and carries a real word count. The rss
// feed only ever holds the most recent handful, so it is the understudy.
async function posts () {
  let held = []
  try {
    const archive = await walk(
      'substack archive',
      (i, all) => { return `https://${SUBSTACK_HOST}/api/v1/archive?sort=new&offset=${all.length}&limit=${PAGE}` }
    )
    held = archive
      .filter((p) => { return p && p.title })
      .map((p, i) => {
        return {
          id: `b${i}`,
          date: stamp(p.post_date),
          size: p.wordcount ? figure(p.wordcount) : '—',
          title: text(p.title),
          state: 'Available externally / G3',
          href: p.canonical_url || `https://${SUBSTACK_HOST}`,
          body: excerpt(text(p.truncated_body_text || p.description || ''))
        }
      })
  } catch (err) { console.warn('Fetch', `substack archive: ${err.message}`) }

  if (!held.length) {
    console.warn('Fetch', 'The archive gave nothing, falling back to the rss feed.')
    held = await feed()
  }
  console.log('Fetch', `substack: ${held.length} entries from ${SUBSTACK_HOST}.`)
  return held
}

async function feed () {
  const xml = await get(`https://${SUBSTACK_HOST}/feed`)
  return xml.split('<item>').slice(1).map((chunk, i) => {
    const item = chunk.split('</item>')[0]
    const full = text(tag(item, 'content:encoded') || tag(item, 'description'))
    return {
      id: `b${i}`,
      date: stamp(tag(item, 'pubDate')),
      size: count(full),
      title: text(tag(item, 'title')) || 'Untitled',
      state: 'Available externally / G3',
      href: tag(item, 'link').trim() || `https://${SUBSTACK_HOST}`,
      body: excerpt(full)
    }
  }).filter((post) => { return post.title })
}

// ------------------------------------------------------------------ notes

// Notes are the short stuff — a line, a picture, sometimes both. They become
// the fragments on the desk. A note with neither is not a fragment, it is an
// accident, and is dropped.
async function notes () {
  const doors = [
    (at) => { return `https://${SUBSTACK_HOST}/api/v1/notes?limit=${PAGE}${at ? `&cursor=${encodeURIComponent(at)}` : ''}` },
    (at) => { return `https://substack.com/api/v1/reader/feed/profile/${SUBSTACK_USER}?types%5B%5D=note&limit=${PAGE}${at ? `&cursor=${encodeURIComponent(at)}` : ''}` }
  ]

  // The cursor lives on the response, so this walks by hand rather than
  // through walk(). Same idea: keep going until the cursor runs out.
  let door = null
  let items = []
  let cursor = null
  for (let page = 0; page < PAGES; page++) {
    let body = null
    for (const candidate of (door ? [door] : doors)) {
      try {
        const parsed = await json(candidate(cursor))
        if (parsed && Array.isArray(parsed.items) && parsed.items.length) { body = parsed; door = candidate; break }
        if (!page) { console.warn('Fetch', 'A notes endpoint answered with nothing.') }
      } catch (err) { if (!page) { console.warn('Fetch', `notes: ${err.message}`) } }
    }
    if (!body) { break }
    items = items.concat(body.items)
    cursor = body.nextCursor
    if (!cursor || items.length >= CEILING) { break }
  }
  if (!items.length) { throw new Error('no notes endpoint answered') }

  const seen = new Set()
  const found = items
    .map((item) => { return item && item.comment })
    .filter((c) => { return c && (text(c.body) || picture(c)) })
    .filter((c) => { if (seen.has(c.id)) { return false } seen.add(c.id); return true })

  const dropped = items.length - found.length
  if (dropped > 0) { console.log('Fetch', `notes: ${dropped} of ${items.length} items held nothing, or were repeats.`) }

  const held = []
  let linked = 0
  for (let i = 0; i < found.length; i++) {
    const note = found[i]
    const words = text(note.body)
    const shot = picture(note)
    const n = String(i + 1).padStart(3, '0')
    let image = ''
    let file = ''
    if (shot) {
      if (!HOLD_ART || i < HOLD_ART) {
        const got = await hold(thumb(shot), `note-${n}`, shot)
        image = got.src
        file = got.file
      } else {
        image = thumb(shot)
        linked += 1
      }
    }
    held.push({
      id: `f${i}`,
      label: ['Note', stamp(note.date), words ? count(words) : 'picture'].join(' · '),
      text: excerpt(words),
      image,
      file,
      href: note.handle && note.id ? `https://substack.com/@${note.handle}/note/c-${note.id}` : `https://${SUBSTACK_HOST}/notes`
    })
  }
  const pictures = held.filter((f) => { return f.image }).length
  console.log('Fetch', `substack notes: ${held.length} fragments, ${pictures} with a picture${linked ? `, ${linked} linked rather than held` : ''}.`)
  return held
}

// photo_url is the author's avatar and is the same on every note — the note's
// own picture is an attachment.
function picture (note) {
  const shot = (note.attachments || []).find((a) => { return a && a.type === 'image' && a.imageUrl })
  return shot ? shot.imageUrl : ''
}

// ------------------------------------------------------------------ words

// A tolerant reader, not a parser. The feed is machine-written and shallow,
// and the alternative is a dependency.
function tag (xml, name) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))
  if (!match) { return '' }
  return match[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '')
}

function text (html) {
  return `${html}`
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(nbsp|#160);/gi, ' ')
    .replace(/&(lt|#60);/gi, '<')
    .replace(/&(gt|#62);/gi, '>')
    .replace(/&(quot|#34);/gi, '"')
    .replace(/&(#39|apos|rsquo|#8217);/gi, '’')
    .replace(/&(lsquo|#8216);/gi, '‘')
    .replace(/&(ldquo|#8220);/gi, '“')
    .replace(/&(rdquo|#8221);/gi, '”')
    .replace(/&(mdash|#8212);/gi, '—')
    .replace(/&(ndash|#8211);/gi, '–')
    .replace(/&(hellip|#8230);/gi, '…')
    .replace(/&#(\d+);/g, (m, code) => { return String.fromCodePoint(parseInt(code, 10)) })
    .replace(/&(amp|#38);/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function stamp (when) {
  const date = new Date(when)
  if (isNaN(date)) { return '--.--.--' }
  const pad = (n) => { return String(n).padStart(2, '0') }
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())}.${String(date.getFullYear()).slice(-2)}`
}

// The piece lives at substack, not here. What is kept is enough to recognise
// it by and to search on — the reading happens at the other end of the link.
function excerpt (body) {
  if (body.length <= EXCERPT) { return body }
  const cut = body.slice(0, EXCERPT)
  const edge = cut.lastIndexOf(' ')
  return `${(edge > EXCERPT - 60 ? cut.slice(0, edge) : cut).trimEnd()}…`
}

// The listings print the word count of the whole piece, not of the excerpt —
// the figure describes the writing, not what is held.
function count (body) { return figure(body.split(/\s+/).filter(Boolean).length) }
function figure (n) { return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} w` }

// ------------------------------------------------------------------ out

async function collect () {
  const feed = { fetched: null, images: [], log: [], fragments: [] }
  try { feed.images = await images() } catch (err) { console.warn('Fetch', `are.na failed, keeping what is held: ${err.message}`) }
  try { feed.log = await posts() } catch (err) { console.warn('Fetch', `substack posts failed, keeping what is held: ${err.message}`) }
  try { feed.fragments = await notes() } catch (err) { console.warn('Fetch', `substack notes failed, keeping what is held: ${err.message}`) }
  if (feed.images.length || feed.log.length || feed.fragments.length) { feed.fetched = new Date().toISOString() }
  return feed
}

// The release is one inline <script>, so nothing written here may contain a
// closing tag. Escaping every < settles it for good.
function emit (feed) {
  const body = JSON.stringify(feed, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
  fs.writeFileSync('./scripts/feed.js', `'use strict'\n\n/* Written by scripts/lib/fetch.js. Do not edit — the next build overwrites it. */\n\nconst FEED = ${body}\n`)
}

module.exports = { collect, emit, ARENA_CHANNEL, SUBSTACK_HOST }

// Run it on its own to see what each source actually says, without touching
// the build:  node scripts/lib/fetch.js
if (require.main === module) {
  collect().then((feed) => {
    const line = (name, list) => { return `  ${name.padEnd(12)} ${String(list.length).padStart(3)}  ${list.length ? 'ok' : 'NOTHING CAME BACK'}` }
    console.log('\nWhat came back')
    console.log(line('images', feed.images))
    console.log(line('log', feed.log))
    console.log(line('fragments', feed.fragments))
    if (feed.log.length) {
      console.log('\nPosts:')
      feed.log.forEach((p) => { console.log(`  ${p.date}  ${String(p.size).padStart(8)}  ${p.title.slice(0, 56)}`) })
    }
    if (feed.fragments.length) {
      console.log('\nFragments:')
      feed.fragments.forEach((f) => { console.log(`  ${f.label.padEnd(30)} ${f.image ? '[picture] ' : '          '} ${f.text.slice(0, 44)}`) })
    }
    console.log('')
  })
}
