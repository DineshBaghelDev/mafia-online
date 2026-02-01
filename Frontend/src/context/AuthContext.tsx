'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in (from localStorage)
        const storedUser = localStorage.getItem('mafia_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                localStorage.removeItem('mafia_user');
            }
        }
        setIsLoading(false);
    }, []);

    const signup = async (email: string, username: string, password: string) => {
        try {
            // In a real app, this would be an API call
            // For now, store in localStorage (simulated signup)
            const existingUsers = localStorage.getItem('mafia_users');
            const users = existingUsers ? JSON.parse(existingUsers) : {};

            // Check if email already exists
            if (users[email]) {
                throw new Error('Email already registered');
            }

            // Create new user
            const newUser: User = {
                id: Date.now().toString(),
                email,
                username
            };

            // Store user credentials (in real app, this would be hashed and stored in backend)
            users[email] = {
                password, // In real app: hash this!
                user: newUser
            };

            localStorage.setItem('mafia_users', JSON.stringify(users));
            localStorage.setItem('mafia_user', JSON.stringify(newUser));
            setUser(newUser);
        } catch (error) {
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            // In a real app, this would be an API call
            const existingUsers = localStorage.getItem('mafia_users');
            const users = existingUsers ? JSON.parse(existingUsers) : {};

            const userData = users[email];
            if (!userData || userData.password !== password) {
                throw new Error('Invalid email or password');
            }

            localStorage.setItem('mafia_user', JSON.stringify(userData.user));
            setUser(userData.user);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('mafia_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
