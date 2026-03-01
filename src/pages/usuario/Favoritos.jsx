import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, getDocs } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/config';
import { Loader } from '../../components/ui/Loader';
import { FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const Page = styled.div`
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  
  h2 {
    font-size: ${({ theme }) => theme.typography.sizes.title};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: 24px;
  }
`;

const ServiceCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  img {
    width: 64px;
    height: 64px;
    border-radius: ${({ theme }) => theme.radii.md};
    object-fit: cover;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const ServiceInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  h3 { font-size: ${({ theme }) => theme.typography.sizes.md}; margin-bottom: 4px; }
  span { color: ${({ theme }) => theme.colors.textSecondary}; font-size: ${({ theme }) => theme.typography.sizes.sm}; }
  strong { color: ${({ theme }) => theme.colors.primary}; margin-top: 8px; font-size: ${({ theme }) => theme.typography.sizes.md}; }
`;

export default function Favoritos() {
    const navigate = useNavigate();
    const [servicos, setServicos] = useState([]);
    const [favoritosIds, setFavoritosIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Puxa lista de IDs favoritados do LocalStorage (MVP prático para conta anonima)
        const favsFromStorage = JSON.parse(localStorage.getItem('mvp_favoritos')) || [];
        setFavoritosIds(favsFromStorage);

        const fetchServicos = async () => {
            try {
                if (favsFromStorage.length === 0) {
                    setServicos([]);
                    return;
                }
                const q = query(collection(db, 'servicos'));
                const snap = await getDocs(q);
                const allServicos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Filtra os serviços que estão na lista de favoritos
                const favsAtuais = allServicos.filter(s => favsFromStorage.includes(s.id));
                setServicos(favsAtuais);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchServicos();
    }, []);

    const toggleFavorito = (id) => {
        let novosFavs;
        if (favoritosIds.includes(id)) {
            novosFavs = favoritosIds.filter(fId => fId !== id);
        } else {
            novosFavs = [...favoritosIds, id];
        }
        setFavoritosIds(novosFavs);
        localStorage.setItem('mvp_favoritos', JSON.stringify(novosFavs));

        // Remove da lista exibida visualmente na mesma hora se foi desfavoritado
        if (!novosFavs.includes(id)) {
            setServicos(servicos.filter(s => s.id !== id));
        }
    };

    if (loading) return <Loader text="Carregando favoritos..." fullHeight />;

    return (
        <Page>
            <h2>Meus Favoritos</h2>

            {servicos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8b8685' }}>
                    <FiHeart size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p>Você ainda não curtiu nenhum serviço.</p>
                </div>
            ) : (
                servicos.map(servico => (
                    <ServiceCard key={servico.id}>
                        {servico.imagemUrl ? <img src={servico.imagemUrl} alt={servico.nome} /> : <div className="img-placeholder" />}
                        <ServiceInfo>
                            <h3>{servico.nome}</h3>
                            <span>{servico.duracao || '--'}</span>
                            <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.valor || 0)}</strong>
                        </ServiceInfo>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                            <button onClick={() => toggleFavorito(servico.id)} style={{ color: '#ef4444' }}>
                                <FiHeart size={24} fill="#ef4444" />
                            </button>
                            <Button size="small" onClick={() => navigate(`../agendar/${servico.id}`)}>
                                Agendar
                            </Button>
                        </div>
                    </ServiceCard>
                ))
            )}
        </Page>
    );
}
