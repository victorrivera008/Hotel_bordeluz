// frontend/hotel-bordeluz-ui/src/components/ProfilePage.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Estilos (similares al Modal de Login)
const style = {
    container: {
        maxWidth: '600px',
        margin: '40px auto',
        padding: '30px',
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Georgia, serif',
    },
    title: {
        color: '#4A2A1A',
        borderBottom: '2px solid #D4AF37',
        paddingBottom: '10px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginTop: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        color: '#666',
        fontSize: '0.9rem',
        marginBottom: '5px',
    },
    input: {
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '1rem',
    },
    button: {
        padding: '12px 25px',
        backgroundColor: '#D4AF37',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '10px',
    },
    message: {
        padding: '10px',
        borderRadius: '5px',
        marginTop: '15px',
        textAlign: 'center',
    },
    success: {
        backgroundColor: '#D4EDDA',
        color: '#155724',
    },
    error: {
        backgroundColor: '#F8D7DA',
        color: '#721C24',
    }
};

const ProfilePage = () => {
    const { userInfo } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        telefono: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 1. Cargar datos del perfil al montar el componente
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userInfo) return; // Esperar a que el contexto cargue
            setLoading(true);
            try {
                // Llama a la nueva API de perfil
                const response = await api.get('/auth/profile/');
                setFormData(response.data);
            } catch (err) {
                setError('No se pudo cargar la información del perfil.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userInfo]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // 2. Guardar cambios (PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Llama a la API de perfil con PUT
            const response = await api.put('/auth/profile/', formData);
            setFormData(response.data); // Actualizar con los datos guardados
            setSuccess('¡Perfil actualizado con éxito!');
        } catch (err) {
            setError('Error al guardar los cambios.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.username) {
        return <div style={style.container}>Cargando perfil...</div>;
    }

    return (
        <div style={style.container}>
            <h1 style={style.title}>Mi Perfil</h1>
            <p>Aquí puedes actualizar tu información de contacto.</p>
            
            <form style={style.form} onSubmit={handleSubmit}>
                
                <div style={style.inputGroup}>
                    <label style={style.label} htmlFor="username">Usuario (No editable)</label>
                    <input style={{...style.input, backgroundColor: '#EEE'}} type="text" id="username" name="username" value={formData.username} readOnly />
                </div>

                <div style={style.inputGroup}>
                    <label style={style.label} htmlFor="email">Email</label>
                    <input style={style.input} type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                
                <div style={style.inputGroup}>
                    <label style={style.label} htmlFor="first_name">Nombre</label>
                    <input style={style.input} type="text" id="first_name" name="first_name" value={formData.first_name || ''} onChange={handleChange} />
                </div>

                <div style={style.inputGroup}>
                    <label style={style.label} htmlFor="last_name">Apellido</label>
                    <input style={style.input} type="text" id="last_name" name="last_name" value={formData.last_name || ''} onChange={handleChange} />
                </div>

                <div style={style.inputGroup}>
                    <label style={style.label} htmlFor="telefono">Teléfono</label>
                    <input style={style.input} type="tel" id="telefono" name="telefono" value={formData.telefono || ''} onChange={handleChange} />
                </div>

                <button type="submit" style={style.button} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                
                {success && <div style={{...style.message, ...style.success}}>{success}</div>}
                {error && <div style={{...style.message, ...style.error}}>{error}</div>}

            </form>
        </div>
    );
};

export default ProfilePage;