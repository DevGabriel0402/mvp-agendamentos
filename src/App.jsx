import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { useConfiguracoes } from './hooks/useConfiguracoes';

function App() {
  const { config, loading } = useConfiguracoes();

  // Se carregando ou não tiver corTema, usa o padrão. Se tiver, cria um objeto customizado.
  const customTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: config?.corTema || theme.colors.primary,
    }
  };

  if (loading) return null; // Previne flicker visual

  return (
    <ThemeProvider theme={customTheme}>
      <GlobalStyle />
      <Toaster position="top-center" />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
