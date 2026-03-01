import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiCalendar } from 'react-icons/fi';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
`;

const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${({ $fullHeight }) => $fullHeight ? '100vh' : 'auto'};
  padding: ${({ $fullHeight }) => $fullHeight ? '0' : '40px 0'};
  color: ${({ theme }) => theme.colors.primary};
`;

const IconContainer = styled.div`
  font-size: ${({ size }) => size || '48px'};
  animation: ${pulse} 1.5s infinite ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 0.5px;
`;

export const Loader = ({ text = "Carregando...", fullHeight = false, size }) => {
  return (
    <LoaderWrapper $fullHeight={fullHeight}>
      <IconContainer size={size}>
        <FiCalendar />
      </IconContainer>
      {text && <LoadingText>{text}</LoadingText>}
    </LoaderWrapper>
  );
};
