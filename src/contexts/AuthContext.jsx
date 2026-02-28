import React, { createContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInAnonymously,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const loginAnonimo = async () => {
        try {
            setLoading(true);
            return await signInAnonymously(auth);
        } catch (error) {
            console.error("Erro no login anônimo", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loginAdmin = async (email, password) => {
        try {
            setLoading(true);
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Erro no login admin", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao sair", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginAnonimo, loginAdmin, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
