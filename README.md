
# KEAVEX Backend

> Evidence-based capability assessment powered by AI reasoning.

KEAVEX is an Explainable Career Intelligence Platform designed to evaluate what current evidence supports about a capability claim.

Instead of assigning percentages or numeric scores, KEAVEX uses evidence-backed capability states:

- `strong`
- `developing`
- `insufficient`

The system is intentionally conservative: insufficient evidence is treated as an evidence gap, not as proof that a person lacks the capability.


## What the Backend Does

The KEAVEX backend provides two core AI-powered workflows:

### 1. Evidence Analysis

A user's resume is processed and evaluated against a selected career target.

```text
Resume PDF
    ↓
PDF Text Extraction
    ↓
Gemini Reasoning Layer
    ↓
Evidence Evaluation
    ↓
Capability Assessment
    ↓
Evidence Sources
    ↓
Unknowns
    ↓
Evidence Gaps
    ↓
Supabase Database
```
2. Evidence Reassessment
When a user provides new evidence through a technical response or demonstration, KEAVEX reassesses the relevant capability.
```
Existing Capability
    ↓
New User Evidence
    ↓
Gemini Reassessment
    ↓
Previous Status → New Status
    ↓
Change Reason
    ↓
New Evidence
    ↓
Convergence
    ↓
Database Update
```
Core Philosophy
KEAVEX does not attempt to determine whether a person is inherently capable or incapable.
It evaluates:
What does the available evidence currently support?
This distinction is fundamental to the system.
Capability Status
```
| Status       | Meaning                                                                               |
| ------------ | ------------------------------------------------------------------------------------- |
| strong       | Available evidence strongly supports the capability claim                             |
| developing   | Evidence demonstrates meaningful capability, but important gaps or uncertainty remain |
| insufficient | Available evidence is not sufficient to support the capability claim                  |
```
insufficient does not mean the user cannot perform the skill.
It means the system does not currently have enough evidence to support the claim.

Evidence Strength
Evidence sources are classified as:
* weak
* moderate
* strong
KEAVEX does not fabricate evidence when information is missing.
Instead, it records:
* what is known
* what is unknown
* what evidence is missing
* what evidence could be provided next
  
AI Architecture
KEAVEX does not use a custom-trained Large Language Model.
The current architecture uses Google's Gemini foundation model as the general language reasoning layer.

KEAVEX provides the domain-specific system around that model, including:
* capability definitions
* evidence evaluation rules
* evidence-strength vocabulary
* uncertainty handling
* evidence-gap identification
* reassessment rules
* convergence states
* structured JSON output
* persistent assessment history
Therefore, the backend should be understood as:
A domain-specific evidence evaluation system built around a foundation model.
Gemini provides general language understanding and reasoning.
KEAVEX determines how that reasoning is constrained and represented for capability assessment.

Technology Stack
* Supabase Edge Functions — backend API execution
* Supabase PostgreSQL — relational data storage
* Supabase Storage — private resume storage
* Gemini API — AI reasoning layer
* Deno / TypeScript — Edge Function runtime
* unpdf — PDF text extraction
  
API
Analyze Evidence
Endpoint
```
POST /functions/v1/analyze-evidence
```
Request
```
{
  "user_id": "uuid",
  "pdf_path": "string",
  "target_role": "string"
}
```
Processing
The endpoint:
1. Validates the request.
2. Downloads the resume from the private resumes storage bucket.
3. Extracts text from the PDF.
4. Sends the relevant evidence context to Gemini.
5. Receives structured JSON.
6. Creates an analysis record.
7. Creates capability records.
8. Stores evidence sources.
9. Stores unknowns.
10. Stores evidence gaps.
11. Returns the structured assessment.
Success Response
```
{
  "analysis_id": "uuid",
  "overall_status": "strong | developing | insufficient",
  "summary": "string",
  "capabilities": []
}
```
The complete capability objects contain the evidence assessment required by the frontend.
Reassess Evidence
Endpoint
```
POST /functions/v1/reassess-evidence
```
Request
```
{
  "analysis_id": "uuid",
  "capability_id": "uuid",
  "user_response": "string"
}
```
Processing
The endpoint:
1. Validates the request.
2. Verifies that the capability belongs to the specified analysis.
3. Retrieves existing unknowns and evidence gaps.
4. Sends the previous assessment and new evidence to Gemini.
5. Reassesses the capability using the same conservative KEAVEX rules.
6. Records the demonstration.
7. Updates the capability status.
8. Stores the new technical evidence.
9. Returns the reassessment result.
Success Response
```
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
Database Architecture
KEAVEX uses a relational evidence model.
analyses
Stores the overall assessment.
Important fields include:
* user_id
* resume_id
* project_id
* target_role
* overall_status
* summary
* status
* created_at
capabilities
Stores individual capability assessments.
Important fields:
* analysis_id
* name
* claim
* status
evidence_sources
Stores evidence supporting a capability.
Important fields:
* capability_id
* source_type
* strength
* detail
unknowns
Stores information that is currently not established by available evidence.
Important field:
* description
evidence_gaps
Stores missing evidence that prevents stronger assessment.
Important fields:
* title
* description
* why_it_matters
* recommended_task
* task_prompt
demonstrations
Stores new evidence submitted during reassessment.
Important fields:
* capability_id
* user_response
* previous_status
* new_status
* change_reason
* created_at
This allows KEAVEX to preserve the progression of evidence rather than treating every assessment as an isolated result.
Reassessment Model
A capability can change when new evidence provides stronger support.
For example:
```
Initial assessment
Containerization
Status: insufficient

        ↓

