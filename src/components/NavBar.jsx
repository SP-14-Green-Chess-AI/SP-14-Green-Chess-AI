import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isAbout = location.pathname.includes('about');

  return (
    <nav style={{
      background: 'white',
      padding: '12px 16px',
      textAlign: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <Link
        to="/"
        style={{ color: isAbout ? '#aaaa' : 'black', margin: '0 24px', textDecoration: 'none', fontWeight: 700, fontSize: '17px' }}
      >
        Play Chess
      </Link>
      <Link
        to="/about"
        style={{ color: isAbout ? 'aaaa' : 'black', margin: '0 24px', textDecoration: 'none', fontWeight: 700, fontSize: '17px' }}
      >
        Project Info
      </Link>
    </nav>
  );
}
