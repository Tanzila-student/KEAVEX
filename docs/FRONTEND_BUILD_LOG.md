# KEAVEX Frontend - Engineering Build Log

> A chronological record of the KEAVEX frontend development process from the initial mobile application foundation to the final product integration stage.

---

# 1. Document Purpose

This document records the frontend development progression of KEAVEX.

The purpose is to document:

* what was built
* how the mobile application evolved
* how the frontend architecture was established
* how the Evidence Map was implemented
* how the Demonstrate → Reassess experience was connected to the backend
* how authentication and application navigation were integrated
* how RevenueCat monetization was implemented
* how Android development builds were validated
* what frontend limitations remained during the final integration stage

The backend engineering history is documented separately in:

```text
docs/BACKEND_BUILD_LOG.md
```

Detailed backend debugging is documented in:

```text
docs/BACKEND_ERRORS_AND_DEBUGGING.md
```

This document therefore focuses on **frontend implementation and integration**, rather than repeating backend development details.

---

# 2. Frontend Objective

The KEAVEX frontend was designed to turn the evidence intelligence backend into a usable product experience.

The frontend is not intended to behave like a generic AI chat interface.

Its responsibility is to make the evidence model understandable and actionable.

The core experience became:

```text
Evidence Map
      ↓
Capability
      ↓
Evidence State
      ↓
Evidence Gap
      ↓
Demonstrate
      ↓
Submit Evidence
      ↓
AI Reassessment
      ↓
Updated Capability State
```

The frontend therefore acts as the interaction and presentation layer over the evidence engine.

---

# 3. Core Frontend Principle

The main frontend principle established during development was:

> **The interface should help the user understand what their evidence currently supports and what evidence would make the picture clearer.**

This influenced the product language, information hierarchy, reassessment screen, and interaction design.

The frontend intentionally avoids presenting the system as:

```text
AI Score
```

or:

```text
Generic AI Answer
```

Instead, the user sees:

```text
Capability
+
Evidence
+
Unknowns
+
Evidence Gap
+
Next Proof
```

---

# 4. Technology Foundation

The mobile frontend was built using:

### Mobile Framework

* React Native
* Expo
* TypeScript
* Expo Router

### Backend Integration

* Supabase
* Supabase Edge Functions
* Supabase Auth

### AI Integration

* Gemini through the Supabase backend

The Gemini API key is not exposed to the mobile application.

### Monetization

* RevenueCat
* RevenueCat Test Store

### Build / Validation

* Expo development build
* Android development build
* EAS Build

### Document Input

* `expo-document-picker`

---

# 5. Frontend Architecture

The frontend architecture evolved around a route-based mobile application.

The major application routes became:

```text
/
├── Evidence Map
│
├── /demonstrate
│
├── /reassessment
│
└── /paywall
```

Conceptually:

```text
                    KEAVEX APP
                        │
                        ▼
                  Evidence Map
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
   Capability View              Demonstrate
                                      │
                                      ▼
                              Evidence Submission
                                      │
                                      ▼
                                Reassessment
                                      │
                                      ▼
                              Updated State
                                      │
                                      ▼
                              Pro / Paywall
```

---

# 6. Application Foundation

## Objective

Establish the React Native / Expo application structure required for KEAVEX.

The application was organized around:

```text
src/
├── app/
├── constants/
└── lib/
```

The route-based structure allowed each major product experience to remain isolated.

Important frontend files include:

```text
src/app/_layout.tsx
src/app/demonstrate.tsx
src/app/reassessment.tsx
src/app/paywall.tsx
```

The application also contains supporting logic and seeded analysis data.

---

# 7. Navigation Architecture

Expo Router was used for application navigation.

The main product flow was intentionally kept short:

```text
Evidence Map
      ↓
Capability
      ↓
Demonstrate
      ↓
Reassessment
```

Monetization was introduced only when the user reached the reassessment limit:

```text
Free Reassessment
      ↓
Limit Reached
      ↓
KEAVEX Pro
      ↓
Purchase
      ↓
Continue Reassessment
```

This kept the main product loop separate from the monetization flow.

---

# 8. Evidence Map

## Objective

Create the primary product surface where users can understand their current capability evidence.

The Evidence Map became the central starting point of the application.

It represents capability states using:

```text
Strong
Developing
Insufficient
```

The frontend does not calculate these states.

They are received from the assessment data.

---

# 8.1 Capability Representation

Each capability can expose information such as:

