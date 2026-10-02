'use strict'

/* global client, Frame, Listing */

function Images (client) {
  this.frame = new Frame('images', '/Home/Dizzy/IMAGES.DT')
  this.listing = new Listing([], 3, 3)

  this.install = (host) => { this.frame.install(host) }
  this.start = () => { this.update() }
  this.page = () => { this.listing.page(client.library.images.length); this.update() }

  this.update = () => {
    const images = client.library.images
    const shown = this.listing.slice(images)
    this.frame.head(`${shown.length} of ${images.length} images held`)
    this.frame.write(`
      <div class="gallery">${shown.map((p) => { return `<div>
        <img src="${p.src}" alt="" loading="lazy">
        <div class="label">${p.label}</div>
      </div>` }).join('')}</div>
      <p class="aside">A shelf, not a gallery. The rest are on Instagram and the post covers are at Substack; only these have been brought here.</p>
      ${this.listing.pager('client.images.page()', shown.length, images.length)}`)
  }
}
