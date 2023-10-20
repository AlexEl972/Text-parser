import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [text, setText] = useState('');
  const [showTokenForm, setShowTokenForm] = useState(false);

  useEffect(() => {
    if (token) {
      setShowTokenForm(false);
    } else {
      setShowTokenForm(true);
    }
  }, [token]);

  const generateToken = () => {
    axios.post('http://localhost:3000/api/token', { email })
      .then(response => {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      })
      .catch(error => console.error('Erreur:', error));
  };

  const sendText = () => {
    axios.post('http://localhost:3000/api/justify', text, {
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => console.error('Erreur:', error));
  };

  return (
    <div className="App">
      {showTokenForm ? (
        <div>
          <h2>Générer un token</h2>
          <label>Email:</label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={generateToken}>Générer</button>
        </div>
      ) : (
        <div>
          <h2>Envoyer du texte à l'API</h2>
          <label>Texte:</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={sendText}>Envoyer</button>
        </div>
      )}
    </div>
  );
}

export default App;
