// frontend/hotel-bordeluz-ui/src/App.jsx (CÓDIGO COMPLETO Y FINAL)

import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './components/Home'; 
import AuthModalContent from './components/AuthModalContent';
import DashboardEjecutivo from './components/DashboardEjecutivo'; 
import RoomsPage from './components/RoomsPage'; 
import ServicesPage from './components/ServicesPage'; 
import BookingPage from './components/BookingPage'; 
import ProfilePage from './components/ProfilePage'; 
import { AuthProvider, useAuth } from './context/AuthContext';


const modalStyle = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
    },
    content: {
        backgroundColor: 'white', padding: '30px', borderRadius: '8px',
        maxWidth: '400px', width: '90%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        position: 'relative', fontFamily: 'Georgia, serif',
    },
    closeButton: {
        position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none',
        fontSize: '1.5rem', cursor: 'pointer', color: '#4A2A1A',
    }
};

const BREAKPOINT = 900; 

const AppContent = () => {
    const [currentPage, setCurrentPage] = useState('Home');
    const [showLogin, setShowLogin] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINT);
    
    const { isAuthenticated, userInfo, loading } = useAuth(); 
    
    const isStaff = isAuthenticated && userInfo?.rol !== 'Cliente';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < BREAKPOINT);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    
    if (loading) {
        return (
            <div style={{
                backgroundColor: '#F4E8D8', 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                fontSize: '1.5rem', 
                color: '#4A2A1A'
            }}>
                Cargando Hotel Bordeluz...
            </div>
        );
    }

    const renderContent = () => {
        if (isStaff) {
            switch (currentPage) {
                case 'Profile':
                    return <ProfilePage />;
                case 'Home': 
                default:
                    if(currentPage === 'Home') setCurrentPage('Dashboard'); 
                    return <DashboardEjecutivo />;
            }
        }
        
        switch (currentPage) {
            case 'Reservar':
                return <BookingPage triggerLogin={() => setShowLogin(true)} />;
            case 'Habitaciones':
                return <RoomsPage />; 
            case 'Servicios':
                return <ServicesPage />; 
            case 'Contacto':
                 return (
                    <div style={{padding: '80px', textAlign: 'center', minHeight: '60vh', backgroundColor: '#F4E8D8'}}>
                        <h2 style={{color: '#4A2A1A'}}>Formulario y Ubicación</h2>
                        <p>Información de contacto, formulario de contacto y mapa.</p>
                    </div>
                 );
            case 'Profile':
                return isAuthenticated ? <ProfilePage /> : <Home triggerLogin={() => setShowLogin(true)} />;
            
            case 'Home':
            default:
                return <Home triggerLogin={() => setShowLogin(true)} />;
        }
    };
    
    return (
        <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            backgroundColor: '#F4E8D8', 
            minHeight: '100vh',
            width: '100vw', 
            overflowX: 'hidden',
            boxSizing: 'border-box'
        }}>
            
            <Header 
                onLoginClick={() => setShowLogin(true)} 
                onNavigate={setCurrentPage} 
                isStaff={isStaff} 
                isMobile={isMobile}
            />
            
            <main style={{ boxSizing: 'border-box' }}>
                {renderContent()}
            </main>
            
            {!isStaff && <Footer />}

            {showLogin && !isAuthenticated && (
                <div style={modalStyle.overlay} onClick={() => setShowLogin(false)}>
                    <div style={modalStyle.content} onClick={e => e.stopPropagation()}>
                        <button 
                            style={modalStyle.closeButton} 
                            onClick={() => setShowLogin(false)}
                            aria-label="Cerrar"
                        >
                            &times;
                        </button>
                        <AuthModalContent onSuccess={() => setShowLogin(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};


function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;