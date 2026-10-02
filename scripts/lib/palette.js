'use strict'

// The colours, and nothing else. Nine values are written into :root as custom
// properties and every rule in palette.css reads them from there — no rule
// anywhere else in the project names a colour directly, so swapping the set
// below repaints the whole desktop.

function Palette (client) {
  this.el = document.createElement('style')
  this.el.id = 'palette'

  this.keys = ['bg', 'ink', 'ink-2', 'ink-3', 'ink-on', 'fill', 'fill-2', 'well', 'accent']

  this.sets = {
    dizzy: {
      bg: '#0000a8',      // the desk
      ink: '#ffffff',     // body copy, frame rules
      'ink-2': '#57ffff', // labels, column heads, secondary rules
      'ink-3': '#8f8fd8', // the quietest thing on screen
      'ink-on': '#0000a8', // copy sitting on a filled surface
      fill: '#ffffff',    // titlebars, hover
      'fill-2': '#ffff57', // held in reserve
      well: '#0000a8',    // the inside of a field
      accent: '#ffff57'   // the one colour that means "here"
    }
  }

  this.name = 'dizzy'

  this.install = (host = document.body) => { host.appendChild(this.el) }

  this.start = () => { this.use(this.name) }

  this.use = (name) => {
    const set = this.sets[name]
    if (!set) { console.warn('Palette', `No set named ${name}`); return }
    const missing = this.keys.filter((key) => { return !set[key] })
    if (missing.length) { console.warn('Palette', `${name} is missing ${missing.join(', ')}`); return }
    this.name = name
    this.el.textContent = `:root { color-scheme:dark;\n${this.keys.map((key) => { return `  --${key}: ${set[key]};` }).join('\n')}\n}`
  }

  this.get = (key) => { return this.sets[this.name][key] }

  this.toString = () => {
    return this.keys.map((key) => { return `${key} ${this.get(key)}` }).join('\n')
  }
}