```text
Capability
Current Status
Supporting Evidence
Evidence Strength
Unknowns
Evidence Gap
Why the Gap Matters
Next Evidence Task
```

The purpose is to move away from a simple:

```text
Skill → Score
```

model.

Instead:

```text
Capability
    ↓
Evidence
    ↓
Current Understanding
    ↓
Missing Proof
```

---

# 8.2 Insufficient State

The frontend preserves an important distinction:

> **Insufficient means insufficient evidence, not inability.**

This wording became important to the product experience because a missing proof should not be interpreted as a negative judgment about the user.

---

# 8.3 Seeded Demonstration Data

The current hackathon Evidence Map uses deterministic seeded analysis data.

The data is located at:

```text
src/constants/mockAnalysis.ts
```

This was intentional for the final demonstration.

It provides a stable starting state for the product demo rather than depending on a fresh AI analysis every time the application opens.

The live reassessment flow is separate from this seeded presentation layer.

---

# 9. Demonstrate Flow

## Objective

Turn an evidence gap into an actionable demonstration.

When a capability has an evidence gap, the frontend presents the user with a concrete task.

For example:

```text
Containerization (Docker)
```

can lead to a demonstration involving:

```text
A repeatedly restarting production container.
```

The user is asked to explain how they would:

```text
diagnose
isolate
recover
```

the issue.

The user's response then becomes new evidence.

---

# 9.1 User Evidence Submission

The frontend collects the user's demonstration response.

The important architectural boundary is:

```text
Frontend
    ↓
Collect user response
    ↓
Backend
    ↓
AI reassessment
```

The frontend does not independently determine whether the response is correct.

---

# 9.2 Reassessment Request

The frontend sends the required reassessment context to the backend:

```text
analysis_id
capability_id
user_response
```

The request is sent to:

```text
reassess-evidence
```

The backend then performs the actual evidence reassessment.

---

# 10. Reassessment Experience

## Objective

Make the reassessment feel like an evidence-learning experience rather than an AI-generated verdict.

This screen went through several iterations during development.

The final direction intentionally moved away from:

```text
technical_response
```

and other backend-oriented terminology.

The frontend should expose human-readable product language rather than database or API field names.

---

# 10.1 Reassessment Language

The final experience uses language such as:

```text
EVIDENCE RE-CHECKED
```

and:

```text
DECISION RATIONALE • WHY STATE DIDN'T MOVE
```

The purpose is to communicate that KEAVEX has reconsidered the capability using the newly submitted evidence.

---

# 10.2 Capability State

The reassessment screen explains the current capability state without pretending that every new response must produce a status transition.

For example:

```text
Developing → Developing
```

can mean:

```text
New evidence was useful,
but it did not yet provide enough proof
to justify moving the capability state.
```

The frontend therefore treats:

```text
No transition
```

as a meaningful outcome rather than an error.

---

# 10.3 Decision Rationale

The final copy direction for the Docker example became:

```text
DECISION RATIONALE • WHY STATE DIDN'T MOVE

Your evidence strengthens the diagnosis signal.
To move the state, the next step is proving production-level container recovery.

Missing evidence: a Dockerfile or Docker Compose manifest,
plus proof that you recovered a real multi-container production failure.
```

The purpose of this section is not to reproduce the entire AI response.

It communicates:

```text
What became stronger
+
What is still missing
+
What would change the conclusion
```

---

# 10.4 Evidence-Driven Progression

The frontend therefore communicates the central KEAVEX concept:

```text
New Evidence
      ↓
Evidence Re-check
      ↓
Current Understanding
      ↓
Missing Proof
      ↓
Next Demonstration
```

The user is encouraged to strengthen their evidence rather than simply receive another generic AI explanation.

---

# 11. Backend Boundary

A major frontend engineering rule was established:

> **The frontend does not determine capability status.**

The backend is the source of truth for:

```text
strong
developing
insufficient
```

The frontend receives and renders the result.

This prevents duplicated assessment logic between the mobile application and backend.

---

# 11.1 Frontend Responsibilities

The frontend is responsible for:

* collecting user input
* displaying capability information
* displaying evidence
* displaying unknowns
* displaying evidence gaps
* presenting demonstration tasks
* submitting new evidence
* displaying reassessment results
* displaying loading states
* displaying errors
* controlling navigation
* enforcing the user-facing monetization flow

---

# 11.2 Backend Responsibilities

The backend remains responsible for:

* evidence evaluation
* Gemini reasoning
* capability status
* evidence strength
* convergence
* status transitions
* persistence
* demonstration history

The boundary therefore remains:

