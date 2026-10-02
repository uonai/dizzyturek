# Deploying to Vercel

The GitHub repo is <https://github.com/uonai/dizzyturek>. These are the steps to put it online.

## 1. Import to Vercel

1. Go to <https://vercel.com/new>.
2. Click **Import** on `uonai/dizzyturek`. (Install the Vercel GitHub app for `uonai` if prompted.)
3. Leave every field at its default — `vercel.json` already sets framework = none, build command = `node scripts/lib/build.js`, output = project root.
4. Click **Deploy**.

The first deploy pulls the Substack and are.na feeds on Vercel's build servers and folds them into `index.html`. Takes about 30 seconds.

## 2. (Optional) Daily rebuild

`vercel.json` contains a cron that calls `/api/rebuild` once a day at 11:00 UTC. To make it actually rebuild (otherwise it is a no-op), set two environment variables in **Project → Settings → Environment Variables**:

| Name              | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| `DEPLOY_HOOK_URL` | Create one at **Settings → Git → Deploy Hooks** (name it e.g. `cron`, branch `main`), then paste the URL. |
| `CRON_SECRET`     | Any long random string. Locks the endpoint so only Vercel's cron can trigger it. |

Redeploy once after setting them. Without these the site still works — it just will not auto-pull new Substack posts. Manually redeploying from the Vercel dashboard also pulls fresh feeds.

## 3. (Optional) Custom domain

**Project → Settings → Domains** → add the domain and follow the DNS instructions Vercel shows.

## That is it

Any `git push` to `main` triggers a new build automatically. No npm install, no framework config, no secrets required for the base site.
