// api/create-checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  Basic:  { amount: 49500,  name: 'DLGNT.ai — Basic Plan' },
  Growth: { amount: 95000,  name: 'DLGNT.ai — Growth Plan' },
  Scale:  { amount: 295000, name: 'DLGNT.ai — Scale Plan' },
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, company, plan } = req.body;
  if (!name || !email || !plan) return res.status(400).json({ error: 'Missing required fields' });

  const planInfo = PLANS[plan];
  if (!planInfo) return res.status(400).json({ error: 'Invalid plan' });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: planInfo.name },
          unit_amount: planInfo.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { name, company: company || '', plan },
      },
      metadata: { name, company: company || '', plan },
      success_url: `${baseUrl}/success.html?email=${encodeURIComponent(email)}`,
      cancel_url: `${baseUrl}/index.html#pricing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
