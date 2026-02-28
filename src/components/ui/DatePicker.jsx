import React from 'react';
import styled from 'styled-components';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

registerLocale('pt-BR', ptBR);

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

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.error};
`;

const DatePickerWrapper = styled.div`
  position: relative;
  width: 100%;

  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 12px 14px;
    padding-right: 40px; /* space for the calendar icon */
    border-radius: ${({ theme }) => theme.radii.sm};
    border: 1px solid ${({ theme, $error }) => ($error ? theme.colors.error : theme.colors.border)};
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.sizes.md};
    transition: all 0.2s;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: ${({ theme, $error }) => ($error ? theme.colors.error : theme.colors.primary)};
      box-shadow: 0 0 0 3px ${({ theme, $error }) => ($error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(221, 167, 165, 0.2)')};
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.border};
    }
  }

  /* Custom Calendar Styling */
  .react-datepicker {
    font-family: inherit;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    box-shadow: ${({ theme }) => theme.shadows.md};
    background-color: ${({ theme }) => theme.colors.surface};
  }

  .react-datepicker__header {
    background-color: ${({ theme }) => theme.colors.background};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    border-top-left-radius: ${({ theme }) => theme.radii.md};
    border-top-right-radius: ${({ theme }) => theme.radii.md};
    padding-top: 12px;
  }

  .react-datepicker__current-month {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
    font-size: ${({ theme }) => theme.typography.sizes.md};
    text-transform: capitalize;
  }

  .react-datepicker__day-name {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }

  .react-datepicker__day {
    color: ${({ theme }) => theme.colors.textPrimary};
    border-radius: ${({ theme }) => theme.radii.full};
    transition: all 0.2s;
    
    &:hover {
      background-color: rgba(221, 167, 165, 0.1);
      color: ${({ theme }) => theme.colors.primaryDark};
    }
  }

  .react-datepicker__day--selected, 
  .react-datepicker__day--keyboard-selected {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #fff;
    font-weight: ${({ theme }) => theme.typography.weights.bold};

    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryDark};
    }
  }

  .react-datepicker__navigation-icon::before {
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  .react-datepicker__navigation:hover *::before {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
  display: flex;
  align-items: center;
`;

export const DatePicker = ({ label, error, value, onChange, placeholder = 'Selecione uma data', ...props }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Convert "yyyy-MM-dd" or ISO string to Date object
  let selectedDate = null;
  if (value) {
    if (value instanceof Date) {
      selectedDate = value;
    } else if (typeof value === 'string' && value.length >= 10) {
      // Avoid timezone shift by splitting if it's strictly 'yyyy-MM-dd' natively from our <input type=date/> fallback
      try {
        const [y, m, d] = (value.split('T')[0]).split('-');
        selectedDate = new Date(y, m - 1, d);
      } catch (e) {
        selectedDate = new Date(value);
      }
    }
  }

  const handleChange = (date) => {
    // Return an event-like object to maintain compatibility with standard onChange={e => setValue(e.target.value)}
    if (onChange) {
      const formatted = date ? format(date, 'yyyy-MM-dd') : '';
      onChange({ target: { value: formatted, name: props.name } });
    }
  };

  return (
    <InputWrapper>
      {label && <Label>{label}</Label>}
      <DatePickerWrapper $error={error}>
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleChange}
          locale="pt-BR"
          dateFormat="dd/MM/yyyy"
          placeholderText={placeholder}
          withPortal={isMobile}
          {...props}
        />
        <IconWrapper>
          <FiCalendar size={18} />
        </IconWrapper>
      </DatePickerWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};
