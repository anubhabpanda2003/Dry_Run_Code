import React, { useState } from 'react';
import VariableTimeline from './VariableTimeline';
import ControlFlowGraph from './ControlFlowGraph';
import RecursionTreeVisualizer from './RecursionTreeVisualizer';
import ExecutionTracer from './ExecutionTracer';
import './EnhancedVisualizationPanel.css';

const EnhancedVisualizationPanel = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState('execution');
  
  if (!analysis || !analysis.success) {
    return (
      <div className="visualization-error">
        {analysis?.error || 'No analysis data available'}
      </div>
    );
  }

  return (
    <div className="enhanced-visualization">
      <div className="visualization-tabs">
        <button 
          className={activeTab === 'execution' ? 'active' : ''}
          onClick={() => setActiveTab('execution')}
        >
          Execution Trace
        </button>
        <button 
          className={activeTab === 'variables' ? 'active' : ''}
          onClick={() => setActiveTab('variables')}
        >
          Variables
        </button>
        <button 
          className={activeTab === 'controlflow' ? 'active' : ''}
          onClick={() => setActiveTab('controlflow')}
        >
          Control Flow
        </button>
        {analysis.hasRecursion && (
          <button 
            className={activeTab === 'recursion' ? 'active' : ''}
            onClick={() => setActiveTab('recursion')}
          >
            Recursion Tree
          </button>
        )}
      </div>
      
      <div className="visualization-content">
        {activeTab === 'execution' && (
          <ExecutionTracer traces={analysis.executionTraces} />
        )}
        
        {activeTab === 'variables' && (
          <VariableTimeline variables={analysis.variables} />
        )}
        
        {activeTab === 'controlflow' && (
          <ControlFlowGraph flow={analysis.controlFlow} />
        )}
        
        {activeTab === 'recursion' && analysis.hasRecursion && (
          <RecursionTreeVisualizer tree={analysis.recursionTree} />
        )}
      </div>
    </div>
  );
};

export default EnhancedVisualizationPanel;