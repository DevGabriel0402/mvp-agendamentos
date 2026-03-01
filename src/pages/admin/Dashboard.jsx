import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiDollarSign, FiChevronLeft, FiChevronRight, FiUser, FiPhone } from 'react-icons/fi';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/ui/Loader';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

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

const CalendarContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 32px;
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h3 {
      font-size: ${({ theme }) => theme.typography.sizes.lg};
      color: ${({ theme }) => theme.colors.textPrimary};
      text-transform: capitalize;
    }
    
    .nav {
      display: flex;
      gap: 8px;
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
`;

const DayCell = styled.button`
  padding: 16px 8px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 2px solid ${({ theme, $isSelected, $isToday }) =>
    $isSelected ? theme.colors.primary :
      ($isToday ? `${theme.colors.primary}40` : theme.colors.border)
  };
  background: ${({ theme, $isSelected }) => $isSelected ? `${theme.colors.primary}10` : 'transparent'};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}05`};
  }
  
  .weekday {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
    font-weight: bold;
  }
  
  .daynum {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  
  .badge {
    padding: 2px 8px;
    background: ${({ theme, $hasItems }) => $hasItems ? theme.colors.primary : 'transparent'};
    color: #fff;
    border-radius: theme.radii.full;
    font-size: 10px;
    font-weight: bold;
    min-height: 18px;
  }
`;

const DayDetails = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  h3 {
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${({ theme }) => theme.colors.textPrimary};
    
    span { color: ${({ theme }) => theme.colors.primary}; }
  }
`;

const AppointmentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child { border-bottom: none; }
  
  .main-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .time {
      font-weight: bold;
      color: ${({ theme }) => theme.colors.primary};
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .service {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.textPrimary};
    }
  }
  
  .client-info {
    text-align: right;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    
    div { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
  }
`;

export default function Dashboard() {
  const { empresa } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalAgendamentos: 0,
    concluidos: 0,
    pendentes: 0,
    faturamentoTotal: 0
  });

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyAppointments, setWeeklyAppointments] = useState({});
  const [loading, setLoading] = useState(true);

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!empresa?.id) return;
      try {
        // 1. Fetch Todos os Clientes (para stats)
        const clientesQuery = query(collection(db, 'clientes'), where('empresaId', '==', empresa.id));
        const clientesSnap = await getDocs(clientesQuery);

        // 2. Fetch Agendamentos (Todos para stats e filtrados para o calendário via lógica JS por enquanto para simplificar o MVP)
        // Nota: Em produção, filtrar por data no Firestore é melhor, mas aqui vamos buscar e organizar.
        const agendamentosQuery = query(collection(db, 'agendamentos'), where('empresaId', '==', empresa.id));
        const agendamentosSnap = await getDocs(agendamentosQuery);

        let totalAgendamentos = agendamentosSnap.size;
        let concluidos = 0;
        let pendentes = 0;
        let faturamentoTotal = 0;
        const appointmentsByDate = {};

        agendamentosSnap.forEach(doc => {
          const data = { id: doc.id, ...doc.data() };
          if (data.status === 'concluido') {
            concluidos++;
            faturamentoTotal += Number(data.valorOriginal || 0);
          } else if (data.status === 'agendado') {
            pendentes++;
          }

          if (data.data) {
            if (!appointmentsByDate[data.data]) appointmentsByDate[data.data] = [];
            appointmentsByDate[data.data].push(data);
          }
        });

        // Ordenar horários dentro de cada dia
        Object.keys(appointmentsByDate).forEach(date => {
          appointmentsByDate[date].sort((a, b) => a.horario.localeCompare(b.horario));
        });

        setWeeklyAppointments(appointmentsByDate);
        setStats({
          totalClientes: clientesSnap.size,
          totalAgendamentos,
          concluidos,
          pendentes,
          faturamentoTotal
        });

      } catch (err) {
        console.error("Erro ao carregar Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [empresa?.id]);

  const handlePrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));

  if (loading) return <Loader text="Carregando painel..." fullHeight />;

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayAppointments = weeklyAppointments[selectedDateStr] || [];

  return (
    <div>
      <Title>Dashboard de Atendimento</Title>

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

      {/* Calendário Semanal */}
      <CalendarContainer>
        <div className="calendar-header">
          <h3>{format(currentWeekStart, "'Semana de' d 'de' MMMM", { locale: ptBR })}</h3>
          <div className="nav">
            <Button $variant="outline" $size="small" onClick={handlePrevWeek}><FiChevronLeft /></Button>
            <Button $variant="outline" $size="small" onClick={() => {
              const today = startOfWeek(new Date(), { weekStartsOn: 1 });
              setCurrentWeekStart(today);
              setSelectedDate(new Date());
            }}>Hoje</Button>
            <Button $variant="outline" $size="small" onClick={handleNextWeek}><FiChevronRight /></Button>
          </div>
        </div>

        <CalendarGrid>
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = weeklyAppointments[dateStr]?.length || 0;
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <DayCell
                key={dateStr}
                $isSelected={isSelected}
                $isToday={isToday}
                $hasItems={count > 0}
                onClick={() => setSelectedDate(day)}
              >
                <span className="weekday">{format(day, 'EEE', { locale: ptBR })}</span>
                <span className="daynum">{format(day, 'dd')}</span>
                <div className="badge">{count > 0 ? `${count} itens` : '-'}</div>
              </DayCell>
            );
          })}
        </CalendarGrid>
      </CalendarContainer>

      {/* Detalhes do Dia Selecionado */}
      <DayDetails>
        <h3>
          Agendamentos de <span>{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
        </h3>

        {dayAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8B8685' }}>
            <FiCalendar style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }} />
            <p>Nenhum agendamento para este dia.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dayAppointments.map(a => (
              <AppointmentItem key={a.id}>
                <div className="main-info">
                  <div className="time"><FiClock /> {a.horario}</div>
                  <div className="service">{a.nomeServico}</div>
                </div>
                <div className="client-info">
                  <div style={{ fontWeight: 'bold', color: '#2D2A26' }}>{a.nomeCliente}</div>
                  <div><FiPhone size={12} /> {a.contato || 'Sem telefone'}</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: a.status === 'concluido' ? '#10B98120' : '#F59E0B20',
                      color: a.status === 'concluido' ? '#10B981' : '#F59E0B'
                    }}>
                      {a.status}
                    </span>
                  </div>
                </div>
              </AppointmentItem>
            ))}
            <Button
              $variant="ghost"
              $fullWidth
              style={{ marginTop: 16 }}
              onClick={() => navigate('../atendimentos', { state: { data: selectedDateStr } })}
            >
              Ver todos os detalhes
            </Button>
          </div>
        )}
      </DayDetails>
    </div>
  );
}
