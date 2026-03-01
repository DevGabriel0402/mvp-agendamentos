import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiUploadCloud, FiX, FiLink } from 'react-icons/fi';
import { uploadImage } from '../../services/cloudinary';
import { Input } from './Input';
import toast from 'react-hot-toast';

const UploadArea = styled.div`
  width: 100%;
  height: 160px;
  border: 2px dashed ${({ theme, $dragActive }) => $dragActive ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $dragActive }) => $dragActive ? 'rgba(221, 167, 165, 0.05)' : theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;

  input {
    display: none;
  }

  svg {
    font-size: 32px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 8px;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    text-align: center;
    padding: 0 16px;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PreviewImage = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  z-index: 10;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
`;

const Loader = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.8);
  z-index: 15;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  font-size: 14px;
`;

export function ImageUpload({ onUploadComplete, initialImage = '' }) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(initialImage);
    const [loading, setLoading] = useState(false);
    const [externalUrl, setExternalUrl] = useState(initialImage);
    const inputRef = useRef(null);

    // Sync inicial apenas quando muda o initialImage (ex: modal abriu)
    useEffect(() => {
        setPreview(initialImage);
        setExternalUrl(initialImage);
    }, [initialImage]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = async (file) => {
        if (!file.type.startsWith('image/')) {
            toast.error("Por favor, selecione apenas arquivos de imagem.");
            return;
        }

        try {
            setLoading(true);
            // Cria preview temporário
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // Envia pro Cloudinary
            const secureUrl = await uploadImage(file);
            onUploadComplete(secureUrl);
            toast.success("Imagem carregada com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao fazer upload da imagem.");
            setPreview('');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (e) => {
        if (e) e.stopPropagation();
        setPreview('');
        setExternalUrl('');
        onUploadComplete('');
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleExternalUrlChange = (e) => {
        const url = e.target.value;
        setExternalUrl(url);
        setPreview(url);
        onUploadComplete(url);
    };

    return (
        <div>
            <UploadArea
                $dragActive={dragActive}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                />

                {!preview && !loading && (
                    <>
                        <FiUploadCloud />
                        <p>Clique ou arraste uma imagem aqui<br />Tamanho recomendado: 800x600px</p>
                    </>
                )}

                {loading && (
                    <Loader>
                        Enviando arquivo...
                    </Loader>
                )}

                {preview && (
                    <>
                        <PreviewImage src={preview} />
                        <RemoveBtn type="button" onClick={handleRemove}><FiX color='#da5854ff' /></RemoveBtn>
                    </>
                )}
            </UploadArea>

            {!loading && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiLink style={{ color: '#8b8685' }} />
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Ou cole a URL de uma imagem externa"
                            value={externalUrl}
                            onChange={handleExternalUrlChange}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
