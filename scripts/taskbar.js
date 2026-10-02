'use strict'

/* global client */

// The footer. On a desk it is a window list: what is open, a way to tidy the
// pile, a count. On a handheld none of that is true — windows do not stack,
// there is nothing to tidy, and a count of a single column is noise. So the
// footer becomes what it should be on a phone: the rights line, and the two
// things a reader might actually want to do next.

function Taskbar (client) {
  this.el = document.createElement('div')
  this.el.id = 'taskbar'

  this.ways = [['subscribe', 'Subscribe'], ['contact', 'Contact']]

  this.install = (host) => { host.appendChild(this.el) }
  this.start = () => { this.update() }

  this.count = () => {
    return client.panels.filter(([id]) => { return client[id].frame.visible }).length + client.reader.count()
  }

  this.update = () => {
    const open = client.panels.filter(([id]) => { return client[id].frame.visible })
    this.el.innerHTML = `
      <span class="rights">© St. God / Provincialistics<span class="sm"> since 09.01.21</span></span>
      ${open.map(([id, name]) => { return `<button type="button" class="sm" onclick="client.${id}.frame.focus()">${name}</button>` }).join('')}
      <button type="button" class="inv sm" onclick="client.desktop.tidy()">Tidy</button>
      <span class="rule sm"></span>
      <span class="inv sm">${this.count()} open</span>
      <span class="hand">${this.ways.map(([id, name]) => { return `<button type="button" onclick="client.${id}.frame.focus()">${name}</button>` }).join('')}</span>`
  }
}
