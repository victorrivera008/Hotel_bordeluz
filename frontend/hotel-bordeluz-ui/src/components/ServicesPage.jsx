// frontend/hotel-bordeluz-ui/src/components/ServicesPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaSpa, FaUtensils, FaCocktail, FaRegCalendarCheck, FaEuroSign } from 'react-icons/fa';

// --- Estilos para la página de servicios ---
const style = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px',
        backgroundColor: '#F4E8D8',
        minHeight: '80vh',
    },
    header: {
        textAlign: 'center',
        color: '#4A2A1A',
        marginBottom: '50px',
    },
    title: {
        fontSize: '3rem',
        borderBottom: '3px solid #D4AF37',
        display: 'inline-block',
        paddingBottom: '10px',
    },
    servicesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        border: '1px solid #EAEAEA',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    content: {
        padding: '25px',
        textAlign: 'left',
    },
    serviceTitle: {
        color: '#4A2A1A',
        fontSize: '1.5rem',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
    },
    priceTag: {
        backgroundColor: '#D4AF37',
        color: 'white',
        padding: '10px 15px',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        textAlign: 'center',
    }
};


const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/servicios/');
                
                const getIcon = (name) => {
                    if (name.toLowerCase().includes('spa') || name.toLowerCase().includes('masaje')) return <FaSpa />;
                    if (name.toLowerCase().includes('restaurant') || name.toLowerCase().includes('cena')) return <FaUtensils />;
                    if (name.toLowerCase().includes('tinaja')) return <FaEuroSign />;
                    if (name.toLowerCase().includes('evento') || name.toLowerCase().includes('salon')) return <FaRegCalendarCheck />;
                    return <FaCocktail />;
                };
                
                const enrichedServices = response.data.map(service => ({
                    ...service,
                    serviceIcon: getIcon(service.nombre)
                }));

                setServices(enrichedServices);
            } catch (err) {
                setError('No se pudieron cargar los servicios. Asegúrate de que el Backend esté corriendo.');
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
    };

    if (loading) {
        return <div style={{...style.container, textAlign: 'center'}}>Cargando experiencias...</div>;
    }

    if (error) {
        return <div style={{...style.container, color: 'red'}}>{error}</div>;
    }

    if (services.length === 0) {
        return <div style={{...style.container, textAlign: 'center'}}>No hay servicios adicionales cargados en la base de datos.</div>;
    }

    return (
        <div style={style.container}>
            <div style={style.header}>
                <h1 style={style.title}>Nuestras Experiencias Exclusivas</h1>
                <p style={{ marginTop: '15px', color: '#4A2A1A' }}>Complementa tu estadía con nuestro Restaurant gourmet, Spa y Tinajas climatizadas.</p>
            </div>

            <div style={style.servicesGrid}>
                {services.map((service) => (
                    <div key={service.id} style={style.card}>
                        <div style={style.content}>
                            <h2 style={style.serviceTitle}>
                                {service.serviceIcon} <span style={{ marginLeft: '10px' }}>{service.nombre}</span>
                            </h2>
                            {/* ⚠️ CORREGIDO: Eliminamos la línea de 'service.descripcion' */}
                        </div>
                        <div style={style.priceTag}>
                            {formatPrice(service.precio)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesPage;