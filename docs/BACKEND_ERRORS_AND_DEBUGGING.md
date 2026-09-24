# KEAVEX Backend - Errors & Debugging

> A record of real backend failures, investigation, root causes, fixes, and validation during the KEAVEX backend development process.

---

# Purpose

This document records the major technical problems encountered while building the KEAVEX backend.

The purpose is not to list hypothetical errors.

Each section documents:

- the actual problem
- the initial approach
- the observed behaviour
- the investigation
- the root cause
- the fix
- how the fix was validated
- the final engineering decision

The main backend development progression is documented separately in:

`docs/BACKEND_BUILD_LOG.md`

---

# Day 2 - Incorrect Database Foreign-Key Relationships

## Error

During database development, some foreign-key relationships in the `analyses` table were incorrectly associated with `analyses.id`.

The intended relationships were not being represented correctly.

---

## Initial Approach

The database relationships were initially created without fully matching the intended ownership model.

This resulted in relationships involving:

```text
analyses.id
````

where the actual relationships should have originated from:

```text
analyses.user_id
analyses.resume_id
analyses.project_id
```

---

## Observed Behaviour

The database structure did not correctly represent:

```text
User → Analysis
Analysis → Resume
Analysis → Project
```

This created an incorrect relational model for the backend.

---

## Investigation

The foreign-key definitions were reviewed against the intended data model.

The required relationships were identified as:

```text
analyses.user_id
    ↓
profiles.id

analyses.resume_id
    ↓
resumes.id

analyses.project_id
    ↓
projects.id
```

---

## Root Cause

The foreign keys had been attached to the wrong column:

```text
analyses.id
```

instead of the specific reference columns:

```text
user_id
resume_id
project_id
```

---

## Fix

The incorrect relationships involving `analyses.id` were removed.

The correct relationships were established:

```text
analyses.user_id → profiles.id

analyses.resume_id → resumes.id

analyses.project_id → projects.id
```

---

## Validation

The corrected database structure was verified before continuing with the analysis persistence workflow.

The resulting model correctly represented:

```text
User
 ↓
Analysis
 ├── Resume
 ├── Project
 └── Capabilities
```

---

## Final Decision

The corrected relational model was retained as the final database structure.

---

# Day 3 - PDF Extraction Runtime Failure

## Error

The initial PDF extraction implementation used:

```text
pdf-parse
```

The implementation failed inside the Supabase Edge Function runtime.

The failure involved browser-like dependencies such as:

```text
DOMMatrix
Path2D
```

---

## Initial Approach

The initial implementation attempted to use `pdf-parse` for extracting text from uploaded resume PDFs.

The expected flow was:

```text
PDF
 ↓
pdf-parse
 ↓
Resume Text
```

---

## Observed Behaviour

The PDF extraction did not work correctly inside the Supabase Edge runtime.

The runtime encountered dependencies that were not compatible with the server-side Edge environment.

---

## Investigation

The problem was isolated to the PDF processing library rather than:

* Supabase Storage
* Gemini
* PostgreSQL
* the resume file itself

The runtime behaviour indicated that the library depended on browser-like PDF processing functionality that was unsuitable for the Edge environment.

---

## Root Cause

The initial PDF extraction library was not compatible with the Supabase Edge runtime in the required execution environment.

---

## Fix

The PDF processing implementation was replaced with:

```text
unpdf@1.8.1
```

The final implementation imports:

```ts
import {
  extractText,
  getDocumentProxy,
} from "npm:unpdf@1.8.1";
```

The extraction flow became:

```text
Storage File
 ↓
ArrayBuffer
 ↓
Uint8Array
 ↓
getDocumentProxy()
 ↓
extractText()
 ↓
