'use strict'

/* global FEED */

// Everything the desktop holds. Each record knows how to become a document,
// so a row in a listing, a search hit and an open reader are the same object
// seen from three distances.
//
// Two directories are pulled at build time — the log from the substack feed,
// the images from an are.na channel — and land in scripts/feed.js. What is
// written out below is the fallback: if a fetch failed, or the build ran
// offline, the desk is furnished from here instead of standing empty.

function Library (client) {
  this.npx = 'https://newplayexchange.org/users/21756/dizzy-turek'
  this.substack = 'https://stgod.substack.com'
  this.email = 'dizzyturek@gmail.com'

  // One place for the figures the chrome quotes at you. The counts include
  // work that is filed elsewhere and not held here, which is why they are
  // larger than the arrays.
  this.counts = { scripts: 17, published: 21, venues: 20 }

  this.feed = typeof FEED === 'object' && FEED ? FEED : { fetched: null, images: [], log: [], fragments: [] }
  this.held = (dir, fallback) => {
    const pulled = this.feed[dir]
    return Array.isArray(pulled) && pulled.length ? pulled : fallback
  }

  this.plays = [
    { id: 'p0', title: 'Three for the Price of One', genre: 'adaptation, biography, translation', cast: 'Cast 3 to 10,000,000', state: 'Script held / G1', body: 'The title is the work. It is kept in the decorated form it was written in, with plain letters underneath so it can be read, searched and spoken.' },
    { id: 'p1', title: 'A Wild Dizzy Turek Script Has Appeared!', genre: 'experimental, fantasy, horror', cast: 'Cast 3 to 10,000', state: 'Described / G3' },
    { id: 'p2', title: 'Tested and Proven for Theatrical Enjoyment', genre: 'thirty-four genres, adaptation through zoom', cast: 'Cast 1 to 5', state: 'Described / G3' },
    { id: 'p3', title: 'The Freshest Shit', genre: '(◕‿◕)~(◕‿◕)', cast: 'Cast 3 to 2', state: 'Described / G3' },
    { id: 'p4', title: '¯\\_(ツ)_/¯', genre: 'your guess is as good as mine', cast: 'Cast 1 to 100M', state: 'Described / G3' },
    { id: 'p5', title: '??????', genre: 'you should try to find out', cast: 'Cast 1 to 1BN', state: 'Described / G3' },
    { id: 'p6', title: '???????????', genre: "literally, couldn't tell you what this is", cast: '3 recommendations', state: 'Described / G3' },
    { id: 'p7', title: '????', genre: 'under construction, come back soon', cast: '—', state: 'Under construction' }
  ]

  this.log = this.held('log', [
    { id: 'b0', date: '06.08.26', size: '163 w', title: 'HAHAHAH, Pin me to the ground, Xi Jiping', state: 'Available externally / G3', href: 'https://stgod.substack.com/p/hahahah-pin-me-to-the-ground-xi-jiping', body: 'Welcome to the Chinago Century of Humiliating Foolishness or the Perverted Renaissance (un)Fair! History owns no purchase, money, and dancing and juggling and the medieval BDSMuseum of Science and Industry-hey-little-mama-lemme-whisper-in-your-ear, I can\'t wait til I\'ve seen my members! Many a garden-variety mushr…' },
    { id: 'b1', date: '06.05.26', size: '234 w', title: '“Victory” she screamed “pyrrhically!”', state: 'Available externally / G3', href: 'https://stgod.substack.com/p/victory-she-screamed-pyrrhically', body: 'Her actressing structures her avoidance of the river of issues, sewage or else leaky chemical buildup from the Dark-Satanic-Waste-Center-Toilet Factory…' },
    { id: 'b2', date: '06.01.26', size: '132 w', title: 'meekly freaky on me', state: 'Available externally / G3', href: 'https://stgod.substack.com/p/meekly-freaky-on-me', body: "She only eats the brown parts of the banana. Babe's got the Shower Angels singing Face-Off crescenduets and let me repeat myself, I am the Midthigh Rider." },
    { id: 'b3', date: '04.20.26', size: 'a list', title: 'Things that I have done outside of here', state: 'Available externally / G3', href: 'https://stgod.substack.com/p/things-that-i-have-done-outside-of', body: 'a full list' },
    { id: 'b4', date: '04.07.26', size: '1 706 w', title: 'The Audience Seen', state: 'Re-view · available externally / G3', href: 'https://stgod.substack.com/p/the-audience-seen', body: 'a re-view' },
    { id: 'b5', date: '09.22.25', size: '—', title: 'On “Tom and Eliza”', state: 'Available externally / G3', href: 'https://stgod.substack.com/p/on-tom-and-eliza', body: 'here up against the clock' },
    { id: 'b6', date: '08.26.25', size: '—', title: 'Stupid ugly Americans', state: 'Available externally / G3', href: 'https://stgod.substack.com/p/stupid-ugly-americans', body: "I'm not locked in here with you, you're locked in here with me." },
    { id: 'b7', date: '09.01.21', size: '—', title: '“a newsletter about theater mostly.”', state: 'The beginning / G3', href: 'https://stgod.substack.com/p/coming-soon', body: 'This is very very very very very very very very very very very dizzy, a newsletter about theater mostly.' }
  ])

  this.prose = [
    { id: 'e0', title: 'Two Stories', venue: 'Bruiser', date: '2025', custody: 'Held there / G3', href: 'https://www.bruisermag.com/turek_twostories%20(1)' },
    { id: 'e1', title: 'the cure', venue: 'Farewell Transmission', date: '06.25', custody: 'Held there / G3', href: 'https://farewelltransmission.net/2025/06/the-cure-dizzy-turek' },
    { id: 'e2', title: 'A SPECIAL PRESENTATION: TOOTH + CLAW', venue: 'Apocalypse Confidential', date: '06.24', custody: 'Excerpt held / G2', href: 'https://apocalypse-confidential.com/2024/06/28/a-special-presentation-tooth-claw/' },
    { id: 'e3', title: 'Illuminated Texts 2024', venue: 'Scan, PDF', date: '2024', custody: 'Download / G1', href: 'https://drive.google.com/file/d/1Dh9Nt0V0J5yKZckfKWWvdOk9QPfWjUG6/view' }
  ]

  this.fragments = this.held('fragments', [
    { id: 'f0', label: 'Provincialistics · 06.05.26 · 234 w', href: 'https://stgod.substack.com/p/victory-she-screamed-pyrrhically', text: '…at the threeheaded squirrels, so cute, down below, drinking from it—' },
    { id: 'f1', label: 'Provincialistics · 06.01.26 · 132 w', href: 'https://stgod.substack.com/p/meekly-freaky-on-me', text: "Babe's got the Shower Angels singing Face-Off crescenduets and let me repeat myself, I am the Midthigh Rider." },
    { id: 'f2', label: 'Provincialistics · 06.08.26 · 163 w', href: 'https://stgod.substack.com/p/hahahah-pin-me-to-the-ground-xi-jiping', text: 'the medieval BDSMuseum of Science and Industry-hey-little-mama-lemme-whisper-in-your-ear' }
  ])

  this.images = this.held('images', [
    { src: 'media/image-01.jpg', file: 'image-01.jpg', label: 'Image 01 · rehearsal · G0' },
    { src: 'media/image-02.jpg', file: 'image-02.jpg', label: 'Image 02 · doorway · G0' },
    { src: 'media/image-03.jpg', file: 'image-03.jpg', label: 'Image 03 · loading dock · G0' },
    { src: 'media/image-04.jpg', file: 'image-04.jpg', label: 'Image 04 · prompt copy · G1' },
    { src: 'media/sheet-a.jpg', file: 'sheet-a.jpg', label: 'Sheet A · G1' },
    { src: 'media/sheet-b.jpg', file: 'sheet-b.jpg', label: 'Sheet B · G1' },
    { src: 'media/sheet-c.jpg', file: 'sheet-c.jpg', label: 'Sheet C · G2' },
    { src: 'media/sheet-d.jpg', file: 'sheet-d.jpg', label: 'Sheet D · G2' }
  ])

  this.install = () => {}
  this.start = () => {
    console.log('Library', `${this.plays.length} plays, ${this.log.length} entries, ${this.prose.length} pieces, ${this.fragments.length} fragments, ${this.images.length} images.`)
    // Say which directories are live and which fell back, so a stale window is
    // obvious from the console instead of being mistaken for fresh.
    const where = ['log', 'fragments', 'images'].map((dir) => {
      const pulled = Array.isArray(this.feed[dir]) && this.feed[dir].length
      return `${dir} ${pulled ? 'pulled' : 'FROM library.js'}`
    }).join(', ')
    console.log('Library', this.feed.fetched ? `Feed of ${this.feed.fetched} — ${where}.` : `No feed held — ${where}.`)
  }

  // A note is often just a link. Escape the text, turn any url in it into an
  // anchor, and show the address without its tracking tail — the whole thing
  // still goes in the href, only the label is shortened. stopPropagation so
  // that following the link does not also open the card behind it.
  this.rich = (body) => {
    return escape(body).replace(/https?:\/\/[^\s<]+/g, (found) => {
      const url = found.replace(/[.,;:!?)\]}'"]+$/, '')
      const tail = found.slice(url.length)
      return `<a href="${url}" target="_blank" rel="noopener" class="url" onclick="event.stopPropagation()">${address(url)}</a>${tail}`
    })
  }

  function escape (body) {
    return `${body}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  // What a person would read out loud: the host and the path, no scheme, no
  // query string, no forty characters of gclid.
  function address (url) {
    const bare = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[?#]/)[0].replace(/\/$/, '')
    return bare.length > 46 ? `${bare.slice(0, 45)}…` : bare
  }

  // Filters

  this.match = (strings) => {
    const q = client.query.trim().toLowerCase()
    if (!q) { return true }
    return strings.join(' ').toLowerCase().indexOf(q) > -1
  }

  this.filter = (dir) => {
    if (dir === 'plays') { return this.plays.filter((p) => { return this.match([p.title, p.genre, p.cast, p.state, p.body || '']) }) }
    if (dir === 'log') { return this.log.filter((b) => { return this.match([b.title, b.date, b.size, b.state, b.body || '']) }) }
    if (dir === 'prose') { return this.prose.filter((e) => { return this.match([e.title, e.venue, e.date, e.custody]) }) }
    if (dir === 'fragments') { return this.fragments.filter((f) => { return this.match([f.label, f.text || '']) }) }
    return []
  }

  this.results = () => {
    return [].concat(
      this.filter('plays').map((p) => { return { kind: 'Plays', title: p.title, meta: p.cast, id: p.id } }),
      this.filter('log').map((b) => { return { kind: 'Blog', title: b.title, meta: `${b.date} · ${b.size}`, id: b.id } }),
      this.filter('prose').map((e) => { return { kind: 'Elsewhere', title: e.title, meta: `${e.venue} · ${e.date}`, id: e.id } }),
      this.filter('fragments').map((f) => { return { kind: 'Fragments', title: f.text || '(a picture)', meta: f.label, id: f.id } })
    )
  }

  // Documents

  this.find = (id) => {
    const record = [].concat(this.plays, this.log, this.prose, this.fragments).find((r) => { return r.id === id })
    if (!record) { console.warn('Library', `Unknown record ${id}`); return null }
    if (id[0] === 'p') { return this.playDoc(record) }
    if (id[0] === 'b') { return this.postDoc(record) }
    if (id[0] === 'e') { return this.proseDoc(record) }
    return this.fragDoc(record)
  }

  this.playDoc = (p) => {
    return { id: p.id, file: `/Home/Dizzy/PLAYS/${p.id.toUpperCase()}.DT`, state: p.state, title: p.title, sub: p.genre, body: p.body || '', href: this.npx, linkLabel: 'At New Play Exchange →', meta: [{ k: 'Cast', v: p.cast }, { k: 'Custody', v: p.state }, { k: 'Filed', v: 'New Play Exchange' }] }
  }

  this.postDoc = (b) => {
    return { id: b.id, file: `/Home/Dizzy/PROVINCIALISTICS/${b.date}.DT`, state: b.state, title: b.title, sub: 'Provincialistics', body: b.body || '', href: b.href || this.substack, linkLabel: 'Read at Substack →', meta: [{ k: 'Published', v: b.date }, { k: 'Length', v: b.size }, { k: 'Custody', v: b.state }] }
  }

  this.proseDoc = (e) => {
    return { id: e.id, file: `/Home/Dizzy/ELSEWHERE/${e.id.toUpperCase()}.DT`, state: e.custody, title: e.title, sub: e.venue, body: '', href: e.href || '', linkLabel: `Held at ${e.venue} →`, meta: [{ k: 'Venue', v: e.venue }, { k: 'Date', v: e.date }, { k: 'Custody', v: e.custody }] }
  }

  this.fragDoc = (f) => {
    return { id: f.id, file: `/Home/Dizzy/FRAGMENTS/${f.id.toUpperCase()}.DT`, state: f.image ? 'Picture held / G1' : 'Excerpt held / G2', title: 'Fragment', sub: f.label, body: f.text || '', image: f.image || '', href: f.href || `${this.substack}/notes`, linkLabel: 'See it at Substack →', meta: [{ k: 'Held', v: f.image ? 'Picture and text' : 'Here, in part' }, { k: 'From', v: 'Notes' }, { k: 'Custody', v: f.image ? 'G1' : 'G2' }] }
  }
}
