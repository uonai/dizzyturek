# Dizzy Turek

DizzyOS. Eight windows, a boot screen and a pager, held in
one HTML file that runs from file://.

## Build

  ./push.sh

Concatenates every file in scripts/lib, then scripts, then links, into two
artifacts:

  index.html  release. One file. Fonts and pictures folded in as data uris.
  debug.html  same page, one script tag per file, for working on it.

No package.json, no dependencies, no bundler. The build is a hundred lines of
node in scripts/lib/build.js and the load order is the dependency graph.

## Structure

  scripts/lib     portable. Copy them into the next project unchanged.
    keys.js       the keymap and the sheet that documents it, one table
    palette.js    the nine colours, written into :root as css variables
    frame.js      a window: chrome, drag handle, close box
    listing.js    a dos directory listing with a `-- More --` pager
    glyphs.js     the pixel sprite sheet
    build.js      the build          — node only, never bundled
    fetch.js      the feed pull      — node only, never bundled

  scripts         this site.
    client.js     composition root. News up every module, installs, starts.
    library.js    everything the desktop holds, and how a record becomes a doc
    feed.js       written by the build. Do not edit.
    desktop.js    window manager: raise, drag, tidy, and the --chrome measure
    boot status menu icons taskbar     the system chrome
    finder reader                      search, and open documents
    plays blog fragments prose images subscribe contact about    the windows

Every module is a capitalised constructor function taking `client`, with the
same three phases:

  constructor   build elements, no dom, no listeners
  install(host) attach, listen, bind keys
  start()       first draw

Modules reach each other through `client`. There is one global, `client`, and
the inline handlers in the html templates call back into it.

## Colour

Nothing in the project names a hex except scripts/lib/palette.js. It writes
nine custom properties into :root and links/palette.css is the only stylesheet
that reads them; links/main.css carries layout and never mentions a colour.

  --bg      the desk              --fill     titlebars, hover
  --ink     body copy, rules      --fill-2   held in reserve
  --ink-2   labels, column heads  --well     the inside of a field
  --ink-3   the quietest thing    --accent   the one colour that means "here"
  --ink-on  copy on a filled surface

To repaint the whole desktop, add a set to Palette.sets and call use(name).

## The feed

Three directories are pulled at build time and folded into the release, the
same way the fonts are:

  PROVINCIALISTICS.DT   from the substack RSS feed
  FRAGMENTS.DT          from substack notes — a line, a picture, or both
  IMAGES.DT             from an are.na channel

A post is available externally: what is held here is an excerpt to recognise it
by and to search on, and the reading happens at the other end of the link. A
note is short enough to hold whole, and its picture is brought down with it.

All three are pulled by node, in scripts/lib/fetch.js, and never by the page.
That is not a preference. Substack has no public api — the RSS feed is the only
surface they support, and it sends no CORS headers, so a browser cannot read it
at all. The notes endpoint is undocumented and may change without warning,
which is another reason to find that out at build time rather than in someone's
browser. are.na could be read from the page, but pulling it here keeps the
release one file that runs from file://, keeps the images inlined, and keeps
the site up when someone else's api is not.

There are no credentials anywhere in this project, and there must never be:
push.sh folds every file under scripts/ into a public index.html. Public are.na
channels need no key. If the channel is ever made private, the token belongs in
a Vercel environment variable read by fetch.js — never in a file.

Two settings, either edited at the top of fetch.js or set in the environment:

  ARENA_CHANNEL   dizzy-website-inspo
  SUBSTACK_HOST   stgod.substack.com

The channel is public, so no key is involved and none is needed. If it is ever
made private, the token goes in a Vercel environment variable read by fetch.js
— never in a file, because every file under scripts/ ends up in index.html.

If a build cannot reach are.na, the images fall back twice: to the are.na url
if the json came through but the file did not, and to the images written into
library.js if nothing came through at all.

Every source is walked to the end of its pagination — are.na by page number,
the substack archive by offset, notes by cursor. Nothing is capped at a page.
CEILING in fetch.js is a runaway backstop, not a target.

Substack turns away anything that does not look like a browser, so fetch.js
asks the way a browser asks. Posts come from the archive endpoint, which pages
properly and carries a real word count; the rss feed is the understudy, since
it only ever holds the most recent handful.

Pictures are pulled through substack's own resizer at THUMB px so that holding
many of them is cheap. HOLD_ART=24 ./push.sh holds the newest 24 and links the
rest, if index.html ever gets too heavy.

To see what each source says without touching the build:

  node scripts/lib/fetch.js

Nothing here can break the site. A failed fetch is a warning, not an error: the
build finishes, feed.js is left as it was, and library.js falls back to the
records written by hand. To build with no network at all:

  SKIP_FETCH=1 ./push.sh

## Where a link goes

Every outbound link resolves to a specific page, not a front door. The
addresses live in one place — the top of library.js and the records themselves:

  library.npx        the New Play Exchange profile, on every play
  library.substack   the publication, for anything without its own url
  library.email      the mailto in Contact
  record.href        the individual post, piece or scan

A record with no href renders no link at all rather than a wrong one. That is
why Reader guards the anchor.

## Deploying

Vercel, static, no framework. vercel.json sets the build command to the same
node script push.sh runs, and serves the repository root.

The cron in vercel.json calls /api/rebuild once a day, which POSTs a deploy
hook and starts a fresh build — that is the only server-side code in the
project, and it holds no content. Two environment variables make it work:

  DEPLOY_HOOK_URL  Settings → Git → Deploy Hooks. Without it, it no-ops.
  CRON_SECRET      any long random string. Without it, the endpoint is open.

Delete api/ and the crons block if you would rather redeploy by hand; the site
does not need them.

## Controls

Press Tab for the sheet. Cmd/Ctrl+1..8 opens a window, Cmd/Ctrl+F finds,
Escape clears the search, PageDown pages whichever listing you touched last,
Cmd/Ctrl+K tidies the desk. Shift+Tab is left alone so tabbing out still works.

## Handhelds

The desk folds to one column under 760px. The chrome stays and sheds fields it
cannot afford: the status line drops to the clock, the framerate and the script
count, the menubar becomes one strip you swipe with Find pinned at its head,
and the taskbar scrolls sideways with Tidy and the open count pinned. Frames
stop being draggable where the pointer is coarse, listings drop their column
heads and stack, and the shortcut sheet is hidden — there is no keyboard to
document. Desktop.measure publishes the sticky chrome's height as --chrome so
the icon column, scroll offsets and scroll margins all read one number.

## No stubs

Nothing on this desk pretends. Boot loads the files it names and the gauge is
the fraction of them that have landed. Contact is an address rather than a form
that would need a server to post to. Subscribe checks the address and hands off
to substack, which owns the list, because a page cannot post to it from here.
