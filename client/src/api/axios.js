import axios from 'axios';

// For production, VITE_API_URL should be set in Vercel to your backend URL (e.g., https://your-api.vercel.app)
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Ensure we have a valid URL and append /api if not present
if (baseUrl) {
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '');
    // Append /api if it's not already there
    if (!baseUrl.endsWith('/api')) {
        baseUrl = `${baseUrl}/api`;
    }
}

const api = axios.create({
    baseURL: baseUrl,
    headers: { 'Content-Type': 'application/json' },
});

export default api;