resumeText
```

---

## Validation

The new implementation successfully extracted usable text from the test resume.

The extracted text could then be passed into the Gemini analysis pipeline.

---

## Final Decision

`unpdf@1.8.1` was retained as the final PDF extraction implementation.

The earlier `pdf-parse` approach was not used in the final backend.

---

# Day 3 - Empty PDF Text Protection

## Problem

A PDF may contain no extractable text, for example when it is scanned or image-only.

Sending an empty extraction result to the AI layer would create an unreliable assessment.

---

## Initial Approach

The backend initially focused on extracting the text but needed an explicit validation step before continuing to Gemini.

---

## Observed Behaviour

An image-only or otherwise non-extractable PDF could produce an empty text result.

---

## Investigation

The extraction result was checked after:

```text
extractText()
```

The backend verified whether usable text actually existed.

---

## Root Cause

PDF files do not necessarily contain machine-readable text.

A visually readable PDF can still contain only images.

---

## Fix

The backend now checks the extracted text.

If no usable text is available, the function returns an explicit error indicating that the PDF may be scanned or image-only.

---

## Validation

The backend no longer continues into AI analysis when the extracted resume text is empty.

---

## Final Decision

Empty-text validation remains part of the final analysis pipeline.

---

# Day 5 - Database Persistence Validation

## Problem

Generating a structured Gemini response was not sufficient for KEAVEX.

The AI response needed to become persistent application data.

---

## Initial Approach

The backend first generated structured capability information through Gemini.

The next requirement was to persist the result in PostgreSQL.

---

## Observed Behaviour

Without database persistence, the result existed only inside the API response.

It could not support:

* capability history
* evidence storage
* unknowns
* evidence gaps
* later reassessment

---

## Investigation

The persistence flow was expanded from:

```text
Gemini
 ↓
JSON Response
```

to:

```text
Gemini
 ↓
analyses
 ↓
capabilities
```

---

## Root Cause

The AI response alone was not a sufficient application data model.

KEAVEX required a relational evidence structure.

---

## Fix

The backend created:

```text
analyses
capabilities
```

records from the structured Gemini response.

The generated `analysis_id` became the parent identifier for capability records.

---

## Validation

A successful analysis generated:

```text
52502cd0-66af-408a-8ab3-acf47c102272
```

with capability records including:

```text
Java & Spring Boot REST API Development
→ developing

Database Management (PostgreSQL / SQL)
→ developing

Containerization (Docker)
→ insufficient
```

---

## Final Decision

Structured AI output is persisted relationally rather than being treated as a temporary response only.

---

# Day 6 - Evidence Persistence Expansion

## Problem

Capability status alone did not explain why KEAVEX reached that status.

---

## Initial Approach

The backend initially persisted:

```text
Analysis
 ↓
Capabilities
```

---

## Observed Behaviour

The system needed to preserve additional evidence context:

```text
Supporting Evidence
Unknowns
Evidence Gaps
Next Evidence
```

---

## Investigation

The Gemini response already contained evidence-oriented information that could be mapped into relational tables.

---

## Root Cause

A capability status without its supporting evidence context would weaken the explainability of the system.

---

## Fix

The backend expanded persistence to include:

```text
evidence_sources
unknowns
evidence_gaps
```

The relationships were:

```text
capability
 ├── evidence_sources
 ├── unknowns
 └── evidence_gaps
```

---

## Validation

A fresh successful analysis produced:

```text
capabilities
→ 3 records

evidence_sources
→ 3 records

unknowns
→ 9 records

