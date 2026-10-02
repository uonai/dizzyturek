'use strict'

/* global Keys, Palette, Glyphs, Library, Desktop, Status, Menu, Icons, Boot, Taskbar */
/* global Finder, Reader, Plays, Blog, Fragments, Prose, Images, Subscribe, Contact, About */

function Client () {
  this.el = document.createElement('div')
  this.el.id = 'dizzy'
  this.query = ''

  // The status line and the menubar travel together as one sticky band, so
  // nothing below them has to guess at their combined height.
  this.chrome = document.createElement('div')
  this.chrome.id = 'chrome'

  this.keys = new Keys(this)
  this.palette = new Palette(this)
  this.glyphs = new Glyphs(this)
  this.library = new Library(this)
  this.desktop = new Desktop(this)
  this.status = new Status(this)
  this.menu = new Menu(this)
  this.icons = new Icons(this)
  this.boot = new Boot(this)
  this.taskbar = new Taskbar(this)
  this.finder = new Finder(this)
  this.reader = new Reader(this)
  this.plays = new Plays(this)
  this.blog = new Blog(this)
  this.fragments = new Fragments(this)
  this.prose = new Prose(this)
  this.images = new Images(this)
  this.subscribe = new Subscribe(this)
  this.contact = new Contact(this)
  this.about = new About(this)

  this.panels = [['plays', 'Plays'], ['blog', 'Blog'], ['fragments', 'Fragments'], ['prose', 'Prose'], ['images', 'Images'], ['subscribe', 'Subscribe'], ['contact', 'Contact'], ['about', 'About']]
  this.windows = { plays: this.plays, blog: this.blog, fragments: this.fragments, prose: this.prose, images: this.images, subscribe: this.subscribe, contact: this.contact, about: this.about, find: this.finder }

  this.install = (host = document.body) => {
    this.glyphs.install(this.el)
    this.el.appendChild(this.chrome)
    this.status.install(this.chrome)
    this.menu.install(this.chrome)
    this.about.install(this.el)
    this.desktop.install(this.el)
    this.icons.install(this.desktop.icons)
    this.finder.install(this.desktop.column)
    this.reader.install(this.desktop.column)
    this.plays.install(this.desktop.column)
    this.blog.install(this.desktop.column)
    this.fragments.install(this.desktop.column)
    this.prose.install(this.desktop.column)
    this.images.install(this.desktop.column)
    this.subscribe.install(this.desktop.column)
    this.contact.install(this.desktop.column)
    this.boot.install(this.el)
    this.taskbar.install(this.el)
    host.appendChild(this.el)
    this.palette.install(host)
    this.keys.install(this.el)

    this.keys.bind('Desk', 'Shortcuts', 'Tab', () => { this.keys.toggle() })
    this.keys.bind('Desk', 'Find', 'Mod+F', () => { this.menu.focus() })
    this.keys.bind('Desk', 'Clear Find', 'Escape', () => { this.menu.clear() })
    this.keys.bind('Desk', 'Page Listing', 'PageDown', () => { this.page() })
    this.keys.bind('Desk', 'Tidy Windows', 'Mod+K', () => { this.desktop.tidy() })
    this.panels.forEach(([id, name], i) => {
      this.keys.bind('Windows', name, `Mod+${i + 1}`, () => { this[id].frame.focus() })
    })
  }

  this.start = () => {
    console.log('Dizzy', 'Starting..')
    this.palette.start()
    this.keys.start()
    console.info(`${this.keys}`)
    this.library.start()
    this.desktop.start()
    this.menu.start()
    this.icons.start()
    this.finder.start()
    this.reader.start()
    this.plays.start()
    this.blog.start()
    this.fragments.start()
    this.prose.start()
    this.images.start()
    this.subscribe.start()
    this.contact.start()
    this.about.start()
    this.subscribe.frame.close()
    this.taskbar.start()
    this.status.start()
    this.boot.start()
    this.loop()
  }

  this.loop = () => {
    this.status.count()
    requestAnimationFrame(() => { this.loop() })
  }

  this.find = (query) => {
    this.query = query
    this.update()
  }

  this.update = () => {
    this.finder.update()
    this.plays.update()
    this.blog.update()
    this.fragments.update()
    this.prose.update()
    this.images.update()
    this.taskbar.update()
  }

  // PgDn pages the window you last touched, the way a console pager does.
  this.page = () => {
    const target = this.windows[this.desktop.active]
    if (target && target.page) { target.page() }
  }
}
