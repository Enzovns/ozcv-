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
- [ ] Privacy Policy page (URGENT — legal)
- [ ] Fix FR/EN language toggle bug
- [ ] Validate 7 remaining PDF templates
- [ ] Ticket tips popup per sector
- [ ] Integrate sector templates into AI prompt
- [ ] Verify api/generate.js logs no personal data
