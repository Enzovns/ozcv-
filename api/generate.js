const Anthropic = require(’@anthropic-ai/sdk’);
const Stripe = require(‘stripe’);

module.exports = async (req, res) => {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

const { prompt, paymentIntentId } = req.body;

try {
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
if (paymentIntent.status !== ‘succeeded’) {
return res.status(402).json({ error: ‘Payment not confirmed.’ });
}
} catch (err) {
return res.status(402).json({ error: ‘Payment verification failed.’ });
}

try {
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const message = await client.messages.create({
model: ‘claude-sonnet-4-20250514’,
max_tokens: 4000,
messages: [{ role: ‘user’, content: prompt }],
});
res.status(200).json({ result: message.content[0].text });
} catch (err) {
res.status(500).json({ error: err.message });
}
};
