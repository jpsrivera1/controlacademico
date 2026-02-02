import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error('Por favor ingresa usuario y contraseña');
            return;
        }

        setLoading(true);
        try {
            const response = await login({ username, password });
            
            if (response.data.success) {
                // Guardar datos del usuario en localStorage
                localStorage.setItem('user', JSON.stringify({
                    id: response.data.userId,
                    username: response.data.username
                }));
                
                toast.success('¡Bienvenido!');
                
                // Forzar recarga completa para actualizar el estado de autenticación
                window.location.href = '/';
            } else {
                toast.error('Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Error en login:', error);
            toast.error(error.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Logo y título */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-900 rounded-full mb-4">
                            <i className="bi bi-person-badge text-white text-4xl"></i>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Control Académico</h1>
                        <p className="text-gray-500 mt-2">Sistema NFC de Asistencias</p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <i className="bi bi-person-fill mr-2"></i>
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Ingresa tu usuario"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <i className="bi bi-lock-fill mr-2"></i>
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Ingresa tu contraseña"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Verificando...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-box-arrow-in-right"></i>
                                    <span>Iniciar Sesión</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Sistema de Control Académico NFC</p>
                        <p className="mt-1">© 2026 CETI</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
