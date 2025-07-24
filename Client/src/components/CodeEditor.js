import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material/styles';
import debounce from 'lodash/debounce';
import './CodeEditor.css';

const CodeEditor = ({ code, setCode, language }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const editorRef = useRef(null);
  
  // Handle resize events with debounce
  useEffect(() => {
    const handleResize = debounce(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div className="code-editor">
      <h3>Code Editor ({language})</h3>
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={setCode}
        theme={isDark ? 'vs-dark' : 'light'}
        loading={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            background: isDark ? '#1e1e1e' : '#ffffff'
          }}>
            <div>Loading editor...</div>
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          lineNumbersMinChars: 3,
          folding: true,
          lineDecorationsWidth: 10,
          tabSize: 2,
          renderLineHighlight: isDark ? 'line' : 'all',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            arrowSize: 14
          }
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          
          if (isDark) {
            monaco.editor.defineTheme('custom-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: '', background: '1E1E1E' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'keyword', foreground: '569CD6' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'type', foreground: '4EC9B0' },
                { token: 'comment', foreground: '6A9955' },
              ],
              colors: {
                'editor.background': '#1E1E1E',
                'editor.foreground': '#D4D4D4',
                'editor.lineHighlightBackground': '#2D2D2D',
                'editor.lineHighlightBorder': '#2D2D2D',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#CCCCCC',
                'editor.selectionBackground': '#264F78',
                'editor.inactiveSelectionBackground': '#3A3D41',
                'editorIndentGuide.background': '#404040',
                'editorIndentGuide.activeBackground': '#707070',
                'editor.selectionHighlightBorder': '#3A3D41',
              },
            });
            monaco.editor.setTheme('custom-dark');
          }
          
          // Force layout after mount
          requestAnimationFrame(() => {
            editor.layout();
          });
        }}
        onValidate={(markers) => {
          // Handle validation markers if needed
          console.log('Markers:', markers);
        }}
      />
    </div>
  );
};

export default CodeEditor;