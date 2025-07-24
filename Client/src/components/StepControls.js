import React from 'react';
import './StepControls.css';

const StepControls = ({ currentStep, totalSteps, onStepChange }) => {
  return (
    <div className="step-controls">
      <button 
        onClick={() => onStepChange(0)} 
        disabled={currentStep === 0}
      >
        First
      </button>
      <button 
        onClick={() => onStepChange(currentStep - 1)} 
        disabled={currentStep === 0}
      >
        Previous
      </button>
      <span>Step {currentStep + 1} of {totalSteps}</span>
      <button 
        onClick={() => onStepChange(currentStep + 1)} 
        disabled={currentStep === totalSteps - 1}
      >
        Next
      </button>
      <button 
        onClick={() => onStepChange(totalSteps - 1)} 
        disabled={currentStep === totalSteps - 1}
      >
        Last
      </button>
    </div>
  );
};

export default StepControls;