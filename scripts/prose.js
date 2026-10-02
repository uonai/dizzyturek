'use strict'

/* global client, Frame, Listing */

function Prose (client) {
  this.frame = new Frame('prose', '/Home/Dizzy/PROSE_ELSEWHERE.DT')
  this.listing = new Listing([['Name', 'minmax(0,1fr)'], ['Venue', '230px', true], ['Date', '78px', true], ['Custody', '160px', true]], 2, 3)

  this.install = (host) => { this.frame.install(host) }
  this.start = () => { this.update() }
  this.page = () => { this.listing.page(client.library.filter('prose').length); this.update() }

  this.update = () => {
    const rows = client.library.filter('prose')
    const shown = this.listing.slice(rows, !client.query)
    const total = client.library.counts.published
    const elsewhere = Math.max(0, total - client.library.prose.length)
    this.frame.head(`${shown.length} of ${total} pieces`)
    this.frame.write(`
      ${this.listing.head()}
      ${shown.map((r) => { return this.listing.row(`client.reader.open('${r.id}')`, [r.title, r.venue, r.date, r.custody]) }).join('')}
      ${rows.length ? '' : this.listing.empty()}
      ${client.query ? '' : this.listing.pager('client.prose.page()', shown.length, rows.length)}
      <div class="tail">${shown.length >= rows.length && elsewhere ? `+ ${elsewhere} more, held at their venues` : ''}</div>`)
  }
}
