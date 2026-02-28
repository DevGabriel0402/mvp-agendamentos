import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [empresa, setEmpresa] = useState(null);
    const [isMaster, setIsMaster] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Verificar se é Master Admin (UID fixo para este MVP ou via custom claim futuramente)
                // Substitua pelo seu UID após o primeiro login se desejar
                const MASTER_EMAIL = 'admin@admin.com';
                setIsMaster(currentUser.email === MASTER_EMAIL);

                // Se não for anônimo, buscar a empresa vinculada
                if (!currentUser.isAnonymous) {
                    try {
                        // Buscamos na coleção 'usuarios' que mapeia UID -> empresaId
                        const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            const empDoc = await getDoc(doc(db, 'empresas', userData.empresaId));
                            if (empDoc.exists()) {
                                setEmpresa({ id: empDoc.id, ...empDoc.data() });
                            }
                        }
                    } catch (error) {
                        console.error("Erro ao carregar dados da empresa", error);
                    }
                }
            } else {
                setEmpresa(null);
                setIsMaster(false);
            }

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
        <AuthContext.Provider value={{
            user,
            empresa,
            isMaster,
            loading,
            loginAnonimo,
            loginAdmin,
            logout
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
