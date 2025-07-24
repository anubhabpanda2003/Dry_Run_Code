import React from 'react';
import './LoopStepDisplay.css';

const LoopStepDisplay = ({ loop }) => {
  return (
    <div className="loop-step-display">
      {loop.type === 'for' && (
        <div>
          <p><strong>Initialization:</strong> {loop.initialization}</p>
          <p><strong>Condition:</strong> {loop.condition}</p>
          <p><strong>Iteration:</strong> {loop.iteration}</p>
        </div>
      )}
      {loop.type === 'while' && (
        <div>
          <p><strong>Condition:</strong> {loop.condition}</p>
        </div>
      )}
    </div>
  );
};

export default LoopStepDisplay;