User provides technical demonstration

        ↓

KEAVEX evaluates new evidence

        ↓

Status: developing
```
The backend records both the previous and new status together with the reason for the change.
This creates an evidence progression rather than simply overwriting the previous assessment.
Convergence
KEAVEX uses three convergence states:
* converging
* conflict
* inconclusive
These represent how the new evidence relates to the existing evidence.
The system does not force a positive conclusion when evidence remains contradictory or insufficient.
Error Handling
The backend distinguishes between request, resource, processing, and upstream AI failures.
400
Used when required request fields are missing or invalid.
404
Used by reassessment when the requested capability or analysis relationship cannot be found.
500
Used for unexpected extraction, database, or backend processing failures.
429
May occur when the upstream Gemini API quota or rate limit is exhausted.
503
May occur when the upstream Gemini service is temporarily unavailable.
When Gemini is unavailable, KEAVEX does not fabricate an assessment.
The error is returned instead.
Security
Sensitive credentials remain server-side.
Frontend
The frontend may use the Supabase publishable/anonymous key required for public client access.
Edge Functions
Sensitive credentials such as:
* Gemini API key
* Supabase secret/service credentials
remain inside the Edge Function environment.
They must never be exposed to the frontend.
Resume Storage
Resume files are stored in a private Supabase Storage bucket and accessed by the backend during analysis.
Important Product Rules
The backend enforces the following product principles:
* No percentage-based capability scores.
* No fabricated evidence.
* No unsupported strong conclusions when evidence is weak.
* insufficient means insufficient evidence, not inability.
* Backend decides capability status.
* Frontend only renders backend decisions.
* Evidence strength is separate from capability status.
* New evidence can change a capability assessment.
* Reassessment preserves previous status and records the change.
* Gemini failure must not produce a fabricated assessment.
Validation Status
The backend has been validated through staged implementation and regression testing.
Analysis Pipeline
Verified:
```
Request
→ Resume Download
→ PDF Extraction
→ Gemini Analysis
→ Analysis Record
→ Capability Records
→ Evidence Sources
→ Unknowns
→ Evidence Gaps
→ API Response
```
Reassessment Pipeline
Verified successfully with a real capability reassessment:
```
Existing Capability
→ New Technical Evidence
→ Gemini Reassessment
→ Status Change
→ Demonstration Record
→ Capability Update
→ New Evidence Source
→ Response
```
Day 9 Regression
The error serialization path was tested against an upstream Gemini 503 UNAVAILABLE response.
The backend returned readable error details instead of the previous:
```
[object Object]
```
The 503 originated from Gemini's temporary service availability and was not a KEAVEX database or assessment-logic failure.
Current Backend Status

Backend: DEMO READY / FROZEN
The backend API contract is frozen for frontend integration.
Further backend changes should only be made if a genuine defect is discovered.
The frontend is expected to consume the existing API contract rather than reproduce assessment logic independently.
Product Boundary

KEAVEX is not:
* a custom-trained LLM
* a generic chatbot
* a resume keyword matcher
* a percentage-based scoring system
  
KEAVEX is:
An evidence-based capability assessment system that uses AI reasoning to determine what current evidence supports, identify what remains unknown, and guide the collection of stronger evidence.
```

