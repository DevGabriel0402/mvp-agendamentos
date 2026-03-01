import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Loader } from '../../components/ui/Loader';

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.title};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 16px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    
    svg {
      font-size: 24px;
      color: ${({ theme, $colorMode }) =>
        $colorMode === 'primary' ? theme.colors.primary :
            (theme.colors[$colorMode] || theme.colors.primary)
    };
      opacity: 0.8;
    }
  }

  .value {
    font-size: 32px;
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartBox = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  h3 {
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    margin-bottom: 24px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const COLORS = ['#10B981', '#F59E0B', '#EF4444', ({ theme }) => theme.colors.primary];

export default function Dashboard() {
    const { empresa } = useAuth();
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalAgendamentos: 0,
        concluidos: 0,
        pendentes: 0,
        faturamentoTotal: 0
    });

    const [chartData, setChartData] = useState({
        barData: [],
        pieData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Buscar contagem real do Firebase
        const fetchStats = async () => {
            if (!empresa?.id) return;
            try {
                const clientesQuery = query(collection(db, 'clientes'), where('empresaId', '==', empresa.id));
                const agendamentosQuery = query(collection(db, 'agendamentos'), where('empresaId', '==', empresa.id));

                const clientesSnap = await getDocs(clientesQuery);
                const agendamentosSnap = await getDocs(agendamentosQuery);

                const totalAgendamentos = agendamentosSnap.size;
                let concluidos = 0;
                let pendentes = 0;
                let faturamentoTotal = 0;

                const weekCounts = {
                    names: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                    counts: [0, 0, 0, 0, 0, 0, 0]
                };

                const paymentCounts = {};

                agendamentosSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.status === 'concluido') {
                        concluidos++;
                        faturamentoTotal += Number(data.valorOriginal || 0);
                    }
                    else if (data.status === 'agendado') pendentes++;

                    // Gráfico da Semana
                    if (data.data) {
                        try {
                            const [ano, mes, dia] = data.data.split('-');
                            const dateObj = new Date(ano, mes - 1, dia);
                            const day = dateObj.getDay();
                            weekCounts.counts[day]++;
                        } catch (e) { }
                    }

                    // Gráfico de Pizza (Pagamento)
                    if (data.formaPagamento) {
                        const fp = data.formaPagamento;
                        if (!paymentCounts[fp]) paymentCounts[fp] = 0;
                        paymentCounts[fp]++;
                    }
                });

                // Formatar dados pro Recharts
                const rawBarData = weekCounts.names.map((name, index) => ({
                    name,
                    agendamentos: weekCounts.counts[index]
                }));
                // Rotacionar para a semana começar na Segunda
                const domingo = rawBarData.shift();
                rawBarData.push(domingo);

                const rawPieData = Object.keys(paymentCounts).map(key => ({
                    name: key,
                    value: paymentCounts[key]
                }));

                setChartData({
                    barData: rawBarData,
                    pieData: rawPieData.length > 0 ? rawPieData : [{ name: 'Sem dados', value: 1 }]
                });

                setStats({
                    totalClientes: clientesSnap.size,
                    totalAgendamentos,
                    concluidos,
                    pendentes,
                    faturamentoTotal
                });
            } catch (err) {
                console.error(err);
            }
        };
        if (empresa?.id) fetchStats().finally(() => setLoading(false));
        else setLoading(false);
    }, [empresa?.id]);

    if (loading) return <Loader text="Carregando estatísticas..." fullHeight />;

    return (
        <div>
            <Title>Visão Geral</Title>

            <StatsGrid>
                <StatCard $colorMode="primary">
                    <div className="header">
                        <span>Total de Agendamentos</span>
                        <FiCalendar />
                    </div>
                    <div className="value">{stats.totalAgendamentos}</div>
                </StatCard>

                <StatCard $colorMode="warning">
                    <div className="header">
                        <span>Aguardando Atendimento</span>
                        <FiClock />
                    </div>
                    <div className="value">{stats.pendentes}</div>
                </StatCard>

                <StatCard $colorMode="success">
                    <div className="header">
                        <span>Atendimentos Concluídos</span>
                        <FiCheckCircle />
                    </div>
                    <div className="value">{stats.concluidos}</div>
                </StatCard>

                <StatCard $colorMode="primaryDark">
                    <div className="header">
                        <span>Clientes Cadastrados</span>
                        <FiUsers />
                    </div>
                    <div className="value">{stats.totalClientes}</div>
                </StatCard>

                <StatCard $colorMode="success">
                    <div className="header">
                        <span>Faturamento Total</span>
                        <FiDollarSign />
                    </div>
                    <div className="value">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.faturamentoTotal)}
                    </div>
                </StatCard>
            </StatsGrid>

            <ChartsGrid>
                <ChartBox>
                    <h3>Agendamentos da Semana</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.barData}>
                                <XAxis dataKey="name" stroke="#8B8685" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#8B8685" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f4f4f4' }} />
                                <Bar dataKey="agendamentos" fill={({ theme }) => theme.colors.primary} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartBox>

                <ChartBox>
                    <h3>Formas de Pagamento</h3>
                    <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
                        {chartData.pieData.map((d, i) => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8B8685' }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                                {d.name}
                            </div>
                        ))}
                    </div>
                </ChartBox>
            </ChartsGrid>
        </div>
    );
}
