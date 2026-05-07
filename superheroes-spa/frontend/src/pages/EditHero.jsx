import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeroForm from '../components/HeroForm';
import { useToast } from '../components/Toast';

const EditHero = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/heroes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Hero not found');
        return res.json();
      })
      .then(data => {
        setInitialData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (heroData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/heroes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar el héroe');
      }
      
      addToast('Héroe actualizado satisfactoriamente', 'success');
      navigate(`/hero/${id}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando datos...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="page-container">
      <h1 className="page-title" style={{background: 'var(--text-primary)', webkitTextFillColor: 'initial'}}>Editar Héroe</h1>
      <HeroForm initialData={initialData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default EditHero;
