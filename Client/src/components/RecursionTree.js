import React from 'react';
import './RecursionTree.css';

const RecursionTree = ({ tree }) => {
  const renderNode = (node, depth = 0) => {
    return (
      <div className="tree-node" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="node-header">
          <strong>Method:</strong> {node.method}
        </div>
        <div className="node-content">
          <div>
            <strong>Parameters:</strong>
            <ul>
              {node.parameters.map((param, i) => (
                <li key={i}>{param.type} {param.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Variables:</strong>
            <ul>
              {node.variables.map((variable, i) => (
                <li key={i}>{variable.name}: {variable.value}</li>
              ))}
            </ul>
          </div>
        </div>
        {node.children && node.children.map((child, i) => (
          <div key={i} className="child-node">
            {renderNode(child.node, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="recursion-tree">
      <h3>Recursion Tree Visualization</h3>
      {tree ? renderNode(tree) : <p>No recursion detected</p>}
    </div>
  );
};

export default RecursionTree;