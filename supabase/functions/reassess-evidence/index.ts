import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY",
)!;

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // --------------------------------------------------
    // 1. Read request
    // --------------------------------------------------

    const body = await req.json();

    const {
      analysis_id,
      capability_id,
      user_response,
    } = body;

    // --------------------------------------------------
    // 2. Validate required fields
    // --------------------------------------------------

    if (
      !analysis_id ||
      !capability_id ||
      !user_response
    ) {
      return Response.json(
        {
          error: "Missing required fields",
          required: [
            "analysis_id",
            "capability_id",
            "user_response",
          ],
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // --------------------------------------------------
    // 3. Get capability
    // --------------------------------------------------

    const { data: capability, error: capabilityError } =
      await supabase
        .from("capabilities")
        .select("id, analysis_id, name, claim, status")
        .eq("id", capability_id)
        .maybeSingle();

    if (capabilityError) {
      throw capabilityError;
    }

    // --------------------------------------------------
    // 4. Validate capability belongs to analysis
    // --------------------------------------------------

    if (
      !capability ||
      capability.analysis_id !== analysis_id
    ) {
      return Response.json(
        {
          error: "Capability not found for this analysis",
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    // --------------------------------------------------
    // 5. Get existing unknowns
    // --------------------------------------------------

    const { data: unknowns, error: unknownsError } =
      await supabase
        .from("unknowns")
        .select("description")
        .eq("capability_id", capability_id);

    if (unknownsError) {
      throw unknownsError;
    }

    // --------------------------------------------------
    // 6. Get existing evidence gaps
    // --------------------------------------------------

    const { data: evidenceGaps, error: gapsError } =
      await supabase
        .from("evidence_gaps")
        .select(
          "title, description, why_it_matters, recommended_task, task_prompt",
        )
        .eq("capability_id", capability_id);

    if (gapsError) {
      throw gapsError;
    }

    // --------------------------------------------------
    // 7. Build Gemini prompt
    // --------------------------------------------------

    const unknownText =
      unknowns && unknowns.length > 0
        ? unknowns
            .map((item) => `- ${item.description}`)
            .join("\n")
        : "None recorded.";

    const gapText =
      evidenceGaps && evidenceGaps.length > 0
        ? evidenceGaps
            .map(
              (gap) =>
                `Title: ${gap.title}
Description: ${gap.description}
Why it matters: ${gap.why_it_matters}
Recommended task: ${gap.recommended_task}
Task prompt: ${gap.task_prompt}`,
            )
            .join("\n\n")
        : "None recorded.";

    const userPrompt = `
You are the evidence reassessment engine for KEAVEX.

Your job is NOT to judge how capable a person is.

Your job is to determine what the NEW evidence supports about the existing capability claim.

Existing capability:

Name:
${capability.name}

Claim:
${capability.claim}

Previous status:
${capability.status}

Previously identified unknowns:
${unknownText}

Previously identified evidence gaps:
${gapText}

New user demonstration:
${user_response}

Evaluation rules:

1. Allowed capability statuses are ONLY:
   - strong
   - developing
   - insufficient

2. "insufficient" means insufficient evidence.
   It does NOT mean the person lacks the ability.

3. Be conservative.
   Do not upgrade a capability unless the new evidence actually supports the capability claim.

4. Do not invent evidence.

5. Do not use percentages or numeric scores.

6. The new user response is evidence from a technical demonstration.
   Evaluate what it actually demonstrates.

7. Compare the new evidence against the previous status and previously known evidence gaps.

8. A strong status requires strong supporting evidence.
   A developing status means meaningful but incomplete evidence.
   An insufficient status means the evidence remains too limited.

9. convergence.status must be ONLY:
   - converging
   - conflict
   - inconclusive

10. Return JSON only.
No markdown.
No explanation outside JSON.

Return exactly this structure:

{
  "previous_status": "developing",
  "status": "strong",
  "change_reason": "Explain specifically why the new evidence caused the status to change or remain the same.",
  "new_evidence": {
    "source": "technical_response",
    "strength": "strong",
    "detail": "Describe what the user's new response actually demonstrated."
  },
  "convergence": {
    "status": "converging",
    "summary": "Explain how the new evidence relates to the previous evidence."
  }
}
`;

    // --------------------------------------------------
    // 8. Call Gemini
    // --------------------------------------------------

    let geminiResponse: Response | null = null;

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=" +
          GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: userPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (geminiResponse.ok) {
        break;
      }

      const errorText = await geminiResponse.text();

      // Retry only temporary server/capacity errors.
      if (
        geminiResponse.status >= 500 &&
        attempt < maxAttempts
      ) {
        const delayMs = 2000 * Math.pow(2, attempt - 1);

        await new Promise((resolve) =>
          setTimeout(resolve, delayMs),
        );

        continue;
      }

      throw new Error(
        `Gemini API error: ${errorText}`,
      );
    }

    if (!geminiResponse || !geminiResponse.ok) {
      throw new Error(
        "Gemini API unavailable after retries",
      );
    }

    const geminiData = await geminiResponse.json();

    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error(
        "Gemini returned an empty response",
      );
    }

    // --------------------------------------------------
    // 9. Parse Gemini JSON
    // --------------------------------------------------

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error(
        "Gemini returned invalid JSON",
      );
    }

    // --------------------------------------------------
    // 10. Validate Gemini status values
    // --------------------------------------------------

    const allowedStatuses = [
      "strong",
      "developing",
      "insufficient",
    ];

    const allowedConvergenceStatuses = [
      "converging",
      "conflict",
      "inconclusive",
    ];

    if (
      !allowedStatuses.includes(parsed.status) ||
      !allowedStatuses.includes(parsed.previous_status)
    ) {
      throw new Error(
        "Gemini returned an invalid capability status",
      );
    }

    if (
      !allowedConvergenceStatuses.includes(
        parsed.convergence?.status,
      )
    ) {
      throw new Error(
        "Gemini returned an invalid convergence status",
      );
    }

    // --------------------------------------------------
    // 11. Save demonstration
    // --------------------------------------------------

    const { error: demonstrationError } =
      await supabase
        .from("demonstrations")
        .insert({
          capability_id: capability_id,
          user_response: user_response,
          previous_status: parsed.previous_status,
          new_status: parsed.status,
          change_reason: parsed.change_reason,
        });

    if (demonstrationError) {
      throw demonstrationError;
    }

    // --------------------------------------------------
    // 12. Update capability status
    // --------------------------------------------------

    const { error: updateError } =
      await supabase
        .from("capabilities")
        .update({
          status: parsed.status,
        })
        .eq("id", capability_id);

    if (updateError) {
      throw updateError;
    }

    // --------------------------------------------------
    // 13. Save new evidence source
    // --------------------------------------------------

    const { error: evidenceError } =
      await supabase
        .from("evidence_sources")
        .insert({
          capability_id: capability_id,
          source_type: "technical_response",
          strength: parsed.new_evidence.strength,
          detail: parsed.new_evidence.detail,
        });

    if (evidenceError) {
      throw evidenceError;
    }

    // --------------------------------------------------
    // 14. Return reassessment result
    // --------------------------------------------------

    return Response.json(
      {
        capability: capability.name,
        previous_status: parsed.previous_status,
        status: parsed.status,
        change_reason: parsed.change_reason,
        new_evidence: parsed.new_evidence,
        convergence: parsed.convergence,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("REASSESS_EVIDENCE_ERROR:", error);

    const details =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : String(error);

    return Response.json(
      {
        error: "Unexpected error",
        details,
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});

