import React from 'react';
import { Hotel, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#04091e', color: 'white', padding: '5rem 0 2rem 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          {/* Brand Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <img src="/logo.png" alt="Royal Hotel Logo" style={{ width: '35px', height: '35px', borderRadius: '50%' }} />
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>Royal Hotel Bookings</span>
            </div>
            <p style={{ color: '#777777', lineHeight: '24px', fontSize: '14px', marginBottom: '2rem' }}>
              Experience luxury beyond limits. We provide the best-in-class hotel booking experience with handpicked premium properties worldwide.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '2rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '16px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Home', 'Accommodation', 'About Us', 'Contact', 'Admin'].map((link, i) => (
                <li key={i} style={{ marginBottom: '1rem' }}>
                  <Link to={link === 'Home' ? '/' : link === 'Admin' ? '/admin' : '/hotels'} style={{ color: '#777777', textDecoration: 'none', fontSize: '14px' }}>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '2rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '16px' }}>Contact Us</h4>
            <ul style={{ listStyle: 'none', padding: 0, color: '#777777', fontSize: '14px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <MapPin size={18} color="var(--primary)" />
                <span>123 Luxury Lane, Chennai, India</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Phone size={18} color="var(--primary)" />
                <span>+91 98765 43210</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Mail size={18} color="var(--primary)" />
                <span>support@royalhotel.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '2rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '16px' }}>Newsletter</h4>
            <p style={{ color: '#777777', marginBottom: '1.5rem', fontSize: '14px' }}>Subscribe to get the latest updates and offers.</p>
            <div style={{ display: 'flex' }}>
              <input 
                type="email" 
                placeholder="Your email" 
                style={{ backgroundColor: 'white', border: 'none', padding: '12px 20px', flex: 1, borderRadius: 0, fontSize: '13px' }} 
              />
              <button className="btn-primary" style={{ padding: '0 20px' }}>Join</button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem', textAlign: 'center', color: '#777777', fontSize: '13px' }}>
          <p>© {new Date().getFullYear()} Royal Hotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
