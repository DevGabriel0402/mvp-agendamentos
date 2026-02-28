import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useConfiguracoes = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                // Assumimos que a configuração fica no doc "geral" da coleção "configuracoes"
                const docRef = doc(db, 'configuracoes', 'geral');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setConfig(docSnap.data());
                } else {
                    setConfig({
                        horariosDisponiveis: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
                        diasFuncionamento: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
                        nomeApp: 'MVP Agendamento',
                        whatsapp: '',
                        corTema: '#DDA7A5',
                        logoUrl: ''
                    });
                }
            } catch (err) {
                console.error("Erro ao buscar configurações:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    return { config, loading };
};
