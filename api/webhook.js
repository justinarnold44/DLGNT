// api/webhook.js
// Stripe webhook — fires after successful payment, creates Supabase account

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body needed — see note below
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;
    const name = session.metadata?.name || '';
    const plan = session.metadata?.plan || 'Growth';

    if (email) {
      try {
        // Create user in Supabase — they'll get a magic link to set their password
        const response = await fetch(`${'https://suqghqjepnzrbzgnpjtw.supabase.co'}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cWdocWplcG56cmJ6Z25wanR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM5NjA5NywiZXhwIjoyMDg5OTcyMDk3fQ.gE-ORyS0Y4ZMw9p2Fm-GW0yhdZd5odBbbpU63jdL5uo',
            'Authorization': `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cWdocWplcG56cmJ6Z25wanR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM5NjA5NywiZXhwIjoyMDg5OTcyMDk3fQ.gE-ORyS0Y4ZMw9p2Fm-GW0yhdZd5odBbbpU63jdL5uo'}`
          },
          body: JSON.stringify({
            email,
            email_confirm: true,
            user_metadata: { name, plan, stripe_customer: session.customer }
          })
        });

        const userData = await response.json();

        if (userData.id) {
          // Send password setup email via Supabase
          await fetch(`${'https://suqghqjepnzrbzgnpjtw.supabase.co'}/auth/v1/admin/users/${userData.id}/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cWdocWplcG56cmJ6Z25wanR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM5NjA5NywiZXhwIjoyMDg5OTcyMDk3fQ.gE-ORyS0Y4ZMw9p2Fm-GW0yhdZd5odBbbpU63jdL5uo',
              'Authorization': `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cWdocWplcG56cmJ6Z25wanR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM5NjA5NywiZXhwIjoyMDg5OTcyMDk3fQ.gE-ORyS0Y4ZMw9p2Fm-GW0yhdZd5odBbbpU63jdL5uo'}`
            },
            body: JSON.stringify({ type: 'recovery' }) // sends "set password" email
          });

          console.log(`Account created for ${email} on ${plan} plan`);
        }
      } catch (err) {
        console.error('Supabase account creation error:', err);
      }
    }
  }

  res.status(200).json({ received: true });
};

// IMPORTANT: Vercel parses request body by default which breaks Stripe signature verification.
// Add this to your vercel.json routes to get the raw body for the webhook:
// { "src": "/api/webhook", "dest": "/api/webhook" }
// And set this in your API function config:
module.exports.config = { api: { bodyParser: false } };
