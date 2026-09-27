import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Backend ko credentials bheje
            const response = await api.post('/api/auth/login', { email, password });

            // Response se JWT token nikal kar browser ki local storage me save kar liya
            const token = response.data.token;
            localStorage.setItem('token', token);

            // Successfully login ke baad Home page par chale jao
            navigate('/home');
        } catch (error) {
            alert('Login failed. Check your credentials.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Login</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-3 border rounded outline-none focus:border-green-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border rounded outline-none focus:border-green-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full bg-green-500 text-white p-3 rounded font-bold hover:bg-green-600 transition">
                        Login
                    </button>
                </form>

                <p className="mt-4 text-sm text-center text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
}