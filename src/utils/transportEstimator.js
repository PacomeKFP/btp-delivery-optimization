// Estimateur de temps de transport basé sur les chaînes de Markov
export class TransportEstimator {
  constructor() {
    // États de trafic: Fluide, Dense, Embouteillé
    // États météo: Sec, Pluvieux
    this.states = {
      'FS': { traffic: 'Fluide', weather: 'Sec', speed: 45 }, // km/h
      'DS': { traffic: 'Dense', weather: 'Sec', speed: 30 },
      'ES': { traffic: 'Embouteillé', weather: 'Sec', speed: 15 },
      'FP': { traffic: 'Fluide', weather: 'Pluvieux', speed: 35 },
      'DP': { traffic: 'Dense', weather: 'Pluvieux', speed: 20 },
      'EP': { traffic: 'Embouteillé', weather: 'Pluvieux', speed: 10 }
    };

    // Matrices de transition pour différentes conditions
    this.transitionMatrices = {
      // Zone urbaine, saison sèche, heure de pointe
      'urban_dry_peak': [
        [0.7, 0.25, 0.05, 0.0, 0.0, 0.0], // FS -> [FS, DS, ES, FP, DP, EP]
        [0.3, 0.5, 0.2, 0.0, 0.0, 0.0],   // DS -> ...
        [0.1, 0.3, 0.6, 0.0, 0.0, 0.0],   // ES -> ...
        [0.0, 0.0, 0.0, 0.8, 0.15, 0.05], // FP -> ...
        [0.0, 0.0, 0.0, 0.2, 0.6, 0.2],   // DP -> ...
        [0.0, 0.0, 0.0, 0.05, 0.25, 0.7]  // EP -> ...
      ],
      // Zone urbaine, saison sèche, heure creuse
      'urban_dry_offpeak': [
        [0.85, 0.15, 0.0, 0.0, 0.0, 0.0],
        [0.4, 0.55, 0.05, 0.0, 0.0, 0.0],
        [0.2, 0.4, 0.4, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.9, 0.1, 0.0],
        [0.0, 0.0, 0.0, 0.3, 0.6, 0.1],
        [0.0, 0.0, 0.0, 0.1, 0.3, 0.6]
      ],
      // Rase campagne
      'rural': [
        [0.9, 0.1, 0.0, 0.0, 0.0, 0.0],
        [0.5, 0.45, 0.05, 0.0, 0.0, 0.0],
        [0.3, 0.5, 0.2, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.85, 0.15, 0.0],
        [0.0, 0.0, 0.0, 0.4, 0.55, 0.05],
        [0.0, 0.0, 0.0, 0.2, 0.4, 0.4]
      ]
    };

    // Probabilités météorologiques par saison
    this.weatherProbs = {
      dry: { rain: 0.1, dry: 0.9 },
      rainy: { rain: 0.7, dry: 0.3 }
    };
  }

