// escape regex special characters in user-supplied search input before dropping it into a MongoDB $regex - without this, a search term like
// "a(b" throws (invalid regex) and something like "(a+)+" can be used to build a catastrophic-backtracking ReDoS payload
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// common shorthand / alternate spellings people actually type for Bengaluru localities, mapped to the canonical name used in restaurant "location" fields. Keys are lowercase for matching.
const LOCATION_ALIASES = {
    "indira nagar": "indiranagar",
    "indiranagar": "indiranagar",
    "btm": "btm layout",
    "btm layout": "btm layout",
    "koramangla": "koramangala",
    "koramangala": "koramangala",
    "hsr": "hsr layout",
    "hsr layout": "hsr layout",
    "jp nagar": "jayaprakash nagar",
    "jayanagar": "jayanagar",
    "electronic city": "electronic city",
    "e city": "electronic city",
    "whitefield": "whitefield",
    "marathahalli": "marathahalli",
    "malleshwaram": "malleshwaram",
    "rajajinagar": "rajajinagar",
    "banashankari": "banashankari",
    "yelahanka": "yelahanka",
    "bellandur": "bellandur",
    "domlur": "domlur",
    "cv raman nagar": "cv raman nagar",
    "mg road": "mg road",
    "brigade road": "brigade road",
    "sarjapur": "sarjapur road",
    "sarjapur road": "sarjapur road",
}

// given a raw search term, returns the canonical location name(s) it could refer to, so "Indira Nagar" also matches restaurants stored under "Indiranagar" and vice versa
const resolveLocationAliases = (searchTerm) => {
    if (!searchTerm) return []

    const term = searchTerm.trim().toLowerCase()
    if (!term) return []

    const matches = new Set()
    for (const [alias, canonical] of Object.entries(LOCATION_ALIASES)) {
        // match in both directions: user typed a shorter/longer form of a known alias ("Indira" -> "indira nagar" -> "indiranagar")
        if (alias.includes(term) || term.includes(alias)) {
            matches.add(canonical)
        }
    }
    return [...matches]
}

module.exports = { escapeRegex, resolveLocationAliases }