```text
Frontend
→ Interaction + Presentation

Backend
→ Evidence Intelligence + State
```

---

# 12. Authentication Integration

Supabase Auth was integrated into the application.

The frontend operates within an authenticated-user architecture so that backend analysis records can be associated with users.

The application therefore does not treat the evidence system as a completely anonymous static interface.

The authenticated identity can be passed into backend workflows where required.

---

# 13. PDF Upload Flow

## Objective

Allow the frontend to work with user-provided resume documents rather than relying conceptually on a single fixed resume.

The project integrated:

```text
expo-document-picker
```

The installed package was verified during development as:

```text
expo-document-picker@57.0.3
```

under:

```text
Expo 57.0.26
```

The intended frontend flow is:

```text
User
 ↓
Choose PDF
 ↓
Document Picker
 ↓
Selected File
 ↓
Upload / Analysis Request
 ↓
Backend
```

---

# 13.1 Dynamic Resume Architecture

The backend API accepts:

```text
pdf_path
```

rather than a hardcoded resume filename.

This means the frontend architecture is designed to provide the selected document path to the backend.

The backend then retrieves the corresponding file from Supabase Storage.

---

# 13.2 PDF Replacement Debugging

During the final integration stage, the ability to replace the currently selected PDF was actively debugged.

The dependency itself was present and verified:

```text
expo-document-picker@57.0.3
```

However, the final change-PDF interaction encountered implementation errors during development.

Therefore the final engineering record does **not** mark the complete PDF replacement workflow as independently validated.

This distinction is important:

```text
Backend dynamic pdf_path
        ✓

Document Picker dependency
        ✓

Frontend PDF selection integration
        ✓ / under integration

Final change-PDF interaction
        → debugging stage
```

The issue was frontend integration rather than the existence of the backend dynamic PDF contract.

---

# 14. RevenueCat Monetization

## Objective

Connect the frontend to the KEAVEX Pro subscription flow.

RevenueCat was integrated into the mobile application.

The product configuration used:

```text
Product ID:
keavex_pro_monthly

Package:
monthly

Entitlement:
keavex_pro_monthly
```

---

# 14.1 Purchase Logic

Core purchase logic was implemented in:

```text
src/lib/purchases.ts
```

The application checks the RevenueCat entitlement before allowing additional reassessment access.

---

# 14.2 Paywall

The user-facing paywall was implemented in:

```text
src/app/paywall.tsx
```

The paywall appears after the free reassessment allowance is exhausted.

The product flow became:

```text
Free User
    ↓
Free Reassessment
    ↓
Free Limit Reached
    ↓
KEAVEX Pro Paywall
    ↓
RevenueCat Test Store
    ↓
Purchase
    ↓
Entitlement Activated
    ↓
Additional Reassessment
```

---

# 14.3 Test Store Validation

The RevenueCat Test Store was used during Android development.

The test purchase successfully:

```text
completed the purchase
        ↓
activated the Pro entitlement
        ↓
unlocked the additional reassessment
```

This demonstrated that the subscription was connected to an actual product action rather than existing only as dashboard configuration.

---

# 15. Android Development Build

The application was validated using an Android development build.

Expo development tooling was used during implementation.

The development environment included:

```text
Expo
Expo Router
Expo Dev Client
Android Development Build
EAS Build
```

The application was repeatedly run on an Android device during UI and backend integration.

---

# 16. EAS Build Integration

EAS was incorporated into the development workflow to support Android development builds.

The project was configured for:

```text
EAS Build
```

and the Android development build became part of the product validation process.

The purpose was to validate the actual mobile experience rather than relying only on a web or simulator representation.

---

# 17. Frontend Debugging

Frontend development involved multiple classes of failures.

These included:

```text
Metro / Expo startup issues
```

```text
development-build connectivity issues
```

```text
React rendering errors
```

```text
reassessment screen data-shape mismatches
```

```text
document-picker integration issues
```

---

# 17.1 Reassessment Rendering Error

One significant rendering issue occurred when an evidence object was rendered directly as a React child.

The object had the structure:

```text
{
  source,
  strength,
  detail
}
```

React Native reported:

```text
Objects are not valid as a React child
```

The root issue was a data-shape mismatch between the structured backend evidence object and the frontend rendering layer.

The frontend needed to render individual properties rather than attempting to render the object itself.

This reinforced the importance of maintaining a clear API-to-UI transformation boundary.

---

# 17.2 Reassessment Module Error

A separate development error occurred in:

```text
src/app/reassessment.tsx
```

