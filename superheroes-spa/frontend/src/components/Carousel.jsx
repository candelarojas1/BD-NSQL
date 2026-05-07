import { useState } from 'react';
import './Carousel.css';

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="carousel single">
        <img src={images[0]} alt="Hero detail view" />
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="carousel">
      <div 
        className="carousel-inner" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="carousel-item">
            <img src={img} alt={`Carousel view ${idx + 1}`} />
          </div>
        ))}
      </div>
      
      <div className="carousel-control prev" onClick={prevSlide}>&#10094;</div>
      <div className="carousel-control next" onClick={nextSlide}>&#10095;</div>

      <div className="carousel-indicators">
        {images.map((_, slideIndex) => (
          <div
            key={slideIndex}
            className={`carousel-dot ${currentIndex === slideIndex ? 'active' : ''}`}
            onClick={() => goToSlide(slideIndex)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
