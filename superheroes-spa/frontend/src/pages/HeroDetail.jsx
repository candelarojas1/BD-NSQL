import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import { useToast } from '../components/Toast';
import './HeroDetail.css';

const HeroDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/heroes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Hero not found');
        return res.json();
      })
      .then(data => {
        setHero(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Está seguro de eliminar este héroe?')) {
      try {
        const res = await fetch(`/api/heroes/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        addToast('Héroe eliminado correctamente', 'success');
        navigate('/');
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  if (loading) return <div className="loading-state">Cargando detalles...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!hero) return null;

  const houseClass = hero.house === 'Marvel' ? 'Marvel' : 'DC';

  return (
    <div className="hero-detail-container">
      <div className="hero-detail-header">
        <h1 className="hero-detail-name">{hero.name}</h1>
        <div className={`hero-badge detail-badge badge-${houseClass}`}>{hero.house}</div>
      </div>
      
      <div className="hero-detail-grid">
        <div className="hero-detail-images">
          <Carousel images={hero.images} />
        </div>
        
        <div className="hero-detail-info">
          {hero.realName && (
            <div className="info-block">
              <span className="info-label">Identidad Secreta:</span>
              <span className="info-value">{hero.realName}</span>
            </div>
          )}
          
          <div className="info-block">
            <span className="info-label">Año de Aparición:</span>
            <span className="info-value">{hero.year}</span>
          </div>
          
          {hero.equipment && (
            <div className="info-block">
              <span className="info-label">Equipamiento:</span>
              <span className="info-value">{hero.equipment}</span>
            </div>
          )}
          
          <div className="info-block full">
            <span className="info-label">Biografía:</span>
            <p className="info-value bio-text">{hero.biography}</p>
          </div>
          
          <div className="detail-actions">
            <button className="btn btn-primary" onClick={handleEdit}>Editar Héroe</button>
            <button className="btn btn-outline" style={{borderColor: '#ff1744', color: '#ff1744'}} onClick={handleDelete}>Eliminar</button>
            <button className="btn btn-outline" onClick={() => navigate(-1)}>Volver</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDetail;
