import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiLock, FiMail } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LeftSide = styled.div`
  flex: 1;
  display: none;
  background-color: ${({ theme }) => theme.colors.primary};
  background-image: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDark} 100%);
  color: white;
  padding: 48px;
  flex-direction: column;
  justify-content: center;

  @media (min-width: 768px) {
    display: flex;
  }

  h1 { font-size: 48px; margin-bottom: 24px; line-height: 1.2; }
  p { font-size: 20px; opacity: 0.9; max-width: 400px; }
`;

const RightSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};

  h2 {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 32px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  background: rgba(239, 68, 68, 0.1);
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-bottom: 16px;
`;

export default function LoginAdmin() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);
    const { loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !senha) {
            setError('Preencha todos os campos.');
            return;
        }

        setLoadingForm(true);
        try {
            await loginAdmin(email, senha);
            navigate('/admin', { replace: true });
        } catch (err) {
            console.error(err);
            setError('E-mail ou senha incorretos. (Você já criou o usuário no banco?)');
        } finally {
            setLoadingForm(false);
        }
    };

    return (
        <Container>
            <LeftSide>
                <h1>Painel<br />Administrativo</h1>
                <p>Acesse para gerenciar serviços, clientes e sua agenda em um só lugar.</p>
            </LeftSide>
            <RightSide>
                <LoginBox>
                    <h2>Bem-vindo de volta!</h2>
                    <p>Faça login com sua conta administrativa.</p>

                    {error && <ErrorText>{error}</ErrorText>}

                    <Form onSubmit={handleLogin}>
                        <Input
                            type="email"
                            label="E-mail"
                            placeholder="admin@salao.com.br"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            label="Senha"
                            placeholder="••••••••"
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                        />

                        <Button size="large" type="submit" disabled={loadingForm} style={{ marginTop: 8 }}>
                            <FiLock /> {loadingForm ? 'Entrando...' : 'Entrar no Painel'}
                        </Button>

                        <Button variant="ghost" type="button" onClick={() => navigate('/entrada')}>
                            Voltar para Agendamento
                        </Button>
                    </Form>
                </LoginBox>
            </RightSide>
        </Container>
    );
}
