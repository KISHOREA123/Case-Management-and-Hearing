import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);

    const loadUserPermissions = async () => {
        try {
            const { data } = await api.get('/permissions/me');
            setPermissions(data.permissions);
            setIsAdmin(data.isAdmin);
        } catch (error) {
            console.error('Failed to fetch permissions', error);
        }
    };

    useEffect(() => {
        const savedAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
        const activeAccountId = localStorage.getItem('activeAccountId');

        const initAuth = async () => {
            if (savedAccounts.length > 0) {
                setAccounts(savedAccounts);
                const activeAccount = savedAccounts.find(a => a.user._id === activeAccountId) || savedAccounts[0];
                setUser(activeAccount.user);
                localStorage.setItem('token', activeAccount.token);
                localStorage.setItem('activeAccountId', activeAccount.user._id);
                await loadUserPermissions();
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });

        const newAccount = { user: data, token: data.token };
        const updatedAccounts = [...accounts.filter(a => a.user._id !== data._id), newAccount];

        setAccounts(updatedAccounts);
        setUser(data);
        localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
        localStorage.setItem('token', data.token);
        localStorage.setItem('activeAccountId', data._id);

        await loadUserPermissions();

        return data;
    };

    const switchAccount = (accountId) => {
        const account = accounts.find(a => a.user._id === accountId);
        if (account) {
            setUser(account.user);
            localStorage.setItem('token', account.token);
            localStorage.setItem('activeAccountId', account.user._id);
            window.location.reload(); // Reload to refresh all data for the new role
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }

        const updatedAccounts = accounts.filter(a => a.user._id !== user._id);
        setAccounts(updatedAccounts);
        localStorage.setItem('accounts', JSON.stringify(updatedAccounts));

        if (updatedAccounts.length > 0) {
            switchAccount(updatedAccounts[0].user._id);
        } else {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('accounts');
            localStorage.removeItem('activeAccountId');
        }
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        const newAccount = { user: data, token: data.token };
        const updatedAccounts = [...accounts.filter(a => a.user._id !== data._id), newAccount];

        setAccounts(updatedAccounts);
        setUser(data);
        localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
        localStorage.setItem('token', data.token);
        localStorage.setItem('activeAccountId', data._id);

        return data;
    };

    return (
        <AuthContext.Provider value={{ user, accounts, loading, permissions, isAdmin, login, register, logout, switchAccount, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
