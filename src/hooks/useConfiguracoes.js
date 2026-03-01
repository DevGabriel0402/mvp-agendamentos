import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useConfiguracoes = (empresaOverride = null) => {
    const { empresa: authEmpresa, loading: authLoading } = useAuth();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const empresaFinal = empresaOverride || authEmpresa;

    useEffect(() => {
        // Prioridade 1: empresaOverride (Tenant da URL)
        if (empresaOverride) {
            setConfig({
                horariosDisponiveis: empresaOverride.horariosDisponiveis || ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
                diasFuncionamento: empresaOverride.diasFuncionamento || [1, 2, 3, 4, 5, 6],
                nomeApp: empresaOverride.nome || 'Meu Agendamento',
                whatsapp: empresaOverride.whatsapp || '',
                corTema: empresaOverride.corTema || '#3B82F6',
                logoUrl: empresaOverride.logoUrl || '',
                enderecoEstabelecimento: empresaOverride.enderecoEstabelecimento || '',
                coordenadas: empresaOverride.coordenadas || { lat: -23.55052, lng: -46.633308 }
            });
            setLoading(false);
            return;
        }

        // Prioridade 2: Empresa Autenticada (Admin)
        if (!authLoading && authEmpresa) {
            setConfig({
                horariosDisponiveis: authEmpresa.horariosDisponiveis || ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
                diasFuncionamento: authEmpresa.diasFuncionamento || [1, 2, 3, 4, 5, 6],
                nomeApp: authEmpresa.nome || 'Meu Agendamento',
                whatsapp: authEmpresa.whatsapp || '',
                corTema: authEmpresa.corTema || '#3B82F6',
                logoUrl: authEmpresa.logoUrl || '',
                enderecoEstabelecimento: authEmpresa.enderecoEstabelecimento || '',
                coordenadas: authEmpresa.coordenadas || { lat: -23.55052, lng: -46.633308 }
            });
            setLoading(false);
        } else if (!authLoading) {
            // Sem empresa vinculada
            setLoading(false);
        }
    }, [empresaOverride, authEmpresa, authLoading]);

    return { config, loading };
};
