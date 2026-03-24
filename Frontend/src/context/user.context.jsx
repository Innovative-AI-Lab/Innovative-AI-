import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'ai_user';
export const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setUser(JSON.parse(raw));
        } catch (e) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    // Persist to localStorage whenever user changes
    useEffect(() => {
        try {
            if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            else localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            // ignore storage errors
        }
    }, [user]);

    const login = (userObj) => setUser(userObj);
    const logout = () => setUser(null);
    // Merge partial updates without losing existing fields
    const updateUser = (partial) => setUser(prev => ({ ...prev, ...partial }));

    return (
        <UserContext.Provider value={{ user, login, logout, setUser, updateUser }}>
            {children}
        </UserContext.Provider>
    );
}
