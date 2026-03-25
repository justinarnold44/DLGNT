// api/create-checkout.js
// Vercel serverless function — creates a Stripe Checkout session

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Map plan names to your Stripe Price IDs
// Create these in your Stripe dashboard under Products > Prices
const PRICE_IDS = {
  Starter: process.env.STRIPE_PRICE_STARTER,   // e.g. price_1ABC...
  Growth:  process.env.STRIPE_PRICE_GROWTH,    // e.g. price_1DEF...
  Scale:   process.env.STRIPE_PRICE_SCALE,     // e.g. price_1GHI...
};

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, company, plan } = req.body;

  if (!name || !email || !plan) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { name, company, plan },
      },
      metadata: { name, company, plan },
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};
