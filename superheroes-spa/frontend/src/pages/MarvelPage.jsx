import { useState, useEffect } from 'react';
import HeroGrid from '../components/HeroGrid';

const MarvelPage = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/heroes/house/marvel')
      .then(res => {
        if (!res.ok) throw new Error('Error fetching Marvel heroes');
        return res.json();
      })
      .then(data => {
        setHeroes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title marvel-title">Universo Marvel</h1>
      <HeroGrid heroes={heroes} loading={loading} error={error} />
    </div>
  );
};

export default MarvelPage;
