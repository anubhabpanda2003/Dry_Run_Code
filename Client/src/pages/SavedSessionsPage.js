import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './SavedSessionsPage.css';

const SavedSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('/api/code/sessions');
        setSessions(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="saved-sessions">
      <h2>Saved Sessions</h2>
      {sessions.length === 0 ? (
        <p>No saved sessions found</p>
      ) : (
        <ul className="session-list">
          {sessions.map(session => (
            <li key={session._id} className="session-item">
              <Link to={`/?load=${session._id}`}>
                <h3>{session.name}</h3>
                <p>{new Date(session.createdAt).toLocaleString()}</p>
                <p>Language: {session.language}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedSessionsPage;