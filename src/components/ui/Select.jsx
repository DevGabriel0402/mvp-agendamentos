import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  position: relative;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const SelectBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background-color: ${({ theme, $error }) => $error ? 'rgba(239, 68, 68, 0.05)' : theme.colors.surface};
  border: 1px solid ${({ theme, $error, $isOpen }) => {
    if ($error) return theme.colors.error;
    if ($isOpen) return theme.colors.primary;
    return theme.colors.border;
  }};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme, $hasValue }) => $hasValue ? theme.colors.textPrimary : theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    border-color: ${({ theme, $error }) => $error ? theme.colors.error : theme.colors.primary};
  }

  svg {
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const OptionsContainer = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  list-style: none;
  padding: 8px 0;
  margin: 0;
  
  /* Scrollbar estilizadinha */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: 20px;
  }
`;

const OptionItem = styled.li`
  padding: 12px 16px;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}1A`}; /* 10% opacidade */
  }

  &.selected {
    background-color: ${({ theme }) => `${theme.colors.primary}26`}; /* 15% opacidade */
    color: ${({ theme }) => theme.colors.primary};
    filter: brightness(0.9);
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  }
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.error};
  margin-top: 4px;
`;

export function Select({ label, options = [], value, onChange, placeholder = 'Selecione...', error, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <SelectWrapper ref={wrapperRef} {...props}>
      {label && <Label>{label}</Label>}
      <SelectBox
        $error={error}
        $isOpen={isOpen}
        $hasValue={!!value}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <FiChevronDown size={20} />
      </SelectBox>

      {isOpen && (
        <OptionsContainer>
          {options.map((option) => (
            <OptionItem
              key={option.value}
              className={value === option.value ? 'selected' : ''}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </OptionItem>
          ))}
          {options.length === 0 && (
            <OptionItem style={{ color: '#8b8685', cursor: 'default' }} onClick={e => e.stopPropagation()}>
              Nenhuma opção
            </OptionItem>
          )}
        </OptionsContainer>
      )}

      {error && <ErrorText>{error}</ErrorText>}
    </SelectWrapper>
  );
}
