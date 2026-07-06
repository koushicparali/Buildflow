const API_URL = 'http://localhost:8000/api';

// Helper to get auth token
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const headers = {
        ...getAuthHeaders(),
        ...options.headers,
    };
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized (Token expired)
    if (response.status === 401 && !options._retry) {
        options._retry = true;
        const refreshToken = sessionStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh: refreshToken })
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    sessionStorage.setItem('access_token', data.access);
                    headers['Authorization'] = `Bearer ${data.access}`;
                    response = await fetch(url, { ...options, headers });
                } else {
                    throw new Error('Refresh failed');
                }
            } catch (err) {
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');
                window.location.href = '/signup';
                throw new Error("Unauthorized");
            }
        } else {
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
            window.location.href = '/signup';
            throw new Error("Unauthorized");
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    // Return null for 204 No Content
    if (response.status === 204) return null;

    return response.json();
};

export const apiFetchBlob = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const headers = { ...getAuthHeaders(), ...options.headers };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401 && !options._retry) {
        options._retry = true;
        const refreshToken = sessionStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh: refreshToken })
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    sessionStorage.setItem('access_token', data.access);
                    headers['Authorization'] = `Bearer ${data.access}`;
                    response = await fetch(url, { ...options, headers });
                } else throw new Error('Refresh failed');
            } catch (err) {
                window.location.href = '/signup';
                throw new Error("Unauthorized");
            }
        }
    }

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
};
