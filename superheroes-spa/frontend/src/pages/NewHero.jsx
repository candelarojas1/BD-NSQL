import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroForm from '../components/HeroForm';
import { useToast } from '../components/Toast';

const NewHero = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (heroData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/heroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al crear el héroe');
      }
      
      const newHero = await res.json();
      addToast('Héroe creado satisfactoriamente', 'success');
      navigate(`/hero/${newHero._id}`);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title" style={{background: 'var(--text-primary)', webkitTextFillColor: 'initial'}}>Crear Nuevo Héroe</h1>
      <HeroForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default NewHero;
