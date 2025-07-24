import React from 'react';
import './VariableDisplay.css';

const VariableDisplay = ({ variables }) => {
  return (
    <div className="variable-display">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {variables.map((variable, index) => (
            <tr key={index}>
              <td>{variable.name}</td>
              <td>{variable.type}</td>
              <td>{variable.currentValue !== null ? variable.currentValue.toString() : 'null'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VariableDisplay;