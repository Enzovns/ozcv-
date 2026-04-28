const Anthropic = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileBase64, mediaType } = req.body;
  if (!fileBase64) return res.status(400).json({ error: 'Missing file data.' });

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      system: 'Tu es un expert ATS australien. Retourne UNIQUEMENT un JSON valide, sans markdown, sans backticks, sans texte avant ou après le JSON.',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 }
          },
          {
            type: 'text',
            text: `Analyse ce CV pour le marché australien mining/FIFO. Retourne ce JSON exact :
{
  "score": <number 0-100>,
  "strengths": ["<point fort 1>", "<point fort 2>", "<point fort 3>"],
  "weaknesses": ["<faiblesse 1>", "<faiblesse 2>", "<faiblesse 3>", "<faiblesse 4>", "<faiblesse 5>"],
  "scoreWithOzCV": <number entre 90 et 97>,
  "summary": "<1 phrase encourageante en français>"
}

Critères de scoring (commence à 100, déduis les pénalités, ajoute les bonus) :
-15 si mise en page multi-colonnes ou tableaux
-10 si icônes ou emojis présents dans le CV
-10 si dates en français ou format non-standard (ex: jan/2024 au lieu de January 2024)
-10 si 'Not provided' dans une section quelconque
-5 par keyword ATS mining manquant parmi : White Card, SWMS, JSA, HSE, PPE, FIFO, drug and alcohol
-5 si pas de mention visa ou work rights
-5 si pas de 'References available upon request'
+10 si headings standards exacts présents : PROFESSIONAL SUMMARY, SKILLS, WORK EXPERIENCE, CERTIFICATIONS, REFERENCES
+10 si métriques chiffrées présentes dans Work Experience (ex: '200 rooms/week', '12-hour shifts')

Score final entre 0 et 100. scoreWithOzCV toujours entre 90 et 97.`
          }
        ]
      }]
    });

    let result;
    try {
      const raw = message.content[0].text.replace(/```json|```/g, '').trim();
      result = JSON.parse(raw);
    } catch (parseErr) {
      return res.status(200).json({ error: 'Analyse impossible, réessaie' });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('ATS score error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
