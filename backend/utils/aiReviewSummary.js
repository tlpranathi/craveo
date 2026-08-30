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
    const reviewLines = reviews
        .filter((r) => r.comment && r.comment.trim())
        .slice(0, 30) // a handful of recent reviews is plenty for a useful summary
        .map((r) => `- (${r.rating}/5) ${r.comment.trim()}`)
        .join("\n")

    if (!reviewLines) {
        throw new Error("No review comments available to summarize")
    }

    const prompt = `You are summarizing customer reviews for a restaurant called "${restaurantName}" on a food delivery app. Based on the reviews below, write a short, neutral 2-3 sentence summary covering what customers consistently praise and any recurring complaints. Do not mention star ratings or numbers. Do not invent details that aren't in the reviews.

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
            max_tokens: 150,
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
