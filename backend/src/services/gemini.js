import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Parse natural language search query into structured filters
 * @param {string} query - User's natural language query
 * @returns {Promise<Object>} Structured search parameters
 */
export async function parseSearchQuery(query) {
  try {
    const prompt = `
You are a real estate search assistant. Parse this natural language query into structured search parameters.

Query: "${query}"

Available properties data structure:
- price (number)
- bedrooms (number)
- bathrooms (number)
- property_type (apartment, house)
- listing_type (rent, sale)
- amenity_types: park, grocery, cafe, restaurant, transit_station, gym, pharmacy, community_center

Extract and return ONLY a valid JSON object with these fields:
{
  "priceRange": { "min": number or null, "max": number or null },
  "bedrooms": { "min": number or null, "max": number or null },
  "bathrooms": { "min": number or null, "max": number or null },
  "propertyType": string or null (must be "apartment" or "house"),
  "listingType": string or null (must be "rent" or "sale"),
  "amenityPreferences": [array of strings from amenity_types list],
  "commutePreference": string or null (e.g., "short", "quick", "walkable", "transit accessible"),
  "transportMode": string or null ("walking", "bicycling", "driving", or "transit"),
  "needsTransportModeClarity": boolean (true if query mentions "nearby" without specifying transport mode),
  "summary": "brief 1-sentence interpretation of the query"
}

Important rules:
- If bedrooms/bathrooms is exact number (e.g., "2 bedroom"), set min and max to that number
- If bedrooms/bathrooms uses "+" (e.g., "2+ bedrooms"), set only min
- For price ranges like "under $2000", set max only
- For price ranges like "over $1500", set min only
- Only include amenity types from the provided list
- Set needsTransportModeClarity to true ONLY if query mentions proximity/nearby but doesn't specify HOW user will get there
- Return ONLY valid JSON, no markdown formatting, no explanations

Example:
Query: "2 bedroom apartment near parks under $2500"
{
  "priceRange": { "min": null, "max": 2500 },
  "bedrooms": { "min": 2, "max": 2 },
  "bathrooms": { "min": null, "max": null },
  "propertyType": "apartment",
  "listingType": null,
  "amenityPreferences": ["park"],
  "commutePreference": null,
  "transportMode": null,
  "needsTransportModeClarity": true,
  "summary": "Looking for 2-bedroom apartments under $2,500/month near parks"
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract JSON from response (remove markdown formatting if present)
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?|\n?```/g, '');
    }

    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error('Error parsing search query with Gemini:', error);
    throw new Error('Failed to parse search query');
  }
}

/**
 * Rank properties based on user query and preferences
 * @param {Array} properties - Array of property objects with commute data
 * @param {string} userQuery - Original user query
 * @param {Object} workplace - Workplace location {lat, lng}
 * @returns {Promise<Array>} Array of {id, reason} ranked by relevance
 */
export async function rankProperties(properties, userQuery, workplace = null) {
  try {
    // Limit properties to top 50 for token efficiency
    const propertiesToRank = properties.slice(0, 50);

    const prompt = `
You are a real estate search assistant. Rank these properties from best to worst match based on the user's query.

User query: "${userQuery}"
${workplace ? `Workplace location: ${workplace.lat}, ${workplace.lng}` : 'No workplace set'}

Properties (simplified):
${JSON.stringify(
  propertiesToRank.map((p) => ({
    id: p.id,
    price: p.price,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    address: p.address,
    commuteDuration: p.commute?.duration || null,
    commuteDurationText: p.commute?.durationText || null,
  })),
  null,
  2
)}

Ranking criteria:
1. Match to query requirements (bedrooms, price, amenities)
2. Commute time (if workplace is set and user cares about commute)
3. Price (prefer better value)
4. Overall quality

Return ONLY a JSON array of property IDs in ranked order with a brief reason for each:
[
  { "id": 1, "reason": "Best transit access and within budget" },
  { "id": 5, "reason": "Shorter commute, slightly over budget but great value" },
  ...
]

Return ONLY valid JSON, no markdown formatting, no explanations.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract JSON from response
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?|\n?```/g, '');
    }

    const ranked = JSON.parse(jsonText);
    return ranked;
  } catch (error) {
    console.error('Error ranking properties with Gemini:', error);
    // Fallback: return properties in original order
    return properties.map((p) => ({ id: p.id, reason: 'Matched your search criteria' }));
  }
}

