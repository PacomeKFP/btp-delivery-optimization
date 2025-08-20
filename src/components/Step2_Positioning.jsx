import React, { useState } from 'react';
import { MapPin, Edit3 } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import { suppliersData } from '../data/suppliers';

const Step2_Positioning = ({ onNext, onPrevious, initialData = {} }) => {
  const [constructionSite, setConstructionSite] = useState(
    initialData.constructionSite || null
  );
  const [suppliers, setSuppliers] = useState(
    initialData.suppliers || suppliersData
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleLocationSelect = (latlng) => {
    setConstructionSite(latlng);
  };

  const handleSupplierMove = (supplierId, newCoordinates) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, coordinates: newCoordinates }
        : supplier
    ));
  };

  const handleNext = () => {
    if (constructionSite) {
      onNext({
        constructionSite,
        suppliers
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
      <div className="text-center mb-8">
        <MapPin className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Positionnement des Sites
        </h2>
        <p className="text-gray-600">
          Positionnez votre chantier et ajustez la localisation des fournisseurs si nécessaire
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions :</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• <strong>Cliquez sur la carte</strong> pour positionner votre chantier</li>
          <li>• <strong>Activez le mode édition</strong> pour déplacer les fournisseurs</li>
          <li>• <strong>Faites glisser les marqueurs</strong> pour ajuster les positions</li>
        </ul>
      </div>

      {/* Edit toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isEditing 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Mode édition actif' : 'Activer l\'édition'}</span>
          </button>
        </div>
        
        {constructionSite && (
          <div className="text-sm text-green-600 font-medium">
            ✓ Chantier positionné
          </div>
        )}
      </div>

      {/* Map */}
      <div className="mb-6">
        <InteractiveMap
          suppliers={suppliers}
          constructionSite={constructionSite}
          onConstructionSiteChange={handleLocationSelect}
          onSupplierMove={handleSupplierMove}
          isEditable={isEditing}
        />
      </div>

      {/* Suppliers summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: supplier.color }}
              />
              <div>
                <h4 className="font-semibold">{supplier.name}</h4>
                <p className="text-sm text-gray-600">{supplier.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          ← Précédent
        </button>
        
        <button
          onClick={handleNext}
          disabled={!constructionSite}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
};

export default Step2_Positioning;