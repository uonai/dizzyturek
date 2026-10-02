// The only server-side code in the project, and it holds no content — it just
// pokes Vercel to build again so the feed is pulled fresh. The cron in
// vercel.json calls it once a day.
//
// Two environment variables, both set in the Vercel dashboard:
//
//   DEPLOY_HOOK_URL  Project → Settings → Git → Deploy Hooks. Make one, paste
//                    the url here. Without it this endpoint does nothing.
//   CRON_SECRET      any long random string. Vercel sends it back as a bearer
//                    token so nobody else can trigger builds by hitting the
//                    url. Without it the endpoint is open — set it.

module.exports = async (req, res) => {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ ok: false, error: 'unauthorized' })
    return
  }

  const hook = process.env.DEPLOY_HOOK_URL
  if (!hook) {
    res.status(200).json({ ok: false, error: 'DEPLOY_HOOK_URL is not set, nothing to poke' })
    return
  }

  try {
    const out = await fetch(hook, { method: 'POST' })
    res.status(out.ok ? 200 : 502).json({ ok: out.ok, status: out.status })
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message })
  }
}
