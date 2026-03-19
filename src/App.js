import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = 'https://ykls9ozykj.execute-api.us-east-1.amazonaws.com/dev';

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredTerms([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Fetching data from API...');

      const url = `${apiUrl}/get-definition?term=${encodeURIComponent(searchTerm)}`;

      const response = await axios.get(url);

      console.log('API Response:', response.data);

      if (Array.isArray(response.data)) {
        setFilteredTerms(response.data);
      } else if (response.data) {
        setFilteredTerms([response.data]);
      } else {
        setFilteredTerms([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cloud Dictionary</h1>

        <input
          type="text"
          placeholder="Search for a term"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={handleSearch}>
          {loading ? 'Searching...' : 'Search'}
        </button>

        {error && <p className="error">{error}</p>}
      </header>

      <div className="dictionary-container">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((term, index) => (
            <div key={index} className="card">
              <h3>{term.term}</h3>
              <p>{term.definition}</p>
            </div>
          ))
        ) : (
          !loading && <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default App;
