import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { useConfiguracoes } from '../../hooks/useConfiguracoes';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Loader } from '../../components/ui/Loader';
import { FiChevronLeft, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { maskPhone } from '../../utils/formatters';

// ... Vamos construir o CSS e a tela

const Page = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  padding-bottom: 80px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 10;
  
  button {
    font-size: 24px;
    display: flex;
    align-items: center;
  }
  
  h2 {
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  }
`;

const Content = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SectionBox = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  h3 {
    font-size: ${({ theme }) => theme.typography.sizes.md};
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ServiceSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  margin-bottom: 16px;
  
  h4 { font-size: ${({ theme }) => theme.typography.sizes.lg}; }
  span { 
    font-weight: bold; 
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const DateScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar { display: none; }
`;

const DateBox = styled.button`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 80px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 2px solid ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, selected }) => selected ? 'rgba(221, 167, 165, 0.1)' : theme.colors.surface};
  color: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textPrimary};
  
  span:first-child { font-size: ${({ theme }) => theme.typography.sizes.sm}; text-transform: capitalize; }
  span:last-child { font-size: ${({ theme }) => theme.typography.sizes.xl}; font-weight: bold; }
`;

const TimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
`;

const TimeBox = styled.button`
  padding: 12px 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, selected }) => selected ? theme.colors.surface : theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  
  &:disabled {
    opacity: 0.4;
    background: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default function Agendamento() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { config } = useConfiguracoes();

    const [servico, setServico] = useState(null);
    const [loading, setLoading] = useState(true);

    // States do Flow
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [horarioSelecionado, setHorarioSelecionado] = useState(null);
    const [clienteData, setClienteData] = useState({
        nome: '',
        cpf: '',
        contato: '',
        endereco: '',
        formaPagamento: 'Pix' // Default
    });

    // Auto-preencher caso já tenha agendado antes
    useEffect(() => {
        const cached = localStorage.getItem('mvp_cliente_data');
        if (cached) {
            setClienteData(JSON.parse(cached));
        }
    }, []);

    const [agendamentosOcupados, setAgendamentosOcupados] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchServico = async () => {
            try {
                const docRef = doc(db, 'servicos', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setServico({ id: docSnap.id, ...docSnap.data() });
                } else {
                    toast.error("Serviço não encontrado");
                    navigate('/home');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchServico();
    }, [id, navigate]);

    // Buscar os agendamentos já ocupados na data selecionada
    useEffect(() => {
        if (!dataSelecionada) return;

        const fetchOcupados = async () => {
            const q = query(
                collection(db, 'agendamentos'),
                where('data', '==', format(dataSelecionada, 'yyyy-MM-dd')),
                // Considerando que status cancelado libera o horário, mas agendado/concluido ocupa
                where('status', 'in', ['agendado', 'concluido'])
            );
            const snap = await getDocs(q);
            const times = snap.docs.map(d => d.data().horario);
            setAgendamentosOcupados(times);
        };
        fetchOcupados();
    }, [dataSelecionada]);

    // Gera array com os próximos 14 dias
    const proxdias = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

    const handleFinalizar = async () => {
        if (!dataSelecionada || !horarioSelecionado || !clienteData.nome || !clienteData.contato) {
            toast.error("Preencha os dados e escolha um horário.");
            return;
        }
        setSubmitting(true);
        try {
            // 1. Verificar se cliente já existe pelo Contato (Simulação de busca automática)
            let clienteId = null;
            const qCliente = query(collection(db, 'clientes'), where('contato', '==', clienteData.contato));
            const clienteSnap = await getDocs(qCliente);

            if (!clienteSnap.empty) {
                clienteId = clienteSnap.docs[0].id;
            } else {
                // Criar cliente
                const novoClienteRef = await addDoc(collection(db, 'clientes'), {
                    ...clienteData,
                    userId: user.uid,
                    createdAt: serverTimestamp()
                });
                clienteId = novoClienteRef.id;
            }

            // 2. Criar Agendamento (Agora com Contato Explícito no topo do Payload)
            const payloadAgendamento = {
                contato: clienteData.contato, // Adicionado para aparecer no painel Admin sem depender só da collection cliente
                clienteId,
                servicoId: servico.id,
                nomeCliente: clienteData.nome,
                nomeServico: servico.nome,
                valorOriginal: servico.valor,
                data: format(dataSelecionada, 'yyyy-MM-dd'),
                horario: horarioSelecionado,
                formaPagamento: clienteData.formaPagamento,
                status: 'agendado',
                createdAt: serverTimestamp(),
                userId: user.uid
            };

            await addDoc(collection(db, 'agendamentos'), payloadAgendamento);

            // 3. Salvar no Caché / LocalStorage para a próxima visita
            localStorage.setItem('mvp_cliente_data', JSON.stringify(clienteData));

            // Sucesso
            navigate('/sucesso', { replace: true, state: { data: dataSelecionada, horario: horarioSelecionado, servico: servico.nome } });
        } catch (err) {
            console.error(err);
            toast.error("Erro ao finalizar agendamento.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !servico) return <Loader text="Carregando..." fullHeight />;

    return (
        <Page>
            <Header>
                <button onClick={() => navigate(-1)}><FiChevronLeft /></button>
                <h2>Finalizar Agendamento</h2>
            </Header>

            <Content>
                {/* Resumo do Serviço */}
                <SectionBox>
                    <ServiceSummary>
                        <div>
                            <h4>{servico.nome}</h4>
                            <p style={{ fontSize: 14, color: '#8b8685' }}>{servico.descricao}</p>
                        </div>
                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.valor || 0)}</span>
                    </ServiceSummary>
                </SectionBox>

                {/* Escolha de Data */}
                <SectionBox>
                    <h3><FiCalendar /> Escolha a Data</h3>
                    <DateScroll>
                        {proxdias.map(d => {
                            const isSelected = dataSelecionada && format(dataSelecionada, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd');
                            return (
                                <DateBox key={d.toISOString()} selected={isSelected} onClick={() => {
                                    setDataSelecionada(d);
                                    setHorarioSelecionado(null); // Reseta horário se mudar o dia
                                }}>
                                    <span>{format(d, 'EEE', { locale: ptBR })}</span>
                                    <span>{format(d, 'dd')}</span>
                                </DateBox>
                            )
                        })}
                    </DateScroll>
                </SectionBox>

                {/* Escolha de Horário (Só mostra se a data estiver selecionada) */}
                {dataSelecionada && (
                    <SectionBox>
                        <h3><FiClock /> Escolha o Horário</h3>
                        <TimeGrid>
                            {config?.horariosDisponiveis?.map(time => {
                                const isOcupado = agendamentosOcupados.includes(time);
                                const isSelected = horarioSelecionado === time;
                                return (
                                    <TimeBox
                                        key={time}
                                        disabled={isOcupado}
                                        selected={isSelected}
                                        onClick={() => setHorarioSelecionado(time)}
                                    >
                                        {time}
                                    </TimeBox>
                                )
                            })}
                        </TimeGrid>
                    </SectionBox>
                )}

                {/* Dados Pessoais */}
                {horarioSelecionado && (
                    <SectionBox>
                        <h3><FiCheckCircle /> Seus Dados</h3>
                        <FormGrid>
                            <Input
                                label="Nome Completo *"
                                placeholder="Ex: Maria Alice"
                                value={clienteData.nome}
                                onChange={e => setClienteData({ ...clienteData, nome: e.target.value })}
                            />
                            <Input
                                label="Telefone / WhatsApp *"
                                placeholder="(00) 00000-0000"
                                value={clienteData.contato}
                                onChange={e => setClienteData({ ...clienteData, contato: maskPhone(e.target.value) })}
                            />
                            <Input
                                label="Endereço (Opcional)"
                                placeholder="Seu endereço..."
                                value={clienteData.endereco}
                                onChange={e => setClienteData({ ...clienteData, endereco: e.target.value })}
                            />
                            <Select
                                label="Forma de Pagamento Base"
                                value={clienteData.formaPagamento}
                                onChange={e => setClienteData({ ...clienteData, formaPagamento: e.target.value })}
                                options={[
                                    { value: 'Pix', label: 'Pix no local' },
                                    { value: 'Cartão', label: 'Cartão via Maquininha' },
                                    { value: 'Dinheiro', label: 'Dinheiro' }
                                ]}
                            />
                        </FormGrid>
                    </SectionBox>
                )}

            </Content>

            {/* Rodapé Fixo */}
            {horarioSelecionado && (
                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: '#fff', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)' }}>
                    <Button fullWidth size="large" onClick={handleFinalizar} disabled={submitting}>
                        {submitting ? 'Aguarde...' : 'Confirmar Agendamento'}
                    </Button>
                </div>
            )}
        </Page>
    );
}
