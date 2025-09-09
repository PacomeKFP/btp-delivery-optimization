import React, { useState } from 'react';
import { CheckCircle, Download, Share2, MapPin, Clock, DollarSign, Truck, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ResultsMap from './ResultsMap';
import { generateSimulationReport } from '../utils/pdfGenerator';

const Step6_Results = ({ onRestart, initialData = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const selectedSolution = initialData.selectedSolution;
  const allSuppliers = initialData.suppliers;
  const constructionSite = initialData.constructionSite;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60).to fixed(2);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const preparePieData = () => {
    return selectedSolution.combination.map(supplier => ({
      name: supplier.name,
      value: supplier.allocatedQuantity,
      fill: supplier.color,
      percentage: ((supplier.allocatedQuantity / selectedSolution.totalQuantity)).toFixed(2)
    }));
  };

  const prepareTimelineData = () => {
    return selectedSolution.deliveries.map(delivery => ({
      name: delivery.supplierName,
      depart: delivery.optimalDeparture.departureHour,
      temps: delivery.deliveryTime,
      livraisons: delivery.numDeliveries,
      fill: selectedSolution.combination.find(s => s.id === delivery.supplierId)?.color || '#3B82F6'
    }));
  };

  const generateReport = () => {
    const report = {
      projet: "Simulation d'Approvisionnement",
      date: new Date().toLocaleDateString('fr-FR'),
      demande: {
        quantite: initialData.demand + ' m³',
        materiau: initialData.materialType,
        dateLivraison: initialData.deliveryDate,
        priorite: initialData.priority
      },
      solution: {
        fournisseurs: selectedSolution.combination.length,
        quantiteTotale: selectedSolution.totalQuantity + ' m³',
        tauxSatisfaction: selectedSolution.satisfactionRate.toFixed(1) + '%',
        coutTotal: formatCurrency(selectedSolution.totalCost),
        coutParM3: formatCurrency(Math.round(selectedSolution.costPerM3)),
        tempsMax: formatTime(selectedSolution.maxDeliveryTime),
        niveauRisque: selectedSolution.riskLevel,
        scoreGlobal: (selectedSolution.globalScore * 100).toFixed(1) + '%',
        scoreExplanation: 'Score composite basé sur la qualité AHP, temps de transport et coût'
      },
      fournisseurs: selectedSolution.combination.map(supplier => ({
        nom: supplier.name,
        localisation: supplier.location,
        quantite: supplier.allocatedQuantity + ' m³',
        pourcentage: ((supplier.allocatedQuantity / selectedSolution.totalQuantity) * 100).toFixed(1) + '%',
        coutTotal: formatCurrency(supplier.allocatedQuantity * supplier.costPerM3),
        tempsTransport: formatTime(supplier.timeData.averageTime),
        nombreLivraisons: Math.ceil(supplier.allocatedQuantity / supplier.truckCapacity),
        departOptimal: supplier.timeData.optimalDeparture.departureHour + 'h'
      }))
    };
    
    // Télécharger le rapport en JSON
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `rapport_approvisionnement_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const generatePDFReport = async () => {
    try {
      // Préparer les données pour le PDF
      const simulationData = {
        demand: initialData.demand,
        materialType: initialData.materialType === 'concrete' ? 'Béton prêt à l\'emploi' : initialData.materialType,
        deliveryDate: initialData.deliveryDate,
        arrivalTime: initialData.arrivalTime,
        selectedSolution
      };
      
      // Générer le PDF
      const generator = await generateSimulationReport(simulationData);
      
      // Télécharger
      const filename = `rapport-simulation-${new Date().toISOString().split('T')[0]}.pdf`;
      await generator.generateAndDownload(filename);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du rapport PDF. Veuillez réessayer.');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: CheckCircle },
    { id: 'map', name: 'Carte', icon: MapPin },
    { id: 'suppliers', name: 'Fournisseurs', icon: Truck },
    { id: 'logistics', name: 'Logistique', icon: Clock }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold">Simulation Terminée</h1>
                <p className="text-green-100">Solution optimale identifiée avec succès</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-bold">{selectedSolution.satisfactionRate.toFixed(1)}%</div>
                <div className="text-green-100 text-sm">Demande satisfaite</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{selectedSolution.combination.length}</div>
                <div className="text-green-100 text-sm">Fournisseur(s)</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatTime(selectedSolution.maxDeliveryTime)}</div>
                <div className="text-green-100 text-sm">Temps max</div>
              </div>
              {/* <div>
                <div className="text-2xl font-bold">{(selectedSolution.globalScore).toFixed(2)}</div>
                <div className="text-green-100 text-sm" title="Score composite basé sur la qualité AHP, temps de transport et coût">Score global ℹ️</div>
              </div> */}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={generatePDFReport}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Rapport PDF</span>
            </button>
            <button
              onClick={generateReport}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Données JSON</span>
            </button>
            <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all">
              <Share2 className="w-4 h-4" />
              <span>Partager</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-green-700">{selectedSolution.totalQuantity} m³</div>
                    <div className="text-green-600">Quantité totale</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(selectedSolution.totalCost)}</div>
                    <div className="text-blue-600">Coût total</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-orange-700">{formatTime(selectedSolution.avgDeliveryTime)}</div>
                    <div className="text-orange-600">Temps moyen</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center">
                  <Truck className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-purple-700">
                      {selectedSolution.deliveries.reduce((sum, d) => sum + d.numDeliveries, 0)}
                    </div>
                    <div className="text-purple-600">Livraisons</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Répartition des quantités</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {preparePieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} m³ (${preparePieData().find(d => d.name === name)?.percentage}%)`, 'Quantité']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {preparePieData().map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="text-sm">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Planning de livraison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareTimelineData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'depart' ? `${value}h` : 
                          name === 'temps' ? formatTime(value) : value,
                          name === 'depart' ? 'Départ optimal' :
                          name === 'temps' ? 'Temps transport' : 'Livraisons'
                        ]}
                      />
                      <Bar dataKey="depart" name="depart" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Carte des résultats</h3>
              <p className="text-gray-600 mb-6">
                Visualisation des fournisseurs sélectionnés et des itinéraires optimaux
              </p>
            </div>
            
            <ResultsMap
              constructionSite={constructionSite}
              selectedSolution={selectedSolution}
              allSuppliers={allSuppliers}
              showRoutes={true}
              className="w-full h-[600px] rounded-lg shadow-lg"
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Légende :</h4>
              <div className="flex flex-wrap gap-6 text-blue-700 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Fournisseurs sélectionnés</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span>Fournisseurs non sélectionnés</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500"></div>
                  <span>Chantier</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 border-dashed border-2 border-blue-500"></div>
                  <span>Itinéraires</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Fournisseurs sélectionnés</h3>
            
            <div className="space-y-6">
              {selectedSolution.combination.map((supplier, index) => {
                const delivery = selectedSolution.deliveries.find(d => d.supplierId === supplier.id);
                return (
                  <div key={supplier.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold">{supplier.name}</h4>
                          <p className="text-gray-600">{supplier.location}</p>
                        </div>
                      </div>
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: supplier.color }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Quantité allouée</div>
                        <div className="text-xl font-bold">{supplier.allocatedQuantity} m³</div>
                        <div className="text-sm text-gray-600">
                          {((supplier.allocatedQuantity / selectedSolution.totalQuantity) * 100).toFixed(1)}% du total
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Coût total</div>
                        <div className="text-xl font-bold">{formatCurrency(supplier.allocatedQuantity * supplier.costPerM3)}</div>
                        <div className="text-sm text-gray-600">{formatCurrency(supplier.costPerM3)}/m³</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Temps transport</div>
                        <div className="text-xl font-bold">{formatTime(supplier.timeData.averageTime)}</div>
                        <div className="text-sm text-gray-600">Départ: {delivery?.optimalDeparture.departureHour}h</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Livraisons</div>
                        <div className="text-xl font-bold">{delivery?.numDeliveries || 0}</div>
                        <div className="text-sm text-gray-600">
                          {delivery?.trucks10Count || 0} × 10m³ + {delivery?.trucks8Count || 0} × 8m³
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Capacité production:</span> {supplier.capacity} m³/h
                        </div>
                        <div>
                          <span className="font-medium">Qté disponible:</span> {supplier.stock} m³
                        </div>
                        <div>
                          <span className="font-medium">Distance:</span> ~{supplier.timeData.distance} km
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Planning logistique</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Schedule */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Horaires optimaux</h4>
                <div className="space-y-4">
                  {selectedSolution.deliveries.map((delivery) => {
                    const supplier = selectedSolution.combination.find(s => s.id === delivery.supplierId);
                    return (
                      <div key={delivery.supplierId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: supplier?.color }}
                          />
                          <span className="font-medium">{delivery.supplierName}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{delivery.optimalDeparture.departureHour}h</div>
                          <div className="text-sm text-gray-600">{formatTime(delivery.deliveryTime)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-800 mb-2">Résumé logistique</h5>
                  <div className="space-y-2 text-green-700">
                    <div>Total de {selectedSolution.deliveries.reduce((sum, d) => sum + d.numDeliveries, 0)} livraisons</div>
                    <div>Temps maximal: {formatTime(selectedSolution.maxDeliveryTime)}</div>
                    <div>Coût total: {formatCurrency(selectedSolution.totalCost)}</div>
                    <div>Niveau de risque: {selectedSolution.riskLevel}</div>
                  </div>
                </div>
                
                {selectedSolution.recommendations.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">Recommandations:</h5>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      {selectedSolution.recommendations.map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Simulation générée le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </div>
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium"
          >
            Nouvelle Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step6_Results;