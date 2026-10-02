# KEAVEX Frontend - Errors & Debugging

> A record of real frontend failures, investigation, root causes, fixes, UI integration issues, and validation during the KEAVEX frontend development process.

---

# Purpose

This document records the major technical problems encountered while building and integrating the KEAVEX frontend.

The purpose is not to list hypothetical errors.

Each section documents:

* the actual problem
* the initial approach
* the observed behaviour
* the investigation
* the root cause
* the fix
* how the fix was validated
* the final engineering decision

The main frontend development progression is documented separately in:

`docs/FRONTEND_BUILD_LOG.md`

The backend debugging process is documented separately in:

`docs/BACKEND_ERRORS_AND_DEBUGGING.md`

---

# Frontend Foundation - Expo / React Native Development Environment

## Problem

The KEAVEX frontend was developed as an Expo React Native application and required a development environment capable of supporting:

```text
Expo
React Native
TypeScript
Expo Router
Android Development Build
```

The application also needed to communicate with the Supabase backend during development.

---

## Initial Approach

The frontend was run through the normal Expo development workflow.

The application was tested using the Android development build rather than treating the browser as the final product environment.

---

## Observed Behaviour

Development connectivity was affected by the local network configuration.

The development machine and Android device needed to communicate with the Expo development server.

---

## Investigation

The development environment was checked using:

```text
Expo
EAS
Android Development Build
```

The phone was connected to the development machine through a mobile hotspot.

Tunnel connectivity was also tested when direct local connectivity was unreliable.

---

## Root Cause

The connectivity issue was related to the development environment and network path rather than the KEAVEX application logic itself.

---

## Fix

The development workflow was configured around the Android development build and Expo development server.

Tunnel mode was also tested as an alternative when local network connectivity was unreliable.

---

## Validation

The KEAVEX application was successfully loaded in the Android development environment during development.

---

## Final Decision

Android development-build validation is treated as the relevant frontend validation environment rather than relying only on browser rendering.

---

# Frontend Runtime - `Uncaught Error "" is not a function`

## Error

During reassessment screen development, the application produced a runtime error similar to:

```text
Uncaught Error "" is not a function
```

The error occurred while the reassessment screen was being updated during development.

---

## Initial Approach

The reassessment screen was being modified while Hot Module Reloading was active.

The application was expected to reload the updated component automatically.

---

## Observed Behaviour

The application failed while rendering the reassessment screen instead of displaying the expected UI.

---

## Investigation

The reassessment component was reviewed for invalid function calls and malformed expressions introduced during the UI iteration.

The problem was isolated to frontend component code rather than:

```text
Supabase
Gemini
Database
RevenueCat
```

---

## Root Cause

A frontend code expression was being evaluated as a function even though the resulting value was not callable.

The issue was introduced during iterative modification of the reassessment component.

---

## Fix

The reassessment component was corrected so that only valid callable functions were invoked.

The affected rendering logic was then reloaded through the development build.

---

## Validation

The reassessment screen was able to render again after the correction.

---

## Final Decision

The reassessment screen must remain free of dynamic expressions that can accidentally evaluate non-functions as callable values.

---

# Reassessment UI - `[object Object]` React Rendering Error

## Error

The reassessment screen produced a React rendering error:

```text
Objects are not valid as a React child
```

The error identified an object containing fields similar to:

```text
source
strength
detail
```

---

## Initial Approach

The frontend attempted to render the returned evidence value directly.

Conceptually, the UI was treating the response as though the evidence itself were a text string.

---

## Observed Behaviour

React rejected the value because the frontend was attempting to render an object directly inside the component tree.

The returned evidence structure was an object rather than a primitive text value.

---

## Investigation

The response structure was inspected.

The evidence object contained structured fields:

```text
source
strength
detail
```

The backend response was therefore valid structured data, but the frontend rendering code did not correctly map that structure into UI elements.

---

## Root Cause

A JavaScript object was passed directly into React rendering.

React cannot render an arbitrary object as a child.

---

## Fix

The frontend was changed to render the individual fields instead of the object itself.

Conceptually:

```text
evidence
 ├── source
 ├── strength
 └── detail
```

was rendered as separate UI values.

---

## Validation

The reassessment screen was able to render the structured evidence response without the React object-child error.

---

## Final Decision

Structured backend objects must always be explicitly mapped into frontend presentation components.

The frontend must not assume that every API response field is directly renderable text.

---

# Reassessment Screen - Hardcoded Result Problem

## Problem

During early reassessment UI testing, the frontend displayed a fixed result instead of reflecting the actual Gemini/backend response.

---

## Initial Approach