with:

```text
Uncaught Error
'' is not a function
```

The issue occurred during the rapid reassessment-screen iteration and was corrected as the screen implementation was revised.

---

# 17.3 UI Iteration

The reassessment screen went through multiple visual iterations.

The major problems identified during review included:

* excessive vertical spacing
* weak Android density
* overly large empty areas
* weak typography hierarchy
* unnecessary symbols
* backend terminology exposed to the user
* generic AI-like wording
* weak button treatment
* redundant explanatory text

The final design direction was therefore intentionally:

```text
Calm
Minimal
Dense enough for Android
Premium
Readable
Evidence-focused
```

rather than a dashboard overloaded with cards and labels.

---

# 18. Design Direction

The frontend was progressively refined toward a premium product experience.

The intended visual characteristics became:

```text
Calm
Clean
Minimal
High-trust
Purposeful
Evidence-driven
```

The goal was not to make every section visually elaborate.

Instead, each element should answer a user question.

For example:

```text
Why did the state change?
```

```text
Why did the state stay the same?
```

```text
What evidence is missing?
```

```text
What should I demonstrate next?
```

This became the main criterion for keeping or removing interface elements.

---

# 19. Reassessment Design Principle

The reassessment screen was deliberately designed to avoid feeling like:

```text
AI says:
"You are still developing."
```

Instead, the user should understand:

```text
What new evidence was considered
        ↓
What became clearer
        ↓
Why the state changed or stayed
        ↓
What evidence would strengthen it
```

This is the frontend representation of KEAVEX's evidence loop.

---

# 20. Current Demo Architecture

The final hackathon application separates deterministic demo state from live reassessment.

```text
Evidence Map
     │
     │ seeded deterministic analysis
     ▼
Capability
     │
     ▼
Demonstrate
     │
     │ user-generated evidence
     ▼
Supabase Edge Function
     │
     ▼
Gemini
     │
     ▼
Reassessment Result
     │
     ▼
Frontend
     │
     ▼
Updated Capability Understanding
```

This allows the main product experience to begin from a stable demonstration state while still proving the live AI evidence loop.

---

# 21. Final Product Loop

The frontend exposes the complete product loop as:

```text
Evidence Map
      ↓
Select Capability
      ↓
Understand Current Evidence
      ↓
Identify Evidence Gap
      ↓
Demonstrate
      ↓
Submit New Evidence
      ↓
AI Reassessment
      ↓
Understand What Changed
      ↓
Understand What Is Still Missing
      ↓
Return to Evidence Map
```

Monetization is connected to the continuation of this loop:

```text
Reassessment Limit
      ↓
KEAVEX Pro
      ↓
RevenueCat Test Purchase
      ↓
Entitlement
      ↓
Additional Reassessment
```

---

# 22. Frontend Responsibility Boundary

The final frontend architecture can therefore be summarized as:

```text
USER
 │
 ▼
KEAVEX MOBILE UI
 │
 ├── Evidence Map
 ├── Capability View
 ├── Demonstrate
 ├── Reassessment
 └── Paywall
 │
 ▼
SUPABASE
 │
 ├── Auth
 ├── Database
 └── Edge Functions
 │
 ▼
GEMINI
```

The mobile application does not contain the core AI assessment logic.

---

# 23. Frontend Engineering Decisions

## Decision 1 — Evidence Map as the Product Center

The application begins from the user's capability picture rather than from a generic AI chat.

---

## Decision 2 — Seeded Demo State

The Evidence Map uses deterministic seeded data so that the hackathon demonstration has a stable starting state.

---

## Decision 3 — Live Reassessment

The Demonstrate → Reassess interaction is connected to the live backend pipeline.

---

## Decision 4 — Backend-Owned Capability Status

The frontend never independently decides:

```text
strong
developing
insufficient
```

---

## Decision 5 — Human-Facing Language

Backend implementation terms should not leak into the product interface.

For example:

```text
technical_response
```

is an internal data concept.

The user-facing experience communicates the meaning of the evidence instead.

---

## Decision 6 — Evidence Before Decoration

UI elements are retained only when they improve:

```text
understanding
trust
actionability
```

rather than simply filling space.

---

## Decision 7 — Android-First Density

The final interface was repeatedly reviewed on Android.

Large empty areas and excessive vertical spacing were treated as product-quality problems rather than merely cosmetic differences.

---

# 24. Final Frontend Validation

The frontend successfully established the following major product surfaces:

### Application

```text
✓
```

### Expo Router Navigation

```text
✓
```

