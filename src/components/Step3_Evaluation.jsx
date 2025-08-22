import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Star, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AHPCalculator } from '../utils/ahpCalculator';
import { suppliersData } from '../data/suppliers';

const Step3_Evaluation = ({ onNext, onPrevious, initialData = {} }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationComplete, setCalculationComplete] = useState(false);

  const ahpCalculator = new AHPCalculator();

  const startEvaluation = async () => {
    setIsCalculating(true);
    
    // Simulate calculation time for better UX
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userPriority = initialData.priority || 'balanced';
    const result = ahpCalculator.calculateSupplierScores(userPriority);
    setEvaluation(result);
    setIsCalculating(false);
    setCalculationComplete(true);
  };

  const getSupplierData = (supplierId) => {
    return suppliersData.find(s => s.id === supplierId);
  };

  const prepareCriteriaChartData = () => {
    if (!evaluation) return [];
    
    return Object.entries(evaluation.adjustedWeights).map(([criterionId, weight]) => ({
      name: ahpCalculator.criteria.find(c => c.id === criterionId)?.name || criterionId,
      weight: weight * 100,
      fill: '#3B82F6'
    }));
  };

  const handleNext = () => {
    if (evaluation) {
      onNext({ evaluation, supplierRanking: evaluation.ranking });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
      <div className="text-center mb-8">
        <TrendingUp className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Évaluation de la fiabilité des fournisseurs
        </h2>
        <p className="text-gray-600">
          Analyse multicritère selon la méthode AHP (Analytic Hierarchy Process)
        </p>
      </div>

      {!calculationComplete ? (
        <div className="text-center py-12">
          {!isCalculating ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3">Critères d'évaluation :</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-700 text-sm">
                  <div>• Qualité des matériaux</div>
                  <div>• Délai de livraison</div>
                  <div>• Coût total</div>
                  <div>• Organisation interne</div>
                  <div>• Flexibilité</div>
                  <div>• Réputation</div>
                  <div>• Collaboration</div>
                </div>
              </div>
              
              <button
                onClick={startEvaluation}
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium text-lg"
              >
                <BarChart3 className="w-5 h-5 inline-block mr-2" />
                Lancer l'Évaluation AHP
              </button>
            </>
          ) : (
            <div className="py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Évaluation en cours...</h3>
              <p className="text-gray-500">Calcul des scores multicritères</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Weights Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Pondération des Critères
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareCriteriaChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Poids']} />
                  <Bar dataKey="weight" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supplier Rankings */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Classement des Fournisseurs
            </h3>
            <div className="space-y-4">
              {evaluation.ranking.map((supplierId, index) => {
                const supplier = getSupplierData(supplierId);
                const score = evaluation.scores[supplierId];
                const strengths = ahpCalculator.getSupplierStrengthsWeaknesses(supplierId, evaluation);

                return (
                  <div 
                    key={supplierId}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      index === 0 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : index === 1 
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-orange-300 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{supplier.name}</h4>
                          <p className="text-sm text-gray-600">{supplier.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          {(score.totalScore * 100).toFixed(1)}%
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 mr-1" />
                          Score global
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">Points forts:</h5>
                        <ul className="text-green-600 space-y-1">
                          {strengths.strengths.map((strength, i) => (
                            <li key={i}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          ← Précédent
        </button>
        
        {calculationComplete && (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium"
          >
            Suivant →
          </button>
        )}
      </div>
    </div>
  );
};

export default Step3_Evaluation;