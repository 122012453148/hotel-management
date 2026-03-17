import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import api from '../services/api';
import HotelListItem from '../components/HotelListItem';
import SearchFilterSidebar from '../components/SearchFilterSidebar';
import Pagination from '../components/Pagination';
import { Search, MapPin, X, Loader2, SlidersHorizontal } from 'lucide-react';
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
          <h1 className="hotels-title" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1.5px' }}>Find Your Dream Stay</h1>
          <p className="hotels-subtitle" style={{ color: 'var(--text-light)', fontSize: '1.25rem' }}>Discover {total} luxury stays across the globe</p>
        </div>

        {/* Search Bar with Global Suggestions */}
        <div className="search-bar-wrapper" style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <form onSubmit={handleSearchSubmit} className="search-form-flex" style={{ 
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
                inputStyle={{ boxShadow: 'none', border: 'none', backgroundColor: 'transparent', width: '100%' }}
              />
            </div>
            <button type="submit" className="btn-primary search-submit-btn" style={{ padding: '0 2.5rem', borderRadius: '16px', height: '48px' }}>
              <Search size={22} color="white" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Filter Toggle Button — lives OUTSIDE the grid */}
      <div className="mobile-filter-fab" style={{ display: 'none', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--secondary)',
            padding: '0.75rem 1.5rem',
            borderRadius: '30px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(161, 188, 152, 0.4)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
      </div>

      <div className="hotels-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: '3rem' }}>
        {/* Desktop Sidebar */}
        <div className="desktop-filter-sidebar glass-morphism" style={{ padding: '2rem', borderRadius: '24px', height: 'fit-content', position: 'sticky', top: '100px' }}>
          <SearchFilterSidebar
            filters={filters}
            setFilters={(f) => { setFilters(f); setPage(1); }}
            onClear={clearFilters}
          />
        </div>

        {/* Mobile Filter Overlay */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(5px)' }}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '90%',
                  maxWidth: '350px',
                  backgroundColor: 'white',
                  zIndex: 1001,
                  padding: '2rem',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ margin: 0 }}>Filters</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>
                <SearchFilterSidebar
                  filters={filters}
                  setFilters={(f) => { setFilters(f); setPage(1); }}
                  onClear={() => { clearFilters(); setIsMobileFilterOpen(false); }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main style={{ minWidth: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '24px' }} />
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {hotels.map((hotel) => (
                  <HotelListItem key={hotel._id} hotel={hotel} />
                ))}
              </div>

              <Pagination
                page={page}
                pages={pages}
                onPageChange={setPage}
              />

              {hotels.length === 0 && (
                <div style={{ textAlign: 'center', padding: '8rem 0', backgroundColor: '#f9fafb', borderRadius: '30px' }}>
                  <Search size={48} color="#d1d5db" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', color: '#6b7280' }}>No places found matching your search.</h3>
                  <button onClick={clearFilters} style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Show all hotels</button>
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
            gap: 0 !important;
          }
          /* Hide desktop sidebar */
          .desktop-filter-sidebar {
            display: none !important;
          }
          /* Show floating filter FAB */
          .mobile-filter-fab {
            display: flex !important;
          }
        }

        @media (max-width: 768px) {
          .hotels-container {
            padding: 2rem 0 !important;
          }
          .hotels-title {
            font-size: 2rem !important;
            letter-spacing: -1px !important;
            line-height: 1.2;
          }
          .hotels-subtitle {
            font-size: 1rem !important;
          }
          .search-form-flex {
            padding: 0.25rem !important;
            border-radius: 14px !important;
          }
          .search-submit-btn {
            padding: 0 1.25rem !important;
            border-radius: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Hotels;
