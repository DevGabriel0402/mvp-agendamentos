import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { FiHome, FiUsers, FiCalendar, FiSettings, FiMenu, FiLogOut, FiEdit, FiExternalLink } from 'react-icons/fi';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { useConfiguracoes } from '../../hooks/useConfiguracoes';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Sidebar = styled.aside`
  width: ${({ $isOpen }) => ($isOpen ? '260px' : '80px')};
  background-color: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
  z-index: 20;

  @media (max-width: 768px) {
    display: none; /* Em mobile usaremos a TabBar Inferior */
  }
`;

const SidebarHeader = styled.div`
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: ${({ $isOpen }) => ($isOpen ? 'space-between' : 'center')};
  padding: 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h2 {
    font-size: 20px;
    color: ${({ theme }) => theme.colors.primary};
    display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
    transition: opacity 0.2s;
  }
`;

const MenuButton = styled.button`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavList = styled.nav`
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s;
  justify-content: ${({ $isOpen }) => ($isOpen ? 'flex-start' : 'center')};

  svg {
    font-size: 20px;
    flex-shrink: 0;
  }

  span {
    display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
    filter: brightness(0.9);
  }

  &.active {
    background-color: ${({ theme }) => `${theme.colors.primary}1A`}; /* 1A = 10% opacidade */
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SidebarFooter = styled.div`
  padding: 24px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radii.md};
  justify-content: ${({ $isOpen }) => ($isOpen ? 'flex-start' : 'center')};

  &:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }

  svg {
    font-size: 20px;
  }

  span {
    display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Topbar = styled.header`
  height: 72px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const MobileMenuBtn = styled(MenuButton)`
  display: none;
  @media (max-width: 768px) {
    display: flex;
  }
`;

const PageScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background-color: ${({ theme }) => theme.colors.background};

  @media (max-width: 768px) {
    padding: 16px;
    padding-bottom: 80px; /* Espaço pro TabBar Inferior */
  }
`;

const MobileTabBar = styled.nav`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 64px;
    background-color: ${({ theme }) => theme.colors.surface};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    justify-content: space-around;
    align-items: center;
    z-index: 50;
  }
`;

const MobileTabItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
  height: 100%;
  
  svg {
    font-size: 20px;
    transition: all 0.2s;
  }
  
  span {
    font-size: 10px;
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    
    svg {
      transform: scale(1.1);
      fill: ${({ theme }) => theme.colors.primary};
      fill-opacity: 0.2;
    }
  }
`;

export default function AdminLayout() {
  const { tenantSlug } = useParams();
  const [isOpen, setIsOpen] = useState(true);
  const [adminNome, setAdminNome] = useState('');
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { config } = useConfiguracoes();
  const theme = useTheme();

  useEffect(() => {
    const fetchAdminName = async () => {
      if (user?.uid) {
        try {
          // Buscar nome diretamente pelo UID (ID do documento)
          // Isso evita erros de "insufficient permissions" em queries complexas
          const docRef = doc(db, 'administradores', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().nome) {
            setAdminNome(docSnap.data().nome);
          }
        } catch (error) {
          console.error("Erro ao buscar nome do admin:", error);
        }
      }
    };
    fetchAdminName();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/entrada', { replace: true });
  };

  return (
    <LayoutContainer>
      <Sidebar $isOpen={isOpen}>
        <SidebarHeader $isOpen={isOpen}>
          <h2>Painel</h2>
          <MenuButton onClick={() => setIsOpen(!isOpen)}>
            <FiMenu />
          </MenuButton>
        </SidebarHeader>

        <NavList>
          <StyledNavLink to={`/${tenantSlug}/admin`} end $isOpen={isOpen}>
            <FiHome /> <span>Dashboard</span>
          </StyledNavLink>
          <StyledNavLink to={`/${tenantSlug}/admin/servicos`} $isOpen={isOpen}>
            <FiEdit /> <span>Serviços</span>
          </StyledNavLink>
          <StyledNavLink to={`/${tenantSlug}/admin/atendimentos`} $isOpen={isOpen}>
            <FiCalendar /> <span>Atendimentos</span>
          </StyledNavLink>
          <StyledNavLink to={`/${tenantSlug}/admin/clientes`} $isOpen={isOpen}>
            <FiUsers /> <span>Clientes</span>
          </StyledNavLink>
          <StyledNavLink to={`/${tenantSlug}/admin/configuracoes`} $isOpen={isOpen}>
            <FiSettings /> <span>Configurações</span>
          </StyledNavLink>
        </NavList>

        <SidebarFooter>
          <LogoutButton $isOpen={isOpen} onClick={handleLogout}>
            <FiLogOut /> <span>Sair da Conta</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <MainContent>
        <Topbar>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: config?.corTema || theme.colors.primary,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {config?.nomeApp ? config.nomeApp.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <span style={{ fontWeight: 500 }}>{config?.nomeApp || 'Painel Admin'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a
              href={`/${tenantSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: theme.colors.primary,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              <FiExternalLink /> Ver Agendamento
            </a>
            <MobileMenuBtn onClick={handleLogout} style={{ color: '#ef4444' }} title="Sair da Conta">
              <FiLogOut />
            </MobileMenuBtn>
          </div>
        </Topbar>
        <PageScroll>
          <Outlet />
        </PageScroll>
      </MainContent>

      <MobileTabBar>
        <MobileTabItem to={`/${tenantSlug}/admin`} end>
          <FiHome /> <span>Início</span>
        </MobileTabItem>
        <MobileTabItem to={`/${tenantSlug}/admin/servicos`}>
          <FiSettings /> <span>Serviços</span>
        </MobileTabItem>
        <MobileTabItem to={`/${tenantSlug}/admin/atendimentos`}>
          <FiCalendar /> <span>Agenda</span>
        </MobileTabItem>
        <MobileTabItem to={`/${tenantSlug}/admin/clientes`}>
          <FiUsers /> <span>Clientes</span>
        </MobileTabItem>
      </MobileTabBar>
    </LayoutContainer>
  );
}
