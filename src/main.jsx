import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);

// Remove o splash screen inicial após o React carregar
const loader = document.getElementById('initial-loader');
if (loader) {
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.remove();
  }, 1000);
}
