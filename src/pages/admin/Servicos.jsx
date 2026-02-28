import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, getDocs, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiPlus, FiImage, FiTrash2, FiEdit, FiGrid, FiList, FiClock } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { ImageUpload } from '../../components/ui/ImageUpload';
import toast from 'react-hot-toast';

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

const TableContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;

  th, td {
    padding: 16px 24px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    background-color: #fafaf8;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  }

  tr:last-child td { border-bottom: none; }
  tbody tr:hover { background-color: rgba(221, 167, 165, 0.05); }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const ServiceCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .card-info {
    flex: 1;
    h3 {
      font-size: ${({ theme }) => theme.typography.sizes.md};
      color: ${({ theme }) => theme.colors.textPrimary};
      margin-bottom: 4px;
    }
    p {
      color: ${({ theme }) => theme.colors.textSecondary};
      font-size: ${({ theme }) => theme.typography.sizes.sm};
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-image {
    width: 64px;
    height: 64px;
    border-radius: ${({ theme }) => theme.radii.md};
    object-fit: cover;
    background: ${({ theme }) => theme.colors.border};
    margin-left: 12px;
  }

  .card-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    
    .price {
      color: ${({ theme }) => theme.colors.primaryDark};
      font-weight: ${({ theme }) => theme.typography.weights.bold};
      font-size: ${({ theme }) => theme.typography.sizes.lg};
    }
    
    .duration {
      display: flex;
      align-items: center;
      gap: 4px;
      color: ${({ theme }) => theme.colors.textSecondary};
      font-size: ${({ theme }) => theme.typography.sizes.sm};
    }
  }

  .card-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;
    
    button {
      padding: 8px;
      border-radius: ${({ theme }) => theme.radii.sm};
      background: ${({ theme }) => theme.colors.background};
      opacity: 0.8;
      &:hover { opacity: 1; }
    }
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;

  button {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: all 0.2s;

    &.active {
      background: rgba(221, 167, 165, 0.1);
      color: ${({ theme }) => theme.colors.primary};
    }

    &:hover:not(.active) {
      background: ${({ theme }) => theme.colors.background};
    }
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  img {
    width: 48px;
    height: 48px;
    border-radius: ${({ theme }) => theme.radii.md};
    object-fit: cover;
    background: ${({ theme }) => theme.colors.border};
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    strong { color: ${({ theme }) => theme.colors.textPrimary}; }
    span { 
      color: ${({ theme }) => theme.colors.textSecondary}; 
      font-size: 13px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  width: 100%;
  max-width: 500px;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 90vh;
  overflow-y: auto;
`;

export default function Servicos() {
    const [viewMode, setViewMode] = useState('list');
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [servicoEmEdicao, setServicoEmEdicao] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        valor: '',
        duracao: '',
        imagemUrl: ''
    });

    const fetchServicos = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'servicos'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setServicos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicos();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Certeza que deseja escluir este serviço? Ele sumirá do Agendamento.")) return;
        try {
            await deleteDoc(doc(db, 'servicos', id));
            setServicos(servicos.filter(s => s.id !== id));
            toast.success("Serviço excluído com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir serviço.");
        }
    };

    const handleEdit = (servico) => {
        setServicoEmEdicao(servico.id);
        setFormData({
            nome: servico.nome || '',
            descricao: servico.descricao || '',
            valor: servico.valor ? String(servico.valor) : '',
            duracao: servico.duracao || '',
            imagemUrl: servico.imagemUrl || ''
        });
        setIsModalOpen(true);
    };

    const handleNovoServico = () => {
        setServicoEmEdicao(null);
        setFormData({ nome: '', descricao: '', valor: '', duracao: '', imagemUrl: '' });
        setIsModalOpen(true);
    };

    const handleSalvar = async (e) => {
        e.preventDefault();
        if (!formData.nome || !formData.valor) {
            toast.error("Preencha ao menos o Nome e o Valor.");
            return;
        }

        setSaving(true);
        try {
            const dadosSalvar = {
                ...formData,
                valor: Number(formData.valor.replace(',', '.'))
            };

            if (servicoEmEdicao) {
                // Atualizar existente
                await updateDoc(doc(db, 'servicos', servicoEmEdicao), dadosSalvar);
            } else {
                // Criar novo
                await addDoc(collection(db, 'servicos'), {
                    ...dadosSalvar,
                    createdAt: serverTimestamp(),
                    ativo: true
                });
            }

            setIsModalOpen(false);
            setServicoEmEdicao(null);
            setFormData({ nome: '', descricao: '', valor: '', duracao: '', imagemUrl: '' });
            fetchServicos(); // Atualiza a lista
            toast.success("Serviço salvo com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar serviço.");
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div>
            <PageHeader>
                <h1>Serviços e Tratamentos</h1>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <ViewToggle>
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                            title="Ver em Lista"
                            type="button"
                        >
                            <FiList size={20} />
                        </button>
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                            title="Ver em Cards"
                            type="button"
                        >
                            <FiGrid size={20} />
                        </button>
                    </ViewToggle>
                    <Button onClick={handleNovoServico}>
                        <FiPlus /> Novo Serviço
                    </Button>
                </div>
            </PageHeader>

            {loading ? (
                <Loader text="Carregando portfólio..." />
            ) : servicos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#8b8685', background: '#fff', borderRadius: 16, border: '1px solid #ebe6e4' }}>
                    Nenhum serviço cadastrado ainda.
                </div>
            ) : viewMode === 'list' ? (
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <th>Serviço</th>
                                <th>Duração</th>
                                <th>Preço Base</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servicos.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <ServiceInfo>
                                            {s.imagemUrl ? <img src={s.imagemUrl} alt={s.nome} /> : <div style={{ width: 48, height: 48, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}><FiImage color="#ccc" /></div>}
                                            <div>
                                                <strong>{s.nome}</strong>
                                                <span>{s.descricao || 'Sem descrição'}</span>
                                            </div>
                                        </ServiceInfo>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b8685' }}>
                                            <FiClock /> {s.duracao || '--'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', fontWeight: 'bold' }}>
                                            {formatCurrency(s.valor || 0)}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => handleEdit(s)} style={{ color: '#F59E0B', padding: 8 }}>
                                                <FiEdit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} style={{ color: '#ef4444', padding: 8 }}>
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableContainer>
            ) : (
                <GridContainer>
                    {servicos.map(s => (
                        <ServiceCard key={s.id}>
                            <div className="card-header">
                                <div className="card-info">
                                    <h3>{s.nome}</h3>
                                    <p>{s.descricao || 'Sem descrição'}</p>
                                </div>
                                {s.imagemUrl ? (
                                    <img src={s.imagemUrl} alt={s.nome} className="card-image" />
                                ) : (
                                    <div className="card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiImage color="#ccc" size={24} />
                                    </div>
                                )}
                            </div>

                            <div className="card-details">
                                <div className="price">{formatCurrency(s.valor || 0)}</div>
                                <div className="duration"><FiClock /> {s.duracao || '--'}</div>
                            </div>

                            <div className="card-actions">
                                <button onClick={() => handleEdit(s)} style={{ color: '#F59E0B' }} title="Editar">
                                    <FiEdit size={18} />
                                </button>
                                <button onClick={() => handleDelete(s.id)} style={{ color: '#ef4444' }} title="Excluir">
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </ServiceCard>
                    ))}
                </GridContainer>
            )}

            {/* Modal de Criação */}
            {isModalOpen && (
                <ModalOverlay onClick={() => !saving && setIsModalOpen(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h2>{servicoEmEdicao ? 'Editar Serviço' : 'Novo Serviço'}</h2>

                        <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Foto de Capa</label>
                                <ImageUpload
                                    initialImage={formData.imagemUrl}
                                    onUploadComplete={(url) => setFormData({ ...formData, imagemUrl: url })}
                                />
                            </div>

                            <Input
                                label="Nome do Serviço *"
                                placeholder="Ex: Corte e Escova"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            />

                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        label="Valor Base (R$) *"
                                        placeholder="Ex: 120"
                                        type="number"
                                        value={formData.valor}
                                        onChange={e => setFormData({ ...formData, valor: e.target.value })}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        label="Duração (Texto genérico)"
                                        placeholder="Ex: 60 a 90 min"
                                        value={formData.duracao}
                                        onChange={e => setFormData({ ...formData, duracao: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 14, fontWeight: 500, color: '#2D2A26' }}>Breve Descrição</label>
                                <textarea
                                    rows={3}
                                    placeholder="Detalhes para os clientes verem..."
                                    style={{ padding: 12, borderRadius: 8, border: '1px solid #EBE6E4', resize: 'vertical' }}
                                    value={formData.descricao}
                                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                <Button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: '#f4f4f5', color: '#18181b' }}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Salvando...' : 'Adicionar Serviço'}
                                </Button>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </div>
    );
}
