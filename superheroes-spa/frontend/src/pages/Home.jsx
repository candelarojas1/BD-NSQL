import { useState, useEffect } from 'react';
import HeroGrid from '../components/HeroGrid';

const Home = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/heroes')
      .then(res => {
        if (!res.ok) throw new Error('Error fetching heroes');
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
      <h1 className="page-title">Directorio de Superhéroes</h1>
      <HeroGrid heroes={heroes} loading={loading} error={error} />
    </div>
  );
};

export default Home;
