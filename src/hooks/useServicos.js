import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useServicos = (tenantId) => {
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchServicos = async () => {
        try {
            if (!tenantId) return;

            setLoading(true);
            const q = query(
                collection(db, 'servicos'),
                where('empresaId', '==', tenantId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setServicos(data);
        } catch (err) {
            console.error("Erro ao buscar serviços:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicos();
    }, [tenantId]);

    return { servicos, loading, error, refetch: fetchServicos };
};
