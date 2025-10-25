/**
 * Calculate ranking score for properties based on commute time and price
 * Iteration 1: Simple weighted formula
 * Formula: (Transportation_Time * w1) + (Price * w2) where w1 = w2 = 0.5
 * Lower score = better ranking
 */
export const calculateRankingScore = (property, commute, weights = { time: 0.5, price: 0.5 }) => {
  if (!commute || !commute.duration) {
    // If no commute data, rank by price only
    return property.price * weights.price;
  }

  // Normalize duration to minutes
  const durationMinutes = commute.duration / 60;

  // Calculate weighted score (lower is better)
  const score = (durationMinutes * weights.time) + (property.price * weights.price);

  return score;
};

/**
 * Rank properties by commute time and price
 * Returns sorted array with lowest scores first (best matches)
 */
export const rankProperties = (properties, commutes, weights) => {
  const scored = properties.map(property => {
    const commute = commutes.find(c => c.propertyId === property.id);
    const score = calculateRankingScore(property, commute, weights);

    return {
      ...property,
      commute,
      rankingScore: score
    };
  });

  // Sort by score (ascending - lower is better)
  return scored.sort((a, b) => a.rankingScore - b.rankingScore);
};

/**
 * Calculate transportation score (0-100)
 * Iteration 1: Basic scoring based on commute time
 * Future iterations can add transit accessibility and walkability
 */
export const calculateTransportationScore = (commute) => {
  if (!commute || !commute.duration) {
    return 0;
  }

  const durationMinutes = commute.duration / 60;

  // Score brackets
  if (durationMinutes < 20) return 90;
  if (durationMinutes < 30) return 75;
  if (durationMinutes < 45) return 60;
  if (durationMinutes < 60) return 40;
  return 20;
};
