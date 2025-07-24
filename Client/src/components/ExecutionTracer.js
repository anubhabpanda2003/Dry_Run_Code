import React, { useState } from 'react';
import './ExecutionTracer.css';

const ExecutionTracer = ({ traces }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showVariables, setShowVariables] = useState(true);

  const handleStepChange = (step) => {
    if (step >= 0 && step < traces.length) {
      setCurrentStep(step);
    }
  };

  const renderStepContent = (step) => {
    switch (step.type) {
      case 'initial':
        return (
          <div className="step-content initial">
            <h4>Initial State</h4>
            <p>Method execution begins</p>
          </div>
        );
      case 'assignment':
        return (
          <div className="step-content assignment">
            <h4>Variable Assignment</h4>
            <p><code>{step.variable} = {step.value}</code></p>
          </div>
        );
      case 'if':
        return (
          <div className="step-content conditional">
            <h4>If Condition</h4>
            <p><code>{step.condition}</code> evaluated to <strong>{step.result ? 'true' : 'false'}</strong></p>
          </div>
        );
      case 'for_init':
        return (
          <div className="step-content loop">
            <h4>For Loop Initialization</h4>
            <p><code>{step.initializations.join(', ')}</code></p>
          </div>
        );
      case 'for_condition':
        return (
          <div className="step-content loop">
            <h4>For Loop Condition Check</h4>
            <p>Iteration {step.iteration + 1}: <code>{step.condition}</code> is {step.result ? 'true' : 'false'}</p>
          </div>
        );
      case 'method_call':
        return (
          <div className="step-content method-call">
            <h4>Method Call</h4>
            <p><code>{step.methodName}({step.arguments.map(a => a.value).join(', ')})</code></p>
          </div>
        );
      case 'return':
        return (
          <div className="step-content return">
            <h4>Return Statement</h4>
            <p>Returning value: <code>{step.value !== undefined ? step.value : 'void'}</code></p>
          </div>
        );
      default:
        return <div className="step-content unknown">Unknown step type</div>;
    }
  };

  return (
    <div className="execution-tracer">
      <div className="tracer-controls">
        <button onClick={() => handleStepChange(0)} disabled={currentStep === 0}>
          First
        </button>
        <button 
          onClick={() => handleStepChange(currentStep - 1)} 
          disabled={currentStep === 0}
        >
          Previous
        </button>
        <span>
          Step {currentStep + 1} of {traces.length}
        </span>
        <button 
          onClick={() => handleStepChange(currentStep + 1)} 
          disabled={currentStep === traces.length - 1}
        >
          Next
        </button>
        <button 
          onClick={() => handleStepChange(traces.length - 1)} 
          disabled={currentStep === traces.length - 1}
        >
          Last
        </button>
        <label>
          <input
            type="checkbox"
            checked={showVariables}
            onChange={() => setShowVariables(!showVariables)}
          />
          Show Variables
        </label>
      </div>
      
      <div className="step-display">
        <div className="step-info">
          {renderStepContent(traces[currentStep])}
        </div>
        
        {showVariables && traces[currentStep].variables && (
          <div className="variable-states">
            <h4>Variable States</h4>
            <table>
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(traces[currentStep].variables).map(([name, data]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{String(data.currentValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="step-navigation">
        <h4>Execution Steps</h4>
        <div className="step-list">
          {traces.map((trace, index) => (
            <div
              key={index}
              className={`step-item ${index === currentStep ? 'active' : ''}`}
              onClick={() => handleStepChange(index)}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-type">{trace.type}</span>
              {trace.type === 'assignment' && (
                <span className="step-detail">{trace.variable} = {trace.value}</span>
              )}
              {trace.type === 'method_call' && (
                <span className="step-detail">{trace.methodName}()</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutionTracer;