// Calculateur AHP pour l'évaluation des fournisseurs
import { ahpScores } from '../data/suppliers';

export class AHPCalculator {
  constructor(criteria = ahpScores.criteria, scores = ahpScores.scores) {
    this.criteria = criteria;
    this.scores = scores;
  }

  // Ajuster les poids selon les priorités de l'utilisateur
  adjustWeights(userPriority) {
    const baseWeights = { ...this.criteria.reduce((acc, c) => ({ ...acc, [c.id]: c.weight }), {}) };
    
    switch (userPriority) {
      case 'quality':
        baseWeights.quality *= 1.5;
        baseWeights.reputation *= 1.3;
        baseWeights.delivery *= 0.8;
        baseWeights.cost *= 0.7;
        break;
        
      case 'time':
        baseWeights.delivery *= 1.8;
        baseWeights.flexibility *= 1.4;
        baseWeights.organization *= 1.2;
        baseWeights.quality *= 0.8;
        baseWeights.cost *= 0.8;
        break;
        
      case 'cost':
        baseWeights.cost *= 1.6;
        baseWeights.delivery *= 0.9;
        baseWeights.quality *= 0.9;
        baseWeights.reputation *= 0.8;
        break;
        
      default:
        // Pas de changement pour 'balanced'
        break;
    }

    // Normaliser les poids pour qu'ils totalisent 1
    const total = Object.values(baseWeights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(baseWeights).forEach(key => {
      baseWeights[key] /= total;
    });

    return baseWeights;
  }

  // Calculer le score global de chaque fournisseur
  calculateSupplierScores(userPriority = 'balanced') {
    const adjustedWeights = this.adjustWeights(userPriority);
    const supplierScores = {};

    Object.keys(this.scores).forEach(supplierId => {
      let totalScore = 0;
      const criteriaScores = {};

      this.criteria.forEach(criterion => {
        const criterionScore = this.scores[supplierId][criterion.id] || 0;
        const weightedScore = criterionScore * adjustedWeights[criterion.id];
        criteriaScores[criterion.id] = {
          score: criterionScore,
          weight: adjustedWeights[criterion.id],
          weightedScore: weightedScore
        };
        totalScore += weightedScore;
      });

      supplierScores[supplierId] = {
        totalScore,
        criteriaScores,
        rank: 0 // Will be calculated after all scores
      };
    });

    // Calculer les rangs
    const sortedSuppliers = Object.entries(supplierScores)
      .sort(([,a], [,b]) => b.totalScore - a.totalScore);

    sortedSuppliers.forEach(([supplierId], index) => {
      supplierScores[supplierId].rank = index + 1;
    });

    return {
      scores: supplierScores,
      ranking: sortedSuppliers.map(([id]) => id),
      adjustedWeights
    };
  }

  // Obtenir une explication textuelle des résultats
  getScoreExplanation(supplierId, evaluation) {
    const score = evaluation.scores[supplierId];
    const rank = score.rank;
    const total = score.totalScore;
    
    let explanation = `Score global: ${(total * 100).toFixed(1)}% (Rang ${rank})\n\n`;
    
    explanation += "Détail par critère:\n";
    this.criteria.forEach(criterion => {
      const criterionData = score.criteriaScores[criterion.id];
      explanation += `• ${criterion.name}: ${(criterionData.score * 100).toFixed(1)}% ` +
        `(poids: ${(criterionData.weight * 100).toFixed(1)}%) ` +
        `→ ${(criterionData.weightedScore * 100).toFixed(1)}%\n`;
    });

    return explanation;
  }

  // Identifier les forces et faiblesses d'un fournisseur
  getSupplierStrengthsWeaknesses(supplierId, evaluation) {
    const score = evaluation.scores[supplierId];
    const criteriaData = Object.entries(score.criteriaScores)
      .map(([criterionId, data]) => ({
        ...data,
        name: this.criteria.find(c => c.id === criterionId)?.name || criterionId,
        id: criterionId
      }))
      .sort((a, b) => b.weightedScore - a.weightedScore);

    const strengths = criteriaData.slice(0, 3).map(c => c.name);
    const weaknesses = criteriaData.slice(-3).reverse().map(c => c.name);

    return { strengths, weaknesses };
  }
}