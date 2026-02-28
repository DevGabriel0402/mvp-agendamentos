import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash from '../pages/public/Splash';
import Entrada from '../pages/public/Entrada';
import Home from '../pages/usuario/Home';
import Agendamento from '../pages/usuario/Agendamento';
import Sucesso from '../pages/usuario/Sucesso';
import Favoritos from '../pages/usuario/Favoritos';
import MeusAgendamentos from '../pages/usuario/MeusAgendamentos';
import UserLayout from '../components/layout/UserLayout';
import LoginAdmin from '../pages/public/LoginAdmin';
import AdminLayout from '../components/layout/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import Atendimentos from '../pages/admin/Atendimentos';
import Clientes from '../pages/admin/Clientes';
import Configuracoes from '../pages/admin/Configuracoes';
import Servicos from '../pages/admin/Servicos';
import { useAuth } from '../hooks/useAuth';

export const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<div className="mobile-app-wrapper"><Splash /></div>} />

                {/* Rotas Dinâmicas de Empresa (CLIENTE) */}
                <Route path="/:tenantSlug">
                    <Route index element={<div className="mobile-app-wrapper"><Entrada /></div>} />

                    <Route element={user && user.isAnonymous ? <UserLayout /> : <Navigate to="./" replace />}>
                        <Route path="home" element={<Home />} />
                        <Route path="agendamentos" element={<MeusAgendamentos />} />
                        <Route path="favoritos" element={<Favoritos />} />
                    </Route>

                    <Route path="agendar/:id" element={
                        user && user.isAnonymous ?
                            <div className="mobile-app-wrapper"><Agendamento /></div> :
                            <Navigate to="./" replace />
                    } />

                    <Route path="sucesso" element={
                        user && user.isAnonymous ?
                            <div className="mobile-app-wrapper"><Sucesso /></div> :
                            <Navigate to="./" replace />
                    } />
                </Route>

                {/* Entrada lida com redirecionamento de acordo com o usuário */}
                <Route
                    path="/entrada"
                    element={!user ? <div className="mobile-app-wrapper"><Entrada /></div> : <Navigate to={user.isAnonymous ? "/home" : "/admin"} replace />}
                />

                {/* Rotas Admin */}
                <Route path="/admin/login" element={
                    !user ? <LoginAdmin /> : <Navigate to="/admin" replace />
                } />

                <Route path="/admin" element={
                    user && !user.isAnonymous ?
                        <AdminLayout /> :
                        <Navigate to="/admin/login" replace />
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="servicos" element={<Servicos />} />
                    <Route path="atendimentos" element={<Atendimentos />} />
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="configuracoes" element={<Configuracoes />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
