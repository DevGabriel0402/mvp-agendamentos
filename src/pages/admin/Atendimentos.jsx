import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { FiCheck, FiX, FiCalendar, FiClock, FiUser, FiPhone, FiCreditCard } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { Select } from '../../components/ui/Select';
import { Loader } from '../../components/ui/Loader';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    font-size: ${({ theme }) => theme.typography.sizes.title};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const GridAtendimentos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const AtendimentoCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const HeaderCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  padding-bottom: 12px;

  .servico {
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    color: ${({ theme }) => theme.colors.primaryDark};
  }

  .status {
    padding: 4px 10px;
    border-radius: ${({ theme }) => theme.radii.full};
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    text-transform: uppercase;
  }
  
  .status.agendado { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
  .status.concluido { background: rgba(16, 185, 129, 0.1); color: #10B981; }
  .status.cancelado { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};

  svg { color: ${({ theme }) => theme.colors.primary}; }
  strong { color: ${({ theme }) => theme.colors.textPrimary}; }
`;

export default function Atendimentos() {
    const { empresa } = useAuth();
    const [atendimentos, setAtendimentos] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [dataFiltro, setDataFiltro] = useState('');
    const [loading, setLoading] = useState(true);

    const filterOptions = [
        { value: 'todos', label: 'Todos os Status' },
        { value: 'agendado', label: 'Pendentes' },
        { value: 'concluido', label: 'Concluídos' },
        { value: 'cancelado', label: 'Cancelados' }
    ];

    const fetchAtendimentos = async () => {
        try {
            if (!empresa?.id) return;

            setLoading(true);
            const q = query(
                collection(db, 'agendamentos'),
                where('empresaId', '==', empresa.id)
            );
            const snap = await getDocs(q);
            let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            data.sort((a, b) => {
                if (a.data === b.data) {
                    return a.horario.localeCompare(b.horario);
                }
                return a.data.localeCompare(b.data);
            });

            setAtendimentos(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAtendimentos();
    }, [empresa?.id]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'agendamentos', id), { status: newStatus });
            toast.success(`Atendimento marcado como ${newStatus}!`);
            fetchAtendimentos();
        } catch (error) {
            console.error("Erro ao mudar status", error);
            toast.error("Erro ao atualizar status: " + error.message);
        }
    };

    const filtered = atendimentos.filter(a => {
        const matchesStatus = filtro === 'todos' ? true : a.status === filtro;
        const matchesData = dataFiltro ? a.data === dataFiltro : true;
        return matchesStatus && matchesData;
    });

    return (
        <div>
            <PageHeader>
                <h1>Gerenciar Atendimentos</h1>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ width: '180px' }}>
                        <DatePicker
                            label="Filtrar por data"
                            value={dataFiltro}
                            onChange={(e) => setDataFiltro(e.target.value)}
                            placeholder="dd/mm/aaaa"
                        />
                    </div>
                    <div style={{ width: '220px' }}>
                        <Select
                            label="Filtrar por Status"
                            options={filterOptions}
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                </div>
            </PageHeader>

            {loading ? (
                <Loader text="Carregando atendimentos..." />
            ) : filtered.length === 0 ? (
                <p style={{ color: '#8B8685' }}>Nenhum atendimento encontrado para este filtro.</p>
            ) : (
                <GridAtendimentos>
                    {filtered.map(a => {
                        const d = new Date(a.data);
                        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());

                        return (
                            <AtendimentoCard key={a.id}>
                                <HeaderCard>
                                    <div className="servico">{a.nomeServico}</div>
                                    <div className={`status ${a.status}`}>{a.status}</div>
                                </HeaderCard>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <InfoRow><FiCalendar /> <span>Data:</span> <strong>{format(d, "dd 'de' MMM, yyyy", { locale: ptBR })}</strong></InfoRow>
                                    <InfoRow><FiClock /> <span>Horário:</span> <strong>{a.horario}</strong></InfoRow>
                                    <InfoRow><FiUser /> <span>Cliente:</span> <strong>{a.nomeCliente}</strong></InfoRow>
                                    <InfoRow><FiPhone /> <span>Contato:</span> <strong>{a.contato || '-'}</strong></InfoRow>
                                    <InfoRow><FiCreditCard /> <span>Pagamento:</span> <strong>{a.formaPagamento}</strong> ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(a.valorOriginal || 0)})</InfoRow>
                                </div>

                                {a.status === 'agendado' && (
                                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                        <Button
                                            fullWidth
                                            style={{ background: '#10B981', color: '#fff' }}
                                            onClick={() => handleStatusChange(a.id, 'concluido')}
                                        >
                                            <FiCheck /> Concluir
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outline"
                                            style={{ color: '#EF4444', borderColor: '#EF4444' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleStatusChange(a.id, 'cancelado');
                                            }}
                                        >
                                            <FiX /> Cancelar
                                        </Button>
                                    </div>
                                )}
                            </AtendimentoCard>
                        )
                    })}
                </GridAtendimentos>
            )}
        </div>
    );
}
