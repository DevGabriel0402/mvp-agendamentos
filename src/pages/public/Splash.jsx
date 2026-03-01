import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiCalendar } from 'react-icons/fi';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const SplashContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
`;

const IconWrapper = styled.div`
  font-size: 64px;
  animation: ${pulse} 2s infinite ease-in-out;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  font-size: ${({ theme }) => theme.typography.sizes.title};
  letter-spacing: -0.5px;
`;

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Tenta obter o último tenant visitado do localStorage
    const ultimoTenant = localStorage.getItem('mvp_ultimo_tenant');

    const timer = setTimeout(() => {
      if (ultimoTenant) {
        navigate(`/${ultimoTenant}`, { replace: true });
      } else {
        // Se não houver, vai para a entrada genérica (que levará ao login por enquanto)
        navigate('/entrada', { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <SplashContainer>
      <IconWrapper>
        <FiCalendar />
      </IconWrapper>
      <Title>Agendamento</Title>
    </SplashContainer>
  );
}
