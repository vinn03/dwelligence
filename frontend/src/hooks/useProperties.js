import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { propertiesAPI, commuteAPI } from '../services/api';

export const useProperties = () => {
  const {
    mapBounds,
    filters,
    workplace,
    transportMode,
    setProperties,
    setVisibleProperties,
    setLoading,
    setCalculatingCommutes
  } = useAppContext();

  const [error, setError] = useState(null);

  // Fetch properties when bounds or filters change
  useEffect(() => {
    const fetchProperties = async () => {
      if (!mapBounds) return;

      try {
        setLoading(true);
        setError(null);

        const response = await propertiesAPI.getInBounds(mapBounds, filters);
        const properties = response.data;

        setProperties(properties);
        setVisibleProperties(properties);

        // If workplace is set, calculate commutes
        if (workplace) {
          await calculateCommutes(properties);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [mapBounds, filters]);

  // Calculate commutes when workplace or transport mode changes
  useEffect(() => {
    const calculateCommutesEffect = async () => {
      const properties = useAppContext.getState?.().properties || [];
      if (properties.length > 0 && workplace) {
        await calculateCommutes(properties);
      }
    };

    calculateCommutesEffect();
  }, [workplace, transportMode]);

  const calculateCommutes = async (properties) => {
    try {
      setCalculatingCommutes(true);

      const propertyIds = properties.map((p) => p.id);
      const response = await commuteAPI.calculate(
        workplace,
        propertyIds,
        transportMode
      );

      const commutes = response.data;

      // Merge commute data with properties
      const propertiesWithCommutes = properties.map((property) => {
        const commute = commutes.find((c) => c.propertyId === property.id);
        return {
          ...property,
          commute: commute || null
        };
      });

      setVisibleProperties(propertiesWithCommutes);
    } catch (err) {
      console.error('Error calculating commutes:', err);
    } finally {
      setCalculatingCommutes(false);
    }
  };

  return { error };
};
