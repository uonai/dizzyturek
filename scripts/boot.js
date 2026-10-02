'use strict'

/* global client, Image */

// The boot screen does the loading it claims to be doing, and shows it.
//
// It used to be a three second timer printing a fixed list, which is a lie
// told at some length. Now it holds a queue of real jobs — every typeface is
// actually loaded, every picture actually fetched and decoded — and every one
// of them prints its own line, by name, when it lands.
//
// The work and the reading of it are deliberately separate. In the release
// almost everything is a data uri, so the work finishes in a blink and there
// is nothing to watch; so finished lines go into a queue and the screen drains
// that queue at a steady beat, the way a machine that was actually thinking
// about it would. The beat comes from the length of the queue, so a dozen
// files and four hundred take about the same time to read.
//
// A job is { name, run } where run() resolves to the status it wants printed.
// Nothing here can hang the site: a failing job prints its failure and the
// queue moves on, and this.ceiling gives up on the lot of them.

function Boot (client) {
  this.el = document.createElement('div')
  this.el.id = 'boot'

  this.span = 3200     // ms the log should take to read, give or take
  this.quick = 45      // ms. The fastest a line may go by
  this.slow = 190      // ms. The slowest, when there is little to show
  this.reveal = 40     // most files named one by one before they are summarised
  this.ceiling = 20000 // ms. A picture that never arrives does not hold the desk
  this.window = 9      // lines kept on screen

  this.queue = []
  this.lines = []
  this.total = 1
  this.beat = 120
  this.stride = 1
  this.working = true
  this.over = false

  this.install = (host) => { host.appendChild(this.el) }

  // The typefaces really are separate files, whether they arrive as data uris
  // in the release or over the wire in debug.
  this.faces = [
    ['Fragment Mono', 'links/fonts/fragmentmono.woff2'],
    ['Junicode', 'links/fonts/junicode.woff'],
    ['Happy Times at the IKOB', 'links/fonts/happytimes.woff2']
  ]

  this.plan = () => {
    const lib = client.library
    const jobs = [
      { name: 'SEEK /Home/Dizzy', run: () => { return Promise.resolve(lib.feed && lib.feed.fetched ? `pulled ${lib.feed.fetched.slice(0, 10)}` : 'held locally') } }
    ]
    for (const [family, file] of this.faces) {
      jobs.push({ name: `LOAD ${file}`, run: () => { return this.face(family) } })
    }
    jobs.push(
      { name: 'MOUNT PLAYS.DT', run: () => { return Promise.resolve(`${lib.counts.scripts} filed, ${lib.plays.length} listed`) } },
      { name: 'MOUNT PROVINCIALISTICS.DT', run: () => { return Promise.resolve(`${lib.log.length} ${lib.log.length === 1 ? 'entry' : 'entries'}`) } },
      { name: 'MOUNT FRAGMENTS.DT', run: () => { return Promise.resolve(`${lib.fragments.length} held`) } },
      { name: 'MOUNT ELSEWHERE.DT', run: () => { return Promise.resolve(`${lib.counts.published} pieces, ${lib.counts.venues} venues`) } },
      { name: 'MOUNT IMAGES.DT', run: () => { return Promise.resolve(`${lib.images.length} images`) } }
    )
    return jobs
  }

  // Everything the desk will try to draw the moment it is uncovered. Records
  // carry the file name beside the source precisely so this screen can say
  // what it is reading — after the build the source itself is a data uri and
  // has no name left in it.
  this.pictures = () => {
    const lib = client.library
    return lib.images.map((r) => { return { src: r.src, file: r.file } })
      .concat(lib.fragments.filter((f) => { return f.image }).map((f) => { return { src: f.image, file: f.file } }))
      .filter((p) => { return p.src })
  }

  this.start = async () => {
    const jobs = this.plan()
    const pictures = this.pictures()

    // Every picture names itself, up to a point — past that they are named
    // every nth, so a long directory still reads in a few seconds.
    this.stride = Math.max(1, Math.ceil(pictures.length / this.reveal))
    const named = Math.ceil(pictures.length / this.stride)
    this.total = jobs.length + named + (pictures.length ? 1 : 0) + 1
    this.beat = Math.min(this.slow, Math.max(this.quick, Math.round(this.span / this.total)))

    this.from = performance.now()
    this.draw()
    this.reader = setInterval(() => { this.next() }, this.beat)
    this.giveup = setTimeout(() => { this.say('TIMEOUT', 'carrying on'); this.flush() }, this.ceiling)

    for (const job of jobs) {
      if (this.over) { return }
      let status = 'ok'
      try { status = await job.run() || 'ok' } catch (err) { status = `failed — ${err.message || err}` }
      this.say(job.name, status)
    }

    if (pictures.length) {
      const got = await this.decode(pictures)
      this.say(`DECODE ${pictures.length} ${pictures.length === 1 ? 'picture' : 'pictures'}`, `${got} of ${pictures.length}`)
    }

    this.say('READY.', '')
    this.working = false
  }

  // document.fonts is the only honest way to know a typeface has arrived. It
  // resolves either way, so a missing file says so rather than stalling.
  this.face = async (family) => {
    if (!document.fonts || !document.fonts.load) { return 'no font api' }
    await document.fonts.load(`16px "${family}"`)
    return document.fonts.check(`16px "${family}"`) ? 'ok' : 'not found'
  }

  // Fetch and decode for real. In the release most of these are data uris and
  // land at once; the ones linked out to are.na or substack take as long as the
  // network takes, which is the point of showing them.
  this.decode = (pictures) => {
    let done = 0
    return Promise.all(pictures.map((picture, i) => {
      return new Promise((resolve) => {
        const img = new Image()
        const settle = (ok) => {
          if (ok) { done += 1 }
          if (i % this.stride === 0) { this.say(`READ ${label(picture)}`, ok ? 'ok' : 'missing') }
          resolve()
        }
        img.onload = () => { settle(true) }
        img.onerror = () => { settle(false) }
        img.src = picture.src
      })
    })).then(() => { return done })
  }

  // Lines are written into the queue, not onto the screen. next() moves one
  // across per beat, which is the whole reason there is anything to watch.
  this.say = (name, status) => {
    this.queue.push(status ? `${name} … ${status}` : name)
  }

  this.next = () => {
    if (this.over) { return }
    if (this.queue.length) {
      this.lines.push(this.queue.shift())
      this.draw()
      return
    }
    if (!this.working) { this.done() }
  }

  // Out of time: print whatever is still waiting and go.
  this.flush = () => {
    this.lines = this.lines.concat(this.queue)
    this.queue = []
    this.working = false
    this.draw()
    this.done()
  }

  this.progress = () => { return Math.min(1, this.lines.length / this.total) }

  this.draw = () => {
    if (this.over) { return }
    const pct = Math.round(this.progress() * 100)
    const shown = this.lines.slice(-this.window)
    this.el.innerHTML = `<div class="frame">
      <div class="titlebar"><span>DIZZY TUREK v0.01</span><span>${pct}%</span></div>
      <div class="inner">
        ${client.glyphs.toString('cut-ghostlight', 60)}
        <div class="display">dizzy turek</div>
        <div class="label">Mounting /Home/Dizzy</div>
        <div class="gauge"><span style="width:${pct}%"></span></div>
        <div class="lines">${shown.map((l) => { return `<div>${escape(l)}</div>` }).join('')}</div>
      </div>
    </div>`
  }

  this.done = () => {
    if (this.over) { return }
    this.over = true
    clearInterval(this.reader)
    clearTimeout(this.giveup)
    this.el.style.display = 'none'
  }

  // The file name when it is held here, the host it is coming from when it is
  // not, and never half a kilobyte of data uri.
  function label (picture) {
    if (picture.file) { return `media/${picture.file}` }
    const src = `${picture.src}`
    if (src.indexOf('http') === 0) { try { return `${new URL(src).hostname}/…` } catch (err) { return 'elsewhere/…' } }
    return src.indexOf('data:') === 0 ? 'media/(inlined)' : src
  }

  function escape (text) {
    return `${text}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}
