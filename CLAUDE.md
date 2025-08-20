# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a logistics simulation system for construction material procurement and transport in Cameroon. The project aims to create a proof-of-concept (PoC) that simulates supplier selection and transport time estimation for construction sites.

## Key System Components

### 1. Supplier Evaluation System
- Uses AHP (Analytic Hierarchy Process) methodology for supplier ranking
- Evaluates suppliers based on 7 criteria: Quality, Delivery time, Cost, Organization, Flexibility, Reputation, Collaboration
- Implementation follows the mathematical model described in "EVALUATION DES FOURNISSEURS PAR LA METHODE AHP.pdf"
- Supplier data located in `data/Evaluation des fournisseurs.csv` and `data/Fiche de données des fournisseurs.csv`

### 2. Transport Time Estimation
- Complex stochastic model using Markov chains for traffic simulation
- Considers road conditions, weather patterns, and traffic congestion
- Mathematical framework detailed in "ESTIMATION DU TEMPS DE TRAJET.pdf"
- Road segment data in `data/Découpage troncons.csv` and `data/Vitesses_PL_Cameroun_SIG_Markov.csv`

### 3. Optimization Engine
- Combinatorial optimization to select optimal supplier combinations
- Minimizes delivery time while maximizing quality scores
- Uses Time Dependent Graph (TDG) with Extended Dijkstra algorithm
- Route optimization considers real-time traffic and weather conditions

## Architecture Requirements

### Frontend Requirements
- Clean, intuitive interface in the style of Jony Ive (simple, minimalist)
- 2-3 color palette with white dominance
- Simple animations for enhanced user experience
- Map visualization for supplier locations and construction sites
- Interactive route display with time estimations

### Backend Architecture
- Lightweight implementation (suitable for Vercel deployment)
- No serious database required - can use file-based data storage
- Core algorithms: AHP for supplier evaluation, Markov chains for time estimation
- RESTful API for simulation requests

### Key Algorithms to Implement

1. **AHP Supplier Evaluation**:
   - Pairwise comparison matrices
   - Consistency ratio calculation (CR < 0.1)
   - Final supplier scoring: Si = Σ(Sij × Wj)

2. **Markov Chain Transport Simulation**:
   - State space: {(Traffic, Weather, Road_Condition)}
   - Transition matrices Q^ls for different location/season combinations
   - Time estimation: analytical approach vs simulation approach

3. **Route Optimization**:
   - Extended Dijkstra for time-dependent graphs
   - Edge weight function: wij(t) - travel time from node i to j at time t

## Data Structure

### Input Data Files
- `data/Evaluation des fournisseurs.csv`: AHP supplier evaluation scores
- `data/Fiche de données des fournisseurs.csv`: Supplier capacity and location data
- `data/Vitesses_PL_Cameroun_SIG_Markov.csv`: Traffic speed data for road segments
- `data/Découpage troncons.csv`: Road segment characteristics

### Expected User Inputs
- Demand quantity and delivery date
- Construction site location
- Material type specifications

### System Outputs
- Ranked supplier recommendations with scores
- Optimal delivery routes with time estimates
- Quantity allocation per selected supplier
- Visual route mapping

## Development Guidelines

### Language and Localization
- Primary language: French (as per existing documentation)
- Mathematical notation should follow academic standards from source documents
- User interface text should be clear and professional

### Performance Considerations
- Algorithms should handle real-time calculations efficiently
- Map rendering should be optimized for web deployment
- Simulation results should be cached when appropriate

### Mathematical Model Implementation
- Implement matrix operations for AHP calculations
- Use appropriate random number generation for Markov chain simulation
- Ensure numerical stability in optimization algorithms

## Deployment
- Target platform: Vercel (as specified in requirements)
- Frontend: Modern web framework (React/Vue recommended)
- Backend: Node.js or similar lightweight solution
- Database: JSON files or lightweight embedded database

## Simulation Workflow
1. User inputs demand and delivery requirements
2. System evaluates available suppliers using AHP
3. Route optimization calculates transport times using Markov chains
4. Combinatorial optimization selects optimal supplier combination
5. System displays recommended suppliers with routes and time estimates

## Key Mathematical Constants
- Road capacity: C0 = 200 UVP per meter of paved road width
- Speed limits: 30 km/h (urban), 50 km/h (heavy vehicles >12.5t), 60 km/h (vehicles <12.5t)
- Weather seasons: Dry season {Dec, Jan, Feb, Jul, Aug}, Rainy season {Mar, Apr, May, Jun, Sep, Oct, Nov}
- Traffic time windows: Peak hours [6h-9h, 16h-21h], Off-peak hours [21h-6h, 9h-16h]