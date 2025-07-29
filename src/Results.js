import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Card, CardContent, Link, List, ListItem, ListItemText } from '@mui/material';
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

const Results = () => {
  const [urls] = useState(() => JSON.parse(localStorage.getItem('shortUrls') || '[]'));
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>All Shortened URLs</Typography>
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ mb: 3 }}>Back to Shortener</Button>
        {urls.map(url => (
          <Card key={url.id} sx={{ mb: 2 }}>
            <CardContent>
              <Link href={url.longUrl} target="_blank" variant="h6">{url.shortUrl}</Link>
              <Typography variant="body2">Created: {new Date(url.created).toLocaleString()}</Typography>
              <Typography variant="body2">Expires: {new Date(url.expiry).toLocaleString()}</Typography>
              <Typography variant="body2">Total Clicks: {url.clicks}</Typography>
              <List dense>
                {url.clickData.map((click, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={`${new Date(click.timestamp).toLocaleString()} - ${click.source} - ${click.location}`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
    </>
  );
};

export default Results;