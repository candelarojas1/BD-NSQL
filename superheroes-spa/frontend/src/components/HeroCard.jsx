import { useNavigate } from 'react-router-dom';
import './HeroCard.css';

const HeroCard = ({ hero }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/hero/${hero._id}`);
  };

  const truncatedBio = hero.biography.length > 120 
    ? hero.biography.substring(0, 120) + '...' 
    : hero.biography;

  const mainImage = hero.images && hero.images.length > 0 ? hero.images[0] : '';
  const houseClass = hero.house === 'Marvel' ? 'Marvel' : 'DC';

  return (
    <div className={`hero-card border-${houseClass.toLowerCase()}`} onClick={handleNavigate}>
      <div className="hero-card-image">
        <img src={mainImage} alt={hero.name} loading="lazy" />
        <div className={`hero-badge badge-${houseClass}`}>{hero.house}</div>
      </div>
      <div className="hero-card-content">
        <h3 className="hero-name">{hero.name}</h3>
        {hero.realName && <p className="hero-real-name">{hero.realName}</p>}
        <p className="hero-bio">{truncatedBio}</p>
      </div>
    </div>
  );
};

export default HeroCard;
