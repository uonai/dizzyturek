'use strict'

/* global client, Frame */

// Substack owns the list, so this window does not pretend to. It checks the
// address, then hands off to the real subscribe page with the address already
// filled in — one confirmation click there and the person is on the list.
//
// It cannot post the signup itself: substack sends no CORS headers, so the
// request would be refused before it left the page.

function Subscribe (client) {
  this.frame = new Frame('subscribe', 'SUBSCRIBE.DT', true)
  this.email = ''
  this.error = ''
  this.sent = false

  this.install = (host) => { this.frame.install(host) }
  this.start = () => { this.update() }
  this.page = () => {}

  this.onEmail = (value) => { this.email = value; if (this.error) { this.error = ''; this.update() } }

  this.href = () => {
    const address = this.email.trim()
    return `${client.library.substack}/subscribe${address ? `?email=${encodeURIComponent(address)}` : ''}`
  }

  this.send = () => {
    const address = this.email.trim()
    this.error = isEmail(address) ? '' : 'That address will not reach you — check it'
    if (this.error) { this.sent = false; this.update(); return }
    this.sent = true
    this.update()
    window.open(this.href(), '_blank', 'noopener')
  }

  this.update = () => {
    this.frame.head('Since 09.01.21')
    this.frame.write(`<div class="fields">
      <div class="lede">
        <div class="display small">“a newsletter about theater mostly.”</div>
        <div class="label">Provincialistics · stgod.substack.com</div>
        ${this.error ? `<div class="error">${this.error}</div>` : ''}
      </div>
      <div class="entry">
        <input type="email" placeholder="name@address" value="${this.email}" oninput="client.subscribe.onEmail(this.value)" onkeydown="if (event.key === 'Enter') { client.subscribe.send() }">
        <button type="button" onclick="client.subscribe.send()">Sign up</button>
      </div>
      ${this.sent ? `<div class="notice">HANDED OFF — finish at <a href="${this.href()}" target="_blank" rel="noopener">substack</a>. If the tab did not open, that link will.</div>` : ''}
      <div class="actions">
        <a href="${client.library.substack}" target="_blank" rel="noopener" class="key">Read it first →</a>
      </div>
    </div>`)
  }

  function isEmail (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
}
