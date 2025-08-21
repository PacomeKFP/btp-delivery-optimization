// Service de routage utilisant OSRM pour les routes réelles
export class RoutingService {
  constructor() {
    this.osrmBaseUrl = 'https://router.project-osrm.org/route/v1/driving';
    this.cache = new Map(); // Cache des routes pour éviter les appels répétés
  }

  // Générer une clé de cache pour une route
  generateCacheKey(start, end) {
    return `${start[0].toFixed(4)},${start[1].toFixed(4)}-${end[0].toFixed(4)},${end[1].toFixed(4)}`;
  }

  // Obtenir une route réelle entre deux points
  async getRealRoute(startCoord, endCoord) {
    const cacheKey = this.generateCacheKey(startCoord, endCoord);
    
    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const start = `${startCoord[1]},${startCoord[0]}`; // lng,lat pour OSRM
      const end = `${endCoord[1]},${endCoord[0]}`;
      
      const response = await fetch(
        `${this.osrmBaseUrl}/${start};${end}?overview=full&geometries=geojson&steps=true&annotations=true`
      );

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const routeData = {
        geometry: route.geometry, // GeoJSON LineString
        distance: Math.round(route.distance / 1000 * 100) / 100, // km avec 2 décimales
        duration: Math.round(route.duration / 60), // minutes
        steps: route.legs[0].steps.map(step => ({
          instruction: step.maneuver.type,
          name: step.name || 'Route sans nom',
          distance: Math.round(step.distance / 1000 * 100) / 100,
          duration: Math.round(step.duration / 60)
        })),
        coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]) // Conversion lng,lat -> lat,lng pour Leaflet
      };

      // Mettre en cache
      this.cache.set(cacheKey, routeData);
      
      return routeData;
    } catch (error) {
      console.warn('Erreur OSRM, fallback vers distance euclidienne:', error.message);
      
      // Fallback vers calcul euclidien
      const distance = this.calculateEuclideanDistance(startCoord, endCoord);
      const fallbackRoute = {
        geometry: {
          type: 'LineString',
          coordinates: [[startCoord[1], startCoord[0]], [endCoord[1], endCoord[0]]]
        },
        distance: distance,
        duration: Math.round(distance / 45 * 60), // Estimation à 45km/h
        steps: [{
          instruction: 'straight',
          name: 'Route directe (estimation)',
          distance: distance,
          duration: Math.round(distance / 45 * 60)
        }],
        coordinates: [startCoord, endCoord],
        isFallback: true
      };

      this.cache.set(cacheKey, fallbackRoute);
      return fallbackRoute;
    }
  }

  // Calcul de distance euclidienne (fallback)
  calculateEuclideanDistance(coord1, coord2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 100) / 100;
  }

  // Obtenir plusieurs routes en parallèle
  async getMultipleRoutes(routes) {
    const promises = routes.map(({ start, end, id }) => 
      this.getRealRoute(start, end).then(route => ({ ...route, id }))
    );
    
    try {
      const results = await Promise.allSettled(promises);
      return results.map((result, index) => ({
        id: routes[index].id,
        route: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    } catch (error) {
      console.error('Erreur lors du calcul des routes multiples:', error);
      return routes.map(route => ({ id: route.id, route: null, error }));
    }
  }

  // Nettoyer le cache si nécessaire
  clearCache() {
    this.cache.clear();
  }

  // Statistiques du cache
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instance singleton
export const routingService = new RoutingService();