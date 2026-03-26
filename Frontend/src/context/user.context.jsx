import React, { createContext, useState, useEffect } from 'react';

const USER_STORAGE_KEY = 'ai_user';
const TOKEN_STORAGE_KEY = 'ai_token';
export const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
            if (storedUser) setUser(JSON.parse(storedUser));
            if (storedToken) setToken(storedToken);
        } catch (e) {
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Persist user and token to localStorage when changed
    useEffect(() => {
        try {
            if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            else localStorage.removeItem(USER_STORAGE_KEY);

            if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
            else localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch (e) {
            // storage failure is non-blocking
        }
    }, [user, token]);

    const login = (userObj, jwtToken) => {
        setUser(userObj);
        setToken(jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const updateUser = (partial) => setUser((prev) => ({ ...prev, ...partial }));

    return (
        <UserContext.Provider value={{ user, token, login, logout, updateUser, setUser, setToken, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

