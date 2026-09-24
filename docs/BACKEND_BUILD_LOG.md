# KEAVEX Backend — Engineering Build Log

> A chronological record of the backend development process from initial architecture to a stable, demo-ready, frozen API.

---

# 1. Document Purpose

This document records the development progression of the KEAVEX backend from Day 1 through Day 9.

The purpose of this document is to explain:

- what was built on each day
- what the objective of each development stage was
- how the backend architecture evolved
- what major implementation decisions were made
- what was successfully validated
- how the backend progressed toward the final frozen API

Detailed error investigation, root-cause analysis, and debugging procedures are documented separately in:

`docs/BACKEND_ERRORS_AND_DEBUGGING.md`

Therefore, this document focuses primarily on **development progression and engineering milestones**, while the debugging document focuses on **failures and their resolution**.

---

# 2. Backend Objective

The KEAVEX backend was designed to support an evidence-based capability assessment system.

The backend receives evidence about a user's experience and evaluates what that evidence currently supports about specific capability claims.

The system is intentionally conservative.

It does not attempt to determine whether a person is inherently capable or incapable.

Instead, it evaluates the available evidence.

The backend therefore works around three capability states:

- `strong`
- `developing`
- `insufficient`

And three evidence-strength levels:

- `weak`
- `moderate`
- `strong`

For reassessment convergence, the backend uses:

- `converging`
- `conflict`
- `inconclusive`

---

# 3. Core Backend Principle

The central principle established during development was:

> KEAVEX evaluates what the available evidence supports about a capability claim.

This means:

- missing evidence is not automatically treated as negative evidence
- the system should not invent evidence
- weak evidence should not automatically produce a strong capability status
- the frontend should not decide capability status
- status changes should be based on new evidence
- the system should preserve evidence history

This principle influenced the database design, Gemini prompts, API contracts, reassessment flow, and frontend boundary.

---

# 4. Technology Foundation

The backend was built around the following components:

### Backend Infrastructure

- Supabase
- Supabase Edge Functions
- Supabase PostgreSQL
- Supabase Storage

### AI Reasoning

- Google Gemini API

### Runtime / Language

- TypeScript
- Deno-compatible Supabase Edge Functions

### PDF Processing

- `unpdf@1.8.1`

---

# 5. High-Level Architecture

The backend eventually evolved into the following architecture:

```text
                    KEAVEX Frontend
                          │
                          │ HTTP
                          ▼
              ┌─────────────────────────┐
              │   Supabase Edge APIs    │
              │                         │
              │  analyze-evidence       │
              │  reassess-evidence      │
              └───────────┬─────────────┘
                          │
              ┌───────────┼───────────────┐
              │           │               │
              ▼           ▼               ▼
        Supabase       Supabase        Gemini
        Storage        Database          API
              │
              │
              ▼
          Resume PDF
              │
              ▼
        PDF Text Extraction
              │
              ▼
        Structured Evidence
           Evaluation
              │
              ▼
       Relational Persistence
````

The architecture was not implemented all at once.

It was developed incrementally over nine days.

---

# Day 1 — Backend Foundation

## Objective

Establish the basic technical foundation for KEAVEX.

The first objective was to prove that the core backend workflow could exist as a real application backend rather than remaining only a product concept.

The initial conceptual pipeline was:

```text
Resume PDF
    ↓
PDF Text Extraction
    ↓
AI Analysis
    ↓
Structured Capability Assessment
```

At this stage, the goal was not to implement every product feature.

The goal was to establish the foundation required for later stages.

---

## Backend Direction

The backend was designed around Supabase because the project required:

* database persistence
* file storage
* server-side functions
* authentication-compatible user records
* API endpoints
* a relatively lightweight deployment model

Supabase Edge Functions became the server-side execution layer.

---

## AI Architecture Decision

An important architectural decision was established during the foundation stage.

KEAVEX would not attempt to train its own language model.

Instead:

```text
Gemini
    ↓
General language understanding and reasoning

KEAVEX
    ↓
