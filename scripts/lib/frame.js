'use strict'

/* global client */

// A window. Chrome, drag handle, close box, nothing else. Every panel on the
// desktop is one of these with a different body written into it.

function Frame (id, path, accent = false) {
  this.id = id
  this.path = path
  this.status = ''
  this.visible = true

  this.el = document.createElement('div')
  this.el.id = id
  this.el.className = accent ? 'frame accent' : 'frame'
  this.el.setAttribute('data-win', '1')

  this._bar = document.createElement('div')
  this._bar.className = 'titlebar'
  this._body = document.createElement('div')
  this._body.className = 'inner'

  // Callbacks
  this.onClose = () => {}

  this.install = (host) => {
    this.el.appendChild(this._bar)
    this.el.appendChild(this._body)
    host.appendChild(this.el)
    this.el.addEventListener('pointerdown', (e) => { client.desktop.raise(this.el) })
    this._bar.addEventListener('pointerdown', (e) => { client.desktop.drag(e, this.el) })
    this._bar.addEventListener('click', (e) => { if (e.target.dataset.close) { this.close() } })
  }

  this.open = () => {
    this.visible = true
    this.el.style.display = ''
    client.taskbar.update()
  }

  this.close = () => {
    this.visible = false
    this.el.style.display = 'none'
    this.onClose()
    client.taskbar.update()
  }

  this.focus = () => {
    this.open()
    client.desktop.raise(this.el)
    client.desktop.scrollTo(this.el)
  }

  this.head = (status) => {
    this.status = status
    this._bar.innerHTML = `<span><button type="button" data-close="1">[X]</button>${this.path}</span><span>${status}</span>`
  }

  this.write = (html) => {
    this._body.innerHTML = html
  }
}
