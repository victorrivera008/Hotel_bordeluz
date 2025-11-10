import React from 'react';
import SearchForm from './SearchForm'; 

const style = {
    mainContainer: {
        minHeight: '80vh',
        fontFamily: 'Georgia, serif',
        backgroundColor: '#F4E8D8', 
    },
    section: {
        padding: '60px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
    },
    title: {
        color: '#4A2A1A', 
        marginBottom: '40px',
        fontSize: '2.5rem',
        position: 'relative',
        display: 'inline-block',
    },
    heroSection: {
        height: '700px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        backgroundImage: 'url(https://www.hotelbordeluz.cl/en/wp-content/uploads/2020/11/slide-h.jpg)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        marginBottom: '0px', 
    },
    heroOverlay: {
        position: 'absolute',
        top: '120px',
        textAlign: 'center',
        color: '#4A2A1A', 
        textShadow: '0 0 5px rgba(255, 255, 255, 0.9)', 
        backgroundColor: 'rgba(255, 255, 255, 0.4)', 
        padding: '20px 40px',
        borderRadius: '10px',
    },
    heroTitle: {
        fontSize: '3.5rem', 
        margin: 0,
        color: '#4A2A1A', 
    }
};

const Home = () => {
    return (
        <div style={style.mainContainer}>
            
            <div style={style.heroSection}>
                <div style={style.heroOverlay}>
                    <h1 style={style.heroTitle}>Hotel Boutique & Restaurant</h1>
                    <p style={{ fontSize: '1.5rem', marginTop: '10px', color: '#4A2A1A' }}>entre Villarrica y Pucón</p>
                </div>
            </div>

        </div>
    );
};

export default Home;