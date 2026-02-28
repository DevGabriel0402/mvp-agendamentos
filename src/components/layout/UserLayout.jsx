import { Outlet, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiCalendar, FiHeart } from 'react-icons/fi';

const Layout = styled.div`
  /* Usa a classe global que já criamos .mobile-app-wrapper pra centralizar */
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 72px; /* espaço da TabBar */
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const TabBarContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 50;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
`;

const TabItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
  height: 100%;
  
  svg {
    font-size: 24px;
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

export default function UserLayout() {
  return (
    <div className="mobile-app-wrapper">
      <ContentArea>
        <Outlet />
      </ContentArea>

      <TabBarContainer>
        <TabItem to="/home">
          <FiHome />
          <span>Agendar</span>
        </TabItem>
        <TabItem to="/agendamentos">
          <FiCalendar />
          <span>Agendamentos</span>
        </TabItem>
        <TabItem to="/favoritos">
          <FiHeart />
          <span>Favoritos</span>
        </TabItem>
      </TabBarContainer>
    </div>
  );
}
