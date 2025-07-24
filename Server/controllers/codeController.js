const javaAnalyzer = require('../services/javaAnalyzer');
const db = require('../services/mockDb');

// Session TTL (24 hours in milliseconds)
const SESSION_TTL = 24 * 60 * 60 * 1000;

/**
 * Validates the required fields in the request body
 * @param {Object} body - The request body
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
const validateRequest = (body, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Analyzes the provided code and returns the analysis result
 * @route POST /api/code/analyze
 * @param {string} req.body.language - The programming language of the code
 * @param {string} req.body.code - The code to analyze
 * @returns {Object} The analysis result
 */
exports.analyzeCode = async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('Received analysis request');
    const { language, code } = req.body;
    
    // Validate request
    if (!language || !code) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: language and code are required',
        timestamp: new Date().toISOString()
      });
    }
    
    if (typeof language !== 'string' || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input types: language and code must be strings',
        timestamp: new Date().toISOString()
      });
    }
    
    const normalizedLanguage = language.toLowerCase().trim();
    
    if (normalizedLanguage !== 'java') {
      return res.status(400).json({ 
        success: false,
        error: 'Unsupported language',
        details: 'Only Java is supported currently',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!code.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Empty code',
        details: 'Please provide some code to analyze',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Starting code analysis...');
    // Analyze the code
    const analysisResult = javaAnalyzer.analyze(code);
    
    if (!analysisResult || analysisResult.success === false) {
      throw new Error(analysisResult?.error || 'Analysis returned no results');
    }
    
    console.log('Analysis completed successfully');
    
    const response = {
      success: true,
      data: {
        ...analysisResult,
        metadata: {
          language: normalizedLanguage,
          analysisTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error analyzing code:', {
      error: error.message,
      stack: error.stack,
      request: {
        body: req.body,
        headers: req.headers
      }
    });
    
    const statusCode = error.statusCode || 500;
    const errorResponse = {
      success: false,
      error: error.message || 'Failed to analyze code',
      timestamp: new Date().toISOString()
    };
    
    // Add more details in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        stack: error.stack,
        code: error.code,
        type: error.name
      };
    }
    
    res.status(statusCode).json(errorResponse);
  }
};

/**
 * Saves a code analysis session
 * @route POST /api/code/save
 * @param {string} req.body.name - The name of the session
 * @param {string} req.body.code - The code being analyzed
 * @param {string} req.body.language - The programming language
 * @param {Object} req.body.analysis - The analysis result
 * @returns {Object} The saved session data
 */
exports.saveSession = async (req, res) => {
  try {
    const { name, code, language, analysis } = req.body;
    
    // Validate request
    const validation = validateRequest(
      req.body, 
      ['name', 'code', 'language', 'analysis']
    );
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        error: validation.error,
        timestamp: new Date().toISOString()
      });
    }
    
    // Create session data
    const sessionData = {
      name: name.trim(),
      code,
      language: language.toLowerCase(),
      analysis,
      metadata: {
        codeLength: code.length,
        analysisTimestamp: new Date().toISOString()
      }
    };
    
    // Save to database with 24-hour TTL
    const newSession = await db.save(sessionData, SESSION_TTL);
    
    res.status(201).json({
      success: true,
      data: newSession,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Retrieves all saved code analysis sessions
 * @route GET /api/code/sessions
 * @returns {Array} Array of saved sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const sessions = await db.findAll();
    
    res.json({
      success: true,
      data: sessions,
      count: sessions.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve sessions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};