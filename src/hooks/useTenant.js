import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useTenant(slugOverride = null) {
    const { tenantSlug: routeSlug } = useParams();
    const tenantSlug = slugOverride || routeSlug;
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!tenantSlug || tenantSlug === 'admin' || tenantSlug === 'master' || tenantSlug === 'entrada') {
            setLoading(false);
            setTenant(null);
            return;
        }

        const fetchTenant = async () => {
            try {
                setLoading(true);
                const q = query(collection(db, 'empresas'), where('slug', '==', tenantSlug));
                const snap = await getDocs(q);

                if (!snap.empty) {
                    const doc = snap.docs[0];
                    setTenant({ id: doc.id, ...doc.data() });
                } else {
                    setError('Empresa não encontrada');
                }
            } catch (err) {
                console.error("Erro ao buscar inquilino:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTenant();
    }, [tenantSlug]);

    return { tenant, loading, error };
}
