// Optimiseur d'approvisionnement combinatoire
export class SupplyOptimizer {
  constructor() {
    this.solutions = [];
  }

  // Optimisation combinatoire pour sélectionner les fournisseurs optimaux
  optimize(demand, suppliers, evaluation, timeEstimations, priority = 'balanced') {
    // Nettoyer les solutions précédentes
    this.solutions = [];
    
    // Calculer tous les scores composites
    const scoredSuppliers = this.calculateCompositeScores(
      suppliers, 
      evaluation, 
      timeEstimations, 
      priority
    );
    
    // Filtrer les fournisseurs qui ont du stock suffisant
    const availableSuppliers = scoredSuppliers.filter(s => s.stock > 0);
    
    // Générer toutes les combinaisons possibles
    const combinations = this.generateCombinations(availableSuppliers, demand);
    
    // Évaluer chaque combinaison
    const evaluatedCombinations = combinations.map(combo => 
      this.evaluateCombination(combo, demand, priority)
    );
    
    // Trier par score global
    const sortedSolutions = evaluatedCombinations
      .filter(solution => solution.totalQuantity >= demand * 0.95) // Au moins 95% de la demande
      .sort((a, b) => b.globalScore - a.globalScore);
    
    this.solutions = sortedSolutions.slice(0, 5); // Top 5 solutions
    
    return {
      optimalSolution: this.solutions[0],
      alternatives: this.solutions.slice(1),
      allSolutions: this.solutions,
      demandSatisfied: this.solutions[0]?.totalQuantity || 0,
      satisfactionRate: ((this.solutions[0]?.totalQuantity || 0) / demand) * 100
    };
  }

  // Calculer les scores composites (qualité + temps + coût)
  calculateCompositeScores(suppliers, evaluation, timeEstimations, priority) {
    return suppliers.map(supplier => {
      const ahpScore = evaluation.scores[supplier.id]?.totalScore || 0;
      const timeData = timeEstimations[supplier.id];
      
      // Normaliser le temps (plus le temps est court, meilleur c'est)
      const maxTime = Math.max(...Object.values(timeEstimations).map(t => t.averageTime));
      const timeScore = 1 - (timeData.averageTime / maxTime);
      
      // Normaliser le coût (plus le coût est bas, meilleur c'est)
      const maxCost = Math.max(...suppliers.map(s => s.costPerM3));
      const costScore = 1 - (supplier.costPerM3 / maxCost);
      
      // Calculer le score composite selon la priorité
      let compositeScore = 0;
      switch (priority) {
        case 'quality':
          compositeScore = ahpScore * 0.6 + timeScore * 0.25 + costScore * 0.15;
          break;
        case 'time':
          compositeScore = timeScore * 0.6 + ahpScore * 0.25 + costScore * 0.15;
          break;
        case 'cost':
          compositeScore = costScore * 0.6 + ahpScore * 0.25 + timeScore * 0.15;
          break;
        default: // balanced
          compositeScore = ahpScore * 0.4 + timeScore * 0.35 + costScore * 0.25;
      }

      return {
        ...supplier,
        ahpScore,
        timeScore,
        costScore,
        compositeScore,
        timeData
      };
    });
  }

  // Générer les combinaisons possibles de fournisseurs
  generateCombinations(suppliers, targetDemand) {
    const combinations = [];
    const maxSuppliers = Math.min(suppliers.length, 3); // Limiter à 3 fournisseurs max
    
    // Solutions à un seul fournisseur
    suppliers.forEach(supplier => {
      const maxQuantity = Math.min(supplier.stock, targetDemand);
      if (maxQuantity > 0) {
        combinations.push([{
          ...supplier,
          allocatedQuantity: maxQuantity
        }]);
      }
    });
    
    // Solutions à deux fournisseurs
    for (let i = 0; i < suppliers.length; i++) {
      for (let j = i + 1; j < suppliers.length; j++) {
        const s1 = suppliers[i];
        const s2 = suppliers[j];
        
        // Différentes répartitions possibles
        const allocations = this.calculateOptimalAllocation([s1, s2], targetDemand);
        if (allocations.length > 0) {
          combinations.push(allocations);
        }
      }
    }
    
    // Solutions à trois fournisseurs (seulement les meilleures combinaisons)
    const topSuppliers = suppliers
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 4);
    
    for (let i = 0; i < topSuppliers.length - 2; i++) {
      for (let j = i + 1; j < topSuppliers.length - 1; j++) {
        for (let k = j + 1; k < topSuppliers.length; k++) {
          const s1 = topSuppliers[i];
          const s2 = topSuppliers[j];
          const s3 = topSuppliers[k];
          
          const allocations = this.calculateOptimalAllocation([s1, s2, s3], targetDemand);
          if (allocations.length > 0) {
            combinations.push(allocations);
          }
        }
      }
    }
    
