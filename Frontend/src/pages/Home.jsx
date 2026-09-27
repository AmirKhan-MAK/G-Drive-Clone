import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Browser se token delete kar diya (logout ho gaya)
        navigate('/login'); // Wapas login page par bhej diya
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to G-Drive Clone!</h1>
                <p className="text-gray-600 mb-8">
                    If you see this page, it means you are successfully logged in using JWT Authentication.
                    Yahan par hum aage chalkar apne files aur folders dikhayenge.
                </p>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}