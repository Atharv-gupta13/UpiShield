# UPIShield

A real-time fraud explainer for UPI payments — it doesn't just flag a payment as "suspicious," it explains **why** in plain language and tells the user **what to do next**.

## Problem Statement

Every day, thousands of Indians lose money to UPI scams — phishing, impersonation, fake "contest winner" messages, and first-time beneficiary fraud. Existing banking apps show a generic "Are you sure?" prompt without any explanation. Users don't know *why* a payment is risky, so they proceed anyway. UPIShield closes that gap by detecting risk signals, explaining each one in plain language, and giving a clear, tier-based recommendation.

## Features

- **Review Payment screen** — editable payee name, UPI ID, amount, and a "new device" toggle to simulate different scenarios live
- **Mock risk-scoring engine** — checks amount anomaly (vs ₹1,200 baseline), first-time beneficiary, new device/context, UPI ID format, and round-number scam heuristic; combines into a 0–100 score with LOW / MEDIUM / HIGH tiers
- **Risk Result screen** — colored risk badge, plain-language "Why is this risky?" breakdown with icons, and a recommendation box (Proceed / Verify / Warn)
- **Transaction History dashboard** — past mock transactions with colored risk-tier chips, saved to localStorage
- **Preloaded mock data** — realistic Indian names, UPI IDs (`rahul.sharma@okaxis`), and amounts so the demo works immediately
- **Mobile-first responsive design** with a clean fintech aesthetic (emerald green, white cards, soft shadows, rounded corners)

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router DOM 6
- lucide-react icons
- localStorage for mock transaction history (no backend required)

## Local Run Instructions

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (typically `http://localhost:5173`).

## Build Instructions

```bash
npm run build
```

The production build is output to `dist/` and is ready to deploy on Netlify or Vercel.

## Folder Structure

```
upishield/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .gitignore
├── README.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── components/
    │   ├── PaymentForm.tsx
    │   ├── RiskResult.tsx
    │   ├── TransactionHistory.tsx
    │   └── RiskBadge.tsx
    └── utils/
        └── riskEngine.ts
```
