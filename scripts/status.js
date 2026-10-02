'use strict'

/* global client */

// The line the machine talks about itself on. Only the figures a browser will
// actually admit to: frames, heap, logical cores, screen, uptime, link.

function Status (client) {
  this.el = document.createElement('div')
  this.el.id = 'status'
  this.frames = 0
  this.sample = performance.now()
  this.fps = 0

  this.install = (host) => { host.appendChild(this.el) }

  this.start = () => {
    this.update()
    setInterval(() => { this.update() }, 1000)
  }

  this.count = () => { this.frames += 1 }

  this.update = () => {
    const d = new Date()
    const now = performance.now()
    const dt = (now - this.sample) / 1000
    if (dt > 0.2) { this.fps = Math.min(999, Math.round(this.frames / dt)) }
    this.frames = 0
    this.sample = now
    const up = Math.floor(now / 1000)
    const tasks = client.taskbar.count()
    const counts = client.library.counts
    this.el.innerHTML = `
      <span>${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}</span>
      <span>FPS:${this.fps}</span>
      <span class="sm">${heap()}</span>
      <span class="sm">${cores()}</span>
      <span class="md">VID:${screen.width}×${screen.height}${window.devicePixelRatio > 1 ? '@' + (Math.round(window.devicePixelRatio * 10) / 10) + 'x' : ''}</span>
      <span class="md">UP:${pad(Math.floor(up / 3600))}:${pad(Math.floor(up / 60) % 60)}:${pad(up % 60)}</span>
      <span class="md">${link()}</span>
      <span class="sm med">…Dizzy Turek Task ${tasks.toString(16).toUpperCase().padStart(2, '0')}h</span>
      <span class="push inv">SCRIPTS:${counts.scripts}</span>
      <span class="md inv">PUBLISHED:${counts.published}</span>`
  }

  function pad (n) { return String(n).padStart(2, '0') }

  function heap () {
    const m = performance.memory
    if (m) { return 'Mem:' + m.usedJSHeapSize.toString(16).toUpperCase().padStart(10, '0') }
    return navigator.deviceMemory ? `Mem:${navigator.deviceMemory}GB` : 'Mem:n/a'
  }

  // hardwareConcurrency is the only CPU figure a browser exposes — logical
  // cores. There is no load or usage percentage available.
  function cores () {
    const n = navigator.hardwareConcurrency
    return 'CPU:' + (n ? n + (n === 1 ? ' CORE' : ' CORES') : 'n/a')
  }

  function link () {
    const c = navigator.connection
    return c && c.effectiveType ? `NET:${c.effectiveType.toUpperCase()}${c.downlink ? ' ' + c.downlink + 'Mb' : ''}` : ''
  }
}