Domain-specific evidence evaluation
```

Gemini acts as the general reasoning layer.

KEAVEX defines:

* capability concepts
* evidence rules
* evidence strength
* unknowns
* evidence gaps
* reassessment logic
* status transitions
* structured output requirements

This established the distinction between a foundation-model-powered application and a custom-trained AI model.

---

## Day 1 Milestone

By the end of the foundation stage, the backend direction was established around:

```text
Supabase
+
Edge Functions
+
PostgreSQL
+
Storage
+
Gemini
```

The next stage was to design the database capable of storing the resulting evidence structure.

---

# Day 2 — Database Foundation

## Objective

Create the relational database foundation required to persist KEAVEX assessments.

A major design requirement was that an analysis should not be stored as one large unstructured AI response.

The backend needed to separately represent:

* the overall analysis
* individual capabilities
* evidence supporting capabilities
* unknowns
* evidence gaps
* later demonstrations

---

# 2.1 `analyses` Table

The `analyses` table was designed to represent the overall assessment.

Important fields included:

```text
id
user_id
resume_id
project_id
target_role
overall_status
summary
status
created_at
```

The analysis became the parent record for capability-level results.

---

# 2.2 `capabilities` Table

The `capabilities` table stores individual capability assessments.

Important fields:

```text
id
analysis_id
name
claim
status
created_at
```

The relationship is:

```text
analysis
   │
   ├── capability
   ├── capability
   └── capability
```

---

# 2.3 Evidence Model Tables

The backend also established tables for evidence-related information.

### `evidence_sources`

Stores evidence supporting a capability.

Fields include:

```text
id
capability_id
source_type
strength
detail
created_at
```

### `unknowns`

Stores information that cannot currently be established.

Fields include:

```text
id
capability_id
description
```

### `evidence_gaps`

Stores missing evidence and potential next evidence.

Fields include:

```text
id
capability_id
title
description
why_it_matters
recommended_task
task_prompt
```

---

# 2.4 Future Reassessment Storage

The backend architecture also accounted for future demonstrations.

The `demonstrations` table contains:

```text
id
capability_id
user_response
previous_status
new_status
change_reason
created_at
```

This table became important during Day 8.

---

# 2.5 Relationship Model

The relational structure eventually became:

```text
profiles
   │
   └── analyses
          │
          ├── capabilities
          │      ├── evidence_sources
          │      ├── unknowns
          │      ├── evidence_gaps
          │      └── demonstrations
          │
          ├── resumes
          └── projects
```

This established the foundation for explainable capability assessments.

---

# 2.6 Database Relationship Corrections

During database development, the foreign-key relationships were reviewed and corrected.

The intended relationships became:

```text
analyses.user_id
    → profiles.id

analyses.resume_id
    → resumes.id

analyses.project_id
    → projects.id
```

Earlier incorrect relationships involving `analyses.id` were removed.

The corrected model ensured that:

* a user owns an analysis
* an analysis may reference a resume
* an analysis may reference a project
* capabilities belong to analyses

---

# Day 2 Milestone

The database was now capable of representing a structured evidence assessment rather than only storing an AI-generated paragraph.

The next requirement was to obtain reliable text from uploaded resumes.

---

# Day 3 — PDF Processing

## Objective

Connect Supabase Storage to the backend analysis pipeline.

The intended flow became:

```text
Resume uploaded
      ↓
Supabase Storage
      ↓
Edge Function
      ↓
PDF Download
      ↓
Text Extraction
      ↓
Resume Text
```

---

# 3.1 Resume Storage

A Supabase Storage bucket named:

```text
resumes
```

was established for resume files.

A test resume was uploaded:

```text
test-resume.pdf
```

The backend would later receive the storage path dynamically.

---

# 3.2 PDF Extraction Requirement

The backend could not send a PDF object directly into the capability evaluation workflow.

It needed usable resume text.

Therefore:

```text
PDF bytes
   ↓
PDF parser
   ↓
Plain text
```

became a required backend stage.

---

# 3.3 PDF Processing Implementation

The initial PDF processing approach was later replaced during implementation.

The final implementation uses:

```text
unpdf@1.8.1
```

with:

```ts
import {
  extractText,
  getDocumentProxy,
} from "npm:unpdf@1.8.1";
```

The final extraction flow is:

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

The detailed failure and debugging process is recorded separately in:

`BACKEND_ERRORS_AND_DEBUGGING.md`

---

# 3.4 Text Validation

The backend validates whether usable text was extracted.

If the resulting text is empty, the function returns an explicit response indicating that the PDF may be scanned or image-only.

This prevents the AI layer from receiving an empty document and attempting to fabricate an assessment.

---

# Day 3 Milestone

The backend successfully established the PDF-to-text stage required for AI analysis.

The pipeline was now:

```text
Storage
   ↓