    return combinations;
  }

  // Calculer l'allocation optimale pour un groupe de fournisseurs
  calculateOptimalAllocation(suppliers, targetDemand) {
    const totalStock = suppliers.reduce((sum, s) => sum + s.stock, 0);
    
    if (totalStock < targetDemand * 0.8) {
      return []; // Pas assez de stock total
    }
    
    // Allocation proportionnelle basée sur le score composite et le stock
    let remainingDemand = targetDemand;
    const allocations = [];
    
    // Trier par score composite décroissant
    const sortedSuppliers = [...suppliers].sort((a, b) => b.compositeScore - a.compositeScore);
    
    for (let i = 0; i < sortedSuppliers.length && remainingDemand > 0; i++) {
      const supplier = sortedSuppliers[i];
      const maxAllocation = Math.min(supplier.stock, remainingDemand);
      
      let allocation;
      if (i === sortedSuppliers.length - 1) {
        // Dernier fournisseur, allouer tout le reste
        allocation = Math.min(maxAllocation, remainingDemand);
      } else {
        // Allouer en fonction du score et de la proportion restante
        const scoreWeight = supplier.compositeScore / 
          sortedSuppliers.slice(i).reduce((sum, s) => sum + s.compositeScore, 0);
        allocation = Math.min(maxAllocation, remainingDemand * scoreWeight * 1.5);
        allocation = Math.max(allocation, targetDemand * 0.1); // Minimum 10% de la demande
      }
      
      if (allocation > 0) {
        allocations.push({
          ...supplier,
          allocatedQuantity: Math.round(allocation)
        });
        remainingDemand -= allocation;
      }
    }
    
    return allocations;
  }

  // Évaluer une combinaison de fournisseurs
  evaluateCombination(combination, targetDemand, priority) {
    const totalQuantity = combination.reduce((sum, s) => sum + s.allocatedQuantity, 0);
    const totalCost = combination.reduce((sum, s) => sum + (s.allocatedQuantity * s.costPerM3), 0);
    const avgAhpScore = combination.reduce((sum, s) => sum + (s.ahpScore * s.allocatedQuantity), 0) / totalQuantity;
    const maxDeliveryTime = Math.max(...combination.map(s => s.timeData.averageTime));
    const avgDeliveryTime = combination.reduce((sum, s) => sum + (s.timeData.averageTime * s.allocatedQuantity), 0) / totalQuantity;
    
    // Calculer le score global selon la priorité
    const satisfactionRate = totalQuantity / targetDemand;
    const timeScore = 1 / (1 + maxDeliveryTime / 60); // Normaliser le temps
    const qualityScore = avgAhpScore;
    const costScore = 1 / (1 + totalCost / 1000000); // Normaliser le coût
    
    let globalScore;
    switch (priority) {
      case 'quality':
        globalScore = qualityScore * 0.5 + satisfactionRate * 0.3 + timeScore * 0.2;
        break;
      case 'time':
        globalScore = timeScore * 0.5 + satisfactionRate * 0.3 + qualityScore * 0.2;
        break;
      case 'cost':
        globalScore = costScore * 0.5 + satisfactionRate * 0.3 + qualityScore * 0.2;
        break;
      default: // balanced
        globalScore = (qualityScore + timeScore + costScore) * 0.3 + satisfactionRate * 0.1;
    }
    
    // Calculer les livraisons nécessaires avec logique toupies 10m³ et 8m³
    const deliveries = combination.map(supplier => {
      const quantity = supplier.allocatedQuantity;
      
      // Calcul optimisé: priorité aux camions 10m³, complément avec 8m³
      const trucks10 = Math.floor(quantity / 10);
      const remaining = quantity - (trucks10 * 10);
      const trucks8 = remaining > 0 ? Math.ceil(remaining / 8) : 0;
      
      const numDeliveries = trucks10 + trucks8;
      
      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        quantity: supplier.allocatedQuantity,
        numDeliveries,
        trucks10Count: trucks10,
        trucks8Count: trucks8,
        deliveryTime: supplier.timeData.averageTime,
        optimalDeparture: supplier.timeData.optimalDeparture
      };
    });
    
    return {
      combination,
      totalQuantity,
      totalCost,
      avgAhpScore,
      maxDeliveryTime,
      avgDeliveryTime,
      globalScore,
      satisfactionRate: satisfactionRate * 100,
      costPerM3: totalCost / totalQuantity,
      deliveries,
      riskLevel: this.calculateRiskLevel(combination),
      recommendations: this.generateRecommendations(combination, targetDemand)
    };
  }

  // Calculer le niveau de risque
  calculateRiskLevel(combination) {
    if (combination.length === 1) {
      return 'Élevé'; // Dépendance à un seul fournisseur
    } else if (combination.length === 2) {
      return 'Modéré';
    } else {
      return 'Faible'; // Diversification
    }
  }

  // Générer des recommandations
  generateRecommendations(combination, targetDemand) {
    const recommendations = [];
    const totalStock = combination.reduce((sum, s) => sum + s.stock, 0);
    
    if (combination.length === 1) {
      recommendations.push("Considérer un fournisseur de secours pour réduire les risques");
    }
    
    if (totalStock < targetDemand * 1.2) {
      recommendations.push("Stock limite - prévoir une commande anticipée");
    }
    
    const maxTime = Math.max(...combination.map(s => s.timeData.averageTime));
    if (maxTime > 120) { // Plus de 2h
      recommendations.push("Temps de livraison important - planifier en conséquence");
    }
    
    const totalDeliveries = combination.reduce((sum, s) => {
      const trucks10 = Math.floor(s.allocatedQuantity / 10);
      const remaining = s.allocatedQuantity - (trucks10 * 10);
      const trucks8 = remaining > 0 ? Math.ceil(remaining / 8) : 0;
      return sum + trucks10 + trucks8;
    }, 0);
    
    if (totalDeliveries > 10) {
      recommendations.push(`${totalDeliveries} livraisons nécessaires - coordonner la logistique`);
    }
    
    return recommendations;
  }

  // Obtenir un résumé des résultats
  getSolutionSummary(solution) {
    if (!solution) return null;
    
    return {
      suppliers: solution.combination.length,
      totalQuantity: solution.totalQuantity,
      totalCost: solution.totalCost,
      avgDeliveryTime: solution.avgDeliveryTime,
      satisfactionRate: solution.satisfactionRate,
      riskLevel: solution.riskLevel,
      score: solution.globalScore
    };
  }
}