/**
 * Generate context-aware property summary with lifestyle insights
 * @param {Object} property - Property object with full details
 * @param {Array} nearbyAmenities - Array of nearby amenity objects
 * @param {Object} commuteInfo - Commute information if available
 * @returns {Promise<string>} Generated summary
 */
export async function generatePropertySummary(property, nearbyAmenities = [], commuteInfo = null) {
  try {
    const prompt = `
You are a real estate copywriter. Generate a compelling 2-3 sentence property description highlighting lifestyle fit.

Property details:
- Address: ${property.address}
- Price: $${property.price}${property.listing_type === 'rent' ? '/month' : ''}
- Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
- Type: ${property.property_type}

Nearby amenities (within walking/biking distance):
${nearbyAmenities.length > 0 ? nearbyAmenities.map((a) => `- ${a.name} (${a.type})`).join('\n') : 'No amenity data available'}

${
  commuteInfo
    ? `Commute to work: ${commuteInfo.durationText} by ${commuteInfo.mode}`
    : 'No commute information available'
}

Write a natural, engaging 2-3 sentence summary that:
1. Highlights the property's key features
2. Mentions notable nearby amenities by name if available
3. Includes commute information if provided
4. Focuses on lifestyle benefits, not just specs

Example style: "Perfectly positioned two-bedroom in the heart of downtown. Stanley Park is a 10-minute walk away for your morning jogs, while Burrard Station puts you just 18 minutes from work. Grab your coffee at Blue Bottle nearby before heading out."

Return ONLY the summary text, no JSON, no formatting, no extra explanations.
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();
    return summary;
  } catch (error) {
    console.error('Error generating property summary with Gemini:', error);
    return `Beautiful ${property.bedrooms}-bedroom ${property.property_type} located at ${property.address}. Contact for more details.`;
  }
}

/**
 * Answer natural language questions about nearby POIs for a specific property
 * @param {Object} property - Property object
 * @param {string} question - User's question about nearby amenities/POIs
 * @param {Array} nearbyPOIs - Array of nearby POI objects from Google Places API
 * @returns {Promise<string>} Natural language answer
 */
export async function answerPOIQuery(property, question, nearbyPOIs = []) {
  try {
    const prompt = `
You are a helpful real estate assistant. Answer the user's question about nearby amenities for this property.

Property: ${property.address}

User question: "${question}"

Nearby places (numbered list):
${
  nearbyPOIs.length > 0
    ? nearbyPOIs
        .map(
          (poi, index) =>
            `${index + 1}. ${poi.name} (${poi.types?.join(', ') || 'unknown type'})${poi.rating ? ` - Rating: ${poi.rating}/5` : ''}${poi.vicinity ? ` - ${poi.vicinity}` : ''}`
        )
        .join('\n')
    : 'No nearby places found for this query'
}

Provide a helpful, conversational answer that:
1. Directly answers the user's question
2. References specific places by their NUMBER (e.g., "Sightglass Coffee [4]" or "places like [1] and [3]")
3. Mentions place names AND their numbers for easy reference
4. Includes relevant details like ratings if available
5. Is concise (2-4 sentences max)
6. Suggests alternatives if exact match isn't found

IMPORTANT: When mentioning a place, always include its number in square brackets like this: "Sightglass Coffee [4]"

If no relevant places were found, suggest the user try a broader search or different amenity type.

Return ONLY the answer text, no JSON, no markdown formatting.
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();
    return answer;
  } catch (error) {
    console.error('Error answering POI query with Gemini:', error);
    return "I'm having trouble processing your question right now. Please try rephrasing or ask about a specific type of amenity like 'coffee shops' or 'grocery stores'.";
  }
}

export default {
  parseSearchQuery,
  rankProperties,
  generatePropertySummary,
  answerPOIQuery,
};