PDF
   ↓
Extracted Text
```

The next stage was to connect that text to Gemini.

---

# Day 4 — Gemini Integration

## Objective

Connect extracted resume evidence to Gemini and obtain structured capability analysis.

The backend needed more than a natural-language response.

It needed machine-readable data that could later be persisted into the relational database.

---

# 4.1 Gemini Integration

The Edge Function sends:

* resume text
* target role
* KEAVEX assessment instructions

to Gemini.

Gemini then returns structured JSON.

The conceptual pipeline became:

```text
Resume Text
     +
Target Role
     +
KEAVEX Rules
     ↓
Gemini
     ↓
Structured JSON
```

---

# 4.2 Structured Output

The backend constrained the AI output to the KEAVEX vocabulary.

Capability status:

```text
strong
developing
insufficient
```

Evidence strength:

```text
weak
moderate
strong
```

This reduced ambiguity between the AI output and the database model.

---

# 4.3 Evidence-Oriented Output

The analysis structure was designed to contain more than a status.

The AI response could contain information such as:

```text
Capability
Claim
Status
Supporting Evidence
Unknowns
Evidence Gap
Next Evidence
Convergence
```

This allowed KEAVEX to retain the reasoning context necessary for later reassessment.

---

# 4.4 Conservative Evaluation

The Gemini instructions were designed around conservative evidence evaluation.

The backend should prefer:

```text
developing
```

or:

```text
insufficient
```

when the available evidence does not justify:

```text
strong
```

This was important because the product is intended to identify evidence strength rather than generate flattering assessments.

---

# Day 4 Milestone

Gemini was successfully integrated as the general reasoning layer.

The backend could now move from:

```text
Resume Text
```

to:

```text
Structured KEAVEX Evidence Assessment
```

The next stage was persistence.

---

# Day 5 — Database Persistence

## Objective

Connect Gemini's structured response to the relational database.

The pipeline needed to become:

```text
Gemini JSON
    ↓
analyses
    ↓
capabilities
```

rather than stopping after generating the AI response.

---

# 5.1 Analysis Persistence

The backend first creates an `analyses` record.

The generated analysis ID becomes the parent identifier for capability records.

Conceptually:

```text
Gemini Result
      ↓
Create Analysis
      ↓
analysis_id
```

---

# 5.2 Capability Persistence

The backend then iterates through the capabilities returned by Gemini.

For every capability:

```text
Create capability
    ↓
Attach analysis_id
    ↓
Store name
    ↓
Store claim
    ↓
Store status
```

This creates a relational structure rather than leaving the result only inside the API response.

---

# 5.3 First Successful Persistence

A successful analysis generated:

```text
analysis_id:
52502cd0-66af-408a-8ab3-acf47c102272
```

The capability records included:

```text
Java & Spring Boot REST API Development
→ developing

Database Management (PostgreSQL / SQL)
→ developing

Containerization (Docker)
→ insufficient
```

This demonstrated that the AI result could be persisted as structured application data.

---

# Day 5 Milestone

The backend had successfully completed:

```text
Gemini
   ↓
Analysis Record
   ↓
Capability Records
```

The next stage expanded this into the full evidence architecture.

---

# Day 6 — Evidence Architecture

## Objective

Persist the supporting evidence structure generated by Gemini.

A capability status alone was not enough for KEAVEX.

The system needed to know:

* why the status exists
* what evidence supports it
* what remains unknown
* what evidence is missing
* what the user could demonstrate next

---

# 6.1 Evidence Sources

Gemini's supporting evidence was mapped into:

```text
evidence_sources
```

Each source stores:

```text
source_type
strength
detail
capability_id
```

This created an explicit relationship between a capability and the evidence supporting it.

---

# 6.2 Unknowns

Unknown information was stored separately.

For example:

```text
Ability to write optimized Dockerfiles
```

or:

```text
Experience configuring multi-container setups using Docker Compose
```

The important distinction is:

```text
Unknown
≠
Not capable
```

The backend records uncertainty rather than converting uncertainty into a negative conclusion.

---

# 6.3 Evidence Gaps

Evidence gaps were introduced to represent missing proof.

An evidence gap can include:

```text
title
description
why_it_matters
recommended_task
task_prompt
```

This makes the system actionable.

Instead of only saying:

```text
Insufficient evidence
```

the backend can explain:

```text
What is missing
+
Why it matters
+
What could demonstrate it
```

---

# 6.4 Full Relational Save

The final Day 6 persistence pipeline became:

```text
Gemini JSON
      │
      ▼
  analyses
      │
      ▼
 capabilities
      │
      ├── evidence_sources
      │
      ├── unknowns
      │
      └── evidence_gaps
