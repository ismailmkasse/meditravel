# MediTravel Platform (Prototype)

A realistic prototype for an international **Medical Tourism + Hotels + Tours** platform with:
- **World countries list** (ISO) + **currency per country**
- **Transparent pricing UI** (Exact vs Estimated + confidence)
- Health flow designed as **Request Quotation** (not instant booking)
- Demo sections for Clinics, Hotels, Tours, and Country comparison

## Important compliance note
This prototype is designed to be **legal and scalable**:
- **No unauthorized scraping** of third‑party websites.
- Prices should come from **official APIs**, **provider portal inputs**, **licensed datasets**, and **platform historical data**.
- If exact data is unavailable, the UI shows **Estimated / Low confidence** (until integrations/providers add data).

## Tech
- React + TypeScript + Vite
- TailwindCSS + shadcn/ui components
- lucide-react icons

## Run locally
```bash
cd app
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Data
- `src/data/countries.ts` contains the full world country list (ISO alpha-2) with:
  - flag emoji
  - currency code + symbol + name

## Next steps (recommended)
- Replace demo data with real sources:
  - Hotels/Tours via official APIs/affiliates
  - Health via provider portal + quotation workflow
- Add Provider dashboard + Admin verification workflow
- Add payments with escrow-like flows (deposit / milestones)
