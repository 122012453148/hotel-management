import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ReviewSection = ({ hotelId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [hotelId]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${hotelId}`);
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to leave a review');
    
    try {
      setLoading(true);
      await api.post('/reviews', { hotelId, rating, comment });
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '4rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <MessageSquare size={32} color="var(--primary)" /> Guest Reviews
      </h2>

      <form onSubmit={handleSubmit} className="glass-morphism" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Leave a Review</h3>
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              size={24} 
              color={star <= rating ? '#f59e0b' : '#d1d5db'} 
              fill={star <= rating ? '#f59e0b' : 'transparent'}
              style={{ cursor: 'pointer' }}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <textarea 
          placeholder={user ? "Share your experience..." : "Please login to share your experience..."} 
          value={comment} 
          onChange={(e) => setComment(e.target.value)}
          style={{ marginBottom: '1.5rem', width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', resize: 'vertical' }}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {loading ? 'Submitting...' : <><Send size={18} /> Post Review</>}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <motion.div 
              key={review._id} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <User size={20} color="var(--text-light)" />
                   </div>
                   <div>
                     <p style={{ fontWeight: 600, margin: 0 }}>{review.user?.name}</p>
                     <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} color="#f59e0b" fill={i < review.rating ? '#f59e0b' : 'transparent'} />
                  ))}
                </div>
              </div>
              <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>{review.comment}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
