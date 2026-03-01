import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { FiUsers, FiTrendingUp, FiBriefcase, FiArrowRight, FiPlus, FiEdit2, FiX } from 'react-icons/fi';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const MasterContainer = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;

  .text {
    h1 { font-size: 28px; color: #2D2A26; margin-bottom: 8px; }
    p { color: #8B8685; }
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const NewButton = styled.button`
  background: #3B82F6;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.2s;
  
  &:hover { background: #2563EB; transform: translateY(-1px); }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
  
  &:hover { transform: translateY(-4px); }

  .icon-box {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: ${props => props.color || '#3B82F6'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .info {
    h4 { color: #8B8685; font-size: 14px; margin-bottom: 4px; }
    span { font-size: 24px; font-weight: bold; color: #2D2A26; }
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 16px;
  border: 1px solid #eee;
  overflow: hidden;
  margin-bottom: 32px;
  
  .section-header {
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 { font-size: 18px; color: #2D2A26; }
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 16px 24px;
    background: #f9f9f9;
    color: #8B8685;
    font-size: 13px;
    font-weight: 500;
  }
  
  td {
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #2D2A26;
  }

  .badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    
    &.active { background: #E6F4EA; color: #1E7E34; }
    &.inactive { background: #FCE8E6; color: #D93025; }
  }

  .slug { font-family: monospace; color: #666; background: #eee; padding: 2px 6px; border-radius: 4px; }
`;

const ActionButton = styled.button`
  background: #f0f0f0;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  color: #2D2A26;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  
  &:hover { background: #e5e5e5; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  position: relative;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    h2 { font-size: 22px; color: #2D2A26; }
    button { background: none; border: none; cursor: pointer; color: #8B8685; }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    label { font-size: 14px; font-weight: 500; color: #8B8685; }
    input { 
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 10px;
      font-size: 15px;
      &:focus { border-color: #3B82F6; outline: none; }
    }
    .hint { font-size: 12px; color: #999; }
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    input { width: 18px; height: 18px; cursor: pointer; }
    span { font-size: 14px; color: #2D2A26; }
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    button { flex: 1; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer; border: none; }
    .save { background: #3B82F6; color: white; }
    .cancel { background: #f5f5f5; color: #666; }
  }
`;

export default function MasterDashboard() {
  const { isMaster, loading: authLoading } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    corTema: '#3B82F6',
    active: true
  });

  const fetchEmpresas = async () => {
    try {
      const q = query(collection(db, 'empresas'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmpresas(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMaster) fetchEmpresas();
  }, [isMaster]);

  const handleOpenModal = (empresa = null) => {
    if (empresa) {
      setEditingEmpresa(empresa);
      setFormData({
        nome: empresa.nome || '',
        slug: empresa.slug || '',
        corTema: empresa.corTema || '#3B82F6',
        active: empresa.active ?? true
      });
    } else {
      setEditingEmpresa(null);
      setFormData({
        nome: '',
        slug: '',
        corTema: '#3B82F6',
        active: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (!editingEmpresa) {
        const existe = empresas.find(e => e.slug === formData.slug);
        if (existe) {
          toast.error("Este Slug já está em uso!");
          setSubmitLoading(false);
          return;
        }
      }

      if (editingEmpresa) {
        await updateDoc(doc(db, 'empresas', editingEmpresa.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success("Empresa atualizada!");
      } else {
        await addDoc(collection(db, 'empresas'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast.success("Empresa cadastrada!");
      }

      setShowModal(false);
      fetchEmpresas();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar empresa");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (authLoading) return <Loader fullHeight text="Verificando acesso..." />;
  if (!isMaster) return <Navigate to="/admin/login" replace />;
  if (loading) return <Loader fullHeight text="Carregando Painel Master..." />;

  const totalEmpresas = empresas.length;
  const empresasAtivas = empresas.filter(e => e.active).length;

  return (
    <MasterContainer>
      <Header>
        <div className="text">
          <h1>Painel Master 👋</h1>
          <p>Gerenciamento Global das Empresas</p>
        </div>
        <NewButton onClick={() => handleOpenModal()}>
          <FiPlus /> Nova Empresa
        </NewButton>
      </Header>

      <StatsGrid>
        <StatCard color="#3B82F6">
          <div className="icon-box"><FiBriefcase /></div>
          <div className="info">
            <h4>Total de Empresas</h4>
            <span>{totalEmpresas}</span>
          </div>
        </StatCard>
        <StatCard color="#10B981">
          <div className="icon-box"><FiTrendingUp /></div>
          <div className="info">
            <h4>Empresas Ativas</h4>
            <span>{empresasAtivas}</span>
          </div>
        </StatCard>
        <StatCard color="#3B82F6">
          <div className="icon-box"><FiUsers /></div>
          <div className="info">
            <h4>Novos Cadastros (30d)</h4>
            <span>{totalEmpresas}</span>
          </div>
        </StatCard>
      </StatsGrid>

      <Section>
        <div className="section-header">
          <h3>Empresas Cadastradas</h3>
        </div>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>Nome da Empresa</th>
                <th>URL Slug</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map(emp => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 500 }}>{emp.nome}</td>
                  <td><span className="slug">/{emp.slug}</span></td>
                  <td>
                    <span className={`badge ${emp.active ? 'active' : 'inactive'}`}>
                      {emp.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td>{emp.createdAt?.toDate ? emp.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <ActionButton title="Editar" onClick={() => handleOpenModal(emp)}>
                      <FiEdit2 />
                    </ActionButton>
                    <ActionButton title="Abrir" onClick={() => window.open(`/${emp.slug}/admin`, '_blank')}>
                      Gerenciar <FiArrowRight />
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </Section>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}</h2>
              <button onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>

            <Form onSubmit={handleSave}>
              <div className="field">
                <label>Nome da Empresa</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Slug de URL</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                  disabled={editingEmpresa}
                />
                <span className="hint">Ex: reservibe.vercel.app/{formData.slug || 'slug'}</span>
              </div>

              <div className="field">
                <label>Cor do Tema</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="color"
                    value={formData.corTema}
                    onChange={e => setFormData({ ...formData, corTema: e.target.value })}
                    style={{ width: 44, height: 44, padding: 0, border: 'none' }}
                  />
                  <input
                    type="text"
                    value={formData.corTema}
                    onChange={e => setFormData({ ...formData, corTema: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                />
                <span>Empresa Ativa</span>
              </label>

              <div className="actions">
                <button type="button" className="cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="save" disabled={submitLoading}>
                  {submitLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </MasterContainer>
  );
}
