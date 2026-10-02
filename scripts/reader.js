'use strict'

/* global client, Frame */

// Open documents. A record from the library becomes a frame, newest on top of
// the stack, and closing one forgets it entirely.

function Reader (client) {
  this.el = document.createElement('div')
  this.el.id = 'readers'
  this.all = {}

  this.install = (host) => { host.appendChild(this.el) }
  this.start = () => {}

  this.open = (id) => {
    if (this.all[id]) { this.all[id].focus(); return }
    const doc = client.library.find(id)
    if (!doc) { return }
    const frame = new Frame(`doc-${id}`, doc.file, true)
    frame.onClose = () => { this.close(id) }
    frame.install(this.el)
    this.el.insertBefore(frame.el, this.el.firstChild)
    frame.head(doc.state)
    frame.write(this.toString(doc))
    this.all[id] = frame
    client.taskbar.update()
    frame.focus()
  }

  this.close = (id) => {
    const frame = this.all[id]
    if (!frame) { return }
    frame.el.remove()
    delete this.all[id]
    client.taskbar.update()
  }

  this.count = () => { return Object.keys(this.all).length }

  this.toString = (doc) => {
    return `
      <div class="display">${doc.title}</div>
      <div class="sub">${doc.sub}</div>
      <div class="meta">${doc.meta.map((m) => { return `<div><span class="key">${m.k}</span> <span>${m.v}</span></div>` }).join('')}</div>
      ${doc.image ? `<img class="still" src="${doc.image}" alt="" loading="lazy">` : ''}
      ${doc.body ? `<p class="prose">${client.library.rich(doc.body)}</p>` : ''}
      <div class="actions">
        ${doc.href ? `<a href="${doc.href}" target="_blank" rel="noopener" class="key">${doc.linkLabel}</a>` : ''}
        <button type="button" onclick="client.reader.close('${doc.id}')">Close</button>
      </div>`
  }
}
