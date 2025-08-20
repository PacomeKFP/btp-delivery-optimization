// Données des fournisseurs basées sur le fichier CSV
export const suppliersData = [
  {
    id: 'F1',
    name: 'CMCC',
    fullName: 'CMCC (F1)',
    capacity: 50, // m3/h
    truckCapacity: 76, // m3
    costPerM3: 108000, // FCFA
    pumpCost: 7000, // FCFA/m3
    quality: 'ISO 9001, Certifications sur les matériaux',
    location: 'Etoa Maki',
    coordinates: [3.8480, 11.5021], // Yaoundé area
    stock: 500, // m3 available
    color: '#3B82F6' // Blue
  },
  {
    id: 'F2',
    name: 'BCC',
    fullName: 'BCC (F2)',
    capacity: 50,
    truckCapacity: 56,
    costPerM3: 109000,
    pumpCost: 10000,
    quality: 'ISO 9001, Certifications sur les matériaux',
    location: 'Olembé',
    coordinates: [3.8680, 11.5221],
    stock: 400,
    color: '#EF4444' // Red
  },
  {
    id: 'F3',
    name: 'SAINTE HELENE',
    fullName: 'SAINTE HELENE (F3)',
    capacity: 45,
    truckCapacity: 66,
    costPerM3: 105000,
    pumpCost: 6500,
    quality: 'ISO 9001, Certifications sur les matériaux',
    location: 'Nouvelle route Mvan',
    coordinates: [3.8280, 11.4821],
    stock: 350,
    color: '#10B981' // Green
  },
  {
    id: 'F4',
    name: 'SOMAF',
    fullName: 'SOMAF (F4)',
    capacity: 200,
    truckCapacity: 86,
    costPerM3: 110000,
    pumpCost: 8000,
    quality: 'ISO 9001, Certifications sur les matériaux',
    location: 'Nomayos',
    coordinates: [3.8780, 11.5421],
    stock: 800,
    color: '#F59E0B' // Yellow
  }
];

// Scores d'évaluation AHP basés sur les données CSV
export const ahpScores = {
  criteria: [
    { id: 'quality', name: 'Qualité', weight: 0.180 },
    { id: 'delivery', name: 'Délai', weight: 0.262 },
    { id: 'cost', name: 'Coût', weight: 0.10 },
    { id: 'organization', name: 'Organisation', weight: 0.13 },
    { id: 'flexibility', name: 'Flexibilité', weight: 0.16 },
    { id: 'reputation', name: 'Réputation', weight: 0.129 },
    { id: 'collaboration', name: 'Collaboration', weight: 0.038 }
  ],
  scores: {
    F1: { quality: 0.3, delivery: 0.3, cost: 0.21, organization: 0.29, flexibility: 0.25, reputation: 0.34, collaboration: 0.25 },
    F2: { quality: 0.19, delivery: 0.2, cost: 0.29, organization: 0.2, flexibility: 0.24, reputation: 0.15, collaboration: 0.24 },
    F3: { quality: 0.2, delivery: 0.21, cost: 0.28, organization: 0.21, flexibility: 0.25, reputation: 0.16, collaboration: 0.25 },
    F4: { quality: 0.31, delivery: 0.29, cost: 0.22, organization: 0.3, flexibility: 0.26, reputation: 0.35, collaboration: 0.26 }
  }
};