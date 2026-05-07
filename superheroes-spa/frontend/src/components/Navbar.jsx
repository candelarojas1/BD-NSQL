import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-logo">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4fc3f7" />
            <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="brand-text">SUPERHEROESDB</span>
        </Link>

        <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        </div>

        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          <li>
            <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} end onClick={() => setIsOpen(false)}>Todos</NavLink>
          </li>
          <li>
            <NavLink to="/marvel" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsOpen(false)}>Marvel</NavLink>
          </li>
          <li>
            <NavLink to="/dc" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsOpen(false)}>DC</NavLink>
          </li>
          <li>
            <Link to="/new" className="btn btn-primary nav-btn" onClick={() => setIsOpen(false)}>
              + Agregar Héroe
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
