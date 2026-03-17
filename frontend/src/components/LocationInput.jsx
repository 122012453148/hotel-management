import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash.debounce';
import axios from 'axios';

const LocationInput = ({ value, onChange, placeholder = "Where are you going?", className = "", inputStyle = {} }) => {
  const [search, setSearch] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  const fetchGlobalSuggestions = async (val) => {
    if (!val || val.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setLoading(true);
    try {
      // Using Photon API (OpenStreetMap) - Free, no key required
      const response = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=6`);
      
      const features = response.data.features.map(f => {
        const p = f.properties;
        const name = p.name || '';
        const city = p.city || p.district || '';
        const state = p.state || '';
        const country = p.country || '';
        
        // Construct a readable address string
        const addressParts = [name, city, state, country].filter(Boolean);
        const uniqueParts = [...new Set(addressParts)];
        
        return {
          display: uniqueParts.join(', '),
          main: name,
          sub: uniqueParts.slice(1).join(', ')
        };
      });
      
      setSuggestions(features);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Location suggestion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((nextValue) => fetchGlobalSuggestions(nextValue), 400),
    []
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val); // Update parent state immediately for typing
    debouncedFetch(val);
  };

  const handleSelect = (suggestion) => {
    setSearch(suggestion.display);
    onChange(suggestion.display);
    setShowSuggestions(false);
  };

  const clearInput = () => {
    setSearch('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <MapPin 
          size={20} 
          style={{ position: 'absolute', left: '1.25rem', color: 'var(--primary)', zIndex: 2 }} 
        />
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => search.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '1.1rem 3rem 1.1rem 3.5rem',
            borderRadius: '16px',
            border: 'none',
            fontSize: '1rem',
            backgroundColor: 'white',
            outline: 'none',
            boxShadow: '0 0 0 1px #eef2f6',
            ...inputStyle
          }}
          className={className}
        />
        
        <div style={{ position: 'absolute', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {loading && <Loader2 size={18} className="animate-spin" style={{ color: '#94a3b8' }} />}
          {search && (
            <button 
              type="button" 
              onClick={clearInput}
              style={{ padding: '4px', backgroundColor: 'transparent', color: '#94a3b8', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              zIndex: 1000,
              padding: '0.75rem',
              maxHeight: '350px',
              overflowY: 'auto',
              border: '1px solid #f1f5f9'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 5, backgroundColor: '#f8fafc' }}
                onClick={() => handleSelect(suggestion)}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  marginTop: '0.2rem',
                  color: 'var(--primary)',
                  backgroundColor: '#eff6ff',
                  padding: '0.5rem',
                  borderRadius: '10px'
                }}>
                  <MapPin size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{suggestion.main}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>{suggestion.sub}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LocationInput;
