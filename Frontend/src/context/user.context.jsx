// ...existing code...
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'ai_user';
export const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setUser(JSON.parse(raw));
        } catch (e) {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            else localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            // ignore
        }
    }, [user]);

    const login = (userObj) => setUser(userObj); // replace with real auth call
    const logout = () => setUser(null);

    return (
        <UserContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </UserContext.Provider>
    );
}


