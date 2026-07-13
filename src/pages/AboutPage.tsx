import React, { useEffect } from 'react';
import About from '../components/About';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Us | ColorMyTrip – Our Story & Team';
  }, []);

  return (
    <div className="animate-fade-in">
      <About />
    </div>
  );
}
