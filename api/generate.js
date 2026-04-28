const Anthropic = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, jobDescription, aiCreativity, atsMode } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt.' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const requestParams = {
      model: 'claude-sonnet-4-5',
      max_tokens: 5000,
      messages: [{ role: 'user', content: prompt }],
    };

    if (atsMode) {
      requestParams.system =
        `You generate a 100% ATS-optimised Australian CV for the mining sector.\n\n` +
        `STRICT RULES:\n` +
        `- Use these exact section headings: PROFESSIONAL SUMMARY, CERTIFICATIONS, SKILLS, WORK EXPERIENCE, EDUCATION, LANGUAGES, REFERENCES\n` +
        `- CRITICAL SEPARATION — CERTIFICATIONS vs SKILLS:\n` +
        `  * "licences" array = ONLY tickets/certifications (White Card, Working at Heights, Confined Space, Gas Testing, Standard 11, First Aid, Police Check / VEVO, Driver's Licence). NEVER put these in skills[].\n` +
        `  * "skills" array = ONLY operational skills — NO tickets (12-15 items): Manual Handling, HSE Procedures, PPE Compliance, SWMS / JSA / Take 5, Toolbox Talk, Lock-out Tag-out (LOTO), FIFO / DIDO Ready, 12-Hour Shift Capacity, Shutdown & Turnaround Support, Open-Cut Mining Operations, Mobile Plant Awareness, Pilbara Site Experience, Physical Fitness & Endurance, Team Collaboration, Drug & Alcohol Free.\n` +
        `  * ATS checkers heavily penalise duplicating certifications inside skills. NEVER duplicate.\n` +
        `- Every Work Experience bullet must begin with a strong action verb and contain at least one keyword from the skills list\n` +
        `- Include measurable metrics where possible (e.g. '200+ accommodation rooms cleaned per week', '12-hour shifts on a 7:7 FIFO roster')\n` +
        `- HEADER: the contact line must be plain: Phone | Email | Location | Work Rights. Do NOT include "Drug & Alcohol Free" in the header.\n` +
        `- PROFESSIONAL SUMMARY must explicitly state: FIFO availability, Drug & Alcohol free, and work rights\n` +
        `- EDUCATION: if no education was provided by the candidate, default to "High School Diploma" — NEVER leave empty, NEVER write "Not provided" or "N/A"\n` +
        `- LANGUAGES: always reformat to Australian professional standard — e.g. "French – Native", "English – Professional working proficiency"\n` +
        `- Follow the exact JSON schema provided in the user message — do not invent new keys\n` +
        `- Return ONLY valid JSON, no markdown, no preamble`;
    } else if (jobDescription && jobDescription.trim()) {
      const creativity = parseInt(aiCreativity) || 50;

      let adaptInstruction;
      if (creativity <= 30) {
        adaptInstruction =
          'Only reformulate existing experience using job ad vocabulary and exact phrasing. Do NOT add new responsibilities or invent experience.';
      } else if (creativity <= 70) {
        adaptInstruction =
          'Reformulate existing experience using job ad vocabulary AND add plausible responsibilities the candidate likely performed in similar roles (same industry, same job type). Do NOT invent entire new jobs.';
      } else {
        adaptInstruction =
          'Reformulate existing experience using job ad vocabulary, add plausible responsibilities, AND add max 1 short complementary experience if it meaningfully strengthens the CV for this specific job. Must be realistic for the candidate\'s background. Location must be Australia or a country the candidate has already worked in.';
      }

      requestParams.system =
        `JOB DESCRIPTION TO MATCH:\n${jobDescription}\n\n` +
        `JOB MATCHING INSTRUCTIONS:\n\n` +
        `STEP 1 — Extract from the job ad:\n` +
        `- Required tickets/certifications\n` +
        `- Required hard & soft skills\n` +
        `- Industry keywords and exact phrasing\n` +
        `- Roster type (FIFO, DIDO, 2:1, 3:1...)\n` +
        `- Location & environment keywords\n\n` +
        `STEP 2 — Adapt CV based on AI creativity level (${creativity}/100):\n` +
        `${adaptInstruction}\n\n` +
        `STEP 3 — STRICT RULES (NEVER BREAK):\n` +
        `- NEVER invent certifications/tickets. Tickets come ONLY from user input.\n` +
        `- NEVER invent languages, visa status, or work rights.\n` +
        `- NEVER fabricate company names outside candidate's real history (exception: closed/real Australian mines per existing rules).\n` +
        `- Use EXACT keyword wording from the job ad (e.g. "Working at Heights" not "Work at height", "Confined Space" not "confined spaces").\n\n` +
        `STEP 4 — Set matchScore (0-100) = percentage of the job ad's key requirements that the final CV covers. Include it in the JSON response as "matchScore".\n\n` +
        `GLOBAL RULES (always apply regardless of job ad):\n` +
        `EDUCATION: If no education was provided, set "education" to "" (empty string). NEVER write "Not provided", "N/A", "none", or any placeholder.\n` +
        `LANGUAGES: NEVER copy the user's raw input verbatim. ALWAYS translate to English and reformat as "Language – Level" (e.g. "French – Native", "English – Fluent"). ` +
        `Use standard levels: Native / Fluent / Professional working proficiency / Intermediate / Conversational / Basic. Each language as a separate array item. ` +
        `Interpret French, mixed-language, or informal input and convert to professional English format.`;
    }

    const message = await client.messages.create(requestParams);
    res.status(200).json({ result: message.content[0].text });
  } catch (err) {
    console.error('Anthropic error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
