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
                // A lógica de Master será ajustada abaixo, baseada no campo 'permissoes'
                // setIsMaster(currentUser.email === MASTER_EMAIL); // Removido ou ajustado

                // Se não for anônimo, buscar a empresa vinculada
                if (!currentUser.isAnonymous) {
                    try {
                        // Busca na coleção 'administradores' conforme print do usuário
                        const userDoc = await getDoc(doc(db, 'administradores', currentUser.uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            setIsMaster(userData.permissoes === 'master');

                            if (userData.empresaId) {
                                // Tenta primeiro buscar pelo ID direto do documento
                                let empDoc = await getDoc(doc(db, 'empresas', userData.empresaId));
                                let empresaData = null;

                                if (empDoc.exists()) {
                                    empresaData = { id: empDoc.id, ...empDoc.data() };
                                } else {
                                    // FALLBACK: Se não achar pelo ID, tenta buscar pelo SLUG 
                                    // (Caso o usuário tenha colocado o slug no campo empresaId manualmente no Firestore)
                                    const { query, collection, where, getDocs } = await import('firebase/firestore');
                                    const q = query(collection(db, 'empresas'), where('slug', '==', userData.empresaId));
                                    const snap = await getDocs(q);
                                    if (!snap.empty) {
                                        const docSnap = snap.docs[0];
                                        empresaData = { id: docSnap.id, ...docSnap.data() };

                                        // AUTO-CORREÇÃO: Salva o ID real no perfil do admin para futuras visitas e regras de segurança
                                        try {
                                            const { updateDoc, doc } = await import('firebase/firestore');
                                            await updateDoc(doc(db, 'administradores', currentUser.uid), {
                                                empresaId: docSnap.id
                                            });
                                            console.log("Perfil de administrador atualizado com o ID real da empresa.");
                                        } catch (updateErr) {
                                            console.error("Erro ao auto-corrigir empresaId:", updateErr);
                                        }
                                    }
                                }

                                if (empresaData) {
                                    setEmpresa(empresaData);

                                    // MIGRAR SE NECESSÁRIO
                                    try {
                                        const { migrarDadosParaEmpresa } = await import('../utils/migration');
                                        await migrarDadosParaEmpresa(currentUser.uid, empresaData.id);
                                    } catch (e) { }
                                }
                            }
                        } else {
                            // AUTO-SETUP PARA O PRIMEIRO ADMIN
                            console.log("Configurando empresa padrão para novo admin...");
                            const novaEmpresaId = 'empresa_' + currentUser.uid.substring(0, 5);
                            const empresaData = {
                                nome: 'Minha Empresa SaaS',
                                slug: 'minha-empresa',
                                corTema: '#3B82F6',
                                active: true,
                                createdAt: new Date()
                            };

                            const { setDoc, serverTimestamp } = await import('firebase/firestore');
                            await setDoc(doc(db, 'empresas', novaEmpresaId), empresaData);

                            // Vincular na coleção 'administradores' com o campo 'permissoes'
                            await setDoc(doc(db, 'administradores', currentUser.uid), {
                                empresaId: novaEmpresaId,
                                permissoes: 'admin',
                                email: currentUser.email,
                                nome: currentUser.displayName || 'Admin',
                                createdAt: serverTimestamp()
                            });

                            // Migrar dados órfãos para a nova empresa
                            try {
                                const { migrarDadosParaEmpresa } = await import('../utils/migration');
                                await migrarDadosParaEmpresa(currentUser.uid, novaEmpresaId);
                            } catch (migError) {
                                console.error("Erro na migração automática:", migError);
                            }

                            setEmpresa({ id: novaEmpresaId, ...empresaData });
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
            setEmpresa,
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
