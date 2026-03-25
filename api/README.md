# DLGNT.ai — Deploy Guide

## Environment Variables (add in Vercel Settings)

| Key | Where to get it |
|-----|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API Keys |
| `STRIPE_PRICE_STARTER` | Stripe → Products → Starter plan Price ID |
| `STRIPE_PRICE_GROWTH` | Stripe → Products → Growth plan Price ID |
| `STRIPE_PRICE_SCALE` | Stripe → Products → Scale plan Price ID |
| `RAPIDAPI_KEY` | rapidapi.com → Subscribe to "TikTok Scraper" (free tier available) |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel URL e.g. https://dlgnt.vercel.app |

## Get RapidAPI Key (for real creator data)
1. Go to rapidapi.com → Sign up free
2. Search "TikTok Scraper7" → Subscribe (100 free calls/month)
3. Copy your API key → paste into Vercel env vars

## Deploy Steps
1. Upload this folder to GitHub
2. Import to Vercel → Deploy
3. Add environment variables above
4. Create 3 Stripe products (Starter $99, Growth $299, Scale $599) → monthly recurring
5. Copy Price IDs into Vercel env vars
6. Test with Stripe card: 4242 4242 4242 4242

## Files
- public/index.html — Landing + pricing page
- public/login.html — Login
- public/dashboard.html — Main app (matches Cruva layout)
- public/success.html — Post-payment
- api/create-checkout.js — Stripe subscription
- api/ai.js — Anthropic proxy
- api/creator-search.js — TikTok creator data via RapidAPI
