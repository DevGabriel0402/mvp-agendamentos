import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { FiSave, FiMapPin, FiClock, FiCalendar, FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import toast from 'react-hot-toast';
import { maskPhone } from '../../utils/formatters';
import { Loader } from '../../components/ui/Loader';
import { Accordion } from '../../components/ui/Accordion';

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

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 800px;
`;

const SectionBox = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  h3 {
    font-size: ${({ theme }) => theme.typography.sizes.md};
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${({ theme }) => theme.colors.textPrimary};
    
    svg { color: ${({ theme }) => theme.colors.primary}; }
  }
`;

const DiasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme, $checked }) => $checked ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $checked }) => $checked ? 'rgba(59, 130, 246, 0.1)' : 'transparent'};
  transition: all 0.2s;
  
  input { accent-color: ${({ theme }) => theme.colors.primary}; width: 18px; height: 18px; }
  transition: all 0.2s;
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const HorariosWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const TimeTag = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  
  button {
    color: ${({ theme }) => theme.colors.error};
    display: flex;
    align-items: center;
    &:hover { opacity: 0.7; }
  }
`;

const MapContainer = styled.div`
  height: 300px;
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 16px;
`;

const DIAS_SEMANA = [
    { id: 0, label: 'Domingo' },
    { id: 1, label: 'Segunda-feira' },
    { id: 2, label: 'Terça-feira' },
    { id: 3, label: 'Quarta-feira' },
    { id: 4, label: 'Quinta-feira' },
    { id: 5, label: 'Sexta-feira' },
    { id: 6, label: 'Sábado' },
];

export default function Configuracoes() {
    const { empresa, setEmpresa } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [novoHorario, setNovoHorario] = useState('');
    const [cep, setCep] = useState('');
    const [mapViewState, setMapViewState] = useState({
        longitude: -46.633308,
        latitude: -23.55052,
        zoom: 14
    });

    const [config, setConfig] = useState({
        enderecoEstabelecimento: '',
        coordenadas: { lat: -23.55052, lng: -46.633308 }, // SP Default
        diasFuncionamento: [1, 2, 3, 4, 5, 6],
        horariosDisponiveis: ["08:00", "09:00", "10:00"],
        nomeApp: 'MVP Agendamento',
        whatsapp: '',
        corTema: '#3B82F6',
        logoUrl: ''
    });

    useEffect(() => {
        if (empresa) {
            const coords = empresa.coordenadas || { lat: -23.55052, lng: -46.633308 };
            setConfig({
                enderecoEstabelecimento: empresa.enderecoEstabelecimento || '',
                coordenadas: coords,
                diasFuncionamento: empresa.diasFuncionamento || [1, 2, 3, 4, 5, 6],
                horariosDisponiveis: empresa.horariosDisponiveis || ["08:00", "09:00", "10:00"],
                nomeApp: empresa.nome || '',
                whatsapp: empresa.whatsapp || '',
                corTema: empresa.corTema || '#3B82F6',
                logoUrl: empresa.logoUrl || ''
            });

            setMapViewState(prev => ({
                ...prev,
                latitude: coords.lat,
                longitude: coords.lng
            }));

            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [empresa]);

    const handleToggleDia = (diaId) => {
        setConfig(prev => {
            const dias = prev.diasFuncionamento.includes(diaId)
                ? prev.diasFuncionamento.filter(d => d !== diaId)
                : [...prev.diasFuncionamento, diaId].sort();
            return { ...prev, diasFuncionamento: dias };
        });
    };

    const handleAddHorario = () => {
        if (!novoHorario) return;
        // Regex pra validar HH:MM (simples)
        if (!/^([01]\d|2[0-3]):?([0-5]\d)$/.test(novoHorario)) {
            toast.error("Formato inválido. Use HH:MM");
            return;
        }

        if (!config.horariosDisponiveis.includes(novoHorario)) {
            setConfig(prev => ({
                ...prev,
                horariosDisponiveis: [...prev.horariosDisponiveis, novoHorario].sort()
            }));
        }
        setNovoHorario('');
    };

    const handleRemoveHorario = (horario) => {
        setConfig(prev => ({
            ...prev,
            horariosDisponiveis: prev.horariosDisponiveis.filter(h => h !== horario)
        }));
    };

    const handleSalvar = async (e) => {
        e.preventDefault();
        if (!empresa?.id) return;
        setSaving(true);
        try {
            // Salvar no documento da empresa
            const dadosSalvar = {
                ...config,
                nome: config.nomeApp // Mantendo consistência com o campo 'nome' da empresa
            };
            await updateDoc(doc(db, 'empresas', empresa.id), dadosSalvar);

            // Atualizar o contexto local para aplicar mudanças visuais imediatas (ex: cor tema)
            setEmpresa(prev => ({ ...prev, ...dadosSalvar }));

            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const handleMapClick = async (e) => {
        const { lng, lat } = e.lngLat;
        // Atualiza pino primeiro
        setConfig(prev => ({ ...prev, coordenadas: { lat, lng } }));

        // Reverse Geocoding (Converter Lat/Lng em Texto do Endereço)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data && data.display_name) {
                setConfig(prev => ({ ...prev, enderecoEstabelecimento: data.display_name }));
            }
        } catch (error) {
            console.error("Erro no reverse geocoding:", error);
        }
    };

    const handleCepSearch = async () => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            toast.error("CEP inválido");
            return;
        }

        setLoading(true);
        try {
            // 1. Buscar endereço via ViaCEP
            const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const viaCepData = await viaCepRes.json();

            if (viaCepData.erro) {
                toast.error("CEP não encontrado");
                setLoading(false);
                return;
            }

            const fullAddress = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade} - ${viaCepData.uf}`;
            setConfig(prev => ({ ...prev, enderecoEstabelecimento: fullAddress }));

            // 2. Geocoding para pegar Lat/Lng via Nominatim
            const searchRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
            const searchData = await searchRes.json();

            if (searchData && searchData.length > 0) {
                const { lat, lon } = searchData[0];
                const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setConfig(prev => ({ ...prev, coordenadas: coords }));
                setMapViewState(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
                toast.success("Endereço e mapa atualizados!");
            } else {
                toast.success("CEP encontrado, mas não conseguimos localizar no mapa. Por favor, ajuste o pino manualmente.");
            }
        } catch (error) {
            console.error("Erro na busca de CEP:", error);
            toast.error("Erro ao buscar CEP");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader text="Carregando configurações..." fullHeight />;

    if (!empresa) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Seu perfil não está vinculado a uma empresa</h2>
                <p>Verifique o Firestore (coleção 'administradores' {'->'} seu UID {'->'} campo 'empresaId').</p>
                <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </div>
        );
    }

    return (
        <div>
            <PageHeader>
                <h1>Configurações do Estabelecimento</h1>
            </PageHeader>

            <FormContainer onSubmit={handleSalvar}>

                <Accordion title="✨ Identidade Visual (White-Label)" defaultOpen>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Logo do Sistema</label>
                            <ImageUpload
                                initialImage={config.logoUrl}
                                onUploadComplete={(url) => setConfig({ ...config, logoUrl: url })}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Input
                                label="Nome do Negócio"
                                placeholder="Seu Salão / Barbearia"
                                value={config.nomeApp || ''}
                                onChange={e => setConfig({ ...config, nomeApp: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                            />

                            <Input
                                label="WhatsApp de Contato"
                                placeholder="Ex: (11) 99999-9999"
                                value={config.whatsapp || ''}
                                onChange={e => setConfig({ ...config, whatsapp: maskPhone(e.target.value) })}
                                onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 14, fontWeight: 500, color: '#2D2A26' }}>Cor Tema (Primária)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <input
                                        type="color"
                                        value={config.corTema || '#3B82F6'}
                                        onChange={e => setConfig({ ...config, corTema: e.target.value })}
                                        style={{ width: 48, height: 48, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                    />
                                    <span style={{ fontFamily: 'monospace', color: '#8b8685' }}>{config.corTema || '#3B82F6'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Accordion>

                <Accordion title="📍 Endereço e Localização">
                    <p style={{ fontSize: 13, color: '#8b8685', marginBottom: 16 }}>Busque pelo CEP ou digite o endereço manualmente. Você também pode clicar no mapa para ajustar.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 16, maxWidth: 400 }}>
                        <Input
                            label="CEP"
                            placeholder="00000-000"
                            value={cep}
                            onChange={e => setCep(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCepSearch())}
                        />
                        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                            <Button type="button" onClick={handleCepSearch}><FiSearch /></Button>
                        </div>
                    </div>

                    <div style={{ flex: 1, marginBottom: 16 }}>
                        <Input
                            label="Endereço Completo"
                            placeholder="Rua, Número, Bairro, Cidade..."
                            value={config.enderecoEstabelecimento}
                            onChange={e => setConfig({ ...config, enderecoEstabelecimento: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                        />
                    </div>

                    <MapContainer>
                        <Map
                            {...mapViewState}
                            onMove={evt => setMapViewState(evt.viewState)}
                            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                            onClick={handleMapClick}
                            cursor="pointer"
                        >
                            <Marker longitude={config.coordenadas.lng} latitude={config.coordenadas.lat} color="#3B82F6" />
                        </Map>
                    </MapContainer>
                    <p style={{ fontSize: 12, color: '#8b8685', marginTop: 8 }}>* Clique no mapa para ajustar o pin de localização.</p>
                </Accordion>

                <Accordion title="📅 Dias de Funcionamento">
                    <DiasGrid>
                        {DIAS_SEMANA.map(dia => (
                            <CheckboxLabel key={dia.id} $checked={config.diasFuncionamento.includes(dia.id)}>
                                <input
                                    type="checkbox"
                                    checked={config.diasFuncionamento.includes(dia.id)}
                                    onChange={() => handleToggleDia(dia.id)}
                                    onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                />
                                {dia.label}
                            </CheckboxLabel>
                        ))}
                    </DiasGrid>
                </Accordion>

                <Accordion title="⏰ Horários Disponíveis">
                    <div style={{ display: 'flex', gap: 16, marginBottom: 24, maxWidth: 300 }}>
                        <Input
                            type="time"
                            value={novoHorario}
                            onChange={e => setNovoHorario(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddHorario();
                                }
                            }}
                        />
                        <Button type="button" onClick={handleAddHorario}><FiPlus /></Button>
                    </div>

                    <HorariosWrapper>
                        {config.horariosDisponiveis.map(h => (
                            <TimeTag key={h}>
                                {h}
                                <button type="button" onClick={() => handleRemoveHorario(h)}><FiTrash2 /></button>
                            </TimeTag>
                        ))}
                        {config.horariosDisponiveis.length === 0 && <span style={{ color: '#8b8685' }}>Nenhum horário adicionado.</span>}
                    </HorariosWrapper>
                </Accordion>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 40, marginTop: 16 }}>
                    <Button size="large" type="submit" disabled={saving}>
                        <FiSave /> {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                </div>

            </FormContainer>
        </div>
    );
}
