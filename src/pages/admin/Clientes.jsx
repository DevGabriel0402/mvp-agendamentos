import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { FiSearch, FiPhone, FiMapPin } from 'react-icons/fi';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    font-size: ${({ theme }) => theme.typography.sizes.title};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SearchBox = styled.div`
  width: 100%;
  max-width: 360px;
  position: relative;
  
  svg {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const TableContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;

  th, td {
    padding: 16px 24px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  th {
    background: #F9FAFB;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  td {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.sizes.md};
  }

  tr:last-child td { border-bottom: none; }

  tr:hover {
    background-color: rgba(0, 0, 0, 0.01);
  }
`;

const Badge = styled.span`
  background: rgba(221, 167, 165, 0.15);
  color: ${({ theme }) => theme.colors.primaryDark};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
`;

export default function Clientes() {
    const { empresa } = useAuth();
    const [clientes, setClientes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClientes = async () => {
            if (!empresa?.id) {
                setLoading(false);
                return;
            }

            try {
                const q = query(
                    collection(db, 'clientes'),
                    where('empresaId', '==', empresa.id)
                );
                const snap = await getDocs(q);
                let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Ordenação local para evitar necessidade de índices compostos
                data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

                setClientes(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClientes();
    }, [empresa?.id]);

    const filteredClientes = clientes.filter(c =>
        c.nome?.toLowerCase().includes(search.toLowerCase()) ||
        c.contato?.includes(search)
    );

    return (
        <div>
            <PageHeader>
                <h1>Clientes Cadastrados</h1>
                <SearchBox>
                    <Input
                        placeholder="Buscar por nome ou telefone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <FiSearch />
                </SearchBox>
            </PageHeader>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Contato</th>
                            <th>Forma de Pag. Padrão</th>
                            <th>Endereço</th>
                            <th>Data Cadastro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32 }}><Loader text="Carregando..." /></td></tr>
                        ) : filteredClientes.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32, color: '#8B8685' }}>Nenhum cliente encontrado.</td></tr>
                        ) : (
                            filteredClientes.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 500 }}>{c.nome}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B8685' }}>
                                            <FiPhone size={14} /> {c.contato}
                                        </div>
                                    </td>
                                    <td><Badge>{c.formaPagamento || 'Pix'}</Badge></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B8685', maxWidth: 200, WebkitLineClamp: 1, overflow: 'hidden' }}>
                                            {c.endereco ? <><FiMapPin size={14} /> {c.endereco}</> : '-'}
                                        </div>
                                    </td>
                                    <td style={{ color: '#8B8685', fontSize: 14 }}>
                                        {c.createdAt ? format(c.createdAt.toDate(), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </TableContainer>
        </div>
    );
}
