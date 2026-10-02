'use strict'

/* global client, Frame, Listing */

function Plays (client) {
  this.frame = new Frame('plays', '/Home/Dizzy/PLAYS.DT')
  this.listing = new Listing([['Name', 'minmax(0,1fr)'], ['Genre', '214px', true], ['Cast', '152px', true]], 3, 5)

  this.install = (host) => { this.frame.install(host) }
  this.start = () => { this.update() }
  this.page = () => { this.listing.page(client.library.filter('plays').length); this.update() }

  this.update = () => {
    const rows = client.library.filter('plays')
    const shown = this.listing.slice(rows, !client.query)
    const filed = client.library.counts.scripts
    const elsewhere = Math.max(0, filed - client.library.plays.length)
    this.frame.head(`${filed} filed · ${shown.length} listed`)
    this.frame.write(`
      ${this.listing.head()}
      ${shown.map((r) => { return this.listing.row(`client.reader.open('${r.id}')`, [r.title, r.genre, r.cast]) }).join('')}
      ${rows.length ? '' : this.listing.empty()}
      ${client.query ? '' : this.listing.pager('client.plays.page()', shown.length, rows.length)}
      ${elsewhere ? `<div class="tail">+ ${elsewhere} MORE — AT NEW PLAY EXCHANGE, NOT HELD HERE</div>` : ''}`)
  }
}