evidence_gaps
→ 3 records
```

The relational links were verified.

---

## Final Decision

KEAVEX retains evidence context as relational data rather than storing only the final capability status.

---

# Day 7 - Hardcoded Analysis Values

## Error

The early analysis workflow depended on fixed test values.

The backend needed to accept real request data.

---

## Initial Approach

The test implementation used fixed values during development.

This was useful for proving the pipeline but was not suitable for a real API.

---

## Observed Behaviour

The backend could not be considered a dynamic analysis endpoint while relying on one fixed:

```text
user
resume
target role
```

---

## Investigation

The request contract was redesigned to accept:

```json
{
  "user_id": "uuid",
  "pdf_path": "string",
  "target_role": "string"
}
```

---

## Root Cause

The analysis function had not yet been converted from a development test flow into a request-driven API.

---

## Fix

The function now reads:

```text
user_id
pdf_path
target_role
```

directly from the incoming request.

The resume is downloaded dynamically from the:

```text
resumes
```

storage bucket.

---

## Validation

A successful dynamic request used:

```json
{
  "user_id": "79eac5f5-b31c-447c-8084-2232878066dd",
  "pdf_path": "test-resume.pdf",
  "target_role": "Backend Developer"
}
```

The backend generated:

```text
analysis_id:
7799c856-8429-4e5a-b357-75c5d666d683
```

---

## Final Decision

The analyze endpoint became fully request-driven.

---

# Day 7 - Invalid Storage Path

## Error

A test request using:

```text
pdf_path: "string"
```

failed because the backend attempted to download an object that did not exist.

---

## Initial Approach

The API contract used:

```json
{
  "pdf_path": "string"
}
```

as a placeholder example.

---

## Observed Behaviour

Using the literal value:

```text
string
```

caused the Supabase Storage download to fail because no object with that path existed.

---

## Investigation

The storage bucket was checked.

The actual test file was:

```text
test-resume.pdf
```

---

## Root Cause

The contract example value was mistakenly treated as an actual storage filename.

---

## Fix

Actual requests must provide the real storage path.

For the development test:

```text
test-resume.pdf
```

was used.

---

## Validation

The request succeeded after using the actual uploaded file path.

---

## Final Decision

API documentation continues to use:

```text
"pdf_path": "string"
```

as a type/example placeholder, while real requests must provide an existing Storage object path.

---

# Day 7 - Supabase Dashboard Test UI Behaviour

## Problem

The Supabase Dashboard function testing interface sometimes displayed:

```text
500 Cannot read properties of undefined (reading 'error')
```

---

## Initial Approach

The initial assumption was that the Edge Function itself might be returning an invalid error response.

---

## Investigation

The same endpoint was tested directly using a PowerShell HTTP request.

The direct API request successfully reached the deployed function and generated a real analysis.

---

## Observed Behaviour

The backend response worked correctly through the direct HTTP request even when the Dashboard testing interface displayed the internal UI error.

---

## Root Cause

The observed failure was associated with the Dashboard testing interface rather than the actual backend API response.

---

## Fix

The endpoint was validated directly through HTTP instead of relying only on the Dashboard test interface.

---

## Validation

A direct PowerShell request successfully returned a structured KEAVEX analysis.

---

## Final Decision

Direct API testing was treated as the reliable validation method for deployed Edge Functions when the Dashboard test interface produced inconsistent UI errors.

---

# Day 7 — Supabase Secret-Key Configuration Investigation

## Problem

The Edge Function required access to the configured Supabase secret-key structure.

There was uncertainty about whether the stored secret configuration had the expected JSON structure.

---

## Investigation

Temporary diagnostic logging was added.

The function reported:

```text
SECRET_KEYS_SHAPE: ["default"]
HAS_DEFAULT_KEY: true
```

---

## Root Cause

There was no actual secret-key structure problem.

The investigation was required to verify the runtime configuration.

---

## Fix

No architectural change was required.

The existing configuration:

```text
SUPABASE_SECRET_KEYS
 └── default
```

was confirmed to be valid for the implementation.

---

## Validation

The diagnostic output confirmed:

```text
default key exists
```

and the Storage/API workflow continued successfully.

---

## Final Decision

The existing secret-key configuration was retained.

Diagnostic logging was treated as temporary debugging instrumentation rather than product functionality.

---

# Day 8 - Reassessment Endpoint Validation

## Problem

KEAVEX needed to support new evidence without rerunning the entire original analysis.

---

## Initial Approach

The original analysis endpoint was designed for initial assessment.

A separate workflow was required for new evidence.

---

## Investigation

The required reassessment context was identified as:

```text
Previous Capability Status
+
Capability Claim
+
Existing Unknowns
+
Existing Evidence Gaps
+
New User Evidence
```

---

## Fix

A separate endpoint was implemented:

```text
POST /functions/v1/reassess-evidence
```

The endpoint:

1. validates the request
2. verifies the capability
3. verifies that the capability belongs to the analysis
4. loads existing unknowns and evidence gaps
5. sends the new evidence to Gemini
6. determines the new status
7. stores the demonstration
8. updates the capability
9. stores the new evidence source
10. returns the status transition

---

## Validation

The Docker capability initially had:

```text
insufficient
```

A technical demonstration supplied evidence about:

```text
multi-stage Dockerfile
Maven
slim JRE
Docker Compose
PostgreSQL
named volumes
health checks
service dependencies
container registry
deployment
logs
health endpoints
```

The reassessment produced:

```text
previous_status:
insufficient

