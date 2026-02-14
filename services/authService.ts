import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// API Base URL - configure via environment variable
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        avatar?: string;
        bio?: string;
        isAdmin: boolean;
    };
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
}

interface JWTPayload {
    userId: string;
    email: string;
    isAdmin: boolean;
    exp: number;
}

class AuthService {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        // Load tokens from localStorage on initialization
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.setupAxiosInterceptors();
    }

    /**
     * Setup axios interceptors to automatically add auth headers
     * and handle token refresh on 401 errors
     */
    private setupAxiosInterceptors() {
        // Request interceptor - add auth header
        axios.interceptors.request.use(
            (config) => {
                if (this.accessToken && config.url?.startsWith(API_URL)) {
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle token refresh
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If 401 and we haven't retried yet, try to refresh token
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const newAccessToken = await this.refreshAccessToken();
                        if (newAccessToken) {
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        this.logout();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
                email,
                password,
            });

            const { accessToken, refreshToken, user } = response.data;
            this.setTokens(accessToken, refreshToken);

            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async register(data: RegisterData): Promise<LoginResponse> {
        try {
            const response = await axios.post<LoginResponse>(`${API_URL}/auth/register`, data);

            const { accessToken, refreshToken } = response.data;
            this.setTokens(accessToken, refreshToken);

            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(data: { name?: string; email?: string; bio?: string; avatar?: string; password?: string }): Promise<any> {
        try {
            const response = await axios.patch(`${API_URL}/users/profile`, data);
            return response.data;
        } catch (error) {
            console.error('Update profile failed:', error);
            throw error;
        }
    }

    /**
     * Logout - clear tokens and user data
     */
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('mnostva_user');
    }

    /**
     * Refresh access token using refresh token
     */
    private async refreshAccessToken(): Promise<string | null> {
        if (!this.refreshToken) {
            return null;
        }

        try {
            const response = await axios.post<{ accessToken: string }>(`${API_URL}/auth/refresh`, {
                refreshToken: this.refreshToken,
            });

            const { accessToken } = response.data;
            this.setTokens(accessToken, this.refreshToken);

            return accessToken;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return null;
        }
    }

    /**
     * Store tokens in memory and localStorage
     */
    private setTokens(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    /**
     * Get current access token
     */
    getAccessToken(): string | null {
        return this.accessToken;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        if (!this.accessToken) {
            return false;
        }

        try {
            const decoded = jwtDecode<JWTPayload>(this.accessToken);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch {
            return false;
        }
    }

    /**
     * Get user info from token
     */
    getUserFromToken(): JWTPayload | null {
        if (!this.accessToken) {
            return null;
        }

        try {
            return jwtDecode<JWTPayload>(this.accessToken);
        } catch {
            return null;
        }
    }

    /**
     * Mock login for development (fallback when backend is not available)
     */
    async mockLogin(email: string, password: string): Promise<boolean> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (email === '123@123.com' && password === '123123') {
            // Create mock JWT-like token (not real JWT, just for development)
            const mockToken = btoa(JSON.stringify({
                userId: 'u1',
                email: email,
                exp: Date.now() / 1000 + 3600 // 1 hour from now
            }));

            this.setTokens(mockToken, mockToken);
            return true;
        }

        return false;
    }
}

// Export singleton instance
export const authService = new AuthService();