The UI was initially developed around a known demonstration response.

This made it easier to establish the visual layout of:

```text
Previous Status
New Status
Reason
Evidence
```

---

## Observed Behaviour

Different user responses did not produce sufficiently different frontend results.

The screen could continue showing the same predefined explanation even when the submitted evidence changed.

---

## Investigation

The frontend behaviour was compared against the backend reassessment endpoint.

The backend was already capable of returning contextual results based on:

```text
capability
existing evidence
unknowns
evidence gaps
user response
```

The problem was therefore located at the presentation/integration layer.

---

## Root Cause

The frontend UI had been using development/demo content instead of treating the backend reassessment response as the source of truth.

---

## Fix

The reassessment screen was changed toward rendering the actual backend response.

The frontend receives the reassessment result and uses the returned fields for the resulting state and explanation.

The frontend does not independently determine whether a capability is:

```text
strong
developing
insufficient
```

---

## Validation

Different reassessment inputs were tested against the live backend flow.

The resulting frontend state could reflect the backend response rather than relying only on a fixed demonstration message.

---

## Final Decision

The backend owns capability state.

The frontend is responsible for:

```text
receiving
interpreting
formatting
displaying
```

the backend result.

It must not invent or override capability status.

---

# Reassessment - Confusing `Developing → Developing` Presentation

## Problem

A reassessment could legitimately return:

```text
Developing
→
Developing
```

This was technically valid but confusing when displayed as a simple status transition.

---

## Initial Approach

The frontend treated reassessment primarily as a:

```text
BEFORE
↓
NOW
```

status change.

---

## Observed Behaviour

When new evidence strengthened the existing diagnosis but did not satisfy the evidence threshold required for a stronger state, the status remained:

```text
Developing
```

The raw transition therefore communicated very little to the user.

---

## Investigation

The backend result showed that the new evidence could still be meaningful even when the capability state did not change.

For example, evidence could strengthen the diagnosis while production-level proof remained missing.

---

## Root Cause

The UI was overemphasizing the status transition instead of explaining the evidence decision.

---

## Fix

The reassessment UI was redesigned around the decision rationale.

The final direction uses:

```text
EVIDENCE RE-CHECKED
```

followed by:

```text
DECISION RATIONALE • WHY STATE DIDN'T MOVE
```

and explains:

```text
Your evidence strengthens the diagnosis signal. To move the state, the next step is proving production-level container recovery.
```

The missing evidence is then made explicit:

```text
Missing evidence:
a Dockerfile or Docker Compose manifest, plus proof that you recovered a real multi-container production failure.
```

---

## Validation

The UI was tested against a reassessment where the capability remained in the same state.

The result could communicate that:

```text
new evidence was useful
```

while also explaining:

```text
why the capability state did not change
```

---

## Final Decision

A reassessment is not required to change the capability state to be meaningful.

KEAVEX explains **why the state changed or why it did not change**.

---

# Reassessment UI - Raw Technical Fields Exposed to the User

## Problem

The backend response contains structured technical information that is useful to the application but is not necessarily appropriate as user-facing copy.

One example is:

```text
technical_response
```

---

## Initial Approach

The frontend considered displaying backend response fields directly in the reassessment result.

---

## Observed Behaviour

Technical field names and implementation-oriented content made the experience feel like an API debugger rather than a finished product.

---

## Investigation

The frontend response was reviewed from the perspective of the actual user.

The user needs to understand:

```text
What did my evidence prove?
What is still missing?
Why did the state change or not change?
What should I prove next?
```

They do not need internal API field names.

---

## Root Cause

Backend response structure and user-facing product language serve different purposes.

---

## Fix

Internal technical fields are not exposed directly as UI labels.

The frontend translates structured backend information into purposeful product language.

---

## Validation

The reassessment result was reviewed without exposing raw backend implementation terminology.

---

## Final Decision

API field names remain an engineering concern.

User-facing UI should communicate the evidence decision in understandable product language.

---

# Reassessment UI - Excessive `BEFORE → NOW` Emphasis

## Problem

The initial reassessment presentation relied heavily on:

```text
BEFORE → NOW
```

to communicate progress.

---

## Initial Approach

A status transition was treated as the main visual result.

---

## Observed Behaviour

The transition became less useful when:

```text
Developing → Developing
```

occurred.

It also created unnecessary visual emphasis on a score-like state rather than the evidence reasoning.

---

## Investigation

The purpose of the reassessment experience was reviewed.

The important product event is not simply:

```text
status changed
```

but:

```text
new evidence was evaluated
↓
existing evidence was reconsidered
↓
a conclusion was reached
↓
the remaining evidence gap was identified
```

