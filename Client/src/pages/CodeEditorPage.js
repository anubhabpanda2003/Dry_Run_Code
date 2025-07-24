import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Button, Select, MenuItem, TextField, Paper, Typography, CircularProgress, Alert, Snackbar, Tabs, Tab, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AnalyzeModeSelector from '../components/AnalyzeModeSelector';
import WhiteBoard from '../components/WhiteBoard';
import CodeEditor from '../components/CodeEditor';
import VisualizationPanel from '../components/VisualizationPanel';
import RecursionTree from '../components/RecursionTree';
import StepControls from '../components/StepControls';
import './CodeEditorPage.css';

const CodeEditorPage = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionName, setSessionName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [analyzeMode, setAnalyzeMode] = useState(null);
  const [analyzeSubMode, setAnalyzeSubMode] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');

  const analyzeCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }
    
    if (!analyzeMode) {
      setError('Please select an analyze mode first');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      console.log('Sending analysis request...');
      const response = await axios.post('http://localhost:5001/api/code/analyze', { 
        language: language.toLowerCase(), 
        code: code.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Analysis response:', response.data);
      
      if (!response.data) {
        throw new Error('Empty response from server');
      }
      
      if (response.data.success === false) {
        throw new Error(response.data.error || 'Analysis failed');
      }
      
      const analysisData = response.data.data || response.data;
      
      if (!analysisData) {
        throw new Error('No analysis data received');
      }
      
      setAnalysis({
        ...analysisData,
        steps: analysisData.executionTraces || analysisData.steps || [],
        variables: analysisData.variableStates || analysisData.variables || {}
      });
      
      setCurrentStep(0);
      
      // Log success
      console.log('Analysis completed successfully');
      
    } catch (err) {
      console.error('Detailed analysis error:', {
        message: err.message,
        response: err.response?.data,
        code: err.code,
        stack: err.stack
      });
      
      let errorMessage = 'Failed to analyze code';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.error || 
                      err.response.data?.message || 
                      `Server error: ${err.response.status} ${err.response.statusText}`;
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check if the server is running.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The server is taking too long to respond.';
      }
      
      setError(errorMessage);
      
      // Show error in console for debugging
      console.error('Analysis error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [code, language]);

  const saveSession = async () => {
    if (!sessionName.trim()) {
      setError('Please provide a session name');
      return;
    }
    
    if (!analysis) {
      setError('Please analyze the code first');
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/code/save', {
        name: sessionName,
        code,
        language,
        analysis
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setSessionName('');
      setError(null);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Session saved successfully!',
        severity: 'success'
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save session';
      setError(errorMessage);
      console.error('Save error:', err);
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleStepChange = useCallback((step) => {
    if (analysis?.steps && step >= 0 && step < analysis.steps.length) {
      setCurrentStep(step);
    }
  }, [analysis]);
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box className="code-editor-page" sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
            disabled={loading}
          >
            <MenuItem value="java">Java</MenuItem>
          </Select>
          
          <AnalyzeModeSelector 
            onModeSelect={(mode, subMode) => {
              setAnalyzeMode(mode);
              setAnalyzeSubMode(subMode);
              setActiveTab('analysis'); // Reset to analysis tab when mode changes
            }}
            currentMode={analyzeMode}
            currentSubMode={analyzeSubMode}
          />
          
          <Button 
            variant="contained" 
            onClick={analyzeCode} 
            disabled={loading || !analyzeMode}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ ml: 1 }}
          >
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </Button>
          
          {analyzeMode === 'manual' && analyzeSubMode && (
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
              <ToggleButtonGroup
                value={activeTab}
                exclusive
                onChange={(e, newValue) => newValue && setActiveTab(newValue)}
                aria-label="view mode"
                size="small"
                sx={{ ml: 2 }}
              >
                <ToggleButton value="analysis" aria-label="analysis view">
                  Analysis
                </ToggleButton>
                <ToggleButton value="whiteboard" aria-label="whiteboard view">
                  WhiteBoard
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </Box>
        
        <TextField
          size="small"
          label="Session Name"
          variant="outlined"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          disabled={loading || !analysis}
          sx={{ flexGrow: 1, maxWidth: 300 }}
        />
        
        <Button 
          variant="outlined" 
          onClick={saveSession} 
          disabled={!analysis || loading}
        >
          Save Session
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, minHeight: 0 }}>
        {/* Left side - Always show code editor */}
        <Box sx={{ 
          width: '50%',
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0,
          borderRight: '1px solid #ddd',
          pr: 1
        }}>
          <CodeEditor 
            code={code} 
            setCode={setCode} 
            language={language} 
            style={{ height: '100%' }}
          />
        </Box>
        
        {/* Right side - Analysis or WhiteBoard */}
        <Box sx={{ 
          width: '50%',
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0,
          pl: 1
        }}>
          {analyzeMode === 'manual' && analyzeSubMode && activeTab === 'whiteboard' ? (
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #ddd',
              borderRadius: 1,
              overflow: 'hidden',
              height: '100%'
            }}>
              <WhiteBoard />
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              bgcolor: 'background.paper',
              borderRadius: 1,
              p: 3
            }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>Analyzing code...</Typography>
            </Box>
          ) : analysis ? (
            <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <StepControls
                currentStep={currentStep}
                totalSteps={analysis.steps.length}
                onStepChange={handleStepChange}
                disabled={loading}
              />
              
              <Box sx={{ flexGrow: 1, overflow: 'auto', mt: 2 }}>
                <VisualizationPanel 
                  step={analysis.steps[currentStep]} 
                  variables={analysis.variables} 
                />
                
                {analysis.recursionTree && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>Recursion Tree</Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <RecursionTree data={analysis.recursionTree} />
                    </Paper>
                  </Box>
                )}
              </Box>
            </Paper>
          ) : (
            <Paper 
              elevation={3} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.default'
              }}
            >
              <Box>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No Analysis Yet
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Enter your code and click "Analyze" to see the visualization
                </Typography>
              </Box>
            </Paper>
          )}
            </Box>
          )}
        </Box>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CodeEditorPage;