new status:
developing
```

with:

```text
new evidence strength:
strong

convergence:
converging
```

The demonstration was persisted in the database.

---

## Final Decision

Reassessment remains a separate endpoint and does not rerun the complete initial resume analysis.

---

# Day 9 - `[object Object]` Error Serialization

## Error

During reassessment testing, the API returned:

```text
{
  "error": "Unexpected error",
  "details": "[object Object]"
}
```

---

## Initial Approach

The catch block used:

```ts
error instanceof Error
  ? error.message
  : String(error)
```

---

## Observed Behaviour

When the thrown value was a plain object rather than a JavaScript `Error` instance,:

```ts
String(error)
```

produced:

```text
[object Object]
```

This hid the useful upstream error information.

---

## Investigation

The error handling path was reviewed.

The issue was found in the conversion of non-`Error` objects into response text.

---

## Root Cause

JavaScript's default string conversion for a plain object produces:

```text
[object Object]
```

which is not useful for debugging API failures.

---

## Fix

The catch block was changed to serialize objects safely:

```ts
const details =
  error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null
      ? JSON.stringify(error)
      : String(error);
```

---

## Validation

After the fix, upstream Gemini errors were returned as readable JSON rather than:

```text
[object Object]
```

---

## Final Decision

All unexpected errors should be serialized into useful diagnostic information before being returned.

---

# Day 9 - Reassessment Function Syntax / Deployment Failure

## Error

After modifying the reassessment error handling, deployment initially failed because the TypeScript file structure was incomplete.

---

## Initial Approach

The error-handling block had been edited while modifying the function ending.

---

## Observed Behaviour

The function did not pass deployment parsing because the outer:

```ts
Deno.serve(async (req) => {
```

handler was not correctly closed.

There was also an incorrect reference to:

```text
reassessment
```

instead of the actual parsed Gemini result:

```text
parsed
```

---

## Investigation

The complete function ending was reviewed.

The correct structure required:

```ts
return Response.json(...);

} catch (error) {
  ...
}

});
```

---

## Root Cause

The function had two structural issues:

1. missing closure of the outer `Deno.serve()` call
2. incorrect variable reference in the final response

---

## Fix

The function ending was corrected to:

```ts
return Response.json({
  capability: capability.name,
  previous_status: parsed.previous_status,
  status: parsed.status,
  change_reason: parsed.change_reason,
  new_evidence: parsed.new_evidence,
  convergence: parsed.convergence,
});
```

followed by the corrected catch block and:

```ts
});
```

---

## Validation

The function was checked using:

```powershell
npx.cmd -y deno check "supabase/functions/reassess-evidence/index.ts"
```

The result was:

```text
Check supabase/functions/reassess-evidence/index.ts
```

with no syntax/type-check error.

The function was then successfully deployed.

---

## Final Decision

The corrected reassessment implementation was deployed and retained.

---

# Day 9 - Gemini 429 Quota Failure

## Error

A development request returned:

```text
429 RESOURCE_EXHAUSTED
```

from Gemini.

The response indicated that the Gemini free-tier request quota had been exceeded.

---

## Initial Approach

The request was initially treated as another possible backend failure.

---

## Investigation

The upstream response identified the affected Gemini quota and model.

The failure was associated with:

```text
GenerateRequestsPerDayPerModel-FreeTier
```

for:

```text
gemini-3.6-flash
```

---

## Root Cause

The failure was caused by the external Gemini free-tier request quota.

It was not caused by:

* PostgreSQL
* Supabase Storage
* PDF extraction
* KEAVEX database logic
* reassessment persistence

---

## Fix

No KEAVEX architecture change was required.

The quota limitation was treated as an external dependency constraint.

---

## Validation

The error response correctly identified the upstream Gemini quota failure.

Earlier successful analysis and reassessment flows had already validated the backend logic.

---

## Final Decision

Gemini free-tier quota exhaustion is treated as an external service limitation rather than an internal KEAVEX defect.

---

# Day 9 - Gemini 503 Temporary Unavailability

## Error

During regression validation, Gemini returned:

```text
503 UNAVAILABLE
```

with an upstream message indicating temporary high demand.

---

## Initial Approach

The regression request was used to verify whether the deployed reassessment endpoint could reach Gemini and return errors safely.

---

## Observed Behaviour

The request reached Gemini successfully, but Gemini returned an upstream availability error.

---

## Investigation

The returned error identified:

```text
503
UNAVAILABLE
```

from the Gemini API.

---

## Root Cause

The Gemini model was temporarily unavailable because of upstream demand.

---

## Fix

No database or KEAVEX logic change was required.

The backend surfaced the upstream failure instead of fabricating a capability assessment.

---

## Validation

The backend returned a serialized error containing the actual upstream Gemini response.

This also confirmed that the earlier:

```text
[object Object]
```

serialization problem had been fixed.

---

## Final Decision

Temporary Gemini availability failures are treated as upstream dependency failures.

The backend must not invent a capability result when the AI dependency is unavailable.

---

# Final Debugging Lessons

The major debugging lessons from the backend development process were:

## 1. Runtime Compatibility Matters

A library that works in a normal Node/browser environment may not work inside a Supabase Edge runtime.

The PDF extraction library was therefore changed from:

```text
pdf-parse
```

to:

```text
unpdf@1.8.1
```

---

## 2. Database Relationships Must Match the Actual Data Model

Foreign keys must represent the actual ownership and reference relationships.

For KEAVEX:

```text
User
 ↓
