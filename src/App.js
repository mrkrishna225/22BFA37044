import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert, Container } from '@mui/material';
import Results from './Results';
import { log } from './logger';
import './App.css';

const Header = () => {
  const navigate = useNavigate();
  
  const handleHeaderClick = () => {
    navigate('/');
  };

  return (
    <div className="header" onClick={handleHeaderClick} title="Click to go home">
    </div>
  );
};

const URLShortener = () => {
  const [urls, setUrls] = useState(() => JSON.parse(localStorage.getItem('shortUrls') || '[]'));
  const [longUrl, setLongUrl] = useState('');
  const [validity, setValidity] = useState(30);
  const [customCode, setCustomCode] = useState('');
  const [error, setError] = useState('');
  const [recentUrl, setRecentUrl] = useState(null);
  const navigate = useNavigate();

  const validateUrl = (url) => /^https?:\/\/.+\..+/.test(url);
  const generateCode = () => Math.random().toString(36).substr(2, 6);

  const shortenUrl = async () => {
    setError('');
    if (!validateUrl(longUrl)) {
      setError('Please enter a valid URL');
      await log('warn', 'component', 'Invalid URL format provided');
      return;
    }
    if (!Number.isInteger(validity) || validity <= 0) {
      setError('Validity must be a positive integer');
      await log('warn', 'component', 'Invalid validity period provided');
      return;
    }
    
    const code = customCode || generateCode();
    if (urls.some(u => u.code === code)) {
      setError('Shortcode already exists');
      await log('warn', 'component', 'Shortcode collision detected');
      return;
    }
    
    const newUrl = {
      id: Date.now(),
      longUrl,
      code,
      shortUrl: `http://localhost:3000/${code}`,
      created: new Date(),
      expiry: new Date(Date.now() + validity * 60000),
      clicks: 0,
      clickData: []
    };
    
    const updatedUrls = [...urls, newUrl];
    setUrls(updatedUrls);
    localStorage.setItem('shortUrls', JSON.stringify(updatedUrls));
    setRecentUrl(newUrl);
    setLongUrl(''); setCustomCode('');
    await log('info', 'component', `URL shortened: ${code}`);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>URL Shortener</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField label="Long URL" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} fullWidth />
            <TextField label="Validity (minutes)" type="number" value={validity} onChange={(e) => setValidity(parseInt(e.target.value))} />
            <TextField label="Custom Shortcode (optional)" value={customCode} onChange={(e) => setCustomCode(e.target.value)} />
            <Button variant="contained" onClick={shortenUrl}>Shorten URL</Button>
          </Box>
          {recentUrl && (
            <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, mb: 2 }}>
              <Typography variant="h6">Most Recent Short URL:</Typography>
              <Typography>{recentUrl.shortUrl}</Typography>
              <Typography variant="body2">Expires: {recentUrl.expiry.toLocaleString()}</Typography>
            </Box>
          )}
          <Button variant="outlined" onClick={() => navigate('/results')}>View All Results</Button>
        </Box>
      </Container>
    </>
  );
};

const RedirectHandler = () => {
  const { code } = useParams();
  const [urls] = useState(() => JSON.parse(localStorage.getItem('shortUrls') || '[]'));

  useEffect(() => {
    const handleRedirect = async () => {
      const url = urls.find(u => u.code === code && new Date() < new Date(u.expiry));
      if (url) {
        const position = await new Promise(resolve => 
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null))
        );
        const clickData = {
          timestamp: new Date(),
          source: document.referrer || 'direct',
          location: position ? `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}` : 'unknown'
        };
        url.clicks++;
        url.clickData.push(clickData);
        const updatedUrls = urls.map(u => u.id === url.id ? url : u);
        localStorage.setItem('shortUrls', JSON.stringify(updatedUrls));
        await log('info', 'middleware', `Redirect to ${url.longUrl}`);
        window.location.href = url.longUrl;
      } else {
        await log('warn', 'middleware', `Invalid or expired shortcode: ${code}`);
      }
    };
    handleRedirect();
  }, [code, urls]);

  return <Typography>Redirecting...</Typography>;
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<URLShortener />} />
      <Route path="/results" element={<Results />} />
      <Route path="/:code" element={<RedirectHandler />} />
    </Routes>
  </Router>
);

export default App;