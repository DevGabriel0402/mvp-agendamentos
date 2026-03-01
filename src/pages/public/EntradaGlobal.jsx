import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiCalendar, FiSearch, FiLogIn, FiArrowRight } from 'react-icons/fi';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';

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
  margin-bottom: 40px;
  
  svg {
    font-size: 64px;
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

const SearchBox = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 32px;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CompanyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
`;

const CompanyItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all 0.2s;
  width: 100%;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}1A`};
  }

  span { font-weight: 600; color: ${({ theme }) => theme.colors.textPrimary}; }
  svg { color: ${({ theme }) => theme.colors.primary}; }
`;

export default function EntradaGlobal() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        const val = e.target.value;
        setSearchTerm(val);

        if (val.length >= 2) {
            setLoading(true);
            try {
                const q = query(collection(db, 'empresas'), limit(10));
                const snap = await getDocs(q);
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const filtered = list.filter(c =>
                    (c.nome && c.nome.toLowerCase().includes(val.toLowerCase())) ||
                    (c.slug && c.slug.toLowerCase().includes(val.toLowerCase()))
                );
                setCompanies(filtered);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            setCompanies([]);
        }
    };

    return (
        <Container>
            <LogoBox>
                <FiCalendar />
                <div>
                    <h1>Agendamento SaaS</h1>
                    <p>Encontre seu estabelecimento e agende agora.</p>
                </div>
            </LogoBox>

            <SearchBox>
                <Input
                    label="Qual empresa você busca?"
                    placeholder="Digite o nome..."
                    icon={<FiSearch />}
                    value={searchTerm}
                    onChange={handleSearch}
                />

                {loading && <Loader text="Buscando..." />}

                <CompanyList>
                    {companies.map(c => (
                        <CompanyItem key={c.id} onClick={() => navigate(`/${c.slug}`)}>
                            <span>{c.nome}</span>
                            <FiArrowRight />
                        </CompanyItem>
                    ))}

                    {searchTerm.length >= 2 && !loading && companies.length === 0 && (
                        <p style={{ fontSize: 13, color: '#8b8685', textAlign: 'center' }}>
                            Nenhuma empresa encontrada.
                        </p>
                    )}
                </CompanyList>

                <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 20 }}>
                    <Button
                        $variant="ghost"
                        $fullWidth
                        onClick={() => navigate('/admin/login')}
                        style={{ opacity: 0.7 }}
                    >
                        <FiLogIn /> Sou Administrador
                    </Button>
                </div>
            </SearchBox>
        </Container>
    );
}
