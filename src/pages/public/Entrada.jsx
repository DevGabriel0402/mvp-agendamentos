import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiCalendar, FiLogIn, FiArrowRight } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useConfiguracoes } from '../../hooks/useConfiguracoes';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LogoBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
  
  svg {
    font-size: 56px;
    color: ${({ theme }) => theme.colors.primary};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.sizes.title};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.typography.sizes.md};
    margin-top: 8px;
  }
`;

const ActionsBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 320px;
  gap: 16px;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  margin-top: 8px;
`;

export default function Entrada() {
  const navigate = useNavigate();
  const { loginAnonimo } = useAuth();
  const { config } = useConfiguracoes();
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');

  const handleAgendarAgora = async () => {
    try {
      setError('');
      setLoadingAction(true);
      await loginAnonimo();
      navigate('/home', { replace: true });
    } catch (err) {
      setError('Falha ao iniciar. Tente novamente.');
      console.error(err);
      setLoadingAction(false);
    }
  };

  return (
    <Container>
      <LogoBox>
        {config?.logoUrl ? (
          <img src={config.logoUrl} alt="Logo" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <FiCalendar />
        )}
        <div>
          <h1>{config?.nomeApp || 'Agende Fácil'}</h1>
          <p>O melhor horário para você, a qualquer momento.</p>
        </div>
      </LogoBox>

      <ActionsBox>
        <Button size="large" fullWidth onClick={handleAgendarAgora} disabled={loadingAction}>
          <span>Agendar Agora</span> <FiArrowRight />
        </Button>

        {/* Link escondidinho/sutil para Admin, comum em SaaS */}
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          style={{ marginTop: '24px', opacity: 0.6 }}
        >
          <FiLogIn /> Sou o Administrador
        </Button>

        {error && <ErrorText>{error}</ErrorText>}
      </ActionsBox>
    </Container>
  );
}
