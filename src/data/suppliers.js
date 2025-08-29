// Données des fournisseurs basées sur le fichier CSV
export const suppliersData = [
  {
    id: "F1",
    name: "CMCC",
    fullName: "CMCC (F1)",
    capacity: 50, // m3/h
    truckCapacity10: 10, // m3 - Camion toupie 10m³
    truckCapacity8: 8, // m3 - Camion toupie 8m³
    costPerM3: 108000, // FCFA
    pumpCost: 7000, // FCFA/m3
    quality: "ISO 9001, Certifications sur les matériaux",
    location: "Etoa Meki",
    coordinates: [3.848, 11.5021], // Yaoundé area
    stock: 76, // m3 available
    color: "#2563eb", // Blue
  },
  {
    id: "F2",
    name: "BCC",
    fullName: "BCC (F2)",
    capacity: 50,
    truckCapacity10: 10,
    truckCapacity8: 8,
    costPerM3: 109000,
    pumpCost: 10000,
    quality: "ISO 9001, Certifications sur les matériaux",
    location: "Olembé",
    coordinates: [3.868, 11.5221],
    stock: 56,
    color: "#ea580c", // Orange
  },
  {
    id: "F3",
    name: "SAINTE HELENE",
    fullName: "SAINTE HELENE (F3)",
    capacity: 45,
    truckCapacity10: 10,
    truckCapacity8: 8,
    costPerM3: 105000,
    pumpCost: 6500,
    quality: "ISO 9001, Certifications sur les matériaux",
    location: "Nouvelle route Mvan",
    coordinates: [3.828, 11.4821],
    stock: 66,
    color: "#86f63bff", // Blue variant
  },
  {
    id: "F4",
    name: "SOMAF",
    fullName: "SOMAF (F4)",
    capacity: 200,
    truckCapacity10: 10,
    truckCapacity8: 8,
    costPerM3: 110000,
    pumpCost: 8000,
    quality: "ISO 9001, Certifications sur les matériaux",
    location: "Nomayos",
    coordinates: [3.878, 11.5421],
    stock: 86,
    color: "#f916c0ff", // Orange variant
  },
];

// Scores d'évaluation AHP basés sur les données CSV
export const ahpScores = {
  criteria: [
    { id: "quality", name: "Qualité", weight: 0.18 },
    { id: "delivery", name: "Délai", weight: 0.262 },
    { id: "cost", name: "Coût", weight: 0.1 },
    { id: "organization", name: "Organisation", weight: 0.13 },
    { id: "flexibility", name: "Flexibilité", weight: 0.16 },
    { id: "reputation", name: "Réputation", weight: 0.129 },
    { id: "collaboration", name: "Collaboration", weight: 0.038 },
  ],
  scores: {
    F1: {
      quality: 75,
      delivery: 70,
      cost: 60,
      organization: 75,
      flexibility: 65,
      reputation: 85,
      collaboration: 65,
    },
    F2: {
      quality: 50,
      delivery: 55,
      cost: 75,
      organization: 60,
      flexibility: 55,
      reputation: 70,
      collaboration: 60,
    },
    F3: {
      quality: 60,
      delivery: 60,
      cost: 70,
      organization: 55,
      flexibility: 55,
      reputation: 75,
      collaboration: 60,
    },
    F4: {
      quality: 80,
      delivery: 75,
      cost: 55,
      organization: 80,
      flexibility: 65,
      reputation: 85,
      collaboration: 65,
    },
  },
};