  // Calculer la distance euclidienne approximative
  calculateDistance(coord1, coord2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Déterminer le type de zone (urbain/rural)
  determineZoneType(coord) {
    // Zone urbaine approximative de Yaoundé
    const yaundeCenter = [3.848, 11.502];
    const urbanRadius = 25; // km
    
    const distanceToCenter = this.calculateDistance(coord, yaundeCenter);
    return distanceToCenter <= urbanRadius ? 'urban' : 'rural';
  }

  // Déterminer la période (pointe/creuse)
  determinePeriod(hour) {
    return (hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 21) ? 'peak' : 'offpeak';
  }

  // Obtenir la matrice de transition appropriée
  getTransitionMatrix(supplierCoord, constructionCoord, hour, season) {
    const supplierZone = this.determineZoneType(supplierCoord);
    const constructionZone = this.determineZoneType(constructionCoord);
    
    // Si l'un des deux points est en zone rurale, considérer comme rural
    if (supplierZone === 'rural' || constructionZone === 'rural') {
      return this.transitionMatrices.rural;
    }

    // Zone urbaine
    const period = this.determinePeriod(hour);
    return this.transitionMatrices[`urban_${season}_${period}`];
  }

  // Simulation Monte Carlo pour estimer le temps de trajet
  simulateTransportTime(supplierCoord, constructionCoord, hour = 8, season = 'dry', numSimulations = 100) {
    const distance = this.calculateDistance(supplierCoord, constructionCoord);
    const transitionMatrix = this.getTransitionMatrix(supplierCoord, constructionCoord, hour, season);
    
    const results = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      let totalTime = 0;
      let remainingDistance = distance;
      
      // État initial (probabiliste basé sur la météo et l'heure)
      let currentState = this.getInitialState(hour, season);
      
      // Simulation par segments de route
      const segmentLength = 5; // km par segment
      
      while (remainingDistance > 0) {
        const segmentDist = Math.min(segmentLength, remainingDistance);
        const speed = this.states[currentState].speed;
        
        // Temps pour ce segment
        const segmentTime = (segmentDist / speed) * 60; // minutes
        totalTime += segmentTime;
        
        // Transition vers le prochain état
        currentState = this.getNextState(currentState, transitionMatrix);
        remainingDistance -= segmentDist;
      }
      
      results.push(totalTime);
    }

    // Statistiques
    const avgTime = results.reduce((sum, time) => sum + time, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    const stdDev = Math.sqrt(
      results.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / results.length
    );

    return {
      averageTime: Math.round(avgTime),
      minTime: Math.round(minTime),
      maxTime: Math.round(maxTime),
      standardDeviation: Math.round(stdDev),
      confidence95: {
        min: Math.round(avgTime - 1.96 * stdDev),
        max: Math.round(avgTime + 1.96 * stdDev)
      },
      distance: Math.round(distance * 100) / 100,
      simulations: numSimulations
    };
  }

  // État initial basé sur l'heure et la saison
  getInitialState(hour, season) {
    const weatherProb = this.weatherProbs[season];
    const isRaining = Math.random() < weatherProb.rain;
    
    if (this.determinePeriod(hour) === 'peak') {
      // Heure de pointe - plus de congestion
      const rand = Math.random();
      if (isRaining) {
        return rand < 0.3 ? 'FP' : rand < 0.8 ? 'DP' : 'EP';
      } else {
        return rand < 0.4 ? 'FS' : rand < 0.8 ? 'DS' : 'ES';
      }
    } else {
      // Heure creuse - moins de congestion
      const rand = Math.random();
      if (isRaining) {
        return rand < 0.6 ? 'FP' : rand < 0.9 ? 'DP' : 'EP';
      } else {
        return rand < 0.8 ? 'FS' : rand < 0.95 ? 'DS' : 'ES';
      }
    }
  }

  // Transition vers le prochain état
  getNextState(currentState, transitionMatrix) {
    const stateIndex = Object.keys(this.states).indexOf(currentState);
    const probabilities = transitionMatrix[stateIndex];
    
    const rand = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (rand < cumulative) {
        return Object.keys(this.states)[i];
      }
    }
    
    return currentState; // Fallback
  }

  // Estimer les fenêtres de livraison optimales
  findOptimalDeliveryWindow(supplierCoord, constructionCoord, deliveryDate, season = 'dry', targetArrivalTime = null) {
    const windows = [];
    
    // Tester différentes heures de départ
    for (let hour = 6; hour <= 18; hour++) {
      const estimation = this.simulateTransportTime(
        supplierCoord, 
        constructionCoord, 
        hour, 
        season, 
        50 // Moins de simulations pour plus de rapidité
      );
      
      const arrivalHour = hour + Math.ceil(estimation.averageTime / 60);
      
      windows.push({
        departureHour: hour,
        arrivalHour: arrivalHour,
        ...estimation
      });
    }
    
    // Si une heure d'arrivée cible est spécifiée, trouver l'heure de départ optimale
    let optimal = windows[0];
    if (targetArrivalTime) {
      const targetHour = parseInt(targetArrivalTime.split(':')[0]);
      const targetMinute = parseInt(targetArrivalTime.split(':')[1]);
      const targetDecimal = targetHour + targetMinute / 60;
      
      // Trouver le créneau qui arrive le plus proche de l'heure cible
      let minDifference = Infinity;
      for (const window of windows) {
        const arrivalDecimal = window.arrivalHour;
        const difference = Math.abs(arrivalDecimal - targetDecimal);
        
        if (difference < minDifference) {
          minDifference = difference;
          optimal = window;
        }
      }
    } else {
      // Trier par temps moyen si pas d'heure cible
      windows.sort((a, b) => a.averageTime - b.averageTime);
      optimal = windows[0];
    }
    
    return {
      optimal: optimal,
      allWindows: windows,
      recommendations: this.generateRecommendations(windows, targetArrivalTime)
    };
  }

  // Générer des recommandations
  generateRecommendations(windows, targetArrivalTime = null) {
    const best = windows[0];
    const worst = windows[windows.length - 1];
    
    const recommendations = [];
    
    if (targetArrivalTime) {
      recommendations.push(`Heure de départ calculée pour arriver vers ${targetArrivalTime}`);
    }
    
    if (best.departureHour <= 7) {
      recommendations.push("Départ tôt le matin recommandé pour éviter les embouteillages");
    }
    
    if (best.departureHour >= 10 && best.departureHour <= 14) {
      recommendations.push("Créneau en milieu de journée optimal");
    }
    
    const timeSaved = worst.averageTime - best.averageTime;
    if (timeSaved > 30) {
      recommendations.push(`Choix de l'horaire optimal peut économiser jusqu'à ${Math.round(timeSaved)} minutes`);
    }
    
    return recommendations;
  }
}