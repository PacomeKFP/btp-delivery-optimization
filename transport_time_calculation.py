# Extrait du code Python pour le calcul du temps de transport
# Implémentation des chaînes de Markov pour l'estimation stochastique

import numpy as np
import random
from math import radians, sin, cos, sqrt, atan2

class TransportEstimator:
    def __init__(self):
        # États de trafic: Fluide+Sec, Dense+Sec, Embouteillé+Sec, 
        #                 Fluide+Pluvieux, Dense+Pluvieux, Embouteillé+Pluvieux
        self.states = {
            'FS': {'traffic': 'Fluide', 'weather': 'Sec', 'speed': 45},       # km/h
            'DS': {'traffic': 'Dense', 'weather': 'Sec', 'speed': 30},
            'ES': {'traffic': 'Embouteillé', 'weather': 'Sec', 'speed': 15},
            'FP': {'traffic': 'Fluide', 'weather': 'Pluvieux', 'speed': 35},
            'DP': {'traffic': 'Dense', 'weather': 'Pluvieux', 'speed': 20},
            'EP': {'traffic': 'Embouteillé', 'weather': 'Pluvieux', 'speed': 10}
        }
        
        # Matrices de transition Q^ls (localisation, saison)
        self.transition_matrices = {
            # Zone urbaine, saison sèche, heure de pointe
            'urban_dry_peak': np.array([
                [0.7, 0.25, 0.05, 0.0, 0.0, 0.0],  # FS -> [FS, DS, ES, FP, DP, EP]
                [0.3, 0.5, 0.2, 0.0, 0.0, 0.0],    # DS -> ...
                [0.1, 0.3, 0.6, 0.0, 0.0, 0.0],    # ES -> ...
                [0.0, 0.0, 0.0, 0.8, 0.15, 0.05],  # FP -> ...
                [0.0, 0.0, 0.0, 0.2, 0.6, 0.2],    # DP -> ...
                [0.0, 0.0, 0.0, 0.05, 0.25, 0.7]   # EP -> ...
            ]),
            
            # Zone urbaine, saison sèche, heure creuse
            'urban_dry_offpeak': np.array([
                [0.85, 0.15, 0.0, 0.0, 0.0, 0.0],
                [0.4, 0.55, 0.05, 0.0, 0.0, 0.0],
                [0.2, 0.4, 0.4, 0.0, 0.0, 0.0],
                [0.0, 0.0, 0.0, 0.9, 0.1, 0.0],
                [0.0, 0.0, 0.0, 0.3, 0.6, 0.1],
                [0.0, 0.0, 0.0, 0.1, 0.3, 0.6]
            ]),
            
            # Rase campagne (rural)
            'rural': np.array([
                [0.9, 0.1, 0.0, 0.0, 0.0, 0.0],
                [0.5, 0.45, 0.05, 0.0, 0.0, 0.0],
                [0.3, 0.5, 0.2, 0.0, 0.0, 0.0],
                [0.0, 0.0, 0.0, 0.85, 0.15, 0.0],
                [0.0, 0.0, 0.0, 0.4, 0.55, 0.05],
                [0.0, 0.0, 0.0, 0.2, 0.4, 0.4]
            ])
        }
        
        # Probabilités météorologiques par saison au Cameroun
        self.weather_probs = {
            'dry': {'rain': 0.1, 'dry': 0.9},      # Saison sèche
            'rainy': {'rain': 0.7, 'dry': 0.3}     # Saison pluvieuse
        }
    
    def calculate_distance(self, coord1, coord2):
        """Calcul de la distance géodésique (formule de Haversine)"""
        R = 6371  # Rayon de la Terre en km
        lat1, lon1 = radians(coord1[0]), radians(coord1[1])
        lat2, lon2 = radians(coord2[0]), radians(coord2[1])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    def determine_zone_type(self, coord):
        """Déterminer le type de zone (urbain/rural)"""
        # Zone urbaine approximative de Yaoundé
        yaounde_center = [3.848, 11.502]
        urban_radius = 25  # km
        
        distance_to_center = self.calculate_distance(coord, yaounde_center)
        return 'urban' if distance_to_center <= urban_radius else 'rural'
    
    def determine_period(self, hour):
        """Déterminer la période (pointe/creuse)"""
        # Heures de pointe: 6h-9h et 16h-21h
        return 'peak' if (6 <= hour <= 9) or (16 <= hour <= 21) else 'offpeak'
    
    def get_transition_matrix(self, supplier_coord, construction_coord, hour, season):
        """Obtenir la matrice de transition appropriée"""
        supplier_zone = self.determine_zone_type(supplier_coord)
        construction_zone = self.determine_zone_type(construction_coord)
        
        # Si l'un des deux points est en zone rurale, considérer comme rural
        if supplier_zone == 'rural' or construction_zone == 'rural':
            return self.transition_matrices['rural']
        
        # Zone urbaine
        period = self.determine_period(hour)
        return self.transition_matrices[f'urban_{season}_{period}']
    
    def get_initial_state(self, hour, season):
        """État initial basé sur l'heure et la saison"""
        weather_prob = self.weather_probs[season]
        is_raining = random.random() < weather_prob['rain']
        
        if self.determine_period(hour) == 'peak':
            # Heure de pointe - plus de congestion
            rand = random.random()
            if is_raining:
                return 'FP' if rand < 0.3 else 'DP' if rand < 0.8 else 'EP'
            else:
                return 'FS' if rand < 0.4 else 'DS' if rand < 0.8 else 'ES'
        else:
            # Heure creuse - moins de congestion
            rand = random.random()
            if is_raining:
                return 'FP' if rand < 0.6 else 'DP' if rand < 0.9 else 'EP'
            else:
                return 'FS' if rand < 0.8 else 'DS' if rand < 0.95 else 'ES'
    
    def get_next_state(self, current_state, transition_matrix):
        """Transition vers le prochain état selon la matrice de Markov"""
        states_list = list(self.states.keys())
        state_index = states_list.index(current_state)
        probabilities = transition_matrix[state_index]
        
        # Sélection aléatoire selon les probabilités
        rand = random.random()
        cumulative = 0
        
        for i, prob in enumerate(probabilities):
            cumulative += prob
            if rand < cumulative:
                return states_list[i]
        
        return current_state  # Fallback
    
    def simulate_transport_time(self, supplier_coord, construction_coord, 
                               hour=8, season='dry', num_simulations=100):
        """
        Simulation Monte Carlo pour estimer le temps de trajet
        
        Args:
            supplier_coord: Coordonnées du fournisseur [lat, lng]
            construction_coord: Coordonnées du chantier [lat, lng]
            hour: Heure de départ (défaut: 8h)
            season: Saison ('dry' ou 'rainy')
            num_simulations: Nombre de simulations Monte Carlo
        
        Returns:
            dict: Statistiques du temps de trajet estimé
        """
        # Calcul de la distance réelle
        distance = self.calculate_distance(supplier_coord, construction_coord) * 1.3  # Facteur route
        
        # Obtenir la matrice de transition appropriée
        transition_matrix = self.get_transition_matrix(
            supplier_coord, construction_coord, hour, season
        )
        
        results = []
        
        # Simulation Monte Carlo
        for sim in range(num_simulations):
            total_time = 0
            remaining_distance = distance
            
            # État initial
            current_state = self.get_initial_state(hour, season)
            
            # Simulation par segments de 5km
            segment_length = 5  # km
            
            while remaining_distance > 0:
                segment_dist = min(segment_length, remaining_distance)
                speed = self.states[current_state]['speed']
                
                # Temps pour ce segment (en minutes)
                segment_time = (segment_dist / speed) * 60
                total_time += segment_time
                
                # Transition vers le prochain état
                current_state = self.get_next_state(current_state, transition_matrix)
                remaining_distance -= segment_dist
            
            results.append(total_time)
        
        # Calcul des statistiques
        results = np.array(results)
        avg_time = np.mean(results)
        std_dev = np.std(results)
        
        return {
            'average_time': round(avg_time),
            'min_time': round(np.min(results)),
            'max_time': round(np.max(results)),
            'standard_deviation': round(std_dev),
            'confidence_95': {
                'min': round(avg_time - 1.96 * std_dev),
                'max': round(avg_time + 1.96 * std_dev)
            },
            'distance': round(distance, 1),
            'simulations': num_simulations
        }

# Exemple d'utilisation
if __name__ == "__main__":
    estimator = TransportEstimator()
    
    # Coordonnées d'exemple (fournisseur -> chantier)
    supplier_coord = [3.8480, 11.5021]  # CMCC - Etoa Maki
    construction_coord = [3.8680, 11.5221]  # Chantier - Olembé
    
    # Simulation pour différentes heures
    for hour in [7, 8, 12, 17]:
        result = estimator.simulate_transport_time(
            supplier_coord, construction_coord, 
            hour=hour, season='dry', num_simulations=200
        )
        
        print(f"Heure de départ: {hour}h")
        print(f"Temps moyen: {result['average_time']} min")
        print(f"Intervalle 95%: [{result['confidence_95']['min']}, {result['confidence_95']['max']}] min")
        print(f"Distance: {result['distance']} km")
        print("-" * 40)