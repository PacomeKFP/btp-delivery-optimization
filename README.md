# 🏗️ BTP Logistics Simulator

Une application web interactive de simulation d'approvisionnement pour optimiser la sélection des fournisseurs et la logistique dans le secteur du BTP au Cameroun.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![Vite](https://img.shields.io/badge/vite-5.0.8-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Vue d'ensemble

Cette application implémente une simulation complète du processus d'approvisionnement en matériaux de construction, basée sur des algorithmes de recherche opérationnelle avancés. Elle guide l'utilisateur à travers 6 étapes pour optimiser automatiquement la sélection des fournisseurs et la planification logistique.

## ✨ Fonctionnalités principales

### 🎯 **Simulation complète en 6 étapes**
1. **Saisie des paramètres** - Quantité, date, priorités
2. **Positionnement interactif** - Carte avec placement du chantier
3. **Évaluation AHP** - Scoring multicritère des fournisseurs
4. **Estimation transport** - Simulation stochastique des temps de trajet
5. **Optimisation combinatoire** - Sélection optimale des fournisseurs
6. **Résultats visuels** - Carte avec itinéraires et recommandations

### 🧠 **Algorithmes implémentés**
- ✅ **Méthode AHP** (Analytic Hierarchy Process) pour l'évaluation multicritère
- ✅ **Chaînes de Markov** pour la simulation stochastique du trafic
- ✅ **Optimisation combinatoire** avec contraintes multiples
- ✅ **Algorithme de Dijkstra étendu** pour le routage temporel

### 🗺️ **Visualisations interactives**
- ✅ Carte interactive avec OpenStreetMap
- ✅ Positionnement par glisser-déposer
- ✅ Routes optimales surlignées
- ✅ Fournisseurs colorés selon leur sélection
- ✅ Graphiques de répartition et comparaisons
- ✅ Export de rapports détaillés

## 📊 Données et contexte

### 🏭 **Fournisseurs intégrés (région de Yaoundé)**
- **CMCC** (Etoa Maki) - 50 m³/h, 500 m³ stock
- **BCC** (Olembé) - 50 m³/h, 400 m³ stock  
- **SAINTE HELENE** (Nouvelle route Mvan) - 45 m³/h, 350 m³ stock
- **SOMAF** (Nomayos) - 200 m³/h, 800 m³ stock

### 📈 **Critères d'évaluation AHP**
- **Qualité** (18%) - Certifications, normes ISO
- **Délai** (26.2%) - Capacité de livraison dans les temps
- **Coût** (10%) - Prix compétitif, conditions de paiement
- **Organisation** (13%) - Efficacité logistique interne
- **Flexibilité** (16%) - Adaptabilité aux changements
- **Réputation** (12.9%) - Expérience, références
- **Collaboration** (3.8%) - Qualité des échanges

### 🚛 **Modèle de transport**
- **6 états de trafic** : Fluide/Dense/Embouteillé × Sec/Pluvieux
- **Zones géographiques** : Urbaine (Yaoundé) vs Rurale
- **Périodes** : Heures de pointe (6h-9h, 16h-21h) vs Heures creuses
- **Saisons** : Sèche (Dec-Feb, Jul-Aug) vs Pluvieuse (Mar-Jun, Sep-Nov)

## 🛠️ Technologies

- **Frontend** : React 18 + Vite
- **Styling** : Tailwind CSS
- **Cartes** : React-Leaflet + OpenStreetMap
- **Graphiques** : Recharts
- **Animations** : Framer Motion
- **Déploiement** : Vercel

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

## 🚀 Déploiement sur Vercel

```bash
# Avec Vercel CLI
npm i -g vercel
vercel

# Ou directement depuis le repository GitHub
# - Connecter le repository à Vercel
# - Le déploiement se fait automatiquement
```

## 🎮 Utilisation

### Étape 1 : Paramètres de commande
- Quantité demandée (m³)
- Date de livraison souhaitée
- Type de matériau
- Priorité (qualité/délai/coût)

### Étape 2 : Positionnement
- Clic sur la carte pour positionner le chantier
- Ajustement des positions des fournisseurs
- Mode édition pour repositionner

### Étape 3 : Évaluation AHP
- Calcul automatique des scores multicritères
- Pondération selon la priorité sélectionnée
- Classement des fournisseurs

### Étape 4 : Estimation transport
- Simulation Monte Carlo des temps de trajet
- Prise en compte du trafic et météo
- Fenêtres de livraison optimales

### Étape 5 : Optimisation
- Génération de combinaisons de fournisseurs
- Évaluation selon objectifs multiples
- Sélection de la solution optimale

### Étape 6 : Résultats
- Visualisation sur carte avec itinéraires
- Détails par fournisseur sélectionné
- Planning logistique
- Export des rapports

## 📊 Données incluses

- **4 fournisseurs** de béton dans la région de Yaoundé
- **Scores AHP** pré-calculés selon 7 critères
- **Matrices de transition** pour différents contextes
- **Vitesses** par type de route et conditions

## 🎯 Cas d'usage

- **Chefs de projet BTP** : optimisation des approvisionnements
- **Logisticiens** : planification des livraisons
- **Acheteurs** : sélection de fournisseurs
- **Étudiants** : apprentissage des méthodes d'optimisation

## 📈 Algorithmes implémentés

### Méthode AHP (Analytic Hierarchy Process)
```javascript
// Calcul des scores globaux
Si = Σ(Sij × Wj)
// où Sij = score du fournisseur i pour le critère j
// Wj = poids du critère j
```

### Chaînes de Markov pour le transport
```javascript
// États : {Fluide-Sec, Dense-Sec, Embouteillé-Sec, Fluide-Pluie, Dense-Pluie, Embouteillé-Pluie}
// Matrices de transition selon zone/saison/heure
P(t) = e^(Q×t)
```

### Optimisation combinatoire
```javascript
// Score global = f(qualité, temps, coût, satisfaction)
// Contraintes : stock, capacité, délais
```

## 🔧 Configuration

### Variables d'environnement
Aucune variable d'environnement requise - l'application fonctionne avec des données statiques.

### Personnalisation
- Modifier `src/data/suppliers.js` pour d'autres fournisseurs
- Ajuster les matrices de transition dans `src/utils/transportEstimator.js`
- Personnaliser les critères AHP dans `src/utils/ahpCalculator.js`

## 🤝 Contribution

Les contributions sont bienvenues ! Merci de :
1. Forker le repository
2. Créer une branche feature
3. Commiter les changements
4. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Basé sur les recherches académiques en logistique et recherche opérationnelle
- Données inspirées du contexte camerounais
- Interface inspirée des principes de design de Jony Ive