```

---

# 6.5 Day 6 Verification

A fresh successful analysis generated:

```text
analysis_id:
d920cfab-3a27-4b3f-8593-ee69426c8060
```

Database verification confirmed:

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

The relational links were verified as well.

---

# Day 6 Milestone

The backend was no longer simply an AI analysis endpoint.

It had become a relational evidence system.

The complete first-analysis flow was now:

```text
Resume
   ↓
PDF Extraction
   ↓
Gemini
   ↓
Analysis
   ↓
Capabilities
   ↓
Evidence Sources
   ↓
Unknowns
   ↓
Evidence Gaps
```

---

# Day 7 — Dynamic Analyze API

## Objective

Remove hardcoded test values from the analysis pipeline.

The endpoint needed to accept real request data.

The required request became:

```json
{
  "user_id": "uuid",
  "pdf_path": "string",
  "target_role": "string"
}
```

---

# 7.1 Request Validation

The Edge Function validates:

```text
user_id
pdf_path
target_role
```

If any required value is missing, the endpoint returns:

```text
400
```

with a structured missing-fields response.

---

# 7.2 Dynamic User

The analysis is now associated with the user specified by:

```text
user_id
```

The test user used during backend development was:

```text
79eac5f5-b31c-447c-8084-2232878066dd
```

The associated test profile contained:

```text
full_name:
Test User

target_role:
Backend Developer
```

---

# 7.3 Dynamic Resume Path

The backend now reads:

```text
pdf_path
```

from the incoming request.

The requested file is downloaded from:

```text
resumes
```

storage.

This removed the need to hardcode a specific resume filename.

---

# 7.4 Dynamic Target Role

The target role is also supplied by the request.

For example:

```json
{
  "target_role": "Backend Developer"
}
```

The AI assessment therefore receives the requested career context rather than relying on one fixed role.

---

# 7.5 Successful Dynamic Request

A successful test used:

```json
{
  "user_id": "79eac5f5-b31c-447c-8084-2232878066dd",
  "pdf_path": "test-resume.pdf",
  "target_role": "Backend Developer"
}
```

The response generated:

```text
analysis_id:
7799c856-8429-4e5a-b357-75c5d666d683
```

The returned capability results included:

```text
REST API Development with Java & Spring Boot
→ developing

Database Management & SQL (PostgreSQL)
→ developing

Containerization (Docker)
→ insufficient
```

---

# 7.6 Dynamic Pipeline

Day 7 established the complete request-driven pipeline:

```text
HTTP Request
      ↓
Request Validation
      ↓
user_id
pdf_path
target_role
      ↓
Storage Download
      ↓
PDF Extraction
      ↓
Gemini
      ↓
Database Persistence
      ↓
API Response
```

---

# Day 7 Milestone

The analyze endpoint was no longer a test-only implementation.

It had become a dynamic backend API capable of receiving:

```text
User
+
Resume
+
Target Role
```

and producing a complete structured assessment.

---

# Day 8 — Evidence Reassessment

## Objective

Implement the second major backend workflow:

```text
Existing Assessment
       ↓
New User Evidence
       ↓
Reassessment
       ↓
Possible Status Change
       ↓
