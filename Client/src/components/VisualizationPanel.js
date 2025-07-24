import React from 'react';
import VariableDisplay from './VariableDisplay';
import LoopStepDisplay from './LoopStepDisplay';
import './VisualizationPanel.css';

const VisualizationPanel = ({ step, variables, loops }) => {
  const renderStepContent = () => {
    if (!step) return null;

    switch (step.type) {
      case 'variable_declaration':
        return (
          <div className="step-content">
            <h4>Variable Declarations</h4>
            <VariableDisplay variables={step.variables} />
          </div>
        );
      case 'loop_start':
        return (
          <div className="step-content">
            <h4>Loop Started: {step.loop.type}</h4>
            <LoopStepDisplay loop={step.loop} />
          </div>
        );
      case 'loop_iteration':
        return (
          <div className="step-content">
            <h4>Loop Iteration: {step.iteration + 1}</h4>
            <VariableDisplay variables={step.variables} />
          </div>
        );
      case 'loop_end':
        return (
          <div className="step-content">
            <h4>Loop Ended</h4>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="visualization-panel">
      <h3>Dry Run Visualization</h3>
      {renderStepContent()}
    </div>
  );
};

export default VisualizationPanel;