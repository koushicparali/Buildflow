import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuoteModal from './components/QuoteModal';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';

const Features = lazy(() => import('./pages/Features'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const Signup = lazy(() => import('./pages/Signup'));
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin'));
const DashboardProjectManager = lazy(() => import('./pages/DashboardProjectManager'));
const DashboardEngineer = lazy(() => import('./pages/DashboardEngineer'));
const DashboardContractor = lazy(() => import('./pages/DashboardContractor'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
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

const FloatingAction = () => {
  return (
    <button className="floating-action-btn" onClick={() => window.dispatchEvent(new Event('openQuoteModal'))}>
      <MessageCircle size={26} />
      <span className="floating-action-tooltip">Get a Quote</span>
    </button>
  );
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
      <AuthProvider>
        <ScrollToTopAndReveal />
        <div className="ambient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="bg-grid"></div>
        <FloatingAction />
        <Navbar />
        
        <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/dashboard-pm" element={
            <ProtectedRoute allowedRoles={['pm', 'admin']}>
              <DashboardProjectManager />
            </ProtectedRoute>
          } />
          <Route path="/dashboard-engineer" element={
            <ProtectedRoute allowedRoles={['engineer', 'admin']}>
              <DashboardEngineer />
            </ProtectedRoute>
          } />
          <Route path="/dashboard-contractor" element={
            <ProtectedRoute allowedRoles={['contractor', 'admin']}>
              <DashboardContractor />
            </ProtectedRoute>
          } />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </Suspense>

      <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
