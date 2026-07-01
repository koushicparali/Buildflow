const API_URL = 'http://localhost:8000/api';

// Helper to get auth token
const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized (Token expired)
    if (response.status === 401) {
        // Here we could implement token refresh logic.
        // For simplicity, we'll clear token and throw an error to redirect to login.
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/signup'; // redirect to signup/login
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    // Return null for 204 No Content
    if (response.status === 204) return null;

    return response.json();
};
