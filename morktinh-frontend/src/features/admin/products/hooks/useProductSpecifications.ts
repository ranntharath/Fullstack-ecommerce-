import { useState, useCallback } from 'react';

export interface Specification {
  id: string;
  key: string;
  value: string;
}

export function useProductSpecifications() {
  const [specifications, setSpecifications] = useState<Specification[]>([]);

  const setInitialSpecifications = useCallback((specs: unknown) => {
    if (!specs) return;
    
    // The API might return it as a JSON object
    if (typeof specs === 'object' && !Array.isArray(specs)) {
      const parsedSpecs: Specification[] = Object.entries(specs).map(([key, value], index) => ({
        id: `spec-${Date.now()}-${index}`,
        key,
        value: String(value)
      }));
      setSpecifications(parsedSpecs);
    }
  }, []);

  const addSpecification = () => {
    setSpecifications(prev => [...prev, { id: Date.now().toString(), key: '', value: '' }]);
  };

  const updateSpecification = (id: string, field: 'key' | 'value', val: string) => {
    setSpecifications(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const removeSpecification = (id: string) => {
    setSpecifications(prev => prev.filter(s => s.id !== id));
  };

  return {
    specifications,
    addSpecification,
    updateSpecification,
    removeSpecification,
    setInitialSpecifications
  };
}
