import React from 'react';
import './VariableTimeline.css';

const VariableTimeline = ({ variables }) => {
  return (
    <div className="variable-timeline">
      <h3>Variable State Timeline</h3>
      <div className="timeline-container">
        {variables.map(variable => (
          <div key={variable.name} className="variable-track">
            <div className="variable-header">
              <span className="var-name">{variable.name}</span>
              <span className="var-type">{variable.type}</span>
            </div>
            <div className="value-changes">
              {variable.values.map((value, idx) => (
                <div key={idx} className="value-change">
                  <span className="step">Step {value.step}:</span>
                  <span className="value">{String(value.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariableTimeline;