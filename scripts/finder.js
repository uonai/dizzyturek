'use strict'

/* global client, Frame, Listing */

// The search window only exists while there is a query. Everything in the
// house is searched at once; the page limits are for browsing, not for finding.

function Finder (client) {
  this.frame = new Frame('find', 'FIND.DT')
  this.listing = new Listing([['Dir', '120px', true], ['Name', 'minmax(0,1fr)'], ['Detail', '220px', true]])

  this.install = (host) => { this.frame.install(host); this.frame.close() }
  this.start = () => { this.update() }
  this.page = () => {}

  this.update = () => {
    if (!client.query.trim()) { this.frame.el.style.display = 'none'; this.frame.visible = false; return }
    const rows = client.library.results()
    this.frame.visible = true
    this.frame.el.style.display = ''
    this.frame.path = `FIND.DT — “${client.query}”`
    this.frame.head(`${rows.length} ${rows.length === 1 ? 'hit' : 'hits'}`)
    this.frame.write(`
      ${this.listing.head()}
      ${rows.map((r) => { return this.listing.row(`client.reader.open('${r.id}')`, [r.kind, r.title, r.meta]) }).join('')}
      ${rows.length ? '' : this.listing.empty('Nothing in /Home/Dizzy matches that.')}`)
  }
}
