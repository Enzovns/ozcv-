const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const TIERS = {
  standard: { price: 1000, name: 'OzCV Standard — CV Professionnel' },
  pro:      { price: 1900, name: 'OzCV Pro — CV + Mode ATS + Cover Letter' },
  premium:  { price: 7900, name: 'OzCV Premium — CV + Appel Personnalisé 30min' }
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