Analysis
 ↓
Capability
 ↓
Evidence
```

is more important than simply creating technically valid foreign keys.

---

## 3. Unknown Does Not Mean Negative

The debugging and product model reinforced the distinction:

```text
Unknown
≠
Not capable
```

Missing evidence must remain uncertainty.

---

## 4. Storage Paths Must Be Real

API examples may use:

```text
"pdf_path": "string"
```

but actual requests must reference an existing Storage object.

---

## 5. Direct API Validation Is Important

A Dashboard testing interface can introduce its own UI-level behaviour.

The deployed endpoint should therefore also be tested through the actual HTTP API.

---

## 6. External Failures Must Be Distinguished From Internal Bugs

Gemini failures such as:

```text
429 RESOURCE_EXHAUSTED
503 UNAVAILABLE
```

are different from:

```text
database failure
PDF extraction failure
TypeScript syntax failure
```

Correct diagnosis prevents unnecessary changes to working backend code.

---

## 7. Errors Must Be Debuggable

Returning:

```text
[object Object]
```

does not provide useful diagnostic information.

Structured error serialization is therefore part of backend reliability.

---

## 8. Backend Status Must Remain the Source of Truth

The frontend must never compensate for an AI or backend failure by inventing a capability status.

The backend determines:

```text
strong
developing
insufficient
```

and the frontend renders the result.

---

# Final Engineering Decision

After Day 9 debugging and stabilization:

```text
Backend
    ↓
Stable
    ↓
API Contract Frozen
    ↓
No New Features
    ↓
Frontend Integration
```

The backend should not receive additional feature work during frontend development unless a genuine defect is discovered.

The final backend principle remains:

> **KEAVEX should claim only what the available evidence supports.**

```
