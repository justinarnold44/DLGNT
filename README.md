# AffiliateAI — Deploy Guide

## What's included
- `public/index.html`    — Landing page + pricing
- `public/login.html`    — Login page
- `public/success.html`  — Post-payment success page
- `public/dashboard.html` — Main app (copy your dashboard file here)
- `api/create-checkout.js` — Stripe Checkout backend
- `api/ai.js`            — Anthropic AI proxy (keeps key secure)

---

## Deploy in 15 minutes

### Step 1 — Push to GitHub
1. Create a new repo at github.com
2. Upload all these files to it

### Step 2 — Deploy to Vercel (free)
1. Go to vercel.com → New Project
2. Import your GitHub repo
3. Click Deploy

### Step 3 — Add environment variables in Vercel
Go to your project → Settings → Environment Variables and add:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | Your key from console.anthropic.com |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_live_...) |
| `STRIPE_PRICE_STARTER` | Stripe Price ID for $99/mo plan |
| `STRIPE_PRICE_GROWTH` | Stripe Price ID for $299/mo plan |
| `STRIPE_PRICE_SCALE` | Stripe Price ID for $599/mo plan |
| `NEXT_PUBLIC_BASE_URL` | Your live URL e.g. https://affiliateai.vercel.app |

### Step 4 — Create Stripe products
1. Go to stripe.com → Products → Add product
2. Create 3 products: Starter ($99/mo), Growth ($299/mo), Scale ($599/mo)
3. Set billing as "Recurring" → Monthly
4. Copy each Price ID (starts with price_) into your Vercel env vars

### Step 5 — Copy dashboard
Copy your `affiliate-platform.html` file into `public/` and rename it `dashboard.html`

Update the AI calls in dashboard.html to use your proxy:
```js
// Change this:
const res = await fetch('https://api.anthropic.com/v1/messages', { ... })

// To this:
const res = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], system: systemPrompt })
});
```

### Step 6 — Add custom domain (optional but recommended)
In Vercel → Settings → Domains → add your domain
Buy a domain at namecheap.com (~$12/yr) if needed

---

## Test it
1. Visit your Vercel URL
2. Click "Get started" on any plan
3. Use Stripe test card: 4242 4242 4242 4242, any future date, any CVC
4. Should redirect to success.html then dashboard

---

## Go live
- Switch Stripe from Test mode to Live mode
- Update STRIPE_SECRET_KEY to your live key (sk_live_...)
- You're live and taking payments!
