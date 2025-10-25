import { Client } from '@googlemaps/google-maps-services-js';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import { db } from './database.js';

dotenv.config();

const client = new Client({});
const cache = new NodeCache({ stdTTL: 86400 }); // 24 hour cache

export const googleMaps = {
  /**
   * Calculate commute times for multiple properties using Distance Matrix API
   * More efficient than individual Directions API calls
   */
  async batchCalculateCommutes(propertyIds, workplace, mode = 'transit') {
    try {
      // Get property locations from database
      const properties = await Promise.all(
        propertyIds.map(id => db.getPropertyById(id))
      );

      const validProperties = properties.filter(p => p !== null);

      if (validProperties.length === 0) {
        return [];
      }

      // Prepare origins (properties) and destination (workplace)
      const origins = validProperties.map(p => ({ lat: p.lat, lng: p.lng }));
      const destinations = [{ lat: workplace.lat, lng: workplace.lng }];

      // Check cache first
      const results = [];
      const uncachedProperties = [];
      const uncachedOrigins = [];

      for (let i = 0; i < validProperties.length; i++) {
        const property = validProperties[i];
        const cacheKey = `commute:${property.id}:${workplace.lat},${workplace.lng}:${mode}`;
        const cached = cache.get(cacheKey);

        if (cached) {
          results.push({ propertyId: property.id, ...cached });
        } else {
          uncachedProperties.push(property);
          uncachedOrigins.push(origins[i]);
        }
      }

      // Fetch uncached commutes from Google Maps API
      if (uncachedOrigins.length > 0) {
        const response = await client.distancematrix({
          params: {
            origins: uncachedOrigins,
            destinations: destinations,
            mode: mode, // 'driving' | 'walking' | 'bicycling' | 'transit'
            key: process.env.GOOGLE_MAPS_API_KEY
          }
        });

        // Process results
        response.data.rows.forEach((row, index) => {
          const element = row.elements[0];
          const property = uncachedProperties[index];

          if (element.status === 'OK') {
            const commuteData = {
              propertyId: property.id,
              duration: element.duration.value, // seconds
              durationText: element.duration.text,
              distance: element.distance.value, // meters
              distanceText: element.distance.text,
              mode: mode
            };

            // Cache the result
            const cacheKey = `commute:${property.id}:${workplace.lat},${workplace.lng}:${mode}`;
            cache.set(cacheKey, commuteData);

            results.push(commuteData);
          } else {
            results.push({
              propertyId: property.id,
              error: 'Commute unavailable',
              status: element.status
            });
          }
        });
      }

      return results;
    } catch (error) {
      console.error('Error calculating commutes:', error);
      throw error;
    }
  },

  /**
   * Calculate commutes for properties within bounds
   */
  async calculateCommutesForBounds(workplace, bounds, mode = 'transit') {
    try {
      // Get properties in bounds
      const properties = await db.getPropertiesInBounds(bounds);

      if (properties.length === 0) {
        return [];
      }

      // Calculate commutes for all properties
      const propertyIds = properties.map(p => p.id);
      const commutes = await this.batchCalculateCommutes(propertyIds, workplace, mode);

      // Merge property data with commute data
      const results = properties.map(property => {
        const commute = commutes.find(c => c.propertyId === property.id);
        return {
          ...property,
          commute: commute || null
        };
      });

      return results;
    } catch (error) {
      console.error('Error calculating commutes for bounds:', error);
      throw error;
    }
  },

  /**
   * Geocode an address to lat/lng coordinates
   */
  async geocodeAddress(address) {
    try {
      const cacheKey = `geocode:${address}`;
      const cached = cache.get(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await client.geocode({
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const result = {
        lat: response.data.results[0].geometry.location.lat,
        lng: response.data.results[0].geometry.location.lng,
        formattedAddress: response.data.results[0].formatted_address
      };

      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }
};
