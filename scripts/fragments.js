'use strict'

/* global client, Frame, Listing */

function Fragments (client) {
  this.frame = new Frame('fragments', '/Home/Dizzy/FRAGMENTS.DT')
  this.listing = new Listing([], 3, 3)

  this.install = (host) => { this.frame.install(host) }
  this.start = () => { this.update() }
  this.page = () => { this.listing.page(client.library.filter('fragments').length); this.update() }

  this.update = () => {
    const rows = client.library.filter('fragments')
    const shown = this.listing.slice(rows, !client.query)
    const done = shown.length >= rows.length
    const total = client.library.fragments.length
    this.frame.head(`${shown.length} of ${total} held`)
    this.frame.write(`
      <div class="cards">${shown.map((f) => { return `<div class="card" onclick="client.reader.open('${f.id}')">
        <div class="label">${f.label}</div>
        ${f.image ? `<img src="${f.image}" alt="" loading="lazy">` : ''}
        ${f.text ? `<p class="prose">${client.library.rich(f.text)}</p>` : ''}
      </div>` }).join('')}</div>
      ${rows.length ? '' : this.listing.empty()}
      ${client.query || done ? '' : this.listing.pager('client.fragments.page()', shown.length, rows.length)}
      ${done && !client.query ? `<div class="end">-- End of directory · ${total} held, the rest stay at substack --</div>` : ''}`)
  }
}
