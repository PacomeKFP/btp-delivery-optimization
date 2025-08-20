import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Custom icons
const createCustomIcon = (color, isConstruction = false, isSelected = false) => {
  const size = isSelected ? 32 : 24;
  const borderWidth = isSelected ? 4 : 3;
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: ${isConstruction ? '0' : '50%'};
        border: ${borderWidth}px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        ${isConstruction ? '🏗️' : '🏭'}
        ${isSelected ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: #10B981;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">✓</div>
        ` : ''}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

const ResultsMap = ({ 
  constructionSite, 
  selectedSolution, 
  allSuppliers,
  showRoutes = true,
  className = "w-full h-96"
}) => {
  const mapRef = useRef();
  
  const selectedSupplierIds = selectedSolution?.combination.map(s => s.id) || [];
  
  // Générer des routes simplifiées (en réalité, on utiliserait une API de routage)
  const generateRoute = (start, end) => {
    // Route simplifiée - en réalité on utiliserait Google Directions API ou similaire
    const latDiff = end[0] - start[0];
    const lngDiff = end[1] - start[1];
    
    // Créer quelques points intermédiaires pour simuler une route
    const numPoints = 5;
    const route = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const ratio = i / numPoints;
      // Ajouter un peu de courbe pour rendre la route plus réaliste
      const curveFactor = Math.sin(ratio * Math.PI) * 0.01;
      
      route.push([
        start[0] + (latDiff * ratio) + curveFactor,
        start[1] + (lngDiff * ratio) + curveFactor
      ]);
    }
    
    return route;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  // Center the map on the construction site or Yaoundé
  const center = constructionSite 
    ? [constructionSite.lat, constructionSite.lng]
    : [3.848, 11.502];

  // Fit map bounds to show all relevant points
  useEffect(() => {
    if (mapRef.current && constructionSite && selectedSolution) {
      const map = mapRef.current;
      const bounds = L.latLngBounds([
        [constructionSite.lat, constructionSite.lng],
        ...selectedSolution.combination.map(s => s.coordinates)
      ]);
      
      // Add some padding
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [constructionSite, selectedSolution]);

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Construction site marker */}
        {constructionSite && (
          <Marker 
            position={[constructionSite.lat, constructionSite.lng]}
            icon={createCustomIcon('#E11D48', true, true)}
          >
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-bold text-lg mb-2">🏗️ Chantier</h3>
                <p className="text-sm text-gray-600">Site de construction</p>
                {selectedSolution && (
                  <div className="mt-3 space-y-1 text-sm">
                    <div><strong>Demande:</strong> {selectedSolution.totalQuantity} m³</div>
                    <div><strong>Satisfaction:</strong> {selectedSolution.satisfactionRate.toFixed(1)}%</div>
                    <div><strong>Coût total:</strong> {formatCurrency(selectedSolution.totalCost)}</div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Supplier markers */}
        {allSuppliers.map((supplier) => {
          const isSelected = selectedSupplierIds.includes(supplier.id);
          const supplierData = selectedSolution?.combination.find(s => s.id === supplier.id);
          
          return (
            <Marker
              key={supplier.id}
              position={supplier.coordinates}
              icon={createCustomIcon(
                isSelected ? supplier.color : '#9CA3AF', 
                false, 
                isSelected
              )}
              opacity={isSelected ? 1 : 0.5}
            >
              <Popup>
                <div className="min-w-64">
                  <div className="flex items-center space-x-2 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: supplier.color }}
                    />
                    <h3 className="font-bold text-lg">{supplier.name}</h3>
                    {isSelected && <span className="text-green-600 font-bold">✓ SÉLECTIONNÉ</span>}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Localisation:</strong> {supplier.location}</div>
                    <div><strong>Stock disponible:</strong> {supplier.stock} m³</div>
                    <div><strong>Capacité:</strong> {supplier.capacity} m³/h</div>
                    <div><strong>Coût:</strong> {formatCurrency(supplier.costPerM3)}/m³</div>
                    
                    {supplierData && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="font-medium text-green-700 mb-2">Allocation:</div>
                        <div><strong>Quantité:</strong> {supplierData.allocatedQuantity} m³</div>
                        <div><strong>Livraisons:</strong> {Math.ceil(supplierData.allocatedQuantity / supplier.truckCapacity)}</div>
                        <div><strong>Temps transport:</strong> {formatTime(supplierData.timeData.averageTime)}</div>
                        <div><strong>Coût total:</strong> {formatCurrency(supplierData.allocatedQuantity * supplier.costPerM3)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Routes */}
        {showRoutes && constructionSite && selectedSolution && (
          <>
            {selectedSolution.combination.map((supplier, index) => {
              const route = generateRoute(
                supplier.coordinates,
                [constructionSite.lat, constructionSite.lng]
              );
              
              return (
                <Polyline
                  key={supplier.id}
                  positions={route}
                  color={supplier.color}
                  weight={4}
                  opacity={0.8}
                  dashArray="5, 5"
                >
                  <Popup>
                    <div className="text-center">
                      <h4 className="font-bold">{supplier.name} → Chantier</h4>
                      <div className="text-sm mt-2">
                        <div>Distance: ~{supplier.timeData?.distance || 0} km</div>
                        <div>Temps: {formatTime(supplier.timeData?.averageTime || 0)}</div>
                        <div>Quantité: {supplier.allocatedQuantity} m³</div>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default ResultsMap;