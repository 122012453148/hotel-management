import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import api from '../services/api';
import HotelListItem from '../components/HotelListItem';
import SearchFilterSidebar from '../components/SearchFilterSidebar';
import Pagination from '../components/Pagination';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash.debounce';
import LocationInput from '../components/LocationInput';

const Hotels = () => {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get initial location from URL
  const searchParams = new URLSearchParams(routerLocation.search);
  const initialLocation = searchParams.get('location') || '';
  
  const [search, setSearch] = useState(initialLocation);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({ 
    rating: '', 
    minPrice: '', 
    maxPrice: '', 
    amenities: [] 
  });

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const params = { 
        location: search, 
        rating: filters.rating,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        amenities: filters.amenities.length > 0 ? filters.amenities.join(',') : undefined,
        page: page,
        limit: 5
      };
      const { data } = await api.get('/hotels', { params });
      setHotels(data.hotels || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [filters, page, search]); // Re-fetch when search changes too

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchHotels();
    // Update URL without reloading
    navigate(`/hotels?location=${search}`, { replace: true });
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({ rating: '', minPrice: '', maxPrice: '', amenities: [] });
    setPage(1);
    navigate('/hotels', { replace: true });
  };

  return (
    <div className="container hotels-container" style={{ padding: '4rem 0' }}>
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1.5px' }}>Find Your Dream Stay</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.25rem' }}>Discover {total} luxury stays across the globe</p>
        </div>

        {/* Search Bar with Global Suggestions */}
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <form onSubmit={handleSearchSubmit} style={{ 
            display: 'flex', gap: '0.5rem', 
            backgroundColor: 'white', padding: '0.5rem', 
            borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1.5px solid #f3f4f6',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <LocationInput 
                value={search} 
                onChange={(val) => {
                  setSearch(val);
                }} 
                inputStyle={{ boxShadow: 'none', border: 'none', backgroundColor: 'transparent' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0 2.5rem', borderRadius: '16px', height: '100%' }}>
              <Search size={22} color="white" />
            </button>
          </form>
        </div>
      </div>

      <div className="hotels-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '4rem' }}>
        <SearchFilterSidebar 
          filters={filters} 
          setFilters={(f) => {setFilters(f); setPage(1);}} 
          onClear={clearFilters} 
        />

        <main>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '24px' }} />
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {hotels.map((hotel, index) => (
                  <HotelListItem key={hotel._id} hotel={hotel} />
                ))}
              </div>
              
              <Pagination 
                page={page} 
                pages={pages} 
                onPageChange={setPage} 
              />

              {hotels.length === 0 && (
                <div style={{ textAlign: 'center', padding: '10rem 0', backgroundColor: '#f9fafb', borderRadius: '30px' }}>
                  <Search size={48} color="#d1d5db" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', color: '#6b7280' }}>No places found matching your search.</h3>
                  <button onClick={clearFilters} style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 700 }}>Show all hotels</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 992px) {
           .hotels-layout {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
           }
        }

        @media (max-width: 768px) {
           .hotels-container {
              padding: 2rem 0 !important;
           }
           h1 {
              font-size: 2.5rem !important;
              letter-spacing: -1px !important;
           }
        }
      `}</style>
    </div>
  );
};

export default Hotels;
