import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { commuteAPI } from '../services/api';

/**
 * Hook to calculate commutes for visible properties
 * Automatically recalculates when workplace, transport mode, or visible properties change
 */
export const useCommuteCalculation = () => {
  const {
    workplace,
    transportMode,
    visibleProperties,
    setVisibleProperties,
    setCalculatingCommutes
  } = useAppContext();

  const debounceTimer = useRef(null);
  const previousPropertiesRef = useRef([]);

  const calculateCommutes = useCallback(async (properties, workplaceData, mode) => {
    if (!workplaceData || properties.length === 0) {
      return;
    }

    try {
      setCalculatingCommutes(true);

      // Extract property IDs
      const propertyIds = properties.map(p => p.id);

      // Call backend API
      const response = await commuteAPI.calculate(workplaceData, propertyIds, mode);

      // Merge commute data with properties
      const propertiesWithCommutes = properties.map(property => {
        const commuteData = response.data.find(c => c.propertyId === property.id);

        return {
          ...property,
          commute: commuteData || null
        };
      });

      setVisibleProperties(propertiesWithCommutes);
    } catch (error) {
      console.error('Error calculating commutes:', error);
      // Keep properties without commute data on error
    } finally {
      setCalculatingCommutes(false);
    }
  }, [setVisibleProperties, setCalculatingCommutes]);

  // Trigger commute calculation when workplace, transport mode, or properties change
  useEffect(() => {
    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Skip if no workplace is set
    if (!workplace) {
      return;
    }

    // Skip if properties haven't changed (avoid recalculating on commute data update)
    const currentPropertyIds = visibleProperties.map(p => p.id).sort().join(',');
    const previousPropertyIds = previousPropertiesRef.current.map(p => p.id).sort().join(',');

    // Only recalculate if properties changed, workplace changed, or mode changed
    const shouldRecalculate = currentPropertyIds !== previousPropertyIds;

    if (!shouldRecalculate && visibleProperties.length > 0 && visibleProperties[0].commute) {
      // Properties already have commute data for this mode, just recalculate
      debounceTimer.current = setTimeout(() => {
        calculateCommutes(visibleProperties, workplace, transportMode);
      }, 300);
    } else if (shouldRecalculate) {
      // New properties in viewport, calculate commutes
      debounceTimer.current = setTimeout(() => {
        calculateCommutes(visibleProperties, workplace, transportMode);
        previousPropertiesRef.current = visibleProperties;
      }, 300);
    }

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [workplace, transportMode, visibleProperties, calculateCommutes]);

  return null;
};
