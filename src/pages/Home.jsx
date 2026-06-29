import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import FeaturesList from '../components/FeaturesList';
import AboutSection from '../components/AboutSection';
import StatsBox from '../components/StatsBox';
import ContactForm from '../components/ContactForm';
import ContactCards from '../components/ContactCards';

const Home = () => {
    return (
        <div>
            <Hero />
            <HowItWorks />
            <FeaturesList />
            <AboutSection />
            <StatsBox />
            <ContactForm />
            <ContactCards />
        </div>
    );
};

export default Home;
