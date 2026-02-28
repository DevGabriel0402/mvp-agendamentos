import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiLogOut, FiCalendar, FiGrid, FiList } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useServicos } from '../../hooks/useServicos';
import { ServiceCard } from '../../components/cards/ServiceCard';

const PageContainer = styled.div`
  padding-bottom: 80px; /* Espaço para algo colado no rodapé se precisar */
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Greeting = styled.div`
  h2 {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  p {
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 16px;
  
  button {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 20px;
    padding: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.background};
    
    &:hover {
      background: ${({ theme }) => theme.colors.border};
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const Content = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 16px;
`;

const GridServicos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;

  button {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: all 0.2s;

    &.active {
      background: rgba(221, 167, 165, 0.1);
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const ListServicos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

export default function Home() {
  const { user, logout } = useAuth();
  const { servicos, loading } = useServicos();
  const navigate = useNavigate();

  const [favoritos, setFavoritos] = useState([]);
  const [clienteCache, setClienteCache] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem('mvp_favoritos')) || [];
    setFavoritos(salvos);

    const cli = JSON.parse(localStorage.getItem('mvp_cliente_data'));
    if (cli && cli.nome) {
      setClienteCache(cli);
    }
  }, []);

  const handleAgendar = (servico) => {
    // Redireciona para tela de Agendamento passando o servico por ID
    navigate(`/agendar/${servico.id}`);
  };

  const handleFavoritar = (id) => {
    let novosFavs;
    if (favoritos.includes(id)) {
      novosFavs = favoritos.filter(fId => fId !== id);
    } else {
      novosFavs = [...favoritos, id];
    }
    setFavoritos(novosFavs);
    localStorage.setItem('mvp_favoritos', JSON.stringify(novosFavs));
  };

  const handleSair = async () => {
    await logout();
    navigate('/entrada', { replace: true });
  };

  return (
    <PageContainer>
      <Header>
        <Greeting>
          {clienteCache ? (
            <h2>Bem-vindo de volta, {clienteCache.nome.split(' ')[0]}! 👋</h2>
          ) : (
            <h2>Olá, {user?.displayName || 'Visitante'} 👋</h2>
          )}
          <p>O que vamos agendar hoje?</p>
        </Greeting>
        <HeaderActions>
          <button onClick={handleSair} title="Sair do aplicativo">
            <FiLogOut />
          </button>
        </HeaderActions>
      </Header>

      <Content>
        <div>
          <SectionHeader>
            <SectionTitle style={{ marginBottom: 0 }}>Serviços Disponíveis</SectionTitle>
            <ViewToggle>
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
                title="Ver em Cards"
              >
                <FiGrid size={18} />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
                title="Ver em Lista"
              >
                <FiList size={18} />
              </button>
            </ViewToggle>
          </SectionHeader>

          {loading ? (
            <Loader text="Carregando serviços..." />
          ) : servicos.length === 0 ? (
            <EmptyState>
              <p>Nenhum serviço disponível no momento.</p>
            </EmptyState>
          ) : viewMode === 'grid' ? (
            <GridServicos>
              {servicos.map(srv => (
                <ServiceCard
                  key={srv.id}
                  servico={srv}
                  isFavoritado={favoritos.includes(srv.id)}
                  onFavoritar={handleFavoritar}
                  onAgendar={handleAgendar}
                />
              ))}
            </GridServicos>
          ) : (
            <ListServicos>
              {servicos.map(srv => (
                <ServiceCard
                  key={srv.id}
                  servico={srv}
                  variant="list"
                  isFavoritado={favoritos.includes(srv.id)}
                  onFavoritar={handleFavoritar}
                  onAgendar={handleAgendar}
                />
              ))}
            </ListServicos>
          )}
        </div>
      </Content>
    </PageContainer>
  );
}
