const Anthropic = require(’@anthropic-ai/sdk’);

module.exports = async (req, res) => {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

const { prompt } = req.body;

if (!prompt) {
return res.status(400).json({ error: ‘Missing prompt.’ });
}

try {
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const message = await client.messages.create({
model: ‘claude-sonnet-4-5’,
max_tokens: 4000,
messages: [{ role: ‘user’, content: prompt }],
});
res.status(200).json({ result: message.content[0].text });
} catch (err) {
console.error(‘Anthropic error:’, err.message);
res.status(500).json({ error: err.message });
}
};