---

## Fix

The reassessment UI was refined to prioritize:

```text
EVIDENCE RE-CHECKED
```

and the decision rationale.

The state is still available as application data, but the explanation becomes the primary user-facing output.

---

## Validation

The revised screen communicated useful information even when the state remained unchanged.

---

## Final Decision

KEAVEX prioritizes explainable evidence decisions over decorative status transitions.

---

# Reassessment UI - Excessive / Unfocused Copy

## Problem

Repeated UI iterations resulted in screens containing more explanatory text than necessary.

---

## Initial Approach

Additional explanatory text was added to make the AI reasoning feel transparent.

---

## Observed Behaviour

The screen became visually heavier and reduced the clarity of the actual decision.

---

## Investigation

Each visible sentence was evaluated against its purpose:

```text
Does this explain the evidence?
Does this explain the missing proof?
Does this help the user understand the result?
```

Text that did not contribute to one of these goals was unnecessary.

---

## Fix

The reassessment UI was reduced to purposeful content.

The final direction focuses on:

```text
Evidence Re-checked
Decision rationale
Why the state did or did not move
Missing evidence
Next meaningful proof
```

---

## Validation

The resulting screen remained informative without exposing unnecessary backend or AI terminology.

---

## Final Decision

Frontend copy should be concise, but not so short that the user loses the reasoning.

Every visible word should have a purpose.

---

# Evidence Map - Seeded Data vs Live Reassessment

## Problem

The Evidence Map uses deterministic seeded analysis data while the reassessment flow is live.

This created a potential misunderstanding about which parts of the frontend were dynamic.

---

## Initial Approach

The hackathon frontend uses:

```text
src/constants/mockAnalysis.ts
```

to provide a stable initial Evidence Map.

---

## Observed Behaviour

The initial capability state and evidence presentation remain consistent between demo runs.

However, the reassessment flow communicates with the backend.

---

## Investigation

The frontend data flow was separated into:

```text
Evidence Map
    ↓
Seeded demonstration state

Demonstrate
    ↓
User response

Reassess
    ↓
Live Supabase Edge Function
    ↓
Gemini
    ↓
Updated result
```

---

## Root Cause

A stable hackathon demonstration state and a live AI interaction serve different purposes.

---

## Fix

The deterministic Evidence Map data remains intentionally seeded.

The Demonstrate → Reassess flow remains connected to the live backend.

---

## Validation

The application can begin from a reproducible Evidence Map state while still executing the actual reassessment pipeline.

---

## Final Decision

Seeded starting data is retained for the current hackathon build.

It is not used as a replacement for the live reassessment pipeline.

---

# PDF Selection - Document Picker Integration

## Problem

The frontend needed to support selecting a PDF document rather than relying entirely on a fixed development file.

---

## Initial Approach

The initial product flow was developed around a known test resume/PDF.

---

## Investigation

The frontend required a native document-selection mechanism compatible with the Expo environment.

The project already uses Expo SDK 57.

The document picker dependency was added:

```text
expo-document-picker
```

with the installed development version:

```text
57.0.3
```

---

## Fix

PDF selection was implemented using the Expo document picker integration.

The frontend can use the selected document as the input to the analysis flow.

---

## Validation

The package was installed and TypeScript-level project checks were investigated during integration.

The document-picker implementation remained a separate integration area from the seeded Evidence Map and live reassessment pipeline.

---

## Final Decision

Document selection is implemented through the Expo document-picker ecosystem rather than custom native file-selection code.

Final end-to-end validation of replacing an already selected PDF should be treated separately from the verified seeded-data demonstration flow.

---

# Frontend ↔ Backend Contract Mismatch Investigation

## Problem

The frontend and backend use structured API responses.

A mismatch between the expected frontend structure and the actual backend structure can cause runtime rendering failures.

---

## Initial Approach

Frontend components were initially developed around expected response shapes.

---

## Observed Behaviour

The structured evidence object rendering error demonstrated that the frontend could incorrectly assume a response field was plain text.

---

## Investigation

The actual backend response was inspected and compared with the component's rendering expectations.

---

## Root Cause

The frontend must respect the actual API contract rather than assuming every response field is a string.

---

## Fix

The frontend maps structured response objects into explicit UI components.

For example:

```text
Evidence
 ├── source
 ├── strength
 └── detail
```

is presented as structured UI rather than being rendered as one object.

---

## Validation

The reassessment screen successfully rendered structured evidence after the response mapping was corrected.

---

## Final Decision

Frontend components must be implemented against the actual backend response structure.

Backend and frontend contracts should not silently diverge.

