'use strict'

// A DOS directory listing: a header rule, fixed columns, and a `-- More --`
// pager that reports how far through the listing you are — not how much is
// left. Give it column widths and it draws any table on the desktop.

function Listing (columns, step = 3, limit = 5) {
  this.columns = columns
  this.step = step
  this.limit = limit
  this.grid = `grid-template-columns:${columns.map((c) => { return c[1] }).join(' ')}`

  this.page = (total) => {
    this.limit = Math.min(total, this.limit + this.step)
  }

  this.slice = (rows, paged = true) => {
    return paged ? rows.slice(0, this.limit) : rows
  }

  this.head = () => {
    return `<div class="rowhead" style="${this.grid}">${this.columns.map((c) => { return `<span>${c[0]}</span>` }).join('')}</div>`
  }

  this.row = (action, cells) => {
    const spans = cells.map((c, i) => { return `<span class="${this.columns[i][2] ? 'dim' : ''}">${escape(c)}</span>` })
    return `<button type="button" class="row" style="${this.grid}" onclick="${action}">${spans.join('')}</button>`
  }

  this.pager = (action, shown, total) => {
    if (shown >= total) { return '' }
    const pct = Math.round(Math.min(1, total ? shown / total : 1) * 100) + '%'
    return `<button type="button" class="pager" onclick="${action}">
      <span>-- More --</span>
      <span class="gauge"><span style="width:${pct}"></span></span>
      <span>${pct}<span class="sm"> · PgDn</span></span>
    </button>`
  }

  this.empty = (text = 'No match in this directory.') => {
    return `<div class="empty">${text}</div>`
  }

  function escape (text) {
    return `${text}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}
