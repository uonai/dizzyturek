'use strict'

/* global client, Frame */

function About (client) {
  this.frame = new Frame('about', 'ABOUT.DT')

  this.install = (host) => { this.frame.install(host) }
  this.start = () => { this.update() }
  this.page = () => {}

  this.update = () => {
    this.frame.head('v0.01')
    this.frame.write(`
      ${client.glyphs.toString('cut-ghostlight', 60)}
      <div class="display">dizzy turek<span class="caret"></span></div>
      <div class="label">Playwright · Chicago</div>
      <p class="prose">a publishing house from ohio but now chicago. tryin to up the tempo (except when you need to do the opposite). Theater 1. Theater 2. Theater 1,2,3,4. thank you for talking to me; also thank you if you chose not to.</p>
      <div class="actions center">
        <button type="button" onclick="client.plays.frame.focus()">The plays →</button>
        <button type="button" onclick="client.about.frame.close()">Close</button>
      </div>`)
  }
}
