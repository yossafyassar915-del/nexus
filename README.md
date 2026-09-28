# Nexus — Static Interactive Demo

A fully client-side, backend-free build of the Nexus CRM/ERP for sending to
clients as a clickable mockup. **No server, no database, no API keys, no
`.env` files — just plain HTML/CSS/JS.**

## What's different from the full-stack version

| | Full-stack version | This demo |
|---|---|---|
| Login | Supabase Auth, required | **Removed** — opens straight to the dashboard |
| Data | Supabase (PostgreSQL) via a FastAPI backend | **Browser `localStorage`** (see `js/db.js`) |
| AI Assistant | Real LLM (Groq) tool-calling | **Simulated** — local rule-matching + a 1.5s delay, same UI |
| Voice input/output | Same | **Unchanged** — Web Speech API is a browser feature, not a server call, so it still really works |

Every Add/Edit/Delete (new lead, new deal, new order, changing a pipeline
stage, receiving a purchase order, ...) writes straight to `localStorage`
and **persists across page refreshes** — but only in that one browser, on
that one device. There's nothing to keep in sync between visitors; each
person who opens the link gets their own independent copy of the data,
seeded from the same realistic starting point.

## Deploying to GitHub Pages

1. Push everything in this folder to a new GitHub repository (the files
   need to sit at the **root** of the repo, or in a `/docs` folder — either
   works, just match it to what you pick in step 2).
2. In the repo: **Settings → Pages → Build and deployment → Source:
   "Deploy from a branch"** → pick your branch and the `/ (root)` folder
   (or `/docs` if you put the files there) → **Save**.
3. GitHub gives you a URL like `https://yourusername.github.io/your-repo/`
   within a minute or two. That's the link to send your client.

No build step, no `npm install`, no configuration — it's already 100%
static files.

## Trying it locally first

Because the pages load `components/*.html` via `fetch()`, opening
`index.html` directly as a `file://` URL won't work (browsers block that
for security). Serve it locally instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works the same way (`npx serve`, VS Code's "Live
Server" extension, etc.) — this is exactly how GitHub Pages will serve it
too, so if it works locally like this, it'll work once deployed.

## "Reset Demo Data"

There's a button in the top-right of every page. It wipes whatever the
person clicking around has added/changed and restores the original seed
data — handy for resetting between demo calls, or if a client wants to
"start over" after exploring.

## Editing the sample data

Open `js/db.js` and edit the `buildSeed()` function — it's plain JS objects
(accounts, leads, deals, inventory, orders, purchase orders). Change names,
numbers, stages, whatever fits the client's industry better. There's no
database to migrate; refreshing the page (or clicking "Reset Demo Data")
picks up your edits immediately.

## File map

```
index.html          Dashboard
crm.html             Leads / Accounts / Pipeline
erp.html              Inventory / Orders / Procurement / Reports
css/                   Same visual design as the full-stack version
js/
  db.js                 The "backend" — localStorage CRUD + seed data
  ai_widget.js            Simulated AI assistant (Web Speech API + local replies)
  layout.js                 Loads the shared sidebar/header/AI widget, wires "Reset Demo Data"
  charts.js                  Dashboard charts + KPI cards + opportunities table
  crm.js                       CRM page logic (tabs, tables, forms, pipeline board)
  erp.js                        ERP page logic (tabs, tables, forms, line-items)
  app.js                        Dashboard page bootstrap
components/            Shared HTML fragments (sidebar, header, AI widget, table)
```

## Going from demo → real product later

If the client says yes and you want to turn this back into the real,
multi-user, persisted version (Supabase + FastAPI + real AI), that's the
other project we built together earlier in this conversation — this static
demo is a separate, simplified fork of it made specifically for this
mockup, not a replacement.
