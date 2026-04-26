import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.role === 'Admin') navigate('/admin/dashboard');
            else if (data.role === 'Teacher') navigate('/teacher/dashboard');
            else if (data.role === 'Student') navigate('/student/dashboard');
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const updateUser = (updatedData) => {
        const merged = { ...user, ...updatedData };
        setUser(merged);
        localStorage.setItem('userInfo', JSON.stringify(merged));
    };

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    // Convenience: authenticated axios get/post/put/delete
    const api = {
        get: (url, params) => axios.get(url, { ...getAuthHeaders(), params }),
        post: (url, data) => axios.post(url, data, getAuthHeaders()),
        put: (url, data) => axios.put(url, data, getAuthHeaders()),
        delete: (url) => axios.delete(url, getAuthHeaders()),
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser, getAuthHeaders, api }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