### Evidence Map

```text
✓
```

### Capability Representation

```text
✓
```

### Demonstration Flow

```text
✓
```

### Live Reassessment Integration

```text
✓
```

### Reassessment Result Presentation

```text
✓
```

### Authentication Integration

```text
✓
```

### RevenueCat Integration

```text
✓
```

### Pro Paywall

```text
✓
```

### Test Store Purchase

```text
✓
```

### Pro Entitlement Unlock

```text
✓
```

### Android Development Build

```text
✓
```

### EAS Development Build

```text
✓
```

### Dynamic PDF Backend Contract

```text
✓
```

### Frontend PDF Replacement

```text
Integration / final validation in progress
```

---

# 25. Frontend Status

## PRODUCT INTEGRATION READY

The main KEAVEX frontend product loop has been implemented:

```text
Evidence Map
      ↓
Capability
      ↓
Demonstrate
      ↓
Evidence Submission
      ↓
AI Reassessment
      ↓
Updated Evidence Understanding
      ↓
RevenueCat Pro Flow
```

The primary remaining frontend integration issue identified during the final development stage was the complete PDF replacement interaction.

This should not be represented as successfully validated until it has been tested end-to-end on the Android build.

---

# 26. Frontend / Backend Freeze Boundary

The backend API contracts are frozen.

The frontend consumes:

```text
POST /functions/v1/analyze-evidence
```

and:

```text
POST /functions/v1/reassess-evidence
```

The frontend should therefore not reproduce backend assessment logic.

The integration boundary is:

```text
Backend
→ Determines evidence state

Frontend
→ Explains and presents evidence state
```

---

# 27. Final Frontend Engineering Principle

The frontend was built around one central product principle:

> **KEAVEX should feel like a system that helps the user learn what their evidence proves, not a system that simply gives them another AI answer.**

That principle is reflected in:

```text
Evidence Map
      ↓
Capability State
      ↓
Evidence Gap
      ↓
Demonstration
      ↓
Reassessment
      ↓
Decision Rationale
      ↓
Next Proof
```

The frontend therefore transforms the backend evidence engine into a continuous learning experience.

---

# 28. Final Product Architecture

The complete KEAVEX product can now be represented as:

```text
                    KEAVEX
                       │
                       ▼
                Evidence Map
                       │
                       ▼
                  Capability
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
           Evidence         Evidence Gap
                                │
                                ▼
                           Demonstrate
                                │
                                ▼
                         New User Evidence
                                │
                                ▼
                     Supabase Edge Function
                                │
                                ▼
                              Gemini
                                │
                                ▼
                          Reassessment
                                │
                                ▼
                    Updated Evidence State
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
             Continue Growth          Pro Paywall
                                            │
                                            ▼
                                      RevenueCat
                                            │
                                            ▼
                                    Additional Evidence
```

---

# 29. Final Frontend State

At the end of the frontend integration stage:

```text
React Native
        ✓

Expo
        ✓

TypeScript
        ✓

Expo Router
        ✓

Evidence Map
        ✓

Capability Experience
        ✓

Demonstration Flow
        ✓

Live Reassessment
        ✓

Backend Integration
        ✓

Authentication
        ✓

RevenueCat
        ✓

Pro Paywall
        ✓

Test Purchase
        ✓

Android Development Build
        ✓

EAS Build
        ✓

Premium Reassessment Experience
        ✓

Dynamic PDF Architecture
        ✓

Final PDF Replacement Validation
        → remaining integration issue
```

---

# 30. Final Engineering Boundary

The KEAVEX frontend is not the intelligence layer.

It is the product layer that makes the intelligence understandable.

The complete system is:

```text
USER
  ↓
KEAVEX FRONTEND
  ↓
EVIDENCE INTERACTION
  ↓
KEAVEX BACKEND
  ↓
GEMINI REASONING
  ↓
STRUCTURED EVIDENCE STATE
  ↓
KEAVEX FRONTEND
  ↓
USER UNDERSTANDING
```

The frontend therefore completes the loop:

> **Evidence → Understanding → Demonstration → Reassessment → Growth through proof.**

---

## Frontend Documentation

For the complete engineering history:

* `docs/FRONTEND_BUILD_LOG.md` — frontend development progression, architecture, implementation decisions, integration, and validation
* `docs/BACKEND_BUILD_LOG.md` — backend Day 1 to Day 9 engineering progression
* `docs/BACKEND_ERRORS_AND_DEBUGGING.md` — backend failures, investigation, fixes, and validation
