'use strict'

/* global client, ResizeObserver */

// The window manager. Holds the icon column and the stack of frames, moves
// them, and keeps the pile under the system chrome so the z-index never
// climbs forever.
//
// It also measures the sticky chrome and publishes the figure as --chrome, so
// the icon column, the scroll offsets and the frame scroll margins all read
// one number instead of each keeping its own guess.

function Desktop (client) {
  this.el = document.createElement('div')
  this.el.id = 'desk'
  this.icons = document.createElement('div')
  this.icons.id = 'icons'
  this.column = document.createElement('div')
  this.column.id = 'column'

  this.offsets = {}
  this.top = 20
  this.active = 'plays'
  this.chrome = 0

  this.install = (host) => {
    this.el.appendChild(this.icons)
    this.el.appendChild(this.column)
    host.appendChild(this.el)
  }

  this.start = () => {
    this.measure()
    window.addEventListener('resize', this.measure)
    window.addEventListener('orientationchange', this.measure)
    if (typeof ResizeObserver === 'function' && client.chrome) {
      new ResizeObserver(this.measure).observe(client.chrome)
    }
  }

  this.measure = () => {
    if (!client.chrome) { return }
    const height = Math.round(client.chrome.getBoundingClientRect().height)
    if (height === this.chrome) { return }
    this.chrome = height
    document.documentElement.style.setProperty('--chrome', `${height}px`)
  }

  this.raise = (el) => {
    if (!el) { return }
    this.top += 1
    if (this.top > 35) { this.normalize() }
    el.style.zIndex = this.top
    this.active = el.id
  }

  this.normalize = () => {
    const wins = Array.from(document.querySelectorAll('[data-win]'))
      .map((w) => { return { w, z: parseInt(w.style.zIndex, 10) || 0 } })
      .sort((a, b) => { return a.z - b.z })
    wins.forEach((o, i) => { o.w.style.zIndex = 21 + i })
    this.top = 21 + wins.length
  }

  // Frames are only draggable where there is a desk to drag them around and a
  // pointer fine enough to grab them. On a phone the titlebar is just a
  // titlebar, and the pile stays a single column.
  this.loose = () => {
    return !window.matchMedia('(max-width:760px), (pointer:coarse)').matches
  }

  this.drag = (e, el) => {
    if (e.target.closest('button')) { return }
    if (!this.loose()) { return }
    const from = this.offsets[el.id] || { x: 0, y: 0 }
    const start = { x: e.clientX, y: e.clientY }
    let at = { x: from.x, y: from.y }
    let frame = null
    this.raise(el)
    const move = (ev) => {
      at = { x: from.x + (ev.clientX - start.x), y: from.y + (ev.clientY - start.y) }
      if (frame) { return }
      frame = requestAnimationFrame(() => { frame = null; el.style.transform = `translate(${at.x}px,${at.y}px)` })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (frame) { cancelAnimationFrame(frame) }
      this.offsets[el.id] = at
      el.style.transform = `translate(${at.x}px,${at.y}px)`
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    e.preventDefault()
  }

  this.tidy = () => {
    for (const id in this.offsets) {
      const el = document.getElementById(id)
      if (el) { el.style.transform = ''; el.style.zIndex = '' }
    }
    this.offsets = {}
    this.top = 20
  }

  this.scrollTo = (el) => {
    requestAnimationFrame(() => {
      if (el.style.position === 'fixed' || !el.offsetParent) { return }
      const still = window.matchMedia('(prefers-reduced-motion:reduce)').matches
      const top = el.getBoundingClientRect().top + window.scrollY - (this.chrome + 12)
      window.scrollTo({ top: Math.max(0, top), behavior: still ? 'auto' : 'smooth' })
    })
  }
}
