# React + Spring Boot JWT Authentication Guide (For Beginners)

Welcome! Kyunki aap React me beginner hain, is guide me hum bilkul zero se start karenge. Hum React app banayenge, usme styling ke liye Tailwind CSS daalenge, folder structure samjhenge, aur phir Spring Boot backend ke sath connect karenge.

---

## Phase 1: Creating the React Application

Pehle hum create-react-app ki jagah **Vite** ka use karenge. Vite ek modern tool hai jo React apps ko bahot tezi se run karta hai aur development ko easy banata hai.

**1. Open your Terminal (Command Prompt / PowerShell / VS Code Terminal)**
Uss folder me jayiye jahan aapko apna frontend project banana hai. (e.g., `G-Drive-Clone` ke main folder me).

**2. Run the Vite command:**
```bash
npm create vite@latest frontend -- --template react
```
- `npm create vite@latest`: Yeh Vite ka latest version download karke project banata hai.
- `frontend`: Yeh aapke naye folder (project) ka naam hoga.
- `-- --template react`: Yeh Vite ko batata hai ki hume specifically React ka framework chahiye.

**3. Go inside the folder and install default packages:**
```bash
cd frontend
npm install
```
- `npm install`: Vite project me jo bhi default libraries hoti hain, unko download karke `node_modules` folder banata hai.

---

## Phase 2: Installing and Setting Up Tailwind CSS (v4)

Tailwind CSS ek library hai jisse hum direct HTML (JSX) ke andar styling kar sakte hain. Hum Tailwind v4 (latest version) ka use kar rahe hain, jo ki setup me aur bhi aasan hai.

**1. Install Tailwind and Vite Plugin:**
Terminal me (frontend folder ke andar) ye command chalayein:
```bash
npm install tailwindcss @tailwindcss/vite
```

**2. Update `vite.config.js`:**
Apne project ki `vite.config.js` file open karein aur Tailwind ka plugin usme add karein. Wo kuch aisi dikhni chahiye:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```
- *Kyun?* Yeh Vite ko batata hai ki Tailwind CSS ko project ke sath kaise integrate karna hai bina kisi extra configuration file (`tailwind.config.js`) ke.

**3. Update `src/index.css`:**
`src/index.css` ke andar ka saara purana code delete kar dein aur bas ye 1 line add karein:
```css
@import "tailwindcss";
```
*(Note: Aap chahein to `src/App.css` file ko ab delete kar sakte hain kyunki hum Tailwind use karenge).*

---

## Phase 3: Installing Additional Required Libraries

Apne project me hume 2 aur important cheezein chahiye:
1. **Routing** (ek page se dusre page par jaane ke liye, bina page reload kiye).
2. **API Calling** (Spring boot backend se baat karne ke liye).

**Run this command:**
```bash
npm install react-router-dom axios
```
- `react-router-dom`: URL change karne aur alag alag pages (Login, Register, Home) dikhane ke kaam aata hai.
- `axios`: Backend se data bhejne aur mangwane ke liye use hota hai. Yeh frontend aur backend ke beech ek bridge ka kaam karega.

---

## Phase 4: Folder Structure Explained

React me folder structure kaisa hona chahiye, yeh samajhna bahot zaroori hai.

**Default Structure (Jo Vite banata hai):**
```text
frontend/
├── node_modules/       # Saari installed libraries yahan hoti hain (isey kabhi touch na karein)
├── public/             # Static files like favicon
├── src/                # Aapka main source code
│   ├── assets/         # Images, icons
│   ├── App.jsx         # Main application component
│   ├── index.css       # Global CSS (jisme humne tailwind dala)
│   └── main.jsx        # Starting point of React app
├── index.html          # Main HTML file
├── package.json        # Project ki saari info aur libraries ki list
└── vite.config.js      # Vite ki settings
```

**Modified Structure (Jo hum banayenge):**
Bade projects ko clean rakhne ke liye hum `src` folder ke andar kuch naye folders banayenge:
```text
src/
├── components/         # Chote reusable UI elements (e.g., Navbar, Buttons, FileCard)
├── pages/              # Poore poore pages (e.g., Login.jsx, Register.jsx, Home.jsx)
├── services/           # Backend API calls ka code (e.g., api.js)
├── App.jsx
├── index.css
└── main.jsx
```
*Tip: Aap apne project me `components`, `pages` aur `services` naam ke folders abhi bana lijiye `src` ke andar.*

---

## Phase 5: Writing the Code

Ab hum apna actual code likhna shuru karenge.

### 1. API Service Setup (`src/services/api.js`)
`src/services` folder ke andar `api.js` banayein. Yeh file backend se baat karegi aur har request me chupchap humara JWT token add kar degi.

```javascript
import axios from 'axios';

