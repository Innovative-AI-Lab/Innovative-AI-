import React, { useState, useEffect } from 'react';
import { UserContext } from './UserContext';

const USER_STORAGE_KEY = 'ai_user';
const TOKEN_STORAGE_KEY = 'ai_token';



export function UserProvider({ children }) {

    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem(USER_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
    const [isLoading, setIsLoading] = useState(false);

    // Persist user and token to localStorage when changed
    useEffect(() => {
        try {
            if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            else localStorage.removeItem(USER_STORAGE_KEY);

            if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
            else localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch (e) {
            console.error("Storage persistence error:", e);
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

    const updateUser = (partial) => {
        setUser((prev) => {
            if (!prev) return partial;
            const updated = { ...prev };
            
            // Handle nested settings merge if it exists in partial
            if (partial.settings && prev.settings) {
                updated.settings = { ...prev.settings, ...partial.settings };
                // Also handle nested notifications if they exist
                if (partial.settings.notifications && prev.settings.notifications) {
                    updated.settings.notifications = { ...prev.settings.notifications, ...partial.settings.notifications };
                }
            }
            
            // Merge the rest
            return { ...updated, ...partial, settings: updated.settings || partial.settings || prev.settings };
        });
    };

    return (
        <UserContext.Provider value={{ user, token, login, logout, updateUser, setUser, setToken, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}
