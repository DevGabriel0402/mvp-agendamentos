import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { AppRoutes } from './routes/AppRoutes';
import { useConfiguracoes } from './hooks/useConfiguracoes';
import { useTenant } from './hooks/useTenant';

function App() {
  const location = useLocation();
  // Extrai o primeiro segmento da URL (slug da empresa)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const potentialSlug = pathParts[0];

  const { tenant, loading: loadingTenant } = useTenant(potentialSlug);
  const { config, loading: loadingConfig } = useConfiguracoes(tenant);

  const loading = loadingTenant || loadingConfig;

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
