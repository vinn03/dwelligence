import { useMemo } from 'react';

export const usePropertySorting = (properties, workplace) => {
  const sortedProperties = useMemo(() => {
    if (!workplace) {
      // No workplace set, sort by price only
      return [...properties].sort((a, b) => a.price - b.price);
    }

    // Commute-aware ranking: (duration_seconds * 0.5) + (price * 0.5)
    // Lower score = better
    return [...properties].sort((a, b) => {
      const getDurationSeconds = (property) => {
        return property.commute?.duration || 999999; // Properties without commute go to bottom
      };

      const scoreA = getDurationSeconds(a) * 0.5 + a.price * 0.5;
      const scoreB = getDurationSeconds(b) * 0.5 + b.price * 0.5;

      return scoreA - scoreB;
    });
  }, [properties, workplace]);

  return sortedProperties;
};