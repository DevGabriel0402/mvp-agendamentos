import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiCheckCircle, FiHome, FiAlertCircle } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
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

const SuccessIcon = styled.div`
  font-size: 80px;
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: 24px;
  animation: scale-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;

  @keyframes scale-up {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.title};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const SubText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 32px;
`;

const DetailsBox = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  max-width: 400px;
  text-align: left;
  margin-bottom: 32px;
  
  p {
    margin-bottom: 12px;
    font-size: ${({ theme }) => theme.typography.sizes.md};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  
  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const WarningBox = styled.div`
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid rgba(245, 158, 11, 0.3);
  width: 100%;
  max-width: 400px;
  text-align: left;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: ${({ theme }) => theme.typography.sizes.sm};

  svg {
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

export default function Sucesso() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { config } = useConfiguracoes();

  if (!state || !state.data) {
    return <Navigate to="../home" replace />;
  }

  const { data, horario, servico, nomeCliente } = state; // Asumindo que passamos o nome do cliente no agendamento

  const handleWhatsApp = () => {
    const hour = new Date().getHours();
    let saudacao = 'Bom dia';
    if (hour >= 12 && hour < 18) saudacao = 'Boa tarde';
    else if (hour >= 18) saudacao = 'Boa noite';

    const dataAgendada = format(new Date(data), "dd/MM/yyyy");

    // Puxa do FireStore via admin conf, se n tiver usa 5511000000000 como demonstração
    const numeroSalao = config?.whatsapp || "5511000000000";

    const mensagem = `${saudacao}! Fui agendado através do Sistema Online.\n\n` +
      `💇‍♀️ *Serviço:* ${servico}\n` +
      `📅 *Data:* ${dataAgendada}\n` +
      `⏰ *Horário:* ${horario}\n\n` +
      `Está tudo certo com o meu agendamento?`;

    const url = `https://wa.me/${numeroSalao}?text=${encodeURIComponent(mensagem)}`;
    toast.success("Redirecionando para o WhatsApp!");
    setTimeout(() => {
      window.open(url, '_blank');
    }, 800);
  };

  return (
    <Container>
      <SuccessIcon>
        <FiCheckCircle />
      </SuccessIcon>

      <Title>Tudo Certo!</Title>
      <SubText>Seu agendamento foi confirmado com sucesso.</SubText>

      <DetailsBox>
        <p>Serviço: <strong>{servico}</strong></p>
        <p>Data: <strong>{format(new Date(data), "dd 'de' MMMM", { locale: ptBR })}</strong></p>
        <p>Horário: <strong>{horario}</strong></p>
      </DetailsBox>

      <WarningBox>
        <FiAlertCircle />
        <p>Por favor, lembre-se de confirmar seu agendamento através do nosso <strong>WhatsApp</strong> com <strong>1 dia de antecedência</strong>.</p>
      </WarningBox>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
        <Button $size="large" $fullWidth onClick={handleWhatsApp} style={{ backgroundColor: '#25D366', color: 'white' }}>
          Confirmar no WhatsApp
        </Button>

        <Button $size="large" $variant="ghost" $fullWidth onClick={() => navigate('../home', { replace: true })}>
          <FiHome /> Voltar para o Início
        </Button>
      </div>
    </Container>
  );
}
