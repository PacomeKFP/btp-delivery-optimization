import React, { useState, useEffect } from 'react';
import { Target, Zap, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { SupplyOptimizer } from '../utils/supplyOptimizer';

const Step5_Optimization = ({ onNext, onPrevious, initialData = {} }) => {
  const [optimization, setOptimization] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(0);

  const supplyOptimizer = new SupplyOptimizer();

  const startOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulation du temps de calcul
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result = supplyOptimizer.optimize(
      parseFloat(initialData.demand),
      initialData.suppliers,
      initialData.evaluation,
      initialData.timeEstimations,
      initialData.priority
    );
    
    setOptimization(result);
    setIsOptimizing(false);
    setOptimizationComplete(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Faible': return 'text-green-600 bg-green-50';
      case 'Modéré': return 'text-yellow-600 bg-yellow-50';
      case 'Élevé': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const preparePieData = (solution) => {
    return solution.combination.map(supplier => ({
      name: supplier.name,
      value: supplier.allocatedQuantity,
      fill: supplier.color
    }));
  };

  const prepareDeliveryData = (solution) => {
    return solution.deliveries.map(delivery => ({
      name: delivery.supplierName,
      livraisons: delivery.numDeliveries,
      temps: delivery.deliveryTime,
      fill: solution.combination.find(s => s.id === delivery.supplierId)?.color || '#3B82F6'
    }));
  };

  const handleNext = () => {
    if (optimization && optimization.optimalSolution) {
      onNext({ 
        optimization,
        selectedSolution: optimization.allSolutions[selectedSolution]
      });
    }
  };

  const currentSolution = optimization?.allSolutions[selectedSolution];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
      <div className="text-center mb-8">
        <Target className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Optimisation Combinatoire
        </h2>
        <p className="text-gray-600">
          Sélection optimale des fournisseurs pour satisfaire votre demande
        </p>
      </div>

      {!optimizationComplete ? (
        <div className="text-center py-12">
          {!isOptimizing ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3">Objectifs d'optimisation :</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-700 text-sm">
                  <div>• Maximiser la satisfaction de la demande</div>
                  <div>• Minimiser le temps de livraison</div>
                  <div>• Optimiser le rapport qualité-prix</div>
                  <div>• Équilibrer les risques</div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <div className="text-blue-800 font-medium">Demande : {initialData.demand} m³</div>
                  <div className="text-blue-700 text-sm">Priorité : {
                    initialData.priority === 'quality' ? 'Qualité' :
                    initialData.priority === 'time' ? 'Délai' :
                    initialData.priority === 'cost' ? 'Coût' : 'Équilibrée'
                  }</div>
                </div>
              </div>
              
              <button
                onClick={startOptimization}
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium text-lg"
              >
                <Zap className="w-5 h-5 inline-block mr-2" />
                Lancer l'Optimisation
              </button>
            </>
          ) : (
            <div className="py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Optimisation en cours...</h3>
              <p className="text-gray-500">Analyse des combinaisons optimales</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {optimization.satisfactionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-green-600">Demande satisfaite</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Target className="w-8 h-8 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {optimization.demandSatisfied} m³
              </div>
              <div className="text-sm text-blue-600">Quantité totale</div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {optimization.allSolutions.length}
              </div>
              <div className="text-sm text-purple-600">Solutions analysées</div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-700">
                {currentSolution?.riskLevel || 'N/A'}
              </div>
              <div className="text-sm text-orange-600">Niveau de risque</div>
            </div>
          </div>

          {/* Solution Selector */}
          {optimization.allSolutions.length > 1 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Solutions alternatives</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {optimization.allSolutions.slice(0, 3).map((solution, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSolution(index)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selectedSolution === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">
                        Solution {index + 1} {index === 0 && '(Optimale)'}
                      </h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(solution.riskLevel)}`}>
                        {solution.riskLevel}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{solution.combination.length} fournisseur(s)</div>
                      <div>{solution.totalQuantity} m³ ({solution.satisfactionRate.toFixed(1)}%)</div>
                      <div>{formatTime(solution.maxDeliveryTime)} max</div>
                      <div>{formatCurrency(Math.round(solution.costPerM3))}/m³</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Solution Details */}
          {currentSolution && (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  Solution {selectedSolution + 1} - Détails
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {(currentSolution.globalScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Score global</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Allocation Chart */}
                <div>
                  <h4 className="font-semibold mb-4">Répartition des quantités</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={preparePieData(currentSolution)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {preparePieData(currentSolution).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} m³`, 'Quantité']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Delivery Chart */}
                <div>
                  <h4 className="font-semibold mb-4">Nombre de livraisons</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareDeliveryData(currentSolution)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="livraisons" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Suppliers Details */}
              <div className="mt-8">
                <h4 className="font-semibold mb-4">Détail par fournisseur</h4>
                <div className="space-y-4">
                  {currentSolution.combination.map((supplier, index) => {
                    const delivery = currentSolution.deliveries.find(d => d.supplierId === supplier.id);
                    return (
                      <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: supplier.color }}
                            />
                            <div>
                              <h5 className="font-semibold">{supplier.name}</h5>
                              <p className="text-sm text-gray-600">{supplier.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{supplier.allocatedQuantity} m³</div>
                            <div className="text-sm text-gray-600">
                              {((supplier.allocatedQuantity / currentSolution.totalQuantity) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Livraisons</div>
                            <div className="font-medium">{delivery?.numDeliveries || 0}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Temps transport</div>
                            <div className="font-medium">{formatTime(supplier.timeData.averageTime)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Coût total</div>
                            <div className="font-medium">{formatCurrency(supplier.allocatedQuantity * supplier.costPerM3)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Départ optimal</div>
                            <div className="font-medium">{delivery?.optimalDeparture.departureHour}h</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Coût total</div>
                  <div className="text-xl font-bold">{formatCurrency(currentSolution.totalCost)}</div>
                  <div className="text-sm text-gray-500">{formatCurrency(Math.round(currentSolution.costPerM3))}/m³</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Temps max</div>
                  <div className="text-xl font-bold">{formatTime(currentSolution.maxDeliveryTime)}</div>
                  <div className="text-sm text-gray-500">Livraison la plus lente</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Qualité moyenne</div>
                  <div className="text-xl font-bold">{(currentSolution.avgAhpScore * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Score AHP pondéré</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Total livraisons</div>
                  <div className="text-xl font-bold">
                    {currentSolution.deliveries.reduce((sum, d) => sum + d.numDeliveries, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Camions nécessaires</div>
                </div>
              </div>

              {/* Recommendations */}
              {currentSolution.recommendations.length > 0 && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-800 mb-2">Recommandations :</h5>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    {currentSolution.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
        
        {optimizationComplete && (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium"
          >
            Voir les Résultats →
          </button>
        )}
      </div>
    </div>
  );
};

export default Step5_Optimization;