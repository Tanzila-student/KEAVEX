# KEAVEX

> **Know what your evidence actually supports.**

**Shipaton 2026 — Next Gen**

KEAVEX is an evidence-based capability assessment app. It does not give a skill score or a fake confidence percentage. It evaluates what the available evidence currently supports about a capability claim, exposes what remains uncertain, and lets the user submit new evidence so the conclusion can be reassessed.

**Demo focus (first 2 minutes):**

```text
Claim → Evidence Map → Prove this → Submit evidence → AI reassessment → BEFORE → AFTER + reason
```

---

## Why this exists

Most career tools ask:

> *“What skills do you have?”*

KEAVEX asks:

> *“What does your evidence actually defend — and what would change that?”*

* **Strong** — available evidence sufficiently supports the claim
* **Developing** — some support exists; important gaps remain
* **Insufficient** — current evidence does not adequately support the claim

**Insufficient means insufficient evidence, not “you are incapable.”**

---

## Core loop

```text
Capability claim
      ↓
Evidence (resume / demonstration)
      ↓
What is supported
      ↓
What remains uncertain / where it breaks
      ↓
What would strengthen it
      ↓
User demonstrates
      ↓
Reassessment (status + reason)
```

---

## Features

| Area               | What ships                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **Auth**           | Supabase Auth; protected assessment routes                                                     |
| **Evidence Map**   | Overall evidence boundary + per-capability claim, evidence so far, where it breaks, Prove this |
| **Deep dive**      | Supported by, unknowns, evidence gap, next proof task                                          |
| **Demonstrate**    | User submits new evidence for a specific gap                                                   |
| **Reassess**       | Supabase Edge Function + Gemini; returns previous status, new status, and change reason        |
| **Security model** | Frontend uses publishable key only; secrets and Gemini key stay server-side; RLS on user data  |

---

## Product flow

```text
Landing → Login → Evidence Map → Capability → Demonstrate → Reassessment
         ↘ Upload / Processing (evidence intake)
```

---

## Tech stack

**Frontend:** React Native, Expo, Expo Router, TypeScript

**Backend:** Supabase (Auth, Postgres, RLS, Edge Functions, Storage)

**AI:** Gemini via Edge Function (`reassess-evidence` / analysis pipeline)

**Monetization (Shipaton):** RevenueCat SDK (`react-native-purchases`, `react-native-purchases-ui`) — entitlement-based premium path, such as additional reassessments; native Test Store / development build for purchase testing

**Build:** EAS Build (Android development profile)

---

## Project structure

```text
keavex-app/
├── src/
│   ├── app/                 # Expo Router screens
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── upload.tsx
│   │   ├── processing.tsx
│   │   ├── evidence-map.tsx
│   │   ├── capability.tsx
│   │   ├── demonstrate.tsx
│   │   └── reassessment.tsx
│   ├── components/
│   ├── constants/
│   └── lib/                 # Supabase client, helpers
├── app.json
├── eas.json
├── package.json
└── README.md
```

### Routes

| Route           | Purpose                          |
| --------------- | -------------------------------- |
| `/`             | Entry / landing                  |
| `/login`        | Sign in                          |
| `/upload`       | Evidence intake                  |
| `/processing`   | Processing state                 |
| `/evidence-map` | Evidence boundary + capabilities |
| `/capability`   | Capability deep dive             |
| `/demonstrate`  | Submit new evidence              |
| `/reassessment` | BEFORE → AFTER + reason          |

---

## Setup

### 1. Clone

```bash
git clone YOUR_PUBLIC_REPO_URL
cd keavex-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment

Create a `.env` file in the project root.

```env
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Use only **publishable** keys on the client.

Service-role keys, database passwords, and Gemini API keys belong only in Supabase Edge Function secrets.

**Never commit real secrets or `.env` files to the repository.**

### 4. Run the Expo app

```bash
npx expo start
```

### 5. Android development build

For native functionality such as RevenueCat testing:

```bash
npx eas-cli@latest build --platform android --profile development
```

---

## Backend

```text
App
 │
 ├── Supabase Auth / DB (RLS)
 │
 ▼
Edge Function
(reassess-evidence)
 │
 ▼
Gemini
 │
 ▼
Structured assessment
 │
 ▼
App
 │
 └── Previous status → New status + reason
```

AI assists the evaluation under fixed product rules:

* no percentage-based skill scores
* conservative capability states
* evidence separated from inference
* reassessment based on newly submitted evidence

---

## Security

* Row Level Security (RLS) protects user-owned data.
* Cross-user profile access is restricted.
* The frontend uses publishable Supabase credentials only.
* `EXPO_PUBLIC_*` values are embedded in the client bundle and must never contain private secrets.
* Service-role keys must remain server-side.
* Gemini API keys must remain inside backend / Edge Function secrets.
* `.env`, service-role keys, database passwords, and private API keys must not be committed.

---

## Development status

### Working in this submission

* Expo Router app + assessment UX
* Supabase Auth + protected routes
* Evidence Map / capability / demonstrate / reassessment flow
* Edge Function reassessment with AI-backed structured result
* RevenueCat SDK integration for Shipaton monetization requirements
* EAS Android development-build configuration

### Known limits / next steps

* Premium entitlement UI and store products finalized on native build
* Broader automated isolation tests across child tables
* Production payment configuration and store listing
* Stronger multi-source evidence intake beyond the core demo path
* Stronger evidence authenticity and verification

---

## Future direction

Post-hackathon: stronger evidence provenance, assessment history, production premium entitlements, and—only with curated, validated data—domain-specific models with explicit provenance and evaluation.

This is a future direction, **not a claim that a custom KEAVEX model already ships in this submission.**

### Long-term possibilities

* stronger evidence provenance and verification
* project and work verification
* structured demonstration validation
* richer assessment history
* continuous model evaluation
* improved explainability
* capability progress tracking
* stronger anti-fabrication mechanisms
* production-grade premium access
* expansion into multiple professional capability domains
* a dedicated KEAVEX AI/ML model trained on curated and validated domain data

---

## Design principles

1. **Evidence over claims**
2. **Explainability over black-box scores**
3. **Demonstration over empty advice**
4. **Progress over one-shot judgment**
5. **Honest uncertainty** — do not invent support that is not present in the evidence
6. **Traceability over unsupported conclusions**

---

## Project goal

> **Don’t just say you can. Show what your evidence supports.**

```text
Claim
  ↓
Evidence
  ↓
Gap
  ↓
Demonstrate
  ↓
Reassess
  ↓
Stronger, traceable conclusion
```

---

## License

MIT License — see [`LICENSE`](LICENSE).
