'use strict'

/* global client, Frame, Listing */

function Blog (client) {
  this.frame = new Frame('blog', '/Home/Dizzy/PROVINCIALISTICS.DT')
  this.listing = new Listing([['Date', '68px', true], ['Size', '64px', true], ['Name', 'minmax(0,1fr)']], 2, 4)

  this.install = (host) => { this.frame.install(host) }
  this.start = () => { this.update() }
  this.page = () => { this.listing.page(client.library.filter('log').length); this.update() }

  this.update = () => {
    const rows = client.library.filter('log')
    const shown = this.listing.slice(rows, !client.query)
    const total = client.library.log.length
    const latest = client.library.log[0]
    this.frame.head(`${shown.length} of ${total} ${total === 1 ? 'entry' : 'entries'}`)
    if (!latest) { this.frame.write(this.listing.empty('Nothing mounted from /Blog.')); return }
    this.frame.write(`<div class="split">
      <div>
        <div class="display">${latest.title}</div>
        <div class="label">Prose · ${latest.size} · ${latest.state}</div>
        ${latest.body ? `<p class="prose">${latest.body}</p>` : ''}
        <button type="button" class="key" onclick="client.reader.open('${latest.id}')">Open it →</button>
      </div>
      <div class="dir">
        <div class="rowhead single">Dir /Blog</div>
        ${shown.map((r) => { return this.listing.row(`client.reader.open('${r.id}')`, [r.date, r.size, r.title]) }).join('')}
        ${rows.length ? '' : this.listing.empty()}
        ${client.query ? '' : this.listing.pager('client.blog.page()', shown.length, rows.length)}
      </div>
    </div>`)
  }
}