// Ek common API client banaya jo humare Spring Boot server se connect karega
const api = axios.create({
  baseURL: 'http://localhost:8080', // Spring Boot ka base URL. Ensure karein aapka backend isi port pe ho.
});

// Interceptor: Request backend par jaane se theek pehle, yeh chalega.
// Yeh check karega ki kya humare paas JWT token hai. Agar hai, toh usko header me attach kar dega.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Token browser ki memory se nikala
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Backend ko bata diya ki main valid user hu
  }
  return config;
});

export default api;
```

### 2. Creating Pages

**A. `src/pages/Register.jsx`**
Yeh user ka naya account banane ka page hai.
```javascript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); // Page ko automatic reload hone se rokta hai
    try {
      // Backend ko email aur password bheja account create karne ke liye
      await api.post('/api/auth/register', { email, password });
      alert('Registration successful! Please login.');
      navigate('/login'); // Success ke baad Login page par bhej diya
    } catch (error) {
      alert('Registration failed! ' + error.response?.data?.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Register</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full p-3 border rounded outline-none focus:border-blue-500"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border rounded outline-none focus:border-blue-500"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded font-bold hover:bg-blue-600 transition">
            Create Account
          </button>
        </form>
        
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
```

**B. `src/pages/Login.jsx`**
Yahan se user login karega aur backend use JWT token dega.
```javascript
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
```

**C. `src/pages/Home.jsx`**
Yeh dashboard page hai.
```javascript
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
```

### 3. Setting Up App.jsx (Routing & Security)
Ab in sab pages ko aapas me link karenge `src/App.jsx` ke andar. Yahan humne ek security check lagaya hai ki bina login kiye koi Home page par na ja sake.

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Security Guard Wrapper: Yeh check karta hai ki kya user ke browser me token hai?
// Agar nahi hai, toh zabardasti usko Login page par bhej dega.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Koi bhi bina login ke dekh sakta hai */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Route - Sirf logged in user dekh sakte hain */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        {/* Default Route: Agar koi galat URL daale, toh login par redirect kardo */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Phase 6: Running Your Application

Aapka React frontend code ready hai! Isko run karne ke liye terminal me likhein:

```bash
npm run dev
```

Yeh command aapke local server ko start karegi aur terminal me ek URL show karegi (jaise `http://localhost:5173/`). Uss link ko browser me open karein.

---

## The Complete JWT Flow Explained (Kaam kaise karta hai)

1. User **Register** form bharta hai -> Backend me details save hoti hain.
2. User **Login** karta hai -> Spring Boot backend check karta hai ki details sahi hain ya nahi. Agar sahi hain, toh Spring Boot ek secret encoded string banata hai jise **JWT (Json Web Token)** kehte hain aur wo React ko de deta hai.
3. React uss Token ko browser ki **LocalStorage** (memory) me sambhal kar rakh leta hai.
4. Ab aage se jab bhi React koi secure file ya folder backend se mangega, toh wo `axios interceptor` ke zariye uss token ko har request me apne sath bhejega (`Authorization: Bearer <token>`).
5. Backend token ko dekhega, pehchanega, aur data return kar dega.
6. Agar user **Logout** karta hai, toh React apne browser se wo token delete kar dega, jisse backend access dena band kar dega.

## 🔥 Must Do Backend Check (CORS Issue)
Aapki React app `localhost:5173` par chalegi aur Spring Boot `localhost:8080` par. 
Browser by default frontend ko backend se baat nahi karne deta (isey CORS policy bolte hain). 

Isey theek karne ke liye apne Spring Boot Controllers me ye line add karni zaroori hai:
```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController { 
   // Your APIs here
}
```
Yeh line aapke backend ko allow karti hai ki wo aapki React app ki requests accept kare!
