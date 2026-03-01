import styled, { css } from 'styled-components';

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-size: ${({ $size, theme }) => ($size === 'large' ? theme.typography.sizes.lg : theme.typography.sizes.md)};
  transition: all 0.2s ease-in-out;
  padding: ${({ $size }) => ($size === 'large' ? '14px 24px' : '10px 16px')};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  /* Variantes */
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'outline':
        return css`
          background: transparent;
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primary}1A; /* 10% opacidade */
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.textPrimary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.border};
          }
        `;
      default: // 'primary'
        return css`
          background: ${theme.colors.primary};
          color: ${theme.colors.surface};
          
          &:hover:not(:disabled) {
            filter: brightness(0.9);
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.md};
          }
        `;
    }
  }}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
