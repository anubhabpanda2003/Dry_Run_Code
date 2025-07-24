import React from 'react';
import { Tree } from 'react-tree-graph';
import './RecursionTreeVisualizer.css';

const RecursionTreeVisualizer = ({ tree }) => {
  // Convert our recursion tree to the format expected by react-tree-graph
  const convertToTreeData = (node) => {
    return {
      name: `Call #${node.depth}`,
      children: node.children.map(convertToTreeData),
      gProps: {
        className: 'recursion-node',
        onClick: () => console.log('Node clicked:', node)
      },
      customData: node
    };
  };

  const treeData = convertToTreeData(tree);

  return (
    <div className="recursion-tree-visualizer">
      <h3>Recursion Tree Visualization</h3>
      <div className="tree-container">
        <Tree
          data={treeData}
          height={500}
          width={800}
          svgProps={{
            className: 'recursion-tree'
          }}
          textProps={{
            className: 'node-text'
          }}
        />
      </div>
      <div className="node-details">
        <h4>Node Details</h4>
        <div className="details-content">
          {/* Details will be populated when nodes are clicked */}
        </div>
      </div>
    </div>
  );
};

export default RecursionTreeVisualizer;