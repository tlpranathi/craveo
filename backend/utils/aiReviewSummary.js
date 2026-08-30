// generates a short natural-language summary of a restaurant's reviews using
// OpenAI's chat completions API. Requires OPENAI_API_KEY - callers should
// catch and fall back to a simpler summary if this throws, since an AI
// summary is a nice-to-have and shouldn't block the reviews endpoint if the
// key is missing or the request fails.
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

const generateAiReviewSummary = async (restaurantName, reviews) => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured")
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

    const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            max_tokens: 150,
        }),
    })

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(`OpenAI request failed: ${response.status} ${errText}`)
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content?.trim()

    if (!summary) {
        throw new Error("OpenAI returned an empty summary")
    }

    return summary
}

module.exports = { generateAiReviewSummary }
