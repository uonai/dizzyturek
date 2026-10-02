'use strict'

/* global client */

function Icons (client) {
  this.items = [
    ['plays', 'mark-mask', 'Plays'], ['blog', 'mark-page', 'Blog'],
    ['fragments', 'mark-fragment', 'Fragments'], ['prose', 'mark-prose', 'Prose'],
    ['images', 'mark-image', 'Images'], ['about', 'mark-bio', 'About'],
    ['subscribe', 'cut-reel', 'Subscribe'], ['contact', 'mark-elsewhere', 'Contact']
  ]

  this.install = (host) => { this.host = host }

  this.start = () => {
    this.host.innerHTML = this.items.map(([id, glyph, name]) => {
      return `<button type="button" onclick="client.${id}.frame.focus()">${client.glyphs.toString(glyph, 40)}<span>${name}</span></button>`
    }).join('')
  }
}
