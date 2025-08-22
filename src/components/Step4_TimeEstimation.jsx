import React, { useState, useEffect } from 'react';
import { Clock, Route, Calendar, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TransportEstimator } from '../utils/transportEstimator';
import { suppliersData } from '../data/suppliers';

const Step4_TimeEstimation = ({ onNext, onPrevious, initialData = {} }) => {
  const [timeEstimations, setTimeEstimations] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  const transportEstimator = new TransportEstimator();

  const startEstimation = async () => {
    setIsCalculating(true);
    
    const constructionSite = initialData.constructionSite;
    const suppliers = initialData.suppliers || suppliersData;
    const deliveryDate = new Date(initialData.deliveryDate);
    const currentMonth = deliveryDate.getMonth();
    
    // Déterminer la saison (saison sèche vs pluvieuse au Cameroun)
    const rainySeason = [2, 3, 4, 5, 8, 9, 10]; // Mars, Avril, Mai, Juin, Sep, Oct, Nov
    const season = rainySeason.includes(currentMonth) ? 'rainy' : 'dry';

    const estimations = {};
    
    for (const supplier of suppliers) {
      // Simulation du temps de calcul
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const supplierCoord = supplier.coordinates;
      const constructionCoord = [constructionSite.lat, constructionSite.lng];
      
      // Estimation pour différentes heures
      const timeEstimation = await transportEstimator.simulateTransportTime(
        supplierCoord, 
        constructionCoord, 
        8, // 8h du matin par défaut
        season,
        200 // Plus de simulations pour plus de précision
      );
      
      // Fenêtres de livraison optimales
      const deliveryWindows = await transportEstimator.findOptimalDeliveryWindow(
        supplierCoord,
        constructionCoord,
        deliveryDate,
        season,
        initialData.arrivalTime
      );
      
      estimations[supplier.id] = {
        supplier: supplier,
        ...timeEstimation,
        deliveryWindows,
        season,
        optimalDeparture: deliveryWindows.optimal
      };
    }
    
    setTimeEstimations(estimations);
    setIsCalculating(false);
    setCalculationComplete(true);
    
    // Sélectionner automatiquement le fournisseur le plus rapide
    const fastestSupplier = Object.entries(estimations)
      .sort(([,a], [,b]) => a.averageTime - b.averageTime)[0];
    setSelectedSupplier(fastestSupplier[0]);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const prepareTimeChartData = () => {
    if (!selectedSupplier || !timeEstimations[selectedSupplier]) return [];
    
    // Prendre un échantillon des fenêtres pour le graphique (toutes les 30min pour lisibilité)
    return timeEstimations[selectedSupplier].deliveryWindows.allWindows
      .filter((window, index) => index % 6 === 0) // Toutes les 6ème (6 x 5min = 30min)
      .sort((a, b) => a.departureTime - b.departureTime)
      .map(window => ({
        hour: `${window.departureHour}h${window.departureMinute.toString().padStart(2, '0')}`,
        temps: window.averageTime,
        min: window.minTime,
        max: window.maxTime
      }));
  };

  const prepareComparisonData = () => {
    return Object.entries(timeEstimations).map(([id, data]) => ({
      name: data.supplier.name,
      temps: data.averageTime,
      distance: data.distance,
      fill: data.supplier.color
    })).sort((a, b) => a.temps - b.temps);
  };

  const handleNext = () => {
    if (calculationComplete) {
      onNext({ timeEstimations, transportSeason: timeEstimations[Object.keys(timeEstimations)[0]]?.season });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
      <div className="text-center mb-8">
        <Clock className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Estimation du Temps de Transport
        </h2>
        <p className="text-gray-600">
          Simulation stochastique basée sur les chaînes de Markov
        </p>
      </div>

      {!calculationComplete ? (
        <div className="text-center py-12">
          {!isCalculating ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3">Facteurs considérés :</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-700 text-sm">
                  <div>• État du trafic (Fluide/Dense/Embouteillé)</div>
                  <div>• Géolocalisation (zone urbaine, zone rurale)</div>
                  <div>• Conditions météorologiques (sec/pluvieux)</div>
                  <div>• État de dégradation de la route</div>
                  <div>• Distance réelle</div>
                </div>
              </div>
              
              <button
                onClick={startEstimation}
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium text-lg"
              >
                <Route className="w-5 h-5 inline-block mr-2" />
                Lancer l'Estimation
              </button>
            </>
          ) : (
            <div className="py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Simulation en cours...</h3>
              <p className="text-gray-500">Analyse des temps de trajet par chaînes de Markov</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Comparison Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2" />
              Comparaison des Temps de Transport
            </h3>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'temps' ? `${value} min` : `${value} km`,
                      name === 'temps' ? 'Temps moyen' : 'Distance'
                    ]} 
                  />
                  <Bar dataKey="temps" name="temps" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supplier Selection */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Détails par Fournisseur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(timeEstimations).map(([id, data]) => (
                <button
                  key={id}
                  onClick={() => setSelectedSupplier(id)}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    selectedSupplier === id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: data.supplier.color }}
                    />
                    <h4 className="font-semibold">{data.supplier.name}</h4>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Distance: {data.distance} km</div>
                    <div>Temps: {formatTime(data.averageTime)}</div>
                    <div>Optimal: {data.optimalDeparture.departureHour}h{data.optimalDeparture.departureMinute?.toString().padStart(2, '0') || '00'}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Supplier Details */}
            {selectedSupplier && timeEstimations[selectedSupplier] && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: timeEstimations[selectedSupplier].supplier.color }}
                  />
                  <h4 className="text-xl font-bold">
                    {timeEstimations[selectedSupplier].supplier.name}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">
                      {formatTime(timeEstimations[selectedSupplier].optimalDeparture.averageTime || timeEstimations[selectedSupplier].averageTime)}
                    </div>
                    <div className="text-sm text-blue-600">Temps optimal</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Route className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700">
                      {timeEstimations[selectedSupplier].distance} km
                    </div>
                    <div className="text-sm text-green-600">Distance</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-700">
                      {timeEstimations[selectedSupplier].optimalDeparture.departureHour}h{timeEstimations[selectedSupplier].optimalDeparture.departureMinute?.toString().padStart(2, '0') || '00'}
                    </div>
                    <div className="text-sm text-orange-600">Départ optimal</div>
                  </div>
                </div>

                {/* Time variation chart */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-3">Variation du temps selon l'heure de départ</h5>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareTimeChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} min`, 'Temps']} />
                        <Line 
                          type="monotone" 
                          dataKey="temps" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recommendations */}
                {timeEstimations[selectedSupplier].deliveryWindows.recommendations.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">Recommandations :</h5>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      {timeEstimations[selectedSupplier].deliveryWindows.recommendations.map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
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

export default Step4_TimeEstimation;