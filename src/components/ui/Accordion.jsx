import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';

const AccordionContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  margin-bottom: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}08`};
  }
`;

const Title = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const AccordionContent = styled.div`
  max-height: ${({ $isOpen, $height }) => ($isOpen ? `${$height}px` : '0px')};
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  background: ${({ theme }) => theme.colors.background};
`;

const ContentInner = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

/**
 * Componente Accordion Premium
 * @param {string} title - Título visível do accordion
 * @param {ReactNode} children - Conteúdo expansível
 * @param {boolean} defaultOpen - Se deve iniciar aberto
 */
export const Accordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [contentHeight, setContentHeight] = useState(0);
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [children]);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    return (
        <AccordionContainer>
            <AccordionHeader onClick={toggleAccordion} aria-expanded={isOpen}>
                <Title>{title}</Title>
                <IconWrapper $isOpen={isOpen}>
                    <FiChevronDown size={20} />
                </IconWrapper>
            </AccordionHeader>
            <AccordionContent $isOpen={isOpen} $height={contentHeight}>
                <ContentInner ref={contentRef}>
                    {children}
                </ContentInner>
            </AccordionContent>
        </AccordionContainer>
    );
};
