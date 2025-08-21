import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different types
const createCustomIcon = (color, isConstruction = false) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: ${isConstruction ? '0' : '50%'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isConstruction ? '🏗️' : '🏭'}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const RouteMap = ({ 
  constructionSite, 
  selectedSolution, 
  allSuppliers,
  showRoutes = true,
  className = "w-full h-96 rounded-lg shadow-lg"
}) => {
  const mapRef = useRef();

  // Calculer le centre de la carte basé sur tous les points
  const calculateMapCenter = () => {
    if (!constructionSite) return [3.848, 11.502]; // Yaoundé par défaut

    const allPoints = [
      [constructionSite.lat, constructionSite.lng],
      ...allSuppliers.map(s => s.coordinates)
    ];

    const avgLat = allPoints.reduce((sum, point) => sum + point[0], 0) / allPoints.length;
    const avgLng = allPoints.reduce((sum, point) => sum + point[1], 0) / allPoints.length;

    return [avgLat, avgLng];
  };

  const center = calculateMapCenter();

  // Ajuster le zoom automatiquement pour inclure tous les points
  useEffect(() => {
    if (mapRef.current && constructionSite && allSuppliers.length > 0) {
      const map = mapRef.current;
      const bounds = L.latLngBounds([
        [constructionSite.lat, constructionSite.lng],
        ...allSuppliers.map(s => s.coordinates)
      ]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [constructionSite, allSuppliers]);

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Fournisseurs */}
        {allSuppliers.map((supplier) => {
          const isSelected = selectedSolution?.combination.some(s => s.id === supplier.id);
          const supplierData = selectedSolution?.combination.find(s => s.id === supplier.id);
          
          return (
            <Marker
              key={supplier.id}
              position={supplier.coordinates}
              icon={createCustomIcon(isSelected ? supplier.color : '#94a3b8')}
            >
              <Popup>
                <div className="min-w-48">
                  <h3 className="font-bold text-lg mb-2" style={{ color: supplier.color }}>
                    {supplier.name} {isSelected ? '✅' : ''}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Localisation:</strong> {supplier.location}</p>
                    <p><strong>Capacité:</strong> {supplier.capacity} m³/h</p>
                    <p><strong>Qté disponible:</strong> {supplier.stock} m³</p>
                    <p><strong>Coût:</strong> {supplier.costPerM3.toLocaleString()} FCFA/m³</p>
                    {isSelected && supplierData && (
                      <>
                        <hr className="my-2" />
                        <p><strong>Alloué:</strong> {supplierData.allocatedQuantity} m³</p>
                        <p><strong>Distance:</strong> {supplierData.timeData?.distance} km</p>
                        <p><strong>Temps:</strong> {Math.round(supplierData.timeData?.averageTime || 0)} min</p>
                      </>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Site de construction */}
        {constructionSite && (
          <Marker 
            position={[constructionSite.lat, constructionSite.lng]}
            icon={createCustomIcon('#dc2626', true)}
          >
            <Popup>
              <div className="text-center">
                <strong>🏗️ Chantier</strong><br />
                Site de construction
              </div>
            </Popup>
          </Marker>
        )}

        {/* Routes réelles */}
        {showRoutes && selectedSolution && constructionSite && (
          selectedSolution.combination.map((supplier) => {
            const route = supplier.timeData?.realRoute;
            if (!route || !route.coordinates) return null;

            return (
              <Polyline
                key={`route-${supplier.id}`}
                positions={route.coordinates}
                pathOptions={{
                  color: supplier.color,
                  weight: 4,
                  opacity: 0.7,
                  dashArray: route.isFallback ? '10, 10' : null
                }}
              >
                <Popup>
                  <div>
                    <strong>Route: {supplier.name}</strong><br />
                    Distance: {route.distance} km<br />
                    Temps estimé: {Math.round(supplier.timeData.averageTime)} min<br />
                    {route.isFallback && <em>Route approximative</em>}
                  </div>
                </Popup>
              </Polyline>
            );
          })
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMap;