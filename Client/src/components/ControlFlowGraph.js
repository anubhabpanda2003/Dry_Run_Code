import React from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import './ControlFlowGraph.css';

const ControlFlowGraph = ({ flow }) => {
  // Convert control flow analysis to ReactFlow nodes and edges
  const nodes = [
    {
      id: 'start',
      type: 'input',
      data: { label: `Start: ${flow.methodName}` },
      position: { x: 250, y: 0 },
    },
    // Add nodes for each control structure
  ];

  const edges = [
    // Add edges between nodes
  ];

  return (
    <div className="control-flow-graph">
      <h3>Control Flow Graph</h3>
      <div className="graph-container" style={{ height: 500 }}>
        <ReactFlow nodes={nodes} edges={edges} fitView />
      </div>
      <div className="flow-details">
        <h4>Method Details</h4>
        <p><strong>Name:</strong> {flow.methodName}</p>
        <p><strong>Parameters:</strong> {flow.parameters.map(p => `${p.type} ${p.name}`).join(', ')}</p>
        
        <h4>Control Structures</h4>
        {flow.loops.length > 0 && (
          <div className="loops-section">
            <h5>Loops</h5>
            {flow.loops.map((loop, idx) => (
              <div key={idx} className="loop-item">
                <p><strong>{loop.type} loop</strong></p>
                {loop.type === 'for' && (
                  <>
                    <p>Initialization: {loop.initialization.join(', ')}</p>
                    <p>Condition: {loop.condition}</p>
                    <p>Update: {loop.update.join(', ')}</p>
                  </>
                )}
                {loop.type === 'while' && (
                  <p>Condition: {loop.condition}</p>
                )}
                <p>Body statements: {loop.body}</p>
              </div>
            ))}
          </div>
        )}
        
        {flow.conditionals.length > 0 && (
          <div className="conditionals-section">
            <h5>Conditionals</h5>
            {flow.conditionals.map((cond, idx) => (
              <div key={idx} className="conditional-item">
                <p><strong>If:</strong> {cond.condition}</p>
                <p>Then branch: {cond.thenBranch} statements</p>
                {cond.elseBranch > 0 && (
                  <p>Else branch: {cond.elseBranch} statements</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlFlowGraph;