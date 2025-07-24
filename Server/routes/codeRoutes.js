const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');

// Analyze code and generate dry run visualization
router.post('/analyze', codeController.analyzeCode);

// Save dry run session
router.post('/save', codeController.saveSession);

// Get saved sessions
router.get('/sessions', codeController.getSessions);

module.exports = router;