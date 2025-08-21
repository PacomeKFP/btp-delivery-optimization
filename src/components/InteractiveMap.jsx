import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { suppliersData } from '../data/suppliers';

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

const LocationMarker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={createCustomIcon('#E11D48', true)}>
      <Popup>
        <div className="text-center">
          <strong>Chantier</strong><br />
          Position sélectionnée
        </div>
      </Popup>
    </Marker>
  );
};

const InteractiveMap = ({ 
  suppliers = suppliersData, 
  constructionSite, 
  onConstructionSiteChange,
  onSupplierMove,
  isEditable = true 
}) => {
  const [editableSuppliers, setEditableSuppliers] = useState(suppliers);
  const mapRef = useRef();

  useEffect(() => {
    setEditableSuppliers(suppliers);
  }, [suppliers]);

  const handleSupplierDrag = (supplierId, newPosition) => {
    const updatedSuppliers = editableSuppliers.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, coordinates: [newPosition.lat, newPosition.lng] }
        : supplier
    );
    setEditableSuppliers(updatedSuppliers);
    if (onSupplierMove) {
      onSupplierMove(supplierId, [newPosition.lat, newPosition.lng]);
    }
  };

  const center = constructionSite 
    ? [constructionSite.lat, constructionSite.lng]
    : [3.848, 11.502]; // Yaoundé center

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
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
        
        {/* Suppliers markers */}
        {editableSuppliers.map((supplier) => (
          <Marker
            key={supplier.id}
            position={supplier.coordinates}
            icon={createCustomIcon(supplier.color)}
            draggable={isEditable}
            eventHandlers={{
              dragend: (e) => {
                if (isEditable) {
                  handleSupplierDrag(supplier.id, e.target.getLatLng());
                }
              }
            }}
          >
            <Popup>
              <div className="min-w-48">
                <h3 className="font-bold text-lg mb-2" style={{ color: supplier.color }}>
                  {supplier.name}
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Localisation:</strong> {supplier.location}</p>
                  <p><strong>Capacité:</strong> {supplier.capacity} m³/h</p>
                  <p><strong>Qté disponible:</strong> {supplier.stock} m³</p>
                  <p><strong>Coût:</strong> {supplier.costPerM3.toLocaleString()} FCFA/m³</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Construction site marker */}
        {constructionSite && (
          <Marker 
            position={[constructionSite.lat, constructionSite.lng]}
            icon={createCustomIcon('#E11D48', true)}
          >
            <Popup>
              <div className="text-center">
                <strong>🏗️ Chantier</strong><br />
                Site de construction
              </div>
            </Popup>
          </Marker>
        )}

        {/* Location selector */}
        {isEditable && onConstructionSiteChange && (
          <LocationMarker onLocationSelect={onConstructionSiteChange} />
        )}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;