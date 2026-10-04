import axios from 'axios';

// Ek common API client banaya jo humare Spring Boot server se connect karega
const api = axios.create({
    baseURL: 'http://localhost:9090', // Direct connection to AUTH-SERVICE (Bypassing API Gateway for testing)
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