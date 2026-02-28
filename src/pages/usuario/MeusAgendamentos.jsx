import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { FiCalendar, FiClock, FiClipboard, FiXCircle } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { maskPhone } from '../../utils/formatters';
import { Loader } from '../../components/ui/Loader';

const Container = styled.div`
  padding: 24px;
  h2 {
    font-size: ${({ theme }) => theme.typography.sizes.title};
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  p.subtitle {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 24px;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
  }
`;

const SearchBox = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  align-items: flex-end;

  > div {
    flex: 1;
  }
`;

const AgendamentoCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusBadge = styled.span`
  background: ${({ theme, status }) => status === 'agendado' ? 'rgba(245, 158, 11, 0.1)' : status === 'concluido' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${({ theme, status }) => status === 'agendado' ? '#b45309' : status === 'concluido' ? '#047857' : '#b91c1c'};
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  align-self: flex-start;
`;

export default function MeusAgendamentos() {
    const { user } = useAuth();
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState(null);

    const fetchMeusAgendamentos = async () => {
        if (!user) return;
        try {
            // Removemos o orderBy('data', 'desc') do Firestore para evitar erro de falta de índice composto. 
            // Faremos a ordenação localmente após buscar os dados.
            const q = query(
                collection(db, 'agendamentos'),
                where('userId', '==', user.uid)
            );
            const snap = await getDocs(q);
            const agendamentosRetornados = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Ordenação por data decrescente (mais recentes primeiro) localmente
            agendamentosRetornados.sort((a, b) => new Date(b.data) - new Date(a.data));

            setAgendamentos(agendamentosRetornados);
        } catch (err) {
            console.error("Erro ao buscar agendamentos do usuário:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeusAgendamentos();
    }, [user]);

    const [telefoneBusca, setTelefoneBusca] = useState('');
    const [buscando, setBuscando] = useState(false);

    const handleBuscarPorTelefone = async () => {
        if (telefoneBusca.length < 14) {
            toast.error("Digite um telefone válido");
            return;
        }
        setBuscando(true);
        try {
            const q = query(
                collection(db, 'agendamentos'),
                where('contato', '==', telefoneBusca)
            );
            const snap = await getDocs(q);
            const agendamentosRetornados = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            agendamentosRetornados.sort((a, b) => new Date(b.data) - new Date(a.data));

            if (agendamentosRetornados.length === 0) {
                toast.error("Nenhum agendamento encontrado para este número.");
            } else {
                toast.success(`Encontramos ${agendamentosRetornados.length} agendamentos!`);
            }
            setAgendamentos(agendamentosRetornados);
        } catch (err) {
            console.error("Erro ao buscar por telefone:", err);
            toast.error("Erro ao buscar agendamentos.");
        } finally {
            setBuscando(false);
        }
    };

    const handleCancelar = async (id) => {
        if (!window.confirm("Você tem certeza de que deseja cancelar este agendamento?")) return;
        setCanceling(id);
        try {
            await updateDoc(doc(db, 'agendamentos', id), {
                status: 'cancelado'
            });
            toast.success("Agendamento cancelado com sucesso!");
            fetchMeusAgendamentos(); // Atualiza a lista após cancelamento
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);
            toast.error("Erro ao cancelar o agendamento.");
        } finally {
            setCanceling(null);
        }
    };

    if (loading) return <Loader text="Carregando seus agendamentos..." fullHeight />;

    return (
        <Container>
            <h2>Meus Agendamentos</h2>
            <p className="subtitle">Consulte o histórico dos seus agendamentos abaixo.</p>

            <SearchBox>
                <Input
                    label="Não encontrou? Busque pelo CPF/Telefone"
                    placeholder="(11) 99999-9999"
                    value={telefoneBusca}
                    onChange={e => setTelefoneBusca(maskPhone(e.target.value))}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleBuscarPorTelefone();
                        }
                    }}
                />
                <Button onClick={handleBuscarPorTelefone} disabled={buscando}>
                    {buscando ? 'Buscando...' : 'Buscar'}
                </Button>
            </SearchBox>

            {agendamentos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8b8685' }}>
                    <FiClipboard size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p>Você ainda não realizou nenhum agendamento (ou não encontramos com este número).</p>
                </div>
            ) : (
                agendamentos.map(agen => {
                    const dataFormatada = format(new Date(agen.data), "dd 'de' MMM, yyyy", { locale: ptBR });
                    return (
                        <AgendamentoCard key={agen.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: 18 }}>{agen.nomeServico}</strong>
                                <StatusBadge status={agen.status}>{agen.status}</StatusBadge>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#8b8685', fontSize: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiCalendar /> {dataFormatada}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiClock /> {agen.horario}
                                </div>
                            </div>

                            {agen.status === 'agendado' && (
                                <div style={{ marginTop: 8 }}>
                                    <Button
                                        variant="outline"
                                        style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
                                        onClick={() => handleCancelar(agen.id)}
                                        disabled={canceling === agen.id}
                                    >
                                        <FiXCircle /> {canceling === agen.id ? 'Cancelando...' : 'Cancelar Agendamento'}
                                    </Button>
                                </div>
                            )}
                        </AgendamentoCard>
                    );
                })
            )}
        </Container>
    );
}
