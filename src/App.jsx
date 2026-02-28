import { useEffect } from 'react';
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

  useEffect(() => {
    // Só tentamos remover o loader quando as configurações pararem de carregar
    if (!loading) {
      const loader = document.getElementById('initial-loader');
      if (loader) {
        loader.style.opacity = '0';
        const timeout = setTimeout(() => {
          loader.remove();
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [loading]);

  if (loading) return null; // Mantém o SplashScreen visível enquanto carrega configs do Firebase

  return (
    <ThemeProvider theme={customTheme}>
      <GlobalStyle />
      <Toaster position="top-center" />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
