import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuoteModal from './components/QuoteModal';
import Home from './pages/Home';
import Features from './pages/Features';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardProjectManager from './pages/DashboardProjectManager';
import DashboardEngineer from './pages/DashboardEngineer';
import DashboardContractor from './pages/DashboardContractor';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import './index.css';

const ScrollToTopAndReveal = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };
    
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    }, 100);

    return () => {
      revealObserver.disconnect();
    };
  }, [pathname]);

  return null;
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsModalOpen(true);
    window.addEventListener('openQuoteModal', handleOpen);
    return () => window.removeEventListener('openQuoteModal', handleOpen);
  }, []);

  return (
    <Router>
      <ScrollToTopAndReveal />
      <div className="ambient-glow"></div>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/dashboard-pm" element={<DashboardProjectManager />} />
        <Route path="/dashboard-engineer" element={<DashboardEngineer />} />
        <Route path="/dashboard-contractor" element={<DashboardContractor />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>

      <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Footer />
    </Router>
  );
}

export default App;
