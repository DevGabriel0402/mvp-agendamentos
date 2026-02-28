import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    background-color: #F3F4F6; /* Fundo global levemente cinza/gelo para as bordas do app */
    color: ${({ theme }) => theme.colors.textPrimary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    outline: none;
  }

  /* Scrollbar customizada */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textSecondary};
  }

  .maplibregl-ctrl{
  display: none !important;}

  /* Estilos Globais para DatePicker Portal (Mobile) */
  .react-datepicker__portal {
    background-color: rgba(0, 0, 0, 0.6) !important;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000 !important;
  }

  /* Faz o calendário aparecer bonitão dentro do portal */
  .react-datepicker__portal .react-datepicker {
    font-family: inherit !important;
    border: none !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  }

  @media (max-width: 768px) {
    .react-datepicker-popper {
      z-index: 9999 !important;
    }
  }
`;
