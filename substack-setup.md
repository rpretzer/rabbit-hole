# Substack Setup Guide

## What's Already Done ✅

- ✅ Created `/writing.html` page with Substack embed and latest posts
- ✅ Added "Essays" link to navigation on all pages
- ✅ Added latest essay preview section to homepage
- ✅ Integrated RSS feed loading for latest posts

## What You Need to Do

### 1. Create Your Substack Publication

1. Go to [substack.com](https://substack.com) and sign up/login
2. Click **"Start writing"** or **"Create publication"**
3. Choose a publication name (e.g., "Ryan Pretzer's Product Notes" or "Pragmatic Product")
4. Set your Substack handle (e.g., `ryanpretzer` or `pragmaticproduct`) — this becomes your URL: `https://YOUR_HANDLE.substack.com`
5. Add a description and cover image

### 2. Configure Your Publication

- **Settings → General**: Add your bio, social links, etc.
- **Settings → Publication details**: Set up your publication name, tagline, description
- **Settings → Monetization**: Enable paid subscriptions (optional but recommended)
  - Set your pricing (e.g., $5/month or $50/year)
  - You can offer free + paid tiers

### 3. Get Your Embed Code

1. Go to **Settings → Advanced → Embed**
2. Copy the embed code (it looks like: `<iframe src="https://YOUR_HANDLE.substack.com/embed"...`)
3. Or use the simpler URL: `https://YOUR_HANDLE.substack.com/embed`

### 4. Update Your Site Files

Replace `YOUR_SUBSTACK` with your actual Substack handle in these files:

**Files to update:**
- `writing.html` (3 places):
  - Line ~30: `<iframe src="https://YOUR_SUBSTACK.substack.com/embed"`
  - Line ~33: `<a href="https://YOUR_SUBSTACK.substack.com"`
  - Line ~48: `<a href="https://YOUR_SUBSTACK.substack.com"`
  - Line ~52: `const SUBSTACK_URL = 'YOUR_SUBSTACK';`

- `index.html`:
  - Line ~56: `<a href="https://YOUR_SUBSTACK.substack.com"`
  - In `js/main.js` line ~175: `const SUBSTACK_URL = 'YOUR_SUBSTACK';`

**Example:** If your handle is `ryanpretzer`, replace all instances of `YOUR_SUBSTACK` with `ryanpretzer`.

### 5. Test Everything

1. Visit `/writing.html` — you should see the Substack subscribe form
2. Visit homepage — latest essay should load (if you've published at least one post)
3. Click "Essays" in navigation — should go to `/writing.html`
4. Publish a test post on Substack to verify RSS feed works

### 6. Optional: Custom Domain (Advanced)

If you want `essays.ryanpretzer.com` instead of `ryanpretzer.substack.com`:

1. In Substack: **Settings → Advanced → Custom domain**
2. Add your domain (you'll need to configure DNS)
3. Update links in your site files to use the custom domain

### 7. Monetization Tips

- **Free tier**: Publish some essays free to build audience
- **Paid tier**: Offer deeper dives, templates, or exclusive content
- **Pricing**: Start at $5-10/month or $50-100/year (common for B2B/product content)
- **Promote**: Link from LinkedIn, Twitter, your email signature

### 8. RSS Feed Notes

The site uses `api.rss2json.com` as a CORS proxy to load your Substack RSS feed. This is free but has rate limits. If you need higher volume:

- Host your own RSS proxy endpoint
- Use a service like Zapier/Make to sync posts to your site
- Or just link directly to Substack (simpler, less dynamic)

## Quick Checklist

- [ ] Created Substack publication
- [ ] Set up publication handle
- [ ] Enabled monetization (optional)
- [ ] Replaced `YOUR_SUBSTACK` in `writing.html` (3 places)
- [ ] Replaced `YOUR_SUBSTACK` in `js/main.js` (1 place)
- [ ] Replaced `YOUR_SUBSTACK` in `index.html` (1 place)
- [ ] Published at least one test post
- [ ] Tested subscribe form on `/writing.html`
- [ ] Tested latest essay preview on homepage
- [ ] Verified navigation links work

## Need Help?

- Substack docs: https://substack.com/help
- Substack community: https://on.substack.com

