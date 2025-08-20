import React, { useState } from 'react';
import { Calendar, Package, MapPin } from 'lucide-react';

const Step1_Input = ({ onNext, initialData = {} }) => {
  const [formData, setFormData] = useState({
    demand: initialData.demand || '',
    deliveryDate: initialData.deliveryDate || '',
    materialType: initialData.materialType || 'concrete',
    priority: initialData.priority || 'balanced',
    ...initialData
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.demand && formData.deliveryDate) {
      onNext(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
      <div className="text-center mb-8">
        <Package className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Informations de la Commande
        </h2>
        <p className="text-gray-600">
          Veuillez saisir les détails de votre demande d'approvisionnement
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Demande */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantité demandée (m³) *
          </label>
          <input
            type="number"
            min="1"
            step="0.1"
            value={formData.demand}
            onChange={(e) => handleChange('demand', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="Ex: 250"
            required
          />
        </div>

        {/* Date de livraison */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de livraison souhaitée *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => handleChange('deliveryDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Type de matériau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de matériau
          </label>
          <select
            value={formData.materialType}
            onChange={(e) => handleChange('materialType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="concrete">Béton</option>
            <option value="aggregates">Granulats</option>
            <option value="cement">Ciment</option>
          </select>
        </div>

        {/* Priorité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Priorité de sélection
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'quality', label: 'Qualité prioritaire', desc: 'Privilégier la qualité des matériaux' },
              { id: 'time', label: 'Délai prioritaire', desc: 'Livraison la plus rapide possible' },
              { id: 'cost', label: 'Coût prioritaire', desc: 'Minimiser les coûts' }
            ].map((option) => (
              <label key={option.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={option.id}
                  checked={formData.priority === option.id}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg transition-all ${
                  formData.priority === option.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="font-medium text-gray-800">{option.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bouton suivant */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={!formData.demand || !formData.deliveryDate}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
          >
            Suivant →
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1_Input;