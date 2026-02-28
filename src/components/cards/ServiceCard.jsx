import styled from 'styled-components';
import { FiHeart, FiClock, FiCheck } from 'react-icons/fi';
import { Button } from '../ui/Button';

const CardContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  display: flex;
  flex-direction: ${({ variant }) => variant === 'list' ? 'row' : 'column'};
  height: ${({ variant }) => variant === 'list' ? '120px' : 'auto'};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const ImageArea = styled.div`
  width: ${({ variant }) => variant === 'list' ? '120px' : '100%'};
  height: ${({ variant }) => variant === 'list' ? '120px' : '160px'};
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.border};
  background-image: url(${({ bgImage }) => bgImage || ''});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const FavoriteBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, active }) => active ? theme.colors.error : theme.colors.textSecondary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  svg {
    fill: ${({ active }) => active ? 'currentColor' : 'none'};
  }
`;

const ContentArea = styled.div`
  padding: ${({ variant }) => variant === 'list' ? '12px 16px' : '16px'};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ variant }) => variant === 'list' ? '4px' : '8px'};
  flex: 1;
  overflow: hidden;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  margin-bottom: 4px;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const FooterInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const Price = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

export const ServiceCard = ({
  servico,
  isFavoritado,
  onFavoritar,
  onAgendar,
  variant = 'grid'
}) => {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  // Se não tem imagem, usamos um placeholder rosa agradável
  const bgImage = servico.imagemUrl || `https://ui-avatars.com/api/?name=${servico.nome.replace(' ', '+')}&background=DDA7A5&color=fff&size=500`;

  return (
    <CardContainer variant={variant}>
      <ImageArea bgImage={bgImage} variant={variant}>
        <FavoriteBtn active={isFavoritado} onClick={(e) => {
          e.stopPropagation();
          onFavoritar(servico.id);
        }}>
          <FiHeart />
        </FavoriteBtn>
      </ImageArea>

      <ContentArea variant={variant}>
        <Title style={{ fontSize: variant === 'list' ? '16px' : '18px' }}>{servico.nome}</Title>
        <Description style={{ WebkitLineClamp: variant === 'list' ? 1 : 2 }}>{servico.descricao}</Description>

        <FooterInfo style={{ marginTop: variant === 'list' ? '4px' : '8px' }}>
          <Price style={{ fontSize: variant === 'list' ? '16px' : '18px' }}>{formatarMoeda(servico.valor || 0)}</Price>
          <Button
            size={variant === 'list' ? 'small' : 'medium'}
            onClick={() => onAgendar(servico)}
          >
            Agendar
          </Button>
        </FooterInfo>
      </ContentArea>
    </CardContainer>
  );
};
