# OzCV — AI CV Generator for Australia
ozcv.vercel.app | $5 AUD per CV

## Stack
- Frontend: index.html (root)
- Backend: api/generate.js (Vercel Serverless Function)
- PDF: jsPDF client-side
- AI: claude-sonnet-4-20250514
- Payments: Stripe

## 8 Sectors
- Mining (2p): Summary → Tickets → Skills → Experience → Languages → References
- Mine Utility (2p): same
- Mine Labourer (2p): same
- Hospitality (1p): Summary → RSA/Food → Skills → Experience → References
- Farm Work (1p): Summary → Skills → Experience → References
- Roadhouse (1p): Summary → Skills → Experience → References
- Station Hand (1p): Summary → Skills → Experience → References
- Construction (1p): Summary → Tickets → Skills → Experience → References

## Required Tickets
- Mining/Utility/Labourer: White Card + Working at Height + Confined Space + Gas Test
- Hospitality/Roadhouse: RSA + Food Handling Certificate
- Construction: White Card + Working at Height + Forklift

## Australian CV Rules
- No photo, no DOB
- Always mention visa/work rights
- "References available upon request" at bottom
- Drug & Alcohol free + FIFO available for mining
- Fake mines = Australian closed/real mines only

## TODO Priority
- [x] Privacy Policy page — DONE (privacy-policy.html, linked in footer)
- [x] Fix FR/EN language toggle bug — DONE (job cards, subs, placeholders translated)
- [x] Validate 7 remaining PDF templates — DONE (B&W, 1-page enforcement)
- [x] Ticket tips popup per sector — DONE (modal on sector select)
- [x] Integrate sector templates into AI prompt — DONE (sector aiTexts + pageRule)
- [x] Verify api/generate.js logs no personal data — DONE (only err.message logged)

## Features Added
- Job ad scanner + AI creativity slider (0-100) with matchScore badge
- ATS-friendly mining PDF (single-column, MM/YYYY dates, no color)
- SEO meta tags + og:tags + sitemap.xml
- Education/language rules in prompt (no "Not provided", auto-format langs)
