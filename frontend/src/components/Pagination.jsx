import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '4rem' }}>
      <button 
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        style={{ 
          backgroundColor: page === 1 ? '#f3f4f6' : 'white',
          color: page === 1 ? '#9ca3af' : 'var(--secondary)',
          border: '1px solid #e5e7eb',
          padding: '10px',
          borderRadius: '12px',
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center'
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[...Array(pages)].map((_, i) => (
          <button 
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            style={{ 
              width: '45px',
              height: '45px',
              borderRadius: '12px',
              fontWeight: 700,
              border: 'none',
              backgroundColor: page === (i + 1) ? 'var(--primary)' : 'white',
              color: page === (i + 1) ? 'white' : 'var(--secondary)',
              boxShadow: page === (i + 1) ? '0 4px 12px rgba(196, 164, 132, 0.3)' : 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button 
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
        style={{ 
          backgroundColor: page === pages ? '#f3f4f6' : 'white',
          color: page === pages ? '#9ca3af' : 'var(--secondary)',
          border: '1px solid #e5e7eb',
          padding: '10px',
          borderRadius: '12px',
          cursor: page === pages ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center'
        }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
