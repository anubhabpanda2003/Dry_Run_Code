/**
 * Enhanced In-Memory Database Service
 * 
 * Features:
 * - Key-value store with TTL support
 * - Automatic cleanup of expired sessions
 * - Statistics tracking
 * - Debug logging in development
 */

class InMemoryDB {
  constructor() {
    this.sessions = new Map();
    this.ttlMap = new Map();
    this.currentId = 1;
    this.stats = {
      totalSessions: 0,
      activeSessions: 0,
      expiredSessions: 0,
      lastCleanup: null,
      lastError: null,
    };
    
    // Start cleanup interval (runs every hour)
    this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 60 * 60 * 1000);
    
    // Clean up on process exit
    process.on('exit', () => this.shutdown());
    
    // Handle other termination signals
    process.on('SIGINT', () => process.exit());
    process.on('SIGTERM', () => process.exit());
  }

  /**
   * Generate a unique ID for new sessions
   * @private
   */
  _generateId() {
    return `sess_${Date.now()}_${this.currentId++}`;
  }

  /**
   * Save a session to the database
   * @param {Object} sessionData - The session data to save
   * @param {number} [ttl] - Optional time-to-live in milliseconds
   * @returns {Promise<Object>} The saved session with ID and timestamps
   */
  /**
   * Clean up expired sessions and their timeouts
   * @private
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt && session.expiresAt <= now) {
        this.sessions.delete(id);
        this.ttlMap.delete(id);
        cleaned++;
      }
    }
    
    this.stats.lastCleanup = new Date();
    this.stats.expiredSessions += cleaned;
    
    if (process.env.NODE_ENV === 'development' && cleaned > 0) {
      console.log(`[MockDB] Cleaned up ${cleaned} expired sessions`);
    }
    
    return cleaned;
  }
  
  /**
   * Gracefully shut down the database
   */
  shutdown() {
    clearInterval(this.cleanupInterval);
    
    // Clear all timeouts
    for (const timeout of this.ttlMap.values()) {
      clearTimeout(timeout);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[MockDB] Database shut down');
    }
  }
  
  async save(sessionData, ttl) {
    const sessionId = this._generateId();
    const now = new Date();
    const expiresAt = ttl ? new Date(now.getTime() + ttl) : null;
    
    const session = {
      ...sessionData,
      _id: sessionId,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      ttl: ttl || null
    };

    this.sessions.set(sessionId, session);
    this.stats.totalSessions++;
    this.stats.activeSessions = this.sessions.size;

    // Set TTL if provided
    if (ttl && typeof ttl === 'number') {
      const timeout = setTimeout(() => {
        if (this.sessions.has(sessionId)) {
          this.sessions.delete(sessionId);
          this.ttlMap.delete(sessionId);
          this.stats.activeSessions = this.sessions.size;
          this.stats.expiredSessions++;
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[MockDB] Session ${sessionId} expired`);
          }
        }
      }, ttl);
      
      this.ttlMap.set(sessionId, timeout);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MockDB] Session ${sessionId} saved`);
    }

    return { ...session };
  }

  /**
   * Find all sessions, sorted by creation date (newest first)
   * @returns {Promise<Array>} Array of sessions
   */
  async findAll() {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Find a session by ID
   * @param {string} id - The session ID
   * @returns {Promise<Object|null>} The session or null if not found
   */
  async findById(id) {
    return this.sessions.get(id) || null;
  }

  /**
   * Update a session
   * @param {string} id - The session ID
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object|null>} The updated session or null if not found
   */
  async update(id, updates) {
    if (!this.sessions.has(id)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MockDB] Update failed: Session ${id} not found`);
      }
      return null;
    }

    const now = new Date();
    const existingSession = this.sessions.get(id);
    
    // Preserve metadata that shouldn't be updated
    const { _id, createdAt, ...safeUpdates } = updates;
    
    const session = {
      ...existingSession,
      ...safeUpdates,
      updatedAt: now,
      _id: existingSession._id, // Ensure ID doesn't change
      createdAt: existingSession.createdAt, // Preserve original creation time
    };

    this.sessions.set(id, session);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MockDB] Session ${id} updated`);
    }
    
    return { ...session };
  }

  /**
   * Delete a session
   * @param {string} id - The session ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    if (this.sessions.has(id)) {
      this.sessions.delete(id);
      
      // Clear any TTL timeout
      if (this.ttlMap.has(id)) {
        clearTimeout(this.ttlMap.get(id));
        this.ttlMap.delete(id);
      }
      
      this.stats.activeSessions = this.sessions.size;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MockDB] Session ${id} deleted`);
      }
      
      return true;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MockDB] Delete failed: Session ${id} not found`);
    }
    
    return false;
  }

  /**
   * Clear all sessions (for testing)
   */
  clear() {
    // Clear all TTL timeouts
    for (const timeout of this.ttlMap.values()) {
      clearTimeout(timeout);
    }
    
    this.sessions.clear();
    this.ttlMap.clear();
    this.currentId = 1;
  }

  /**
   * Get the total number of sessions
   * @returns {number} The count of sessions
   */
  /**
   * Get database statistics
   * @returns {Object} Database statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeSessions: this.sessions.size,
      sessionsWithTTL: this.ttlMap.size,
      lastUpdated: new Date()
    };
  }
  
  /**
   * Get the number of active sessions
   * @returns {number} Number of active sessions
   */
  get size() {
    return this.sessions.size;
  }
  
  /**
   * Get all session IDs
   * @returns {Array<string>} Array of session IDs
   */
  getSessionIds() {
    return Array.from(this.sessions.keys());
  }
  
  /**
   * Get all sessions (for debugging/administration)
   * @returns {Array<Object>} Array of all sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.values());
  }
}

// Export a singleton instance
module.exports = new InMemoryDB();
