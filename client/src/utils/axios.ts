import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config();

const api = axios.create({
    baseURL: process.env.BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization= `Bearer ${token}`
    }
    return config;
})

export default api