Persist New Evidence
```

This introduced the concept of capability progression through new evidence.

---

# 8.1 New Endpoint

The new endpoint became:

```text
POST /functions/v1/reassess-evidence
```

Request:

```json
{
  "analysis_id": "uuid",
  "capability_id": "uuid",
  "user_response": "string"
}
```

---

# 8.2 Reassessment Validation

The endpoint validates:

```text
analysis_id
capability_id
user_response
```

It also verifies that the capability belongs to the specified analysis.

If the capability does not exist or does not belong to the analysis, the backend returns:

```text
404
```

---

# 8.3 Existing Capability Context

The backend retrieves the existing capability:

```text
name
claim
status
```

This allows the reassessment to understand what was previously established.

---

# 8.4 Existing Evidence Context

The backend also retrieves related:

```text
unknowns
evidence_gaps
```

This allows new evidence to be evaluated against known evidence gaps.

The reassessment therefore considers:

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

# 8.5 Gemini Reassessment

Gemini is then used to evaluate the new evidence under the same KEAVEX evidence rules.

The reassessment output includes:

```text
previous_status
status
change_reason
new_evidence
convergence
```

---

# 8.6 Demonstration Persistence

After reassessment, the backend creates a `demonstrations` record containing:

```text
capability_id
user_response
previous_status
new_status
change_reason
```

This preserves the status transition.

---

# 8.7 Capability Update

The capability record is then updated with the new status.

This means the current state is updated while the demonstration table preserves the transition history.

---

# 8.8 New Evidence Source

The new demonstration is also stored as an evidence source.

The source type is:

```text
technical_response
```

This differentiates newly demonstrated evidence from evidence originally extracted from the resume.

---

# 8.9 Real Docker Reassessment

The Docker capability was selected for the first complete reassessment test.

Initial state:

```text
Containerization (Docker)
→ insufficient
```

Capability ID:

```text
cdecbfdb-c4ca-467e-9267-dff5f68ce993
```

Existing unknowns included:

```text
Ability to write optimized Dockerfiles

Experience configuring multi-container setups using Docker Compose

Understanding of containerized deployment pipelines
```

The evidence gap identified missing Dockerfiles and Docker Compose configuration artifacts.

---

# 8.10 New Technical Demonstration

The user demonstration covered:

```text
multi-stage Dockerfile
Maven build stage
slim JRE runtime image
Docker Compose
PostgreSQL
named volume
health checks
service dependencies
image build
container registry
deployment
logs
health endpoints
```

This supplied evidence directly relevant to the existing Docker evidence gaps.

---

# 8.11 Successful Status Transition

The reassessment produced:

```text
previous_status:
insufficient

new status:
developing
```

The new evidence strength was:

```text
strong
```

The convergence state was:

```text
converging
```

The returned change reason explained that the new technical response addressed major evidence gaps around Dockerfile optimization, multi-container orchestration, health checks, registry workflows, and deployment verification.

---

# 8.12 Database Verification

The demonstration was persisted with:

```text
id:
bd887e16-05c2-4464-abe0-765de1e2b3e6
```

The stored transition was:

```text
previous_status:
insufficient

new_status:
developing
```

The capability was subsequently verified as:

```text
Containerization (Docker)
→ developing
```

---

# Day 8 Milestone

The backend successfully demonstrated the complete evidence progression loop:

```text
Insufficient Evidence
        ↓
User Demonstrates New Evidence
        ↓
Gemini Reassessment
        ↓
Developing Evidence
        ↓
Status Transition Persisted
```

This became one of the core backend workflows for the product.

---

# Day 9 — Stabilization and Backend Freeze

## Objective

Day 9 was intentionally not a feature-development day.

The objective was:

```text
Stable APIs
      ↓
Clean Errors
      ↓
Frozen Contract
      ↓
Regression Validation
      ↓
