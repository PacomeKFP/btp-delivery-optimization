import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div className="flex items-center w-full">
            <div className="flex items-center justify-center">
              {index < currentStep ? (
                <CheckCircle className="w-8 h-8 text-primary-600 bg-white rounded-full" />
              ) : index === currentStep ? (
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
              ) : (
                <Circle className="w-8 h-8 text-gray-300" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 ${
                index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
          <span className={`text-sm mt-2 text-center ${
            index <= currentStep ? 'text-primary-700 font-medium' : 'text-gray-400'
          }`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;