# Operations Notes

## Contact form (Formspree)
- The form on `contact.html` posts to Formspree. Replace `YOUR_FORM_ID` in `action="https://formspree.io/f/YOUR_FORM_ID"` with your Formspree ID.
- Keep `_next` pointing at `https://ryanpretzer.com/thanks.html` (or your custom domain) to redirect after submit.
- Optional: add `_replyto` hidden field if you want reply-to set explicitly.
- If you want Slack/Notion forwarding, use Zapier/Make: trigger = Formspree submission, action = Slack message + Notion row.

## Scheduling
- Calendly link is `https://calendly.com/rpretzer/intro`. Update text/slug as needed.
- Calendly can auto-create Google Meet links; enable in Calendly Integrations.

## Social
- Contact page lists LinkedIn + Instagram. Add more links in the same block or to the footer if desired.

## Deploy (GitHub Pages)
- Workflow: `.github/workflows/deploy.yml` builds nothing (static) and deploys root to GitHub Pages on push to `main`.
- Make sure Pages is enabled in repo settings (Source: GitHub Actions).

## Notion as content/CRM (next steps)
- Content DB idea: create a Notion database with properties like `title`, `slug`, `body (rich text/markdown)`, `tags`, `published`. 
- Build a small node script (e.g., `scripts/notion-sync.js`) that:
  - Uses `NOTION_TOKEN` + `NOTION_DB_ID` env vars.
  - Reads pages, writes JSON/markdown into `content/` for the site.
  - Run on-demand (`node scripts/notion-sync.js`) or via a scheduled Action/cron.
- Leads CRM: make a Notion DB for leads (Name, Email, Source, Status, Next step). Use Zapier/Make to append new Formspree submissions to that DB and post to Slack.

## Secrets
- Do not commit secrets. Store API keys in GitHub repo secrets or local `.env` (ignored).

