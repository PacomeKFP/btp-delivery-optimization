import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepIndicator from './components/StepIndicator';
import Step1_Input from './components/Step1_Input';
import Step2_Positioning from './components/Step2_Positioning';
import Step3_Evaluation from './components/Step3_Evaluation';
import Step4_TimeEstimation from './components/Step4_TimeEstimation';
import Step5_Optimization from './components/Step5_Optimization';
import Step6_Results from './components/Step6_Results';

const STEPS = [
  'Demande',
  'Positionnement',
  'Évaluation',
  'Transport',
  'Optimisation',
  'Résultats'
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationData, setSimulationData] = useState({});

  const handleNext = (stepData) => {
    setSimulationData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSimulationData({});
  };

  const renderStep = () => {
    const stepVariants = {
      enter: { opacity: 0, x: 50 },
      center: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 }
    };

    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step1"
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Step1_Input
              onNext={handleNext}
              initialData={simulationData}
            />
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            key="step2"
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Step2_Positioning
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={simulationData}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step3"
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Step3_Evaluation
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={simulationData}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step4"
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Step4_TimeEstimation
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={simulationData}
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step5"
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Step5_Optimization
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={simulationData}
            />
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            key="step6"
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            <Step6_Results
              onRestart={handleRestart}
              initialData={simulationData}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Simulation d'Approvisionnement
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Optimisation intelligente de la sélection des fournisseurs et de la logistique 
            pour vos projets de construction
          </p>
        </div>

        {/* Step Indicator */}
        {currentStep < 5 && (
          <div className="max-w-4xl mx-auto mb-8">
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>
            Développé avec ❤️ pour l'optimisation des chaînes d'approvisionnement dans le BTP
          </p>
          <p className="mt-2">
            Basé sur la méthode AHP et les chaînes de Markov pour des prédictions précises
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;