'use strict'

/* global client */

// The menubar. Real elements, drawn once — the find field has to keep focus
// while the rest of the desktop redraws under it.

function Menu (client) {
  this.el = document.createElement('div')
  this.el.id = 'menu'
  this._input = document.createElement('input')
  this._input.type = 'search'
  this._input.placeholder = 'everything'
  this._input.setAttribute('aria-label', 'Find in /Home/Dizzy')
  this._input.setAttribute('autocomplete', 'off')
  this._input.setAttribute('autocapitalize', 'off')
  this._input.setAttribute('autocorrect', 'off')
  this._input.setAttribute('spellcheck', 'false')
  this._input.setAttribute('enterkeyhint', 'search')

  this.items = [['plays', 'Plays'], ['blog', 'Blog'], ['fragments', 'Fragments'], ['prose', 'Prose'], ['images', 'Images'], ['about', 'Biographical']]

  this.install = (host) => {
    let html = '<span class="label">Menu</span>'
    for (const [id, name] of this.items) { html += `<button type="button" onclick="client.${id}.frame.focus()">${name}</button>` }
    this.el.innerHTML = html
    const find = document.createElement('div')
    find.className = 'find'
    find.innerHTML = '<span class="label">Find</span>'
    find.appendChild(this._input)
    this.el.appendChild(find)
    for (const [id, name] of [['subscribe', 'Subscribe'], ['contact', 'Contact']]) {
      const button = document.createElement('button')
      button.type = 'button'
      button.innerText = name
      button.onclick = () => { client[id].frame.focus() }
      this.el.appendChild(button)
    }
    this._input.addEventListener('input', () => { client.find(this._input.value) })
    host.appendChild(this.el)
  }

  this.start = () => {}

  this.focus = () => { this._input.focus(); this._input.select() }
  this.clear = () => { this._input.value = ''; client.find('') }
}
