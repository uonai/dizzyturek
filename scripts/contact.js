'use strict'

/* global client, Frame */

// No form. A form here would need a server to post to, and everything else on
// this desk is a static file — so it would either be a stub that swallows what
// people write, or a dependency the rest of the project does not have. An
// address is the honest version, and it works from every machine ever made.

function Contact (client) {
  this.frame = new Frame('contact', 'CONTACT.DT')

  this.install = (host) => { this.frame.install(host) }
  this.start = () => { this.update() }
  this.page = () => {}

  this.update = () => {
    const lib = client.library
    this.frame.head('Chicago')
    this.frame.write(`<div class="split">
      <div>
        <div class="label">Write to me</div>
        <div class="display small address"><a href="mailto:${lib.email}">${lib.email}</a></div>
        <p class="aside">thank you for talking to me; also thank you if you chose not to.</p>
        <div class="actions">
          <a href="mailto:${lib.email}" class="key">Open a message →</a>
        </div>
      </div>
      <div class="cards stack">
        <div class="card"><div class="label">The blog</div><a href="${lib.substack}" target="_blank" rel="noopener">stgod.substack.com</a></div>
        <div class="card"><div class="label">The scripts</div><a href="${lib.npx}" target="_blank" rel="noopener">newplayexchange.org</a></div>
      </div>
    </div>`)
  }
}
