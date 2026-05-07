import { useState, useEffect } from 'react';
import './HeroForm.css';

const HeroForm = ({ initialData, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    realName: '',
    year: '',
    house: 'Marvel',
    biography: '',
    equipment: '',
    images: ['']
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        images: initialData.images && initialData.images.length > 0 ? initialData.images : ['']
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // filter out empty image URLs
    const cleanedData = {
      ...formData,
      images: formData.images.filter(url => url.trim() !== '')
    };
    if (cleanedData.images.length === 0) {
      alert('Debes agregar al menos una imagen.');
      return;
    }
    onSubmit(cleanedData);
  };

  return (
    <form className="hero-form" onSubmit={handleSubmit}>
      <div className="form-group row">
        <div className="col">
          <label className="form-label">Nombre del Héroe *</label>
          <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="col">
          <label className="form-label">Identidad Secreta / Nombre Real</label>
          <input type="text" name="realName" className="form-control" value={formData.realName} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group row">
        <div className="col">
          <label className="form-label">Año de Primera Aparición *</label>
          <input type="number" name="year" className="form-control" value={formData.year} onChange={handleChange} required min="1900" max="2100" />
        </div>
        <div className="col">
          <label className="form-label">Casa / Editorial *</label>
          <select name="house" className="form-control" value={formData.house} onChange={handleChange} required>
            <option value="Marvel">Marvel</option>
            <option value="DC">DC</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Equipamiento</label>
        <input type="text" name="equipment" className="form-control" value={formData.equipment} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label className="form-label">Biografía *</label>
        <textarea name="biography" className="form-control" value={formData.biography} onChange={handleChange} required rows="5"></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Imágenes (URLs) *</label>
        {formData.images.map((url, index) => (
          <div key={index} className="image-input-group">
            <input 
              type="url" 
              className="form-control" 
              value={url} 
              onChange={(e) => handleImageChange(index, e.target.value)} 
              placeholder="https://..." 
              required={index === 0}
            />
            {formData.images.length > 1 && (
              <button type="button" className="btn btn-danger icon-btn" onClick={() => removeImageField(index)}>X</button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-outline small-btn mt-2" onClick={addImageField}>+ Agregar otra imagen</button>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Héroe'}
        </button>
      </div>
    </form>
  );
};

export default HeroForm;
