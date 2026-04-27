const Anthropic = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileBase64, mediaType } = req.body;
  if (!fileBase64) return res.status(400).json({ error: 'Missing file data.' });

  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const mtype = validTypes.includes(mediaType) ? mediaType : 'application/pdf';

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: mtype, data: fileBase64 }
          },
          {
            type: 'text',
            text: `You are an ATS (Applicant Tracking System) expert specialising in Australian job applications — especially mining, FIFO, construction, hospitality, and farm work.

Analyse this CV for ATS compatibility and return ONLY valid JSON (no markdown, no preamble):

{
  "score": <integer 0-100>,
  "grade": "<Poor|Fair|Good|Excellent>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": [
    "<specific weakness 1 — formatting, keyword, structure>",
    "<specific weakness 2>",
    "<specific weakness 3>",
    "<specific weakness 4>",
    "<specific weakness 5>"
  ],
  "ozcv_score": 95,
  "top_issue": "<single most critical fix in one sentence>"
}

Scoring criteria:
- Layout (single column, no tables/text boxes, no headers/footers): 25 pts
- Keywords density (industry-relevant, Australian context): 25 pts
- File format compatibility: 10 pts
- Section structure (standard headings, reverse chronological): 20 pts
- Contact info accessibility: 10 pts
- Date format consistency: 10 pts

Be specific and actionable in weaknesses. Always set ozcv_score to 95.`
          }
        ]
      }]
    });

    const raw = message.content[0].text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);
    res.status(200).json(result);
  } catch (err) {
    console.error('ATS score error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
