import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const IconWrapper = styled.button`
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme, $error }) => ($error ? theme.colors.error : theme.colors.border)};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  transition: all 0.2s;

  &:focus {
    border-color: ${({ theme, $error }) => ($error ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ theme, $error }) => ($error ? `${theme.colors.error}1A` : `${theme.colors.primary}33`)}; /* 1A=10%, 33=20% */
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.border};
  }

  &:disabled {
    background-color: #F3F4F6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.error};
`;

export const Input = ({ label, error, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <InputWrapper>
      {label && <Label>{label}</Label>}
      <InputContainer>
        <StyledInput
          $error={error}
          type={inputType}
          {...props}
          style={isPassword ? { paddingRight: '44px' } : {}}
        />
        {isPassword && (
          <IconWrapper type="button" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </IconWrapper>
        )}
      </InputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};