Demo-Ready Backend
```

The backend was prepared for frontend integration.

---

# 9.1 API Contract Freeze

The analyze endpoint was frozen as:

```text
POST /functions/v1/analyze-evidence
```

Request:

```json
{
  "user_id": "uuid",
  "pdf_path": "string",
  "target_role": "string"
}
```

Success:

```json
{
  "analysis_id": "uuid",
  "overall_status": "strong | developing | insufficient",
  "summary": "string",
  "capabilities": []
}
```

---

# 9.2 Reassessment Contract Freeze

The reassessment endpoint was frozen as:

```text
POST /functions/v1/reassess-evidence
```

Request:

```json
{
  "analysis_id": "uuid",
  "capability_id": "uuid",
  "user_response": "string"
}
```

Success:

```json
{
  "capability": "string",
  "previous_status": "strong | developing | insufficient",
  "status": "strong | developing | insufficient",
  "change_reason": "string",
  "new_evidence": {
    "source": "technical_response",
    "strength": "weak | moderate | strong",
    "detail": "string"
  },
  "convergence": {
    "status": "converging | conflict | inconclusive",
    "summary": "string"
  }
}
```

---

# 9.3 Error Handling Stabilization

The backend's error handling was reviewed so that internal and upstream failures could be returned in a useful serialized form.

A specific error serialization issue was identified and corrected during this stage.

The complete debugging history is intentionally documented separately in:

```text
docs/BACKEND_ERRORS_AND_DEBUGGING.md
```

---

# 9.4 Syntax Validation

The reassessment Edge Function was checked using:

```powershell
npx.cmd -y deno check "supabase/functions/reassess-evidence/index.ts"
```

The result confirmed that the TypeScript function passed the syntax/type-check stage without an error.

---

# 9.5 Deployment

The corrected reassessment function was successfully deployed to the Supabase project:

```text
zspdcdbydaxgirashmml
```

The deployed function was:

```text
reassess-evidence
```

---

# 9.6 Upstream Gemini Availability

During regression validation, Gemini returned an upstream:

```text
503 UNAVAILABLE
```

The backend correctly surfaced the upstream failure rather than fabricating a capability result.

A separate development request had also previously encountered:

```text
429 RESOURCE_EXHAUSTED
```

because of Gemini free-tier request quota.

These events established that Gemini availability and quota are external dependencies of the backend.

The detailed debugging history is documented separately.

---

# Day 9 Milestone

The backend reached a frozen state.

No new backend features were added after this stabilization stage.

The focus shifted from backend development to frontend integration.

---

# 10. Final Backend Pipeline

After Day 9, the main analysis pipeline is:

```text
User Request
    ↓
analyze-evidence
    ↓
Validate Request
    ↓
Download Resume
    ↓
Extract PDF Text
    ↓
Gemini Evidence Analysis
    ↓
Create Analysis
    ↓
Create Capabilities
    ↓
Create Evidence Sources
    ↓
Create Unknowns
    ↓
Create Evidence Gaps
    ↓
Return Structured API Response
```

---

# 11. Final Reassessment Pipeline

The reassessment pipeline is:

```text
User Demonstration
       ↓
reassess-evidence
       ↓
Validate Analysis + Capability
       ↓
Load Existing Capability Context
       ↓
Load Unknowns + Evidence Gaps
       ↓
Gemini Reassessment
       ↓
Determine New Status
       ↓
Save Demonstration
       ↓
Update Capability
       ↓
Save New Evidence Source
       ↓
Return Status Transition
```

---

# 12. Final Database Model

The final relational model is:

```text
profiles
   │
   └── analyses
          │
          ├── capabilities
          │      │
          │      ├── evidence_sources
          │      ├── unknowns
          │      ├── evidence_gaps
          │      └── demonstrations
          │
          ├── resumes
          └── projects
