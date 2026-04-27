const Stripe = require('stripe');

const TIERS = {
  standard: { price: 1000, name: 'OzCV Standard — Professional CV' },
  pro:      { price: 1900, name: 'OzCV Pro — CV + ATS Mode + Cover Letter' },
  premium:  { price: 7900, name: 'OzCV Premium — 1-on-1 Session with Enzo' }
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tier } = req.body;
  if (!tier || !TIERS[tier]) return res.status(400).json({ error: 'Invalid tier.' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const base = process.env.BASE_URL || 'https://ozcv.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'aud',
          product_data: { name: TIERS[tier].name },
          unit_amount: TIERS[tier].price
        },
        quantity: 1
      }],
      success_url: `${base}/?paid=true&tier=${tier}`,
      cancel_url:  `${base}/`,
      allow_promotion_codes: true
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
