import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiLock, FiMail, FiSearch, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/ui/Loader';

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

const CompanyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const CompanyItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all 0.2s;
  width: 100%;
  text-align: left;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}1A`};
  }

  span { font-weight: 600; color: ${({ theme }) => theme.colors.textPrimary}; }
  svg { color: ${({ theme }) => theme.colors.primary}; }
`;

const SelectedHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: ${({ theme }) => `${theme.colors.success}1A`};
    border-radius: ${({ theme }) => theme.radii.md};
    margin-bottom: 24px;
    border: 1px solid ${({ theme }) => theme.colors.success};

    span { font-size: 14px; font-weight: 500; color: ${({ theme }) => theme.colors.success}; }
`;

export default function LoginAdmin() {
  const { tenantSlug } = useParams();
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const [step, setStep] = useState(tenantSlug ? 'login' : 'select');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  // Estados para Seleção de Empresa
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    if (tenantSlug) {
      setStep('login');
    } else {
      setStep('select');
    }
  }, [tenantSlug]);

  useEffect(() => {
    if (step === 'select' && searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        fetchCompanies();
      }, 500);
      return () => clearTimeout(timer);
    } else if (searchTerm.length < 2) {
      setCompanies([]);
    }
  }, [searchTerm, step]);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const q = query(
        collection(db, 'empresas'),
        where('active', '==', true),
        limit(5)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Filtro manual simples (já que o Firestore não suporta full text-search nativo com where active)
      const filtered = list.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setCompanies(filtered);
    } catch (err) {
      console.error("Erro ao buscar empresas:", err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    navigate(`/${company.slug}/admin/login`);
  };

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
      setError('E-mail ou senha incorretos.');
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
          {step === 'select' ? (
            <>
              <h2>Encontre sua empresa</h2>
              <p>Digite o nome do seu estabelecimento para acessar.</p>

              <Input
                placeholder="Ex: Barber Shop..."
                icon={<FiSearch />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              {loadingCompanies && <div style={{ margin: '20px 0' }}><Loader text="Buscando..." /></div>}

              <CompanyList>
                {companies.map(c => (
                  <CompanyItem key={c.id} onClick={() => handleSelectCompany(c)}>
                    <span>{c.nome}</span>
                    <FiArrowRight />
                  </CompanyItem>
                ))}

                {searchTerm.length >= 2 && !loadingCompanies && companies.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 20, color: '#8b8685' }}>
                    Nenhuma empresa encontrada com esse nome.
                  </div>
                )}
              </CompanyList>
            </>
          ) : (
            <>
              <h2>Bem-vindo de volta!</h2>
              {tenantSlug && (
                <SelectedHeader>
                  <FiCheckCircle size={20} />
                  <span>Acessando: <strong>{tenantSlug}</strong></span>
                  <button
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: 12, color: '#8b8685' }}
                    onClick={() => navigate('/admin/login')}
                  >
                    Trocar
                  </button>
                </SelectedHeader>
              )}
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

                <Button
                  $variant="ghost"
                  type="button"
                  onClick={() => navigate(`/${tenantSlug || ''}`)}
                >
                  Voltar para Agendamento
                </Button>
              </Form>
            </>
          )}
        </LoginBox>
      </RightSide>
    </Container>
  );
}

