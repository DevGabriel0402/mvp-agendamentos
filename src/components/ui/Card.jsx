import styled from 'styled-components';

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ padding }) => padding || '24px'};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  ${({ hoverable, theme }) => hoverable && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
    }
  `}
`;
