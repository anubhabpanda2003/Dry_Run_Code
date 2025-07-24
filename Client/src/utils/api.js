/**
 * API Configuration
 * 
 * This file contains all the API endpoints and utility functions
 * for making HTTP requests to the server.
 */

const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Standardized API request handler
 * @param {string} endpoint - The API endpoint (e.g., '/code/analyze')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Object>} The parsed JSON response
 */
const apiRequest = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || 'Something went wrong');
      error.status = response.status;
      error.details = data.details;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// API Endpoints
export const codeApi = {
  /**
   * Analyze code and generate visualization
   * @param {string} language - The programming language
   * @param {string} code - The source code to analyze
   * @returns {Promise<Object>} Analysis result
   */
  analyze: (language, code) => 
    apiRequest('/code/analyze', {
      method: 'POST',
      body: JSON.stringify({ language, code }),
    }),

  /**
   * Save a code analysis session
   * @param {Object} session - The session data to save
   * @returns {Promise<Object>} The saved session
   */
  saveSession: (session) =>
    apiRequest('/code/save', {
      method: 'POST',
      body: JSON.stringify(session),
    }),

  /**
   * Get all saved sessions
   * @returns {Promise<Array>} Array of saved sessions
   */
  getSessions: () => 
    apiRequest('/code/sessions'),
};

export default {
  code: codeApi,
};