---

# RevenueCat Paywall - Product Flow Integration

## Problem

The Pro subscription needed to be represented as an actual frontend product flow rather than simply a static paywall screen.

---

## Initial Approach

The paywall was implemented as a dedicated route:

```text
/paywall
```

The purchase system was integrated through RevenueCat.

---

## Observed Behaviour

The application needed to distinguish between:

```text
Free user
```

and:

```text
Pro entitlement
```

before allowing another reassessment.

---

## Investigation

The purchase flow was connected to:

```text
src/lib/purchases.ts
```

and the paywall:

```text
src/app/paywall.tsx
```

The RevenueCat product was configured as:

```text
keavex_pro_monthly
```

with:

```text
monthly
```

package and:

```text
keavex_pro_monthly
```

entitlement.

---

## Fix

The frontend checks the RevenueCat entitlement before allowing additional reassessment access.

The user flow became:

```text
Free Reassessment
 ↓
Free Limit Reached
 ↓
Pro Paywall
 ↓
RevenueCat Test Store
 ↓
Purchase
 ↓
Pro Entitlement
 ↓
Additional Reassessment
```

---

## Validation

The flow was tested on the Android development build using the RevenueCat Test Store.

The test purchase successfully activated the Pro entitlement and allowed another reassessment.

---

## Final Decision

RevenueCat is treated as a real product-access mechanism rather than a visual-only subscription screen.

---

# Android Development Build - Validation Issue

## Problem

Some frontend functionality could not be meaningfully validated through a purely static UI review.

The product includes:

```text
native document selection
RevenueCat
Android
Expo development build
```

---

## Initial Approach

Frontend changes were frequently tested through the development environment.

---

## Investigation

The Android development build was used to validate product behaviour that depends on native/device functionality.

---

## Fix

The application was run through the Android development build during final product validation.

---

## Validation

The following frontend/product flows were validated on Android:

```text
Authentication
Evidence Map
Capability interaction
Demonstration flow
Reassessment
Paywall
RevenueCat Test Store
Pro entitlement
Additional reassessment
```

---

## Final Decision

The Android development build remains the primary device-level validation environment for the current KEAVEX frontend.

---

# Frontend Debugging Lessons

The major debugging lessons from the frontend development process were:

## 1. Backend Data and UI Data Are Different Layers

A backend response may contain:

```text
objects
technical fields
metadata
internal identifiers
```

The frontend must convert those structures into meaningful UI.

---

## 2. Never Render Structured Objects Directly

A response such as:

```text
{
  source,
  strength,
  detail
}
```

must be mapped into UI fields.

It cannot be passed directly as a React child.

---

## 3. The Backend Owns Capability State

The frontend must not decide:

```text
strong
developing
insufficient
```

The backend remains the source of truth.

---

## 4. A Reassessment Does Not Have to Change the State

New evidence can strengthen an existing conclusion without crossing the threshold for a new capability state.

Therefore:

```text
Developing → Developing
```

can still represent meaningful progress.

The UI must explain why.

---

## 5. Do Not Expose Internal API Terminology

Fields such as:

```text
technical_response
analysis_id
capability_id
```

are useful for engineering but should not become the user's product language.

---

## 6. Seeded Demo Data and Live AI Are Not the Same Thing

The current Evidence Map provides a stable starting state.

The Demonstrate → Reassess loop is connected to the live backend.

This distinction must remain explicit.

---

## 7. Native Features Need Device Validation

Features involving:

```text
document picker
RevenueCat
Android
```

cannot be considered fully validated from source code alone.

They require device-level testing.

---

## 8. UI Copy Is Part of Product Engineering

A technically correct result can still be confusing if the interface communicates only:

```text
BEFORE → NOW
```

without explaining:

```text
what the new evidence proved
what remains missing
why the state moved or did not move
```

---

## 9. Every UI Element Should Have a Purpose

The final reassessment experience should not add text merely to make the screen look more complete.

The visible content should help answer:

```text
What happened?
Why did it happen?
What evidence is missing?
What should I prove next?
```

---

# Final Frontend Engineering Decision

After frontend debugging and product refinement:

```text
Frontend
    ↓
Backend-driven capability state
    ↓
Structured response rendering
    ↓
Live reassessment integration
    ↓
Evidence-focused UX
    ↓
RevenueCat entitlement flow
    ↓
Android development-build validation
```

The frontend should not compensate for backend uncertainty or invent assessment results.

The frontend's responsibility is to make the evidence decision understandable.

The final frontend principle remains:

> **KEAVEX should show users what their evidence supports, what it does not yet support, and why.**
