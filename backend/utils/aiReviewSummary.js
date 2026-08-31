// generates a short natural-language summary of a restaurant's reviews using
// Groq's chat completions API (OpenAI-compatible request/response shape).
// Requires GROQ_API_KEY - callers should catch and fall back to a simpler
// summary if this throws, since an AI summary is a nice-to-have and
// shouldn't block the reviews endpoint if the key is missing or the request
// fails. Groq's free tier is generous enough for this use case and needs no
// billing card, unlike OpenAI's API.
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "openai/gpt-oss-20b"

const generateAiReviewSummary = async (restaurantName, reviews) => {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured")
    }

    // only send the rating + comment text - keep the payload small and never
    // send any reviewer-identifying info to the third-party API
    const commentedReviews = reviews.filter((r) => r.comment && r.comment.trim())

    if (commentedReviews.length === 0) {
        throw new Error("No review comments available to summarize")
    }

    const reviewLines = commentedReviews
        .slice(0, 30) // a handful of recent reviews is plenty for a useful summary
        .map((r) => `- (${r.rating}/5) ${r.comment.trim()}`)
        .join("\n")

    // scale the requested length to how much material there actually is -
    // asking for "2-3 sentences" out of a single review just makes the model
    // pad/generalize from a sample size of one
    let lengthInstruction
    if (commentedReviews.length === 1) {
        lengthInstruction = "Write exactly ONE sentence describing what this single review says. Since there is only one review, do not use words like \"customers\" or \"many\" - refer to it as one reviewer's experience."
    } else if (commentedReviews.length <= 3) {
        lengthInstruction = "Write 1-2 short sentences summarizing these reviews."
    } else {
        lengthInstruction = "Write 2-3 short sentences summarizing what customers consistently praise and any recurring complaints."
    }

    const prompt = `You are summarizing customer reviews for a restaurant called "${restaurantName}" on a food delivery app. ${lengthInstruction} Do not mention star ratings or numbers. Do not invent details that aren't in the reviews. Output only the summary text - no preamble, no headers, no reasoning.

Reviews:
${reviewLines}`

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            // gpt-oss is a reasoning model - it spends tokens on internal
            // reasoning before writing the actual answer, and those tokens
            // count against this budget. Too low a budget means the visible
            // summary gets cut off mid-sentence because reasoning ate it all.
            // reasoning_effort keeps that internal step short, and the
            // budget itself is generous enough to leave room for the answer.
            max_completion_tokens: 400,
            reasoning_effort: "low",
        }),
    })

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Groq request failed: ${response.status} ${errText}`)
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content?.trim()

    if (!summary) {
        throw new Error("Groq returned an empty summary")
    }

    return summary
}

module.exports = { generateAiReviewSummary }
