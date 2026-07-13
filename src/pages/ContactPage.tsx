import React, { useEffect } from 'react';
import Contact from '../components/Contact';

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact Us | ColorMyTrip – Plan Your Trip';
  }, []);

  return (
    <div className="animate-fade-in">
      <Contact />
    </div>
  );
}
