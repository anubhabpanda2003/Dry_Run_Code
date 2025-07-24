import React, { useState, useRef, useEffect } from 'react';
import './WhiteBoard.css';

const Whiteboard = () => {
  // State for whiteboard elements
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [theme, setTheme] = useState('light');
  const [textInput, setTextInput] = useState('');
  const [activeElement, setActiveElement] = useState(null);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [selectedCell, setSelectedCell] = useState(null);
  
  const whiteboardRef = useRef(null);

  // Save to history
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, elements.map(el => ({...el}))]);
    setHistoryIndex(newHistory.length);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1].map(el => ({...el})));
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1].map(el => ({...el})));
    }
  };

  // Get coordinates (handles both mouse and touch events)
  const getCoordinates = (e) => {
    const rect = whiteboardRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  // Start drawing
  const startDrawing = (e) => {
    e.preventDefault();
    const { offsetX, offsetY } = getCoordinates(e);
    
    if (tool === 'pen') {
      setElements([...elements, {
        type: 'path',
        points: [{ x: offsetX, y: offsetY }],
        color,
        id: Date.now()
      }]);
      setIsDrawing(true);
    } else if (tool === 'line') {
      setElements([...elements, {
        type: 'line',
        start: { x: offsetX, y: offsetY },
        end: { x: offsetX, y: offsetY },
        color,
        id: Date.now()
      }]);
      setIsDrawing(true);
    } else if (tool === 'rectangle') {
      setElements([...elements, {
        type: 'rectangle',
        x: offsetX,
        y: offsetY,
        width: 0,
        height: 0,
        color,
        id: Date.now()
      }]);
      setIsDrawing(true);
    } else if (tool === 'circle') {
      setElements([...elements, {
        type: 'circle',
        x: offsetX,
        y: offsetY,
        radius: 0,
        color,
        id: Date.now()
      }]);
      setIsDrawing(true);
    } else if (tool === 'text') {
      setElements([...elements, {
        type: 'text',
        x: offsetX,
        y: offsetY,
        content: '',
        color,
        id: Date.now(),
        isEditing: true
      }]);
      setTextInput('');
      setActiveElement(elements.length);
    } else if (tool === 'sticky') {
      setElements([...elements, {
        type: 'sticky',
        x: offsetX,
        y: offsetY,
        width: 200,
        height: 150,
        color: '#ffff88',
        content: '',
        id: Date.now(),
        isEditing: true
      }]);
      setActiveElement(elements.length);
      setTextInput('');
    } else if (tool === 'table') {
      setElements([...elements, {
        type: 'table',
        x: offsetX,
        y: offsetY,
        rows: tableRows,
        cols: tableCols,
        cellWidth: 60,
        cellHeight: 30,
        color,
        cells: Array(tableRows * tableCols).fill(''),
        id: Date.now()
      }]);
    }
  };

  // Drawing
  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const { offsetX, offsetY } = getCoordinates(e);
    const lastElementIndex = elements.length - 1;
    const lastElement = elements[lastElementIndex];
    
    // Ensure coordinates stay within bounds
    const boundedX = Math.max(0, Math.min(offsetX, whiteboardRef.current.offsetWidth));
    const boundedY = Math.max(0, Math.min(offsetY, whiteboardRef.current.offsetHeight));
    
    if (tool === 'pen') {
      const updatedElement = {
        ...lastElement,
        points: [...lastElement.points, { x: boundedX, y: boundedY }]
      };
      const newElements = [...elements];
      newElements[lastElementIndex] = updatedElement;
      setElements(newElements);
    } else if (tool === 'line') {
      const updatedElement = {
        ...lastElement,
        end: { x: boundedX, y: boundedY }
      };
      const newElements = [...elements];
      newElements[lastElementIndex] = updatedElement;
      setElements(newElements);
    } else if (tool === 'rectangle') {
      const updatedElement = {
        ...lastElement,
        width: boundedX - lastElement.x,
        height: boundedY - lastElement.y
      };
      const newElements = [...elements];
      newElements[lastElementIndex] = updatedElement;
      setElements(newElements);
    } else if (tool === 'circle') {
      const dx = boundedX - lastElement.x;
      const dy = boundedY - lastElement.y;
      const updatedElement = {
        ...lastElement,
        radius: Math.sqrt(dx * dx + dy * dy)
      };
      const newElements = [...elements];
      newElements[lastElementIndex] = updatedElement;
      setElements(newElements);
    }
  };

  // Stop drawing
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  // Handle text input
  const handleTextSubmit = (e) => {
    if (e.key === 'Enter' && activeElement !== null) {
      const newElements = [...elements];
      newElements[activeElement].content = textInput;
      newElements[activeElement].isEditing = false;
      setElements(newElements);
      setActiveElement(null);
      saveToHistory();
    }
  };

  // Handle sticky note text
  const handleStickySubmit = (e) => {
    if (e.key === 'Enter' && activeElement !== null) {
      const newElements = [...elements];
      newElements[activeElement].content = textInput;
      newElements[activeElement].isEditing = false;
      setElements(newElements);
      setActiveElement(null);
      saveToHistory();
    }
  };

  // Handle table cell click
  const handleTableCellClick = (elementIndex, cellIndex) => {
    setActiveElement(elementIndex);
    setSelectedCell(cellIndex);
    const element = elements[elementIndex];
    setTextInput(element.cells[cellIndex] || '');
  };

  // Handle table cell text change
  const handleTableCellChange = (e) => {
    if (activeElement !== null && selectedCell !== null) {
      const newElements = [...elements];
      const element = newElements[activeElement];
      element.cells[selectedCell] = e.target.value;
      setElements(newElements);
      setTextInput(e.target.value);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Render elements
  const renderElements = () => {
    return elements.map((element, index) => {
      switch (element.type) {
        case 'path':
          return (
            <svg key={element.id} className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <path
                d={`M ${element.points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke={element.color}
                strokeWidth="2"
              />
            </svg>
          );
        case 'line':
          return (
            <svg key={element.id} className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <line
                x1={element.start.x}
                y1={element.start.y}
                x2={element.end.x}
                y2={element.end.y}
                stroke={element.color}
                strokeWidth="2"
              />
            </svg>
          );
        case 'rectangle':
          return (
            <svg key={element.id} className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <rect
                x={Math.min(element.x, element.x + element.width)}
                y={Math.min(element.y, element.y + element.height)}
                width={Math.abs(element.width)}
                height={Math.abs(element.height)}
                stroke={element.color}
                strokeWidth="2"
                fill="transparent"
              />
            </svg>
          );
        case 'circle':
          return (
            <svg key={element.id} className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <circle
                cx={element.x}
                cy={element.y}
                r={element.radius}
                stroke={element.color}
                strokeWidth="2"
                fill="transparent"
              />
            </svg>
          );
        case 'text':
          return element.isEditing ? (
            <input
              key={element.id}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleTextSubmit}
              onBlur={() => {
                const newElements = [...elements];
                newElements[index].content = textInput;
                newElements[index].isEditing = false;
                setElements(newElements);
                setActiveElement(null);
                saveToHistory();
              }}
              style={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                color: element.color,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: 'Arial',
                zIndex: 10
              }}
              autoFocus
            />
          ) : (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                color: element.color,
                fontSize: '16px',
                fontFamily: 'Arial',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
              onClick={() => {
                const newElements = [...elements];
                newElements[index].isEditing = true;
                setElements(newElements);
                setActiveElement(index);
                setTextInput(element.content);
              }}
            >
              {element.content}
            </div>
          );
        case 'sticky':
          return element.isEditing ? (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                backgroundColor: element.color,
                boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                padding: '8px',
                zIndex: 10
              }}
            >
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleStickySubmit}
                onBlur={() => {
                  const newElements = [...elements];
                  newElements[index].content = textInput;
                  newElements[index].isEditing = false;
                  setElements(newElements);
                  setActiveElement(null);
                  saveToHistory();
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'Arial'
                }}
                autoFocus
              />
            </div>
          ) : (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                backgroundColor: element.color,
                boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                padding: '8px',
                cursor: 'pointer',
                overflow: 'hidden',
                wordWrap: 'break-word'
              }}
              onClick={() => {
                const newElements = [...elements];
                newElements[index].isEditing = true;
                setElements(newElements);
                setActiveElement(index);
                setTextInput(element.content);
              }}
            >
              {element.content}
            </div>
          );
        case 'table':
          return (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                border: `1px solid ${element.color}`,
                zIndex: 5,
                backgroundColor: 'white'
              }}
            >
              <table
                style={{
                  borderCollapse: 'collapse'
                }}
              >
                <tbody>
                  {Array.from({ length: element.rows }).map((_, row) => (
                    <tr key={row}>
                      {Array.from({ length: element.cols }).map((_, col) => (
                        <td
                          key={col}
                          style={{
                            width: `${element.cellWidth}px`,
                            height: `${element.cellHeight}px`,
                            border: `1px solid ${element.color}`,
                            padding: '4px',
                            backgroundColor: activeElement === index && selectedCell === row * element.cols + col 
                              ? 'rgba(0,0,0,0.1)' 
                              : 'white',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleTableCellClick(index, row * element.cols + col)}
                        >
                          {element.cells[row * element.cols + col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {activeElement === index && selectedCell !== null && (
                <input
                  type="text"
                  value={textInput}
                  onChange={handleTableCellChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setActiveElement(null);
                      setSelectedCell(null);
                    }
                  }}
                  onBlur={() => {
                    setActiveElement(null);
                    setSelectedCell(null);
                    saveToHistory();
                  }}
                  style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '0',
                    zIndex: 10
                  }}
                  autoFocus
                />
              )}
            </div>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className={`whiteboard-container ${theme}`}>
      <div className="toolbar">
        <button onClick={() => setTool('pen')} className={tool === 'pen' ? 'active' : ''}>Pen</button>
        <button onClick={() => setTool('line')} className={tool === 'line' ? 'active' : ''}>Line</button>
        <button onClick={() => setTool('rectangle')} className={tool === 'rectangle' ? 'active' : ''}>Rectangle</button>
        <button onClick={() => setTool('circle')} className={tool === 'circle' ? 'active' : ''}>Circle</button>
        <button onClick={() => setTool('text')} className={tool === 'text' ? 'active' : ''}>Text</button>
        <button onClick={() => setTool('sticky')} className={tool === 'sticky' ? 'active' : ''}>Sticky Note</button>
        <button onClick={() => setTool('table')} className={tool === 'table' ? 'active' : ''}>Table</button>
        
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        
        <div className="table-controls" style={{ display: tool === 'table' ? 'flex' : 'none' }}>
          <label>Rows:</label>
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={tableRows} 
            onChange={(e) => setTableRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 2)))} 
          />
          <label>Columns:</label>
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={tableCols} 
            onChange={(e) => setTableCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 2)))} 
          />
        </div>
        
        <button onClick={undo} disabled={historyIndex <= 0}>Undo</button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1}>Redo</button>
        
        <button onClick={toggleTheme}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
      
      <div 
        ref={whiteboardRef}
        className={`whiteboard ${theme}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      >
        {renderElements()}
      </div>
    </div>
  );
};

export default Whiteboard;