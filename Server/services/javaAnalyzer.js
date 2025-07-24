const { parse, getParser } = require('java-parser');
const { PerformanceObserver, performance } = require('perf_hooks');

// Helper function to safely parse Java code
function parseJavaCode(code) {
  // Normalize line endings and trim whitespace
  const normalizedCode = code.replace(/\r\n/g, '\n').trim();
  
  // Try different parsing strategies
  const strategies = [
    {
      name: 'default',
      parse: () => ({
        success: true,
        result: parse(normalizedCode),
        warnings: []
      }
    )
    },
    {
      name: 'relaxed',
      parse: () => {
        const parser = getParser({
          jsdoc: false,
          ignoreAnnotations: true,
          ignoreModifiers: true,
          strict: false
        });
        return {
          success: true,
          result: parser.parse(normalizedCode),
          warnings: ['Code was parsed in relaxed mode']
        };
      }
    },
    {
      name: 'wrapInClass',
      parse: () => {
        // Try wrapping in a class if it's just a method
        if (!/^\s*(public\s+)?(class|interface|enum|@interface)\s+\w+/.test(normalizedCode)) {
          const wrappedCode = `public class WrapperClass {\n  ${normalizedCode}\n}`;
          return {
            success: true,
            result: parse(wrappedCode),
            wrapped: true,
            warnings: ['Code was automatically wrapped in a class']
          };
        }
        throw new Error('Not a standalone method');
      }
    },
    {
      name: 'wrapInMain',
      parse: () => {
        // Try wrapping in a main method and class
        const wrappedCode = `public class WrapperClass {\n  public static void main(String[] args) {\n    ${normalizedCode}\n  }\n}`;
        return {
          success: true,
          result: parse(wrappedCode),
          wrapped: true,
          warnings: ['Code was automatically wrapped in a main method']
        };
      }
    }
  ];

  let lastError;
  
  for (const strategy of strategies) {
    try {
      console.log(`Trying parsing strategy: ${strategy.name}`);
      const result = strategy.parse();
      console.log(`Success with strategy: ${strategy.name}`);
      return result;
    } catch (error) {
      console.warn(`Strategy ${strategy.name} failed:`, error.message);
      lastError = error;
    }
  }
  
  throw new Error(`All parsing strategies failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Enhanced Java analyzer with proper parsing and execution tracing
exports.analyze = (code) => {
  try {
    console.log('Starting code analysis...');
    const { result: compilationUnit, warnings } = parseJavaCode(code);
    console.log('Parsed compilation unit:', JSON.stringify(compilationUnit, null, 2));
    
    // Extract main class and method with better error handling
    if (!compilationUnit.types || compilationUnit.types.length === 0) {
      // Try to find class declarations in the AST if not in the expected location
      const allNodes = [];
      const collectNodes = (node) => {
        if (!node || typeof node !== 'object') return;
        allNodes.push(node);
        Object.values(node).forEach(value => {
          if (Array.isArray(value)) {
            value.forEach(item => collectNodes(item));
          } else if (value && typeof value === 'object') {
            collectNodes(value);
          }
        });
      };
      
      collectNodes(compilationUnit);
      console.log('All node types found:', [...new Set(allNodes.map(n => n.type))]);
      
      const classNodes = allNodes.filter(n => n.type === 'ClassDeclaration');
      console.log('Found class nodes:', classNodes);
      
      if (classNodes.length === 0) {
        throw new Error('No class or interface found in the provided code');
      }
      
      compilationUnit.types = classNodes;
    }
    
    const mainClass = compilationUnit.types[0];
    console.log('Main class:', mainClass);
    
    // Find all methods in the class
    const methods = [];
    const findMethods = (node) => {
      if (!node) return;
      
      // Check if this node is a method declaration
      if (node.type === 'MethodDeclaration') {
        methods.push(node);
      }
      
      // Recursively search through all object properties
      Object.values(node).forEach(value => {
        if (Array.isArray(value)) {
          value.forEach(item => findMethods(item));
        } else if (value && typeof value === 'object') {
          findMethods(value);
        }
      });
    };
    
    findMethods(mainClass);
    console.log('Found methods:', methods.map(m => m.name));
    
    // Try to find a main method, or fall back to the first method found
    let mainMethod = methods.find(m => m.name === 'main');
    if (!mainMethod && methods.length > 0) {
      mainMethod = methods[0];
      console.log('Using method for analysis:', mainMethod.name);
    }
    
    if (!mainMethod) {
      throw new Error('Could not find any methods to analyze. Please include at least one method.');
    }
    
    // Perform control flow analysis
    const controlFlow = analyzeControlFlow(mainMethod);
    
    // Detect recursion
    const recursionInfo = detectRecursion(mainMethod, compilationUnit);
    
    // Generate execution traces
    const executionTraces = generateExecutionTraces(mainMethod, controlFlow);
    
    // Extract variables and their states
    const variableStates = extractVariableStates(mainMethod, executionTraces);
    
    // Build recursion tree if recursion exists
    const recursionTree = recursionInfo.hasRecursion 
      ? buildRecursionTree(recursionInfo, executionTraces) 
      : null;
    
    return {
      success: true,
      variables: variableStates,
      controlFlow,
      executionTraces,
      hasRecursion: recursionInfo.hasRecursion,
      recursionTree,
      methodCalls: recursionInfo.methodCalls,
      warnings: []
    };
  } catch (error) {
    console.error('Enhanced Java analysis error:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
};

// Enhanced control flow analysis
function analyzeControlFlow(method) {
  const flow = {
    methodName: method.name,
    parameters: method.parameters,
    variables: [],
    loops: [],
    conditionals: [],
    returns: []
  };
  
  // Extract variables
  method.body?.statements?.forEach(statement => {
    if (statement.type === 'VariableDeclaration') {
      flow.variables.push({
        name: statement.name,
        type: statement.type,
        initialValue: statement.initializer ? statement.initializer.toString() : null
      });
    }
  });
  
  // Analyze loops and conditionals
  traverseAST(method.body, {
    visitForStatement(path) {
      const node = path.node;
      flow.loops.push({
        type: 'for',
        initialization: node.initialization.map(init => init.toString()),
        condition: node.condition.toString(),
        update: node.update.map(upd => upd.toString()),
        body: node.body.statements.length
      });
      return false;
    },
    visitWhileStatement(path) {
      const node = path.node;
      flow.loops.push({
        type: 'while',
        condition: node.condition.toString(),
        body: node.body.statements.length
      });
      return false;
    },
    visitIfStatement(path) {
      const node = path.node;
      flow.conditionals.push({
        condition: node.condition.toString(),
        thenBranch: node.thenStatement.statements?.length || 1,
        elseBranch: node.elseStatement?.statements?.length || 0
      });
      return false;
    },
    visitReturnStatement(path) {
      flow.returns.push({
        expression: path.node.expression?.toString() || 'void'
      });
      return false;
    }
  });
  
  return flow;
}

// Enhanced recursion detection
function detectRecursion(method, compilationUnit) {
  const methodCalls = [];
  let hasRecursion = false;
  
  // Find all method calls in the method body
  traverseAST(method.body, {
    visitMethodInvocation(path) {
      const node = path.node;
      methodCalls.push({
        methodName: node.name,
        arguments: node.arguments.map(arg => arg.toString()),
        location: node.loc
      });
      
      // Check if this is a recursive call
      if (node.name === method.name) {
        hasRecursion = true;
      }
      
      return false;
    }
  });
  
  // Check for mutual recursion
  const calledMethods = new Set(methodCalls.map(m => m.methodName));
  for (const methodName of calledMethods) {
    if (methodName !== method.name) {
      const otherMethod = findMethod(compilationUnit, methodName);
      if (otherMethod && methodCallsInMethod(otherMethod, method.name)) {
        hasRecursion = true;
        methodCalls.push({
          methodName: methodName,
          mutualRecursion: true,
          calls: method.name
        });
      }
    }
  }
  
  return {
    hasRecursion,
    methodCalls,
    entryMethod: method.name
  };
}

// Generate execution traces with variable states
function generateExecutionTraces(method, controlFlow) {
  const traces = [];
  const variableMap = {};
  
  // Initialize variables
  controlFlow.variables.forEach(variable => {
    variableMap[variable.name] = {
      ...variable,
      currentValue: variable.initialValue
    };
  });
  
  // Initial state
  traces.push({
    step: 0,
    type: 'initial',
    variables: JSON.parse(JSON.stringify(variableMap)),
    location: method.loc.start
  });
  
  // Simulate execution (simplified - would use interpreter in real implementation)
  let stepCounter = 1;
  
  function processStatement(statement) {
    if (statement.type === 'ExpressionStatement') {
      // Handle assignments
      if (statement.expression.type === 'Assignment') {
        const varName = statement.expression.left.name;
        const newValue = evaluateExpression(statement.expression.right, variableMap);
        
        variableMap[varName].currentValue = newValue;
        
        traces.push({
          step: stepCounter++,
          type: 'assignment',
          variable: varName,
          value: newValue,
          location: statement.loc.start
        });
      }
    } else if (statement.type === 'IfStatement') {
      const conditionResult = evaluateExpression(statement.condition, variableMap);
      
      traces.push({
        step: stepCounter++,
        type: 'if',
        condition: statement.condition.toString(),
        result: conditionResult,
        location: statement.loc.start
      });
      
      if (conditionResult) {
        statement.thenStatement.statements.forEach(processStatement);
      } else if (statement.elseStatement) {
        statement.elseStatement.statements.forEach(processStatement);
      }
    } else if (statement.type === 'ForStatement') {
      // Process initialization
      statement.initialization.forEach(init => {
        if (init.type === 'VariableDeclaration') {
          variableMap[init.name] = {
            name: init.name,
            type: init.type,
            initialValue: init.initializer ? evaluateExpression(init.initializer, variableMap) : null,
            currentValue: init.initializer ? evaluateExpression(init.initializer, variableMap) : null
          };
        } else if (init.type === 'Assignment') {
          const varName = init.left.name;
          const newValue = evaluateExpression(init.right, variableMap);
          variableMap[varName].currentValue = newValue;
        }
      });
      
      traces.push({
        step: stepCounter++,
        type: 'for_init',
        initializations: statement.initialization.map(i => i.toString()),
        variables: JSON.parse(JSON.stringify(variableMap)),
        location: statement.loc.start
      });
      
      // Simulate loop iterations (simplified)
      let iteration = 0;
      const maxIterations = 5; // Safety limit
      
      while (iteration < maxIterations) {
        const conditionResult = evaluateExpression(statement.condition, variableMap);
        
        traces.push({
          step: stepCounter++,
          type: 'for_condition',
          condition: statement.condition.toString(),
          result: conditionResult,
          iteration,
          variables: JSON.parse(JSON.stringify(variableMap)),
          location: statement.loc.start
        });
        
        if (!conditionResult) break;
        
        // Process body
        statement.body.statements.forEach(processStatement);
        
        // Process update
        statement.update.forEach(update => {
          if (update.type === 'Assignment') {
            const varName = update.left.name;
            const newValue = evaluateExpression(update.right, variableMap);
            variableMap[varName].currentValue = newValue;
          }
        });
        
        traces.push({
          step: stepCounter++,
          type: 'for_update',
          updates: statement.update.map(u => u.toString()),
          variables: JSON.parse(JSON.stringify(variableMap)),
          iteration,
          location: statement.loc.start
        });
        
        iteration++;
      }
    } else if (statement.type === 'WhileStatement') {
      let iteration = 0;
      const maxIterations = 5; // Safety limit
      
      while (iteration < maxIterations) {
        const conditionResult = evaluateExpression(statement.condition, variableMap);
        
        traces.push({
          step: stepCounter++,
          type: 'while_condition',
          condition: statement.condition.toString(),
          result: conditionResult,
          iteration,
          variables: JSON.parse(JSON.stringify(variableMap)),
          location: statement.loc.start
        });
        
        if (!conditionResult) break;
        
        // Process body
        statement.body.statements.forEach(processStatement);
        
        iteration++;
      }
    } else if (statement.type === 'MethodInvocation') {
      traces.push({
        step: stepCounter++,
        type: 'method_call',
        methodName: statement.name,
        arguments: statement.arguments.map(arg => ({
          expression: arg.toString(),
          value: evaluateExpression(arg, variableMap)
        })),
        location: statement.loc.start
      });
    } else if (statement.type === 'ReturnStatement') {
      const returnValue = statement.expression 
        ? evaluateExpression(statement.expression, variableMap)
        : undefined;
      
      traces.push({
        step: stepCounter++,
        type: 'return',
        value: returnValue,
        location: statement.loc.start
      });
    }
  }
  
  // Process all statements
  method.body.statements.forEach(processStatement);
  
  return traces;
}

// Helper function to evaluate expressions (simplified)
function evaluateExpression(expr, variables) {
  if (expr.type === 'Literal') {
    return expr.value;
  } else if (expr.type === 'Name') {
    return variables[expr.name]?.currentValue || null;
  } else if (expr.type === 'BinaryExpression') {
    const left = evaluateExpression(expr.left, variables);
    const right = evaluateExpression(expr.right, variables);
    
    switch (expr.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '==': return left == right;
      case '!=': return left != right;
      default: return null;
    }
  }
  return null;
}

// Build detailed recursion tree
function buildRecursionTree(recursionInfo, executionTraces) {
  const tree = {
    node: {
      method: recursionInfo.entryMethod,
      depth: 0,
      variables: {},
      parameters: []
    },
    children: []
  };
  
  // Group traces by recursion depth
  let currentDepth = 0;
  let currentNode = tree;
  const callStack = [];
  
  executionTraces.forEach(trace => {
    if (trace.type === 'method_call' && trace.methodName === recursionInfo.entryMethod) {
      // New recursive call
      const newChild = {
        node: {
          method: trace.methodName,
          depth: currentDepth + 1,
          variables: {},
          parameters: trace.arguments
        },
        children: []
      };
      
      currentNode.children.push(newChild);
      callStack.push(currentNode);
      currentNode = newChild;
      currentDepth++;
    } else if (trace.type === 'return' && currentDepth > 0) {
      // Returning from recursive call
      currentNode.node.returnValue = trace.value;
      currentNode = callStack.pop();
      currentDepth--;
    } else if (trace.variables) {
      // Update current node's variables
      Object.assign(currentNode.node.variables, trace.variables);
    }
  });
  
  return tree;
}

// Helper functions
function traverseAST(node, visitors) {
  const visitorKeys = {
    MethodDeclaration: ['body'],
    BlockStatement: ['statements'],
    ForStatement: ['initialization', 'condition', 'update', 'body'],
    WhileStatement: ['condition', 'body'],
    IfStatement: ['condition', 'thenStatement', 'elseStatement'],
    VariableDeclaration: ['name', 'type', 'initializer'],
    Assignment: ['left', 'right'],
    MethodInvocation: ['name', 'arguments']
  };
  
  function visitNode(path) {
    const visitor = visitors[`visit${path.node.type}`];
    if (visitor && visitor(path)) {
      return;
    }
    
    const keys = visitorKeys[path.node.type] || [];
    keys.forEach(key => {
      const child = path.node[key];
      if (Array.isArray(child)) {
        child.forEach((item, index) => {
          visitNode({
            node: item,
            parent: path.node,
            key,
            index
          });
        });
      } else if (child && typeof child === 'object') {
        visitNode({
          node: child,
          parent: path.node,
          key
        });
      }
    });
  }
  
  visitNode({ node });
}

function findMethod(compilationUnit, methodName) {
  for (const type of compilationUnit.types) {
    if (type.methods) {
      for (const method of type.methods) {
        if (method.name === methodName) {
          return method;
        }
      }
    }
  }
  return null;
}

function methodCallsInMethod(method, targetMethodName) {
  let found = false;
  traverseAST(method.body, {
    visitMethodInvocation(path) {
      if (path.node.name === targetMethodName) {
        found = true;
      }
      return false;
    }
  });
  return found;
}

function extractVariableStates(method, executionTraces) {
  const variables = {};
  
  // Get all variable declarations
  traverseAST(method.body, {
    visitVariableDeclaration(path) {
      variables[path.node.name] = {
        name: path.node.name,
        type: path.node.type,
        initialValue: path.node.initializer ? path.node.initializer.toString() : null,
        values: []
      };
      return false;
    }
  });
  
  // Track value changes through execution traces
  executionTraces.forEach(trace => {
    if (trace.variables) {
      Object.keys(trace.variables).forEach(varName => {
        if (variables[varName]) {
          variables[varName].values.push({
            step: trace.step,
            value: trace.variables[varName].currentValue
          });
        }
      });
    }
  });
  
  return Object.values(variables);
}