```

This allows the backend to preserve both:

```text
Current Capability State
```

and:

```text
Evidence History
```

---

# 13. Backend Responsibility

The backend is responsible for:

* receiving analysis requests
* validating request data
* retrieving resume files
* extracting resume text
* sending evidence to Gemini
* applying KEAVEX evidence rules
* storing capability assessments
* storing supporting evidence
* storing unknowns
* storing evidence gaps
* reassessing capabilities using new evidence
* recording demonstrations
* updating capability state
* returning structured API responses
* handling upstream failures

---

# 14. Frontend Responsibility

The frontend should not independently determine capability status.

The backend is the source of truth for:

```text
strong
developing
insufficient
```

The frontend should primarily:

* send requests
* display returned data
* show loading states
* show errors
* display evidence
* display unknowns
* display evidence gaps
* collect user demonstrations
* display reassessment results

The frontend should not reproduce the backend's assessment logic.

---

# 15. Frozen Product Rules

The following rules were frozen as part of the backend contract.

## Rule 1 — No Capability Percentages

KEAVEX does not use percentage-based capability scores.

The backend returns:

```text
strong
developing
insufficient
```

---

## Rule 2 — Insufficient Does Not Mean Incapable

`insufficient` means:

> There is not enough evidence currently available to support a stronger assessment.

It does not mean:

> The person cannot perform the capability.

---

## Rule 3 — Evidence Must Not Be Invented

The backend must not create evidence that does not exist in the supplied context.

---

## Rule 4 — Backend Owns Status

The backend determines capability status.

The frontend renders it.

---

## Rule 5 — New Evidence Must Be Traceable

When a reassessment changes status, the backend records:

```text
previous_status
new_status
change_reason
user_response
```

---

## Rule 6 — Current State and History Are Separate

The capability record stores the current status.

The demonstrations table stores the transition history.

---

# 16. Security Boundary

Sensitive credentials remain server-side.

The following must not be exposed to the frontend:

```text
GEMINI_API_KEY
Supabase secret credentials
service-role credentials
```

The frontend should use the appropriate public/publishable Supabase credential.

Resume files remain in private storage and are accessed by the backend.

---

# 17. Important Backend Implementation Decisions

## Foundation Model Instead of Custom LLM

The project does not train its own large language model.

Gemini provides general language reasoning.

KEAVEX provides the domain-specific evidence evaluation architecture.

---

## Relational Evidence Model

Evidence is stored as related database records rather than only as one large AI response.

---

## Separate Reassessment Endpoint

New evidence is handled through:

```text
reassess-evidence
```

rather than rerunning the entire original analysis.

---

## Evidence-First Status Model

The system evaluates:

```text
What does the evidence support?
```

rather than:

```text
How capable is this person?
```

---

## Conservative Evaluation

When evidence is insufficient, the backend should preserve uncertainty rather than manufacture confidence.

---

# 18. Backend Validation Summary

The backend successfully established the following major flows:

### Initial Analysis

```text
Resume
→ PDF Extraction
→ Gemini
→ Analysis
→ Capabilities
→ Evidence
→ Unknowns
→ Evidence Gaps
```

### Dynamic Analysis

```text
user_id
+
pdf_path
+
target_role
→
Complete Analysis
```

### Reassessment

```text
Existing Capability
+
New User Evidence
→
Reassessment
→
Status Transition
→
Demonstration Record
```

### Error Handling

```text
Internal Error
→
Structured Error Response
```

and:

```text
Gemini Upstream Failure
→
Readable Upstream Error
```

---

# 19. Major Backend Milestones

## Milestone 1

Backend foundation established.

---

## Milestone 2

Relational database structure established.

---

## Milestone 3

Resume PDF extraction established.

---

## Milestone 4

Gemini structured analysis established.

---

## Milestone 5

Analysis and capability persistence established.

---

## Milestone 6

Evidence sources, unknowns, and evidence gaps persisted.

---

## Milestone 7

Analyze API became dynamic.

---

## Milestone 8

Evidence reassessment and status transitions became functional.

---

## Milestone 9

API contracts were stabilized and backend was frozen for frontend integration.

---

# 20. Final Backend State

At the end of Day 9:

```text
PDF Processing
        ✓

Gemini Integration
        ✓

Structured AI Output
        ✓

Analysis Persistence
        ✓

Capability Persistence
        ✓

Evidence Sources
        ✓

Unknowns
        ✓

Evidence Gaps
        ✓

Dynamic Analyze API
        ✓

Reassessment API
        ✓

Demonstration Persistence
        ✓

Status Transitions
        ✓

Error Handling
        ✓

Security Boundary
        ✓

API Contract
        ✓ FROZEN
```

---

# 21. Backend Status

## DEMO READY / FROZEN

The backend has reached the point required for frontend integration.

The backend should not receive new feature work during frontend implementation unless a genuine defect is discovered.

The frontend should integrate against the frozen API contracts.

---

# 22. Development Boundary After Day 9

The backend development phase ends here.

The next phase is frontend development.

The frontend will consume the existing backend through:

```text
POST /functions/v1/analyze-evidence
```

and:

```text
POST /functions/v1/reassess-evidence
```

The frontend therefore becomes the presentation and interaction layer over the already-established evidence engine.

---

# 23. Final Engineering Principle

The backend was built around one consistent principle:

> **KEAVEX should claim only what the available evidence supports.**

This principle is reflected across:

```text
Database Design
        ↓
AI Output Structure
        ↓
Capability Status
        ↓
Evidence Strength
        ↓
Unknowns
        ↓
Evidence Gaps
        ↓
Reassessment
        ↓
Status History
```

The backend is therefore not simply:

```text
Resume → AI → Result
```

It is:

```text
Evidence
   ↓
Structured Evaluation
   ↓
Capability State
   ↓
Evidence Gaps
   ↓
New Demonstration
   ↓
Reassessment
   ↓
Updated Evidence State
```

---

# 24. End of Backend Build Log

**KEAVEX Backend — Day 1 to Day 9**

**Status: DEMO READY / FROZEN**

Detailed errors and debugging history:

`docs/BACKEND_ERRORS_AND_DEBUGGING.md`
``
```
