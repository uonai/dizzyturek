'use strict'

// The keymap, and the sheet that documents it. One table serves both: bind a
// chord to a name and a function, and the same entry fires the key and prints
// its line in the sheet. Nothing can be reachable by keyboard and undocumented.
//
// Chords are written the way they read: 'Mod+F', 'PageDown', 'Escape'. Mod is
// Cmd on a mac and Ctrl everywhere else, and the sheet prints it as ^.

function Keys (client) {
  this.el = document.createElement('ul')
  this.el.id = 'keys'
  this.groups = []
  this.table = {}
  this.open = false

  const MODS = ['mod', 'alt', 'shift']
  const ALIAS = { cmd: 'mod', command: 'mod', ctrl: 'mod', control: 'mod', meta: 'mod', option: 'alt', opt: 'alt', esc: 'escape', pgdn: 'pagedown', pgup: 'pageup', ' ': 'space' }

  this.install = (host = document.body) => {
    window.addEventListener('keydown', this.onKeyDown)
    this.el.addEventListener('click', this.onClick)
    host.appendChild(this.el)
  }

  this.start = () => {
    this.draw()
    this.hide()
  }

  // Registration. Groups keep the order they were first named in, entries the
  // order they were bound in, so the sheet reads as the client wrote it.

  this.bind = (group, name, chord, fn) => {
    const key = normalize(chord)
    if (!key) { console.warn('Keys', `${name} was given no chord`); return }
    if (this.table[key]) { console.warn('Keys', `${chord} is already bound to ${this.table[key].name}`) }
    if (this.groups.indexOf(group) < 0) { this.groups.push(group) }
    this.table[key] = { group, name, chord, key, fn }
  }

  this.lookup = (chord) => { return this.table[normalize(chord)] || null }

  this.entries = (group) => {
    return Object.values(this.table).filter((entry) => { return entry.group === group })
  }

  this.run = (key) => {
    const entry = this.table[key]
    if (!entry) { return false }
    entry.fn()
    return true
  }

  // The sheet. Drawn once from the table, then shown and hidden. Clicks are
  // delegated off the list so every line stays a plain string of html.

  this.draw = () => {
    this.el.innerHTML = this.groups.map((group) => {
      const lines = this.entries(group).map((entry) => {
        return `<li data-key="${entry.key}">${entry.name}<i>${print(entry.chord)}</i></li>`
      }).join('')
      return `<li><span class="head">${group}</span><ul>${lines}</ul></li>`
    }).join('')
  }

  this.onClick = (e) => {
    const line = e.target.closest('[data-key]')
    if (line) { this.run(line.dataset.key) }
  }

  this.show = () => { this.open = true; this.el.classList.remove('shut') }
  this.hide = () => { this.open = false; this.el.classList.add('shut') }
  this.toggle = () => { return this.open ? this.hide() : this.show() }

  // Dispatch. Typing in a field swallows everything except Escape and the
  // modified chords, and Shift+Tab is left alone so tabbing out still works.

  this.onKeyDown = (e) => {
    if (e.key === 'Tab' && e.shiftKey) { return }
    const held = e.ctrlKey || e.metaKey || e.altKey
    if (isTyping(e.target) && !held && e.key !== 'Escape') { return }
    if (!this.run(chordOf(e))) { return }
    e.preventDefault()
  }

  this.toString = () => {
    return this.groups.map((group) => {
      return `${group}\n` + this.entries(group).map((entry) => { return `  ${entry.name.padEnd(18)} ${print(entry.chord)}` }).join('\n')
    }).join('\n\n')
  }

  // A chord in, a sorted canonical string out: modifiers first, in a fixed
  // order, then the key itself. Written chords and pressed chords both come
  // through here, so the two can only ever match on the same spelling.

  function normalize (chord) {
    const parts = `${chord}`.split('+').map((part) => { return resolve(part.trim().toLowerCase()) })
    const key = parts.filter((part) => { return MODS.indexOf(part) < 0 }).pop()
    if (!key) { return '' }
    return MODS.filter((mod) => { return parts.indexOf(mod) > -1 }).concat(key).join('+')
  }

  function chordOf (event) {
    const parts = []
    if (event.ctrlKey || event.metaKey) { parts.push('mod') }
    if (event.altKey) { parts.push('alt') }
    if (event.shiftKey) { parts.push('shift') }
    parts.push(resolve(event.key.toLowerCase()))
    return normalize(parts.join('+'))
  }

  function resolve (part) { return ALIAS[part] || part }

  function print (chord) {
    return `${chord}`.split('+').map((part) => {
      const p = part.trim()
      return /^(mod|cmd|ctrl|command|control|meta)$/i.test(p) ? '^' : p
    }).join('')
  }

  function isTyping (el) {
    if (!el) { return false }
    return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable === true
  }
}
