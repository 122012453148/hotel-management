import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ChatWindow from '../components/ChatWindow';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  PlusCircle, 
  BedDouble, 
  TicketCheck, 
  LogOut, 
  Users, 
  IndianRupee, 
  MapPin, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Upload, 
  X,
  PieChart as PieIcon,
  BarChart3 as BarIcon,
  ClipboardList,
  QrCode,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowRight,
  Loader2,
  Trash2,
  Edit3,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import ManagerSidebar from '../components/ManagerSidebar';
import NotificationPanel from '../components/NotificationPanel';

const HotelManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [promotions, setPromotions] = useState([]);

  // Modals / Edit states
  const [viewingBooking, setViewingBooking] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [showEditHotel, setShowEditHotel] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  const [roomFormData, setRoomFormData] = useState({
    roomType: 'Deluxe',
    price: '',
    capacity: 2,
    totalRooms: 10,
    amenities: [],
    weekendMultiplier: 1.2
  });

  const [hotelFormData, setHotelFormData] = useState({
    name: '',
    location: '',
    city: '',
    zipCode: '',
    address: '',
    description: '',
    amenities: [], // Changed to array for checkboxes
    images: [],
    extraServices: []
  });

  const [promoFormData, setPromoFormData] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    validFrom: '',
    validTo: '',
    applicableHotels: [],
    couponCode: ''
  });

  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const indianCities = [
    'Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Coimbatore',
    'Madurai', 'Salem', 'Trichy', 'Kochi', 'Pune', 'Kolkata'
  ];

  const handleCitySearch = (e) => {
    const value = e.target.value;
    setCitySearch(value);
    setHotelFormData({ ...hotelFormData, city: value });

    if (value.length >= 2) {
      const filtered = indianCities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(filtered);
      setShowCitySuggestions(true);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  };

  const selectCity = (city) => {
    setCitySearch(city);
    setHotelFormData({ ...hotelFormData, city: city });
    setShowCitySuggestions(false);
  };

  useEffect(() => {
    let scanner;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render(onScanSuccess, onScanError);
    }
    return () => { if (scanner) scanner.clear(); };
  }, [showScanner]);

  function onScanSuccess(decodedText) {
    handleVerifyQR(decodedText);
  }

  function onScanError(err) {
    // console.warn(err);
  }

  const handleVerifyQR = async (code) => {
    if (scanning) return;
    setScanning(true);
    try {
      const { data } = await api.put(`/bookings/verify-qr/${code}`);
      setScanResult(data);
      toast.success(data.message);
      fetchBookings(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setScanning(false);
    }
  };

  const allAmenities = ['WiFi', 'Breakfast', 'Restaurant', 'Pool', 'Gym', 'Parking', 'AC', 'Spa', 'Pet-friendly', 'TV'];
  const suggestedExtras = [
    { name: 'Breakfast', price: 500, icon: '🥐' },
    { name: 'Airport Shuttle', price: 1200, icon: '🚐' },
    { name: 'Spa Package', price: 2500, icon: '💆' },
    { name: 'Laundry Service', price: 300, icon: '🧼' },
    { name: 'Guided Tour', price: 1500, icon: '🗺️' }
  ];

  const toggleAmenity = (amenity) => {
    const current = hotelFormData.amenities;
    if (current.includes(amenity)) {
      setHotelFormData({ ...hotelFormData, amenities: current.filter(a => a !== amenity) });
    } else {
      setHotelFormData({ ...hotelFormData, amenities: [...current, amenity] });
    }
  };

  const addExtraService = (service, isEdit = false) => {
    if (isEdit) {
      const current = editingHotel.extraServices || [];
      if (current.find(s => s.name === service.name)) return;
      setEditingHotel({ ...editingHotel, extraServices: [...current, service] });
    } else {
      const current = hotelFormData.extraServices;
      if (current.find(s => s.name === service.name)) return;
      setHotelFormData({ ...hotelFormData, extraServices: [...current, service] });
    }
  };

  const removeExtraService = (name, isEdit = false) => {
    if (isEdit) {
      setEditingHotel({
        ...editingHotel,
        extraServices: editingHotel.extraServices.filter(s => s.name !== name)
      });
    } else {
      setHotelFormData({
        ...hotelFormData,
        extraServices: hotelFormData.extraServices.filter(s => s.name !== name)
      });
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e, isEdit = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (isEdit) {
        setEditingHotel({
          ...editingHotel,
          images: [...(editingHotel.images || []), ...data]
        });
      } else {
        setHotelFormData({
          ...hotelFormData,
          images: [...hotelFormData.images, ...data]
        });
      }
    } catch (err) {
      toast.error('Failed to upload images. Check if Cloudinary credentials are set.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index, isEdit = false) => {
    if (isEdit) {
      setEditingHotel({
        ...editingHotel,
        images: editingHotel.images.filter((_, i) => i !== index)
      });
    } else {
      setHotelFormData({
        ...hotelFormData,
        images: hotelFormData.images.filter((_, i) => i !== index)
      });
    }
  };

  const [analyticsData, setAnalyticsData] = useState(null);

  const handleAddPromotion = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/promotions', promoFormData);
      toast.success('Promotion Created successfully!');
      setPromotions([data.promotion, ...promotions]);
      setPromoFormData({
        title: '',
        description: '',
        discountPercentage: '',
        validFrom: '',
        validTo: '',
        applicableHotels: [],
        couponCode: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create promotion');
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelsRes, bookingsRes, reviewsRes, analyticsRes, promosRes] = await Promise.all([
        api.get('/hotels/my-hotels'),
        api.get('/bookings'),
        api.get('/reviews/manager/all'),
        api.get('/bookings/analytics'),
        api.get('/promotions/my-promotions')
      ]);
      setHotels(hotelsRes.data);
      setBookings(bookingsRes.data);
      setReviews(reviewsRes.data);
      setAnalyticsData(analyticsRes.data);
      setPromotions(promosRes.data?.promotions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHotel = async (hotel) => {
    setSelectedHotel(hotel);
    setLoading(true);
    try {
      const { data } = await api.get(`/rooms/hotel/${hotel._id}`);
      setRooms(data);
      setActiveTab('manageRooms');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHotel = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hotels', hotelFormData);
      toast.success('Hotel submitted for approval!');
      setHotelFormData({
        name: '',
        location: '',
        city: '',
        zipCode: '',
        address: '',
        description: '',
        amenities: [],
        images: [],
        extraServices: []
      });
      setCitySearch('');
      setActiveTab('hotels');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add hotel');
    }
  };

  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/hotels/${editingHotel._id}`, editingHotel);
      toast.success('Hotel updated successfully!');
      setShowEditHotel(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update hotel');
    }
  };

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Are you sure? This will remove the hotel and all its rooms.')) return;
    try {
      await api.delete(`/hotels/${id}`);
      setHotels(hotels.filter(h => h._id !== id));
      toast.success('Hotel removed');
    } catch (err) {
      toast.error('Failed to delete hotel');
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', {
        ...roomFormData,
        hotel: selectedHotel._id,
        capacity: Number(roomFormData.capacity),
        totalRooms: Number(roomFormData.totalRooms),
        price: Number(roomFormData.price),
        weekendMultiplier: Number(roomFormData.weekendMultiplier)
      });
      toast.success('Room category added!');
      setRoomFormData({ roomType: 'Deluxe', price: '', capacity: 2, totalRooms: 10, amenities: [], weekendMultiplier: 1.2 });
      const { data } = await api.get(`/rooms/hotel/${selectedHotel._id}`);
      setRooms(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room type?')) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms(rooms.filter(r => r._id !== roomId));
      toast.success('Room type deleted');
    } catch (err) {
      toast.error('Failed to delete room');
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
      if (viewingBooking && viewingBooking._id === id) {
        setViewingBooking({ ...viewingBooking, status });
      }
      toast.success(`Booking ${status}`);
    } catch (err) {
      toast.error('Failed to update booking status');
    }
  };

  const stats = [
    { label: 'Total Hotels', value: hotels.length, icon: <Building2 />, color: '#6366f1' },
    { label: 'Total Bookings', value: bookings.length, icon: <TicketCheck />, color: '#10b981' },
    { label: 'Total Revenue', value: `₹${bookings.reduce((acc, b) => acc + (b.status !== 'Cancelled' ? b.totalPrice : 0), 0).toLocaleString()}`, icon: <IndianRupee />, color: '#f59e0b' },
    { label: 'Active Guests', value: bookings.filter(b => b.status === 'Confirmed').length, icon: <Users />, color: '#ec4899' },
  ];

  const handleUpdateRoomStatus = async (roomId, status) => {
    try {
      await api.put(`/rooms/${roomId}`, { roomStatus: status });
      setRooms(rooms.map(r => r._id === roomId ? { ...r, roomStatus: status } : r));
      toast.success(`Room marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update room status');
    }
  };

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-morphism"
            style={{ padding: '24px', borderRadius: '24px', borderLeft: `6px solid ${stat.color}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: `${stat.color}15`, color: stat.color, display: 'flex' }}>
                {React.cloneElement(stat.icon, { size: 20 })}
              </div>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} /> +12%
              </span>
            </div>
            <div>
              <p style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '14px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
              <h4 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--secondary)', lineHeight: '1.2' }}>{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        <div className="glass-morphism" style={{ padding: '32px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', color: 'var(--secondary)' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.slice(0, 5).map(b => (
              <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800, color: 'var(--primary)', fontSize: '18px' }}>
                    {b.user?.name.charAt(0)}
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 800, color: 'var(--secondary)', marginBottom: '2px', fontSize: '15px' }}>{b.user?.name}</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Booked {b.hotel?.name}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, color: '#10b981', fontSize: '16px', marginBottom: '2px' }}>₹{b.totalPrice}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-morphism" style={{ padding: '32px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', color: 'var(--secondary)' }}>Property Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {hotels.map(h => (
              <div key={h._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{h.name}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{Math.floor(Math.random() * 40 + 60)}% Occ.</span>
                </div>
                <div style={{ height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${Math.random() * 40 + 60}%` }}
                    style={{ height: '100%', backgroundColor: 'var(--primary)', borderRadius: '5px' }}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHotelCard = (hotel) => (
    <motion.div
      key={hotel._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="glass-morphism hotel-manage-card"
      style={{ padding: '24px', borderRadius: '28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: hotel.isApproved ? '6px solid #10b981' : '6px solid #f59e0b', transition: 'all 0.2s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
    >
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <img src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=200'} style={{ width: '130px', height: '95px', borderRadius: '18px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} alt={hotel.name} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', lineHeight: 1.2 }}>{hotel.name}</h3>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500 }}>
            <MapPin size={16} /> {hotel.city || hotel.location}
          </p>
          <div style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '8px', backgroundColor: hotel.isApproved ? '#ecfdf5' : '#fffbeb', color: hotel.isApproved ? '#059669' : '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {hotel.isApproved ? '● Live' : '● Pending Admin Approval'}
            </span>
          </div>
        </div>
      </div>
      <div className="hotel-card-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {hotel.isApproved ? (
          <button className="btn-primary" onClick={() => handleSelectHotel(hotel)} style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, margin: 0 }}>Manage Rooms</button>
        ) : (
          <button disabled style={{ padding: '12px 24px', borderRadius: '14px', backgroundColor: '#f1f5f9', color: '#94a3b8', fontWeight: 700, cursor: 'not-allowed', fontSize: '14px', border: 'none', margin: 0 }}>
            Awaiting Approval
          </button>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setEditingHotel(hotel); setShowEditHotel(true); }} style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'white', border: '1.5px solid #edf2f7', color: 'var(--secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s', cursor: 'pointer' }}>
            <Edit3 size={18} />
          </button>
          <button onClick={() => handleDeleteHotel(hotel._id)} style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#fff5f5', border: '1.5px solid #fed7d7', color: '#e53e3e', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s', cursor: 'pointer' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ backgroundColor: '#FBF6F6', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Design Elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(174, 183, 132, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '30%', height: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(174, 183, 132, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(#AEB784 1px, transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 }}></div>

      <div className="container" style={{ padding: '40px 0', position: 'relative', zIndex: 1 }}>
        <div className="manager-dashboard-grid">
          <ManagerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ textAlign: 'left', minWidth: 0 }}>
          <div className="manager-header-flex glass-morphism" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '40px',
            backgroundColor: 'white',
            padding: '1.25rem 2rem',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9',
            gap: '1rem',
            flexWrap: 'nowrap'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 className="manager-header-title" style={{ fontSize: '24px', fontWeight: 900, color: 'var(--secondary)', letterSpacing: '-0.5px', marginBottom: '2px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTab === 'dashboard' ? 'Portfolio Overview' :
                 activeTab === 'hotels' ? 'My Properties' :
                 activeTab === 'addHotel' ? 'Register Property' :
                 activeTab === 'manageRooms' ? 'Inventory Control' :
                 activeTab === 'housekeeping' ? 'Housekeeping Tracker' :
                 activeTab === 'analytics' ? 'Business Intelligence' :
                 activeTab === 'bookings' ? 'Guest Reservations' : 
                 activeTab === 'promotions' ? 'Promotions & Offers' : 'Guest Reviews'}
              </h1>
              <p className="manager-header-subtitle" style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Welcome back, {user?.name?.split(' ')[0]}.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1.5rem', borderRight: '1px solid #e2e8f0' }} className="hide-tablet">
                <NotificationPanel />
              </div>
              <div className="manager-profile-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }} className="hide-mobile">
                  <p style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '14px', lineHeight: 1.1 }}>{user?.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>Hotel Manager</p>
                </div>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '12px', 
                  backgroundColor: 'var(--primary)', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  color: 'white', 
                  fontWeight: 900,
                  fontSize: '16px',
                  boxShadow: '0 4px 10px rgba(174, 183, 132, 0.3)'
                }}>
                  {user?.name?.charAt(0) || 'M'}
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .manager-header-flex {
                padding: 1rem !important;
                margin-bottom: 2rem !important;
                border-radius: 20px !important;
                gap: 0.5rem !important;
              }
              .manager-header-title {
                font-size: 18px !important;
              }
              .manager-header-subtitle {
                font-size: 11px !important;
              }
              .hide-mobile { display: none !important; }
              .manager-profile-container { gap: 0 !important; }
            }
            @media (max-width: 1024px) {
              .hide-tablet { display: none !important; }
            }
          `}</style>

          <AnimatePresence mode="wait">
            {loading ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
                  <Loader2 className="spin" size={48} color="var(--primary)" />
               </motion.div>
            ) : (
                <>
                {activeTab === 'dashboard' && <motion.div key="dash" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>{renderDashboard()}</motion.div>}

                {activeTab === 'hotels' && (
                  <motion.div key="hotels" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {hotels.length === 0 ? (
                      <div className="glass-morphism" style={{ padding: '5rem', textAlign: 'center' }}>
                        <Building2 size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                        <h3>No Hotels Yet</h3>
                        <button className="btn-primary" onClick={() => setActiveTab('addHotel')}>Add Your First Hotel</button>
                      </div>
                    ) : (
                      hotels.map(renderHotelCard)
                    )}
                  </motion.div>
                )}

                {activeTab === 'addHotel' && (
                  <motion.div key="add" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-morphism" style={{ padding: '3.5rem', borderRadius: '40px' }}>
                    <form onSubmit={handleAddHotel} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                      <div className="manager-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                         <div>
                           <label>Hotel Name</label>
                           <input type="text" placeholder="Enter hotel name" value={hotelFormData.name} onChange={e => setHotelFormData({...hotelFormData, name: e.target.value})} required />
                         </div>
                         <div style={{ position: 'relative' }}>
                           <label>City</label>
                           <input
                             type="text"
                             placeholder="Enter city name"
                             value={citySearch}
                             onChange={handleCitySearch}
                             autoComplete="off"
                             required
                           />
                           {showCitySuggestions && citySuggestions.length > 0 && (
                             <div className="city-dropdown glass-morphism">
                               {citySuggestions.map(city => (
                                 <div key={city} className="city-option" onClick={() => selectCity(city)}>
                                   {city}
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>

                       <div className="manager-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                         <div>
                           <label>Zip Code / Pincode</label>
                           <input type="number" placeholder="Enter zip or postal code" value={hotelFormData.zipCode} onChange={e => setHotelFormData({...hotelFormData, zipCode: e.target.value})} required />
                         </div>
                         <div>
                           <label>Full Address</label>
                           <input type="text" placeholder="Enter complete hotel address" value={hotelFormData.address} onChange={e => setHotelFormData({...hotelFormData, address: e.target.value})} required />
                         </div>
                       </div>

                       <div>
                         <label>General Location Hint (e.g. Near Airport)</label>
                         <input type="text" placeholder="Shortcut location for list view" value={hotelFormData.location} onChange={e => setHotelFormData({...hotelFormData, location: e.target.value})} required />
                       </div>

                       <div>
                         <label>Description</label>
                         <textarea rows="5" placeholder="Tell guests about your property..." value={hotelFormData.description} onChange={e => setHotelFormData({...hotelFormData, description: e.target.value})} required />
                       </div>

                       <div>
                         <label style={{ marginBottom: '1.5rem' }}>Add-on Services (Extras)</label>
                         <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                           {suggestedExtras.map(extra => (
                             <button
                               key={extra.name}
                               type="button"
                               onClick={() => addExtraService(extra)}
                               style={{
                                 padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                 backgroundColor: 'white', fontSize: '0.85rem', fontWeight: 600,
                                 cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                               }}
                             >
                               <span>{extra.icon}</span> {extra.name}
                             </button>
                           ))}
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                           {hotelFormData.extraServices.map(service => (
                             <div key={service.name} className="glass-morphism" style={{ padding: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <div>
                                 <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{service.icon} {service.name}</p>
                                 <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}>₹{service.price}</p>
                               </div>
                               <button type="button" onClick={() => removeExtraService(service.name)} style={{ border: 'none', background: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
                             </div>
                           ))}
                         </div>
                       </div>

                       <div>
                         <label style={{ marginBottom: '1.5rem' }}>Amenities</label>
                         <div className="amenities-checkbox-grid">
                           {allAmenities.map(amenity => (
                             <div
                               key={amenity}
                               className={`amenity-checkbox ${hotelFormData.amenities.includes(amenity) ? 'active' : ''}`}
                               onClick={() => toggleAmenity(amenity)}
                             >
                               <div className="checkbox-indicator">
                                 {hotelFormData.amenities.includes(amenity) && <CheckCircle size={14} />}
                               </div>
                               <span>{amenity}</span>
                             </div>
                           ))}
                         </div>
                       </div>

                       <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                         <div>
                           <label>Property Images</label>
                           <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                             {hotelFormData.images.map((url, i) => (
                               <div key={i} style={{ position: 'relative', width: '100px', height: '75px' }}>
                                 <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} alt="" />
                                 <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                   <X size={14} />
                                 </button>
                               </div>
                             ))}
                             <label className="image-upload-box">
                               {uploading ? <Loader2 className="spin" size={24} color="var(--primary)" /> : <Upload size={24} color="#9ca3af" />}
                               <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>Upload</p>
                               <input type="file" multiple onChange={(e) => handleImageUpload(e)} style={{ display: 'none' }} />
                             </label>
                           </div>
                         </div>
                       </div>

                       <div style={{ paddingTop: '1rem' }}>
                         <button type="submit" className="btn-primary" style={{ padding: '1.1rem 4rem', borderRadius: '18px', fontSize: '1.1rem', fontWeight: 700 }}>
                           Register Royal Property
                         </button>
                       </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'manageRooms' && (
                  <motion.div key="rooms" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {!selectedHotel ? (
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                          {hotels.map(h => (
                            <div key={h._id} className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px', cursor: 'pointer' }} onClick={() => handleSelectHotel(h)}>
                               <Building2 size={32} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                               <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{h.name}</h4>
                               <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{h.location}</p>
                            </div>
                          ))}
                       </div>
                    ) : (
                      <>
                        <div className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px', marginBottom: '3rem' }}>
                           <h3 style={{ marginBottom: '2rem' }}>Add New Room Category</h3>
                           <form onSubmit={handleAddRoom} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                              <div><label>ROOM TYPE</label><select value={roomFormData.roomType} onChange={e => setRoomFormData({...roomFormData, roomType: e.target.value})}><option>Deluxe</option><option>Suite</option><option>Presidential</option><option>Family</option></select></div>
                              <div><label>PRICE / NIGHT</label><input type="number" value={roomFormData.price} onChange={e => setRoomFormData({...roomFormData, price: e.target.value})} required /></div>
                              <div><label>CAPACITY</label><input type="number" value={roomFormData.capacity} onChange={e => setRoomFormData({...roomFormData, capacity: e.target.value})} required /></div>
                              <div><label>TOTAL ROOMS</label><input type="number" value={roomFormData.totalRooms} onChange={e => setRoomFormData({...roomFormData, totalRooms: e.target.value})} required /></div>
                              <div><label>WEEKEND MULTIPLIER</label><input type="number" step="0.1" value={roomFormData.weekendMultiplier} onChange={e => setRoomFormData({...roomFormData, weekendMultiplier: e.target.value})} /></div>
                              <div style={{ gridColumn: '1 / -1' }}><button type="submit" className="btn-primary" style={{ width: '100%' }}>Add Room</button></div>
                           </form>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                           {rooms.map(room => (
                             <div key={room._id} className="glass-morphism" style={{ padding: '2rem', borderRadius: '24px', position: 'relative' }}>
                               <button onClick={() => handleDeleteRoom(room._id)} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--error)' }}><Trash2 size={18} /></button>
                               <h4 style={{ fontWeight: 800, fontSize: '1.25rem' }}>{room.roomType}</h4>
                               <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: '1rem 0' }}>₹{room.price}</p>
                               <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-light)', fontSize: '0.85rem' }}><span>Max: {room.capacity} Pax</span><span>Inv: {room.totalRooms}</span></div>
                             </div>
                           ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'housekeeping' && (
                  <motion.div key="housekeeping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {!selectedHotel ? (
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                          {hotels.map(h => (
                            <div key={h._id} className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px', cursor: 'pointer' }} onClick={() => handleSelectHotel(h)}>
                               <Building2 size={32} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                               <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{h.name}</h4>
                               <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{h.location}</p>
                            </div>
                          ))}
                       </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {rooms.map(room => (
                          <div key={room._id} className="glass-morphism" style={{ padding: '2rem', borderRadius: '28px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                               <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{room.roomType}</h4>
                               <span style={{
                                 fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px',
                                 backgroundColor: room.roomStatus === 'Available' ? '#ecfdf5' : room.roomStatus === 'Cleaning' ? '#eff6ff' : '#fef2f2',
                                 color: room.roomStatus === 'Available' ? '#059669' : room.roomStatus === 'Cleaning' ? '#2563eb' : '#dc2626'
                               }}>
                                 {room.roomStatus || 'Available'}
                               </span>
                             </div>

                             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                               <button
                                 onClick={() => handleUpdateRoomStatus(room._id, 'Available')}
                                 style={{ padding: '12px', borderRadius: '14px', border: room.roomStatus === 'Available' ? '2px solid #059669' : '1px solid #e2e8f0', backgroundColor: room.roomStatus === 'Available' ? '#f0fdf4' : 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                               >
                                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669' }}></div> Available
                               </button>
                               <button
                                 onClick={() => handleUpdateRoomStatus(room._id, 'Cleaning')}
                                 style={{ padding: '12px', borderRadius: '14px', border: room.roomStatus === 'Cleaning' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: room.roomStatus === 'Cleaning' ? '#eff6ff' : 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                               >
                                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }}></div> Cleaning
                               </button>
                               <button
                                 onClick={() => handleUpdateRoomStatus(room._id, 'Maintenance')}
                                 style={{ padding: '12px', borderRadius: '14px', border: room.roomStatus === 'Maintenance' ? '2px solid #dc2626' : '1px solid #e2e8f0', backgroundColor: room.roomStatus === 'Maintenance' ? '#fef2f2' : 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                               >
                                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626' }}></div> Maintenance
                               </button>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'analytics' && (
                  <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {!analyticsData ? (
                        <div style={{ textAlign: 'center', padding: '5rem 0' }}><Loader2 className="spin" size={48} color="var(--primary)" /></div>
                    ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                      <div className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800 }}>Revenue Trends (Last 6 Months)</h3>
                        <div style={{ height: '300px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.revenueTrends?.slice().reverse() || []}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} />
                              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(value) => `₹${value}`} />
                              <Bar dataKey="rev" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800 }}>Booking Status</h3>
                        <div style={{ height: '300px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length },
                                  { name: 'Pending', value: bookings.filter(b => b.status === 'Pending').length },
                                  { name: 'Cancelled', value: bookings.filter(b => b.status === 'Cancelled').length },
                                  { name: 'Checked-in', value: bookings.filter(b => b.status === 'Checked-in').length }
                                ].filter(d => d.value > 0)}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#f59e0b" />
                                <Cell fill="#ef4444" />
                                <Cell fill="#3b82f6" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px', gridColumn: '1 / -1' }}>
                         <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800 }}>Occupancy Rate per Hotel (%)</h3>
                         <div style={{ height: '300px' }}>
                           <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={analyticsData.occupancyRates || []}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" />
                               <YAxis />
                               <Tooltip />
                               <Line type="monotone" dataKey="occ" stroke="var(--primary)" strokeWidth={3} />
                             </LineChart>
                           </ResponsiveContainer>
                         </div>
                      </div>
                    </div>
                    )}

                  </motion.div>
                )}

                {activeTab === 'bookings' && (
                  <motion.div key="bookings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reservation Ledger</h2>
                      <button
                        onClick={() => setShowScanner(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '16px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(174, 183, 132, 0.2)' }}
                      >
                        <QrCode size={20} /> Verify Check-in
                      </button>
                    </div>
                    {bookings.length === 0 ? <p>No guest bookings yet.</p> : (
                      <div className="glass-morphism table-container" style={{ borderRadius: '32px' }}>
                        <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
                              <th style={{ padding: '1.5rem' }}>GUEST</th>
                              <th style={{ padding: '1.5rem' }}>HOTEL</th>
                              <th style={{ padding: '1.5rem' }}>DATES</th>
                              <th style={{ padding: '1.5rem' }}>TOTAL</th>
                              <th style={{ padding: '1.5rem' }}>STATUS</th>
                              <th style={{ padding: '1.5rem' }}>ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.map(b => (
                              <tr key={b._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '1.5rem' }}><strong>{b.user?.name}</strong></td>
                                <td style={{ padding: '1.5rem' }}>{b.hotel?.name}</td>
                                <td style={{ padding: '1.5rem' }}>{new Date(b.checkIn).toLocaleDateString()}</td>
                                <td style={{ padding: '1.5rem' }}>₹{b.totalPrice}</td>
                                <td style={{ padding: '1.5rem' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', backgroundColor: b.status === 'Confirmed' ? '#ecfdf5' : b.status === 'Cancelled' ? '#fef2f2' : '#fff7ed', color: b.status === 'Confirmed' ? '#059669' : b.status === 'Cancelled' ? '#dc2626' : '#d97706' }}>
                                    {b.status}
                                  </span>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {b.status === 'Pending' && (
                                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                          onClick={() => handleUpdateBookingStatus(b._id, 'Confirmed')}
                                          style={{ padding: '0.6rem 1rem', borderRadius: '10px', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                        >
                                          <CheckCircle size={16} /> Accept
                                        </button>
                                        <button
                                          onClick={() => handleUpdateBookingStatus(b._id, 'Cancelled')}
                                          style={{ padding: '0.6rem 1rem', borderRadius: '10px', backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                        >
                                          <XCircle size={16} /> Reject
                                        </button>
                                      </div>
                                    )}
                                      <button
                                        onClick={() => setViewingBooking(b)}
                                        style={{ padding: '0.6rem 1rem', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                      >
                                        View Details
                                      </button>
                                      <button
                                        onClick={() => setActiveChat(b)}
                                        style={{ padding: '0.6rem 1rem', borderRadius: '10px', backgroundColor: '#f1f5f9', color: 'var(--primary)', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                      >
                                        <MessageSquare size={16} /> Chat with Guest
                                      </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div key="reviews" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {reviews.length === 0 ? <p>No reviews yet.</p> : (
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                          {reviews.map(r => (
                            <div key={r._id} className="glass-morphism" style={{ padding: '2rem', borderRadius: '24px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                  <div style={{ display: 'flex', color: '#f59e0b', gap: '2px' }}>
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < r.rating ? '#f59e0b' : 'none'} />)}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                               </div>
                               <p style={{ fontSize: '1rem', fontWeight: 500, fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--secondary)' }}>"{r.comment}"</p>
                               <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                  <div>
                                     <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>GUEST</p>
                                     <p style={{ fontWeight: 700 }}>{r.user?.name}</p>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                     <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>PROPERTY</p>
                                     <p style={{ fontWeight: 700 }}>{r.hotel?.name}</p>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'promotions' && (
                  <motion.div key="promos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="glass-morphism" style={{ padding: '2.5rem', borderRadius: '32px', marginBottom: '3rem' }}>
                       <h3 style={{ marginBottom: '2rem' }}>Create New Promotion</h3>
                       <form onSubmit={handleAddPromotion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                          <div style={{ gridColumn: '1 / -1' }}><label>OFFER TITLE</label><input type="text" value={promoFormData.title} onChange={e => setPromoFormData({...promoFormData, title: e.target.value})} required /></div>
                          <div style={{ gridColumn: '1 / -1' }}><label>DESCRIPTION</label><textarea value={promoFormData.description} onChange={e => setPromoFormData({...promoFormData, description: e.target.value})} required /></div>
                          <div><label>DISCOUNT PERCENTAGE</label><input type="number" min="1" max="100" value={promoFormData.discountPercentage} onChange={e => setPromoFormData({...promoFormData, discountPercentage: e.target.value})} required /></div>
                          <div><label>COUPON CODE (Optional)</label><input type="text" value={promoFormData.couponCode} onChange={e => setPromoFormData({...promoFormData, couponCode: e.target.value})} /></div>
                          <div><label>VALID FROM</label><input type="date" value={promoFormData.validFrom} min={new Date().toISOString().split('T')[0]} onChange={e => setPromoFormData({...promoFormData, validFrom: e.target.value})} required /></div>
                          <div><label>VALID UNTIL</label><input type="date" value={promoFormData.validTo} min={promoFormData.validFrom || new Date().toISOString().split('T')[0]} onChange={e => setPromoFormData({...promoFormData, validTo: e.target.value})} required /></div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label>APPLICABLE HOTELS</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                              {hotels.map(h => (
                                <button
                                  type="button"
                                  key={h._id}
                                  onClick={() => {
                                    const current = promoFormData.applicableHotels;
                                    if (current.includes(h._id)) {
                                      setPromoFormData({ ...promoFormData, applicableHotels: current.filter(id => id !== h._id) });
                                    } else {
                                      setPromoFormData({ ...promoFormData, applicableHotels: [...current, h._id] });
                                    }
                                  }}
                                  style={{
                                    padding: '8px 16px', borderRadius: '12px', 
                                    border: promoFormData.applicableHotels.includes(h._id) ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                    backgroundColor: promoFormData.applicableHotels.includes(h._id) ? '#f0fdf4' : 'white', 
                                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                                  }}
                                >
                                  {h.name} {promoFormData.applicableHotels.includes(h._id) && '✓'}
                                </button>
                              ))}
                            </div>
                            {hotels.length > 0 && promoFormData.applicableHotels.length === 0 && (
                               <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>Managers must select at least one hotel.</p>
                            )}
                          </div>
                          
                          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}><button type="submit" className="btn-primary" style={{ width: '100%' }}>Launch Promotion</button></div>
                       </form>
                    </div>

                    <div className="glass-morphism table-container" style={{ borderRadius: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Promotions</h3>
                      </div>
                      <table style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                          <tr>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>OFFER TITLE</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>DISCOUNT</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>VALID UNTIL</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {promotions.map(promo => (
                            <tr key={promo._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '1.5rem' }}>
                                 <p style={{ fontWeight: 700 }}>{promo.title}</p>
                                 <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{promo.description}</p>
                              </td>
                              <td style={{ padding: '1.5rem', fontWeight: 800, color: '#10b981' }}>{promo.discountPercentage}% OFF</td>
                              <td style={{ padding: '1.5rem', color: '#64748b' }}>{new Date(promo.validTo).toLocaleDateString()}</td>
                              <td style={{ padding: '1.5rem' }}>
                                 <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', backgroundColor: promo.isActive ? '#ecfdf5' : '#fef2f2', color: promo.isActive ? '#10b981' : '#ef4444' }}>
                                   {promo.isActive ? 'Active' : 'Expired'}
                                 </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {promotions.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>You have not created any promotions yet.</div>
                      )}
                    </div>
                  </motion.div>
                )}
                </>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Edit Hotel Modal */}
      {showEditHotel && editingHotel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-morphism" style={{ width: '700px', padding: '3rem', backgroundColor: 'white', borderRadius: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ marginBottom: '2rem' }}>Edit Property</h2>
              <form onSubmit={handleUpdateHotel} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div><label>Hotel Name</label><input type="text" value={editingHotel.name} onChange={e => setEditingHotel({...editingHotel, name: e.target.value})} /></div>
                   <div><label>City</label><input type="text" value={editingHotel.city || ''} onChange={e => setEditingHotel({...editingHotel, city: e.target.value})} /></div>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div><label>Zip Code</label><input type="number" value={editingHotel.zipCode || ''} onChange={e => setEditingHotel({...editingHotel, zipCode: e.target.value})} /></div>
                   <div><label>Full Address</label><input type="text" value={editingHotel.address || ''} onChange={e => setEditingHotel({...editingHotel, address: e.target.value})} /></div>
                 </div>
                 <div><label>Location Hint</label><input type="text" value={editingHotel.location} onChange={e => setEditingHotel({...editingHotel, location: e.target.value})} /></div>
                 <div><label>Description</label><textarea rows="4" value={editingHotel.description} onChange={e => setEditingHotel({...editingHotel, description: e.target.value})} /></div>

                 <div>
                   <label style={{ marginBottom: '1rem' }}>Add-on Services (Extras)</label>
                   <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                     {suggestedExtras.map(extra => (
                       <button
                         key={extra.name}
                         type="button"
                         onClick={() => addExtraService(extra, true)}
                         style={{
                           padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0',
                           backgroundColor: 'white', fontSize: '0.75rem', fontWeight: 600,
                           cursor: 'pointer'
                         }}
                       >
                         {extra.name}
                       </button>
                     ))}
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                     {(editingHotel.extraServices || []).map(service => (
                       <div key={service.name} style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
                         <div>
                           <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>{service.icon} {service.name}</p>
                           <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>₹{service.price}</p>
                         </div>
                         <button type="button" onClick={() => removeExtraService(service.name, true)} style={{ border: 'none', background: 'none', color: '#ef4444' }}><Trash2 size={14} /></button>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div>
                   <label style={{ marginBottom: '1rem' }}>Amenities</label>
                   <div className="amenities-checkbox-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                     {allAmenities.map(amenity => (
                       <div
                         key={amenity}
                         className={`amenity-checkbox ${editingHotel.amenities?.includes(amenity) ? 'active' : ''}`}
                         onClick={() => {
                           const current = editingHotel.amenities || [];
                           const updated = current.includes(amenity)
                             ? current.filter(a => a !== amenity)
                             : [...current, amenity];
                           setEditingHotel({ ...editingHotel, amenities: updated });
                         }}
                         style={{ padding: '8px 12px' }}
                       >
                         <div className="checkbox-indicator" style={{ width: '18px', height: '18px' }}>
                           {editingHotel.amenities?.includes(amenity) && <CheckCircle size={10} />}
                         </div>
                         <span style={{ fontSize: '0.75rem' }}>{amenity}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div>
                   <label>Property Images</label>
                   <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                     {editingHotel.images?.map((url, i) => (
                       <div key={i} style={{ position: 'relative', width: '80px', height: '60px' }}>
                         <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} alt="" />
                         <button type="button" onClick={() => removeImage(i, true)} style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                           <X size={12} />
                         </button>
                       </div>
                     ))}
                     <label className="image-upload-box" style={{ width: '80px', height: '60px' }}>
                       {uploading ? <Loader2 className="spin" size={20} /> : <Upload size={20} />}
                       <input type="file" multiple onChange={(e) => handleImageUpload(e, true)} style={{ display: 'none' }} />
                     </label>
                   </div>
                 </div>
                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Save Changes</button>
                    <button type="button" onClick={() => setShowEditHotel(false)} style={{ padding: '0.8rem 2rem', borderRadius: '14px', backgroundColor: '#f3f4f6', color: 'var(--secondary)', border: 'none', fontWeight: 600 }}>Cancel</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* View Booking Details Modal */}
      {viewingBooking && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-morphism" style={{ width: '600px', padding: '3rem', backgroundColor: 'white', borderRadius: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                 <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Booking Details</h2>
                 <button onClick={() => setViewingBooking(null)} style={{ backgroundColor: '#f3f4f6', border: 'none', padding: '0.5rem', borderRadius: '50%', display: 'flex', cursor: 'pointer' }}>
                   <X size={20} />
                 </button>
              </div>

              {/* Booking ID banner */}
              <div style={{ backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Booking ID</p>
                   <p style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>#{viewingBooking._id?.slice(-8).toUpperCase()}</p>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Booked On</p>
                   <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{new Date(viewingBooking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                 <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Customer Profile</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>{viewingBooking.user?.name}</p>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.2rem' }}>📧 {viewingBooking.user?.email}</p>
                    {viewingBooking.user?.phone && <p style={{ fontSize: '0.85rem', color: '#475569' }}>📞 {viewingBooking.user.phone}</p>}
                 </div>
                 <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Property Info</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>{viewingBooking.hotel?.name}</p>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.2rem' }}>📍 {viewingBooking.hotel?.location}</p>
                    {viewingBooking.hotel?.city && <p style={{ fontSize: '0.85rem', color: '#475569' }}>{viewingBooking.hotel.city}</p>}
                 </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Check-in</p>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{new Date(viewingBooking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Check-out</p>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{new Date(viewingBooking.checkOut).toLocaleDateString()}</p>
                    </div>
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Room Category</p>
                      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>{viewingBooking.room?.roomType || 'Standard Room'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Guests</p>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{viewingBooking.guests} People</p>
                    </div>
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Booking Amount</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>₹{viewingBooking.totalPrice}</p>
                    </div>
                    <div>
                       <span style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', backgroundColor: viewingBooking.status === 'Cancelled' ? '#fef2f2' : viewingBooking.status === 'Confirmed' ? '#ecfdf5' : '#fff7ed', color: viewingBooking.status === 'Cancelled' ? '#dc2626' : viewingBooking.status === 'Confirmed' ? '#059669' : '#d97706', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                         {viewingBooking.status}
                       </span>
                    </div>
                 </div>
              </div>

              {viewingBooking.status === 'Pending' && (
                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                   <button
                     onClick={() => handleUpdateBookingStatus(viewingBooking._id, 'Confirmed')}
                     style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', backgroundColor: '#10b981', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                   >
                     <CheckCircle size={24} /> Accept Booking
                   </button>
                   <button
                     onClick={() => handleUpdateBookingStatus(viewingBooking._id, 'Cancelled')}
                     style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}
                   >
                     <XCircle size={24} /> Reject Booking
                   </button>
                </div>
              )}
           </motion.div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-morphism" style={{ width: '500px', padding: '3rem', backgroundColor: 'white', borderRadius: '40px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Scan Guest QR Code</h3>
                <button onClick={() => { setShowScanner(false); setScanResult(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              {!scanResult ? (
                <div id="reader" style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', border: 'none' }}></div>
              ) : (
                <div style={{ padding: '2rem', backgroundColor: '#ecfdf5', borderRadius: '24px', textAlign: 'center' }}>
                  <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                  <h4 style={{ color: '#059669', fontSize: '1.5rem', fontWeight: 800 }}>Check-in Successful!</h4>
                  <div style={{ marginTop: '1.5rem', textAlign: 'left', backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Guest Name</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>{scanResult.booking?.guestName}</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Room Type</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{scanResult.booking?.roomType}</p>
                  </div>
                  <button onClick={() => setScanResult(null)} style={{ marginTop: '2rem', width: '100%', padding: '1rem', borderRadius: '14px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Scan Another</button>
                </div>
              )}
           </motion.div>
        </div>
      )}

      <style>{`
        label { display: block; margin-bottom: 8px; font-weight: 800; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; }
        input, textarea, select { width: 100%; padding: 14px 18px; border-radius: 16px; border: 1.5px solid #edf2f7; outline: none; transition: all 0.2s; font-size: 15px; background-color: #f8fafc; color: var(--secondary); font-weight: 500; }
        input:focus, textarea:focus, select:focus { border-color: var(--primary); background-color: white; box-shadow: 0 0 0 4px var(--primary-light)15; }
        
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .dashboard-info-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 32px;
          margin-top: 32px;
        }

        @media (max-width: 1200px) {
          .manager-dashboard-grid { grid-template-columns: 1fr !important; }
          .dashboard-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dashboard-info-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .container { padding: 16px !important; }
          .dashboard-stats-grid { grid-template-columns: 1fr; }
          h1 { font-size: 28px !important; }
          
          .glass-morphism { padding: 1.5rem !important; }
          
          .glass-morphism[style*="display: flex; justify-content: space-between"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          .glass-morphism[style*="display: flex; justify-content: space-between"] div[style*="display: flex; gap: 12px; align-items: center"] {
            width: 100% !important;
            justify-content: flex-start !important;
          }

          div[style*="grid-template-columns: 1fr 1fr"] {
             grid-template-columns: 1fr !important;
          }
        }

        .city-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 100;
          background: white;
          margin-top: 8px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid #f1f5f9;
        }

        .city-option {
          padding: 12px 20px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .city-option:hover {
          background-color: #f8fafc;
          color: var(--primary);
        }

        .amenities-checkbox-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .amenity-checkbox {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid transparent;
        }

        .amenity-checkbox:hover {
          background: #f1f5f9;
        }

        .amenity-checkbox.active {
          background: #eff6ff;
          border-color: var(--primary);
          color: var(--secondary);
          font-weight: 600;
        }

        .checkbox-indicator {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          color: var(--primary);
        }

        .amenity-checkbox.active .checkbox-indicator {
          border-color: var(--primary);
          background: var(--primary);
          color: white;
        }

        @media (max-width: 992px) {
          .amenities-checkbox-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .manager-dashboard-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 1200px) {
          .manager-dashboard-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 768px) {
          .container { padding: 20px !important; }
          .manager-header-flex {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 1.5rem !important;
            gap: 1rem !important;
          }
          .manager-header-flex > div:last-child {
            width: 100%;
            justify-content: flex-start;
          }
          .manager-header-flex .hide-mobile {
            display: none !important;
          }
          .hotel-manage-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.5rem !important;
          }
          .hotel-manage-card > div:first-child {
            flex-direction: column !important;
            align-items: flex-start !important;
            width: 100%;
          }
          .hotel-manage-card img {
            width: 100% !important;
            height: 180px !important;
          }
          .hotel-card-actions {
            width: 100%;
            justify-content: space-between;
          }
          .hotel-card-actions button:first-child {
            flex: 1;
          }
        }
      `}</style>
      {activeChat && <ChatWindow booking={activeChat} onClose={() => setActiveChat(null)} />}
      </div>
    </div>
  );
};

export default HotelManagerDashboard;
