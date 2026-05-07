import { useState } from 'react';
import HeroCard from './HeroCard';
import './HeroGrid.css';

const HeroGrid = ({ heroes, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHeroes = heroes.filter(hero => 
    hero.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (hero.realName && hero.realName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="hero-grid-container">
      <div className="hero-grid-actions">
        <input 
          type="text" 
          className="form-control search-input" 
          placeholder="Buscar por nombre o identidad secreta..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <div className="loading-state">Cargando héroes...</div>}
      
      {error && <div className="error-state">{error}</div>}
      
      {!loading && !error && filteredHeroes.length === 0 && (
        <div className="empty-state">
          No se encontraron héroes que coincidan con la búsqueda.
        </div>
      )}

      {!loading && !error && filteredHeroes.length > 0 && (
        <div className="grid grid-cols-2 grid-cols-3 grid-cols-4">
          {filteredHeroes.map(hero => (
            <HeroCard key={hero._id} hero={hero} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroGrid;
