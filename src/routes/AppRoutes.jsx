import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Splash from '../pages/public/Splash';
import Entrada from '../pages/public/Entrada';
import EntradaGlobal from '../pages/public/EntradaGlobal';
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
import MasterDashboard from '../pages/master/MasterDashboard';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/ui/Loader';

const RedirecionadorEntrada = () => {
    const { user, empresa, isMaster, loading } = useAuth();

    if (loading) return <Loader fullHeight />;

    // Se o usuário está na rota /admin sem slug e não está logado, vai para login
    if (!user && window.location.pathname.includes('/admin')) return <Navigate to="/admin/login" replace />;

    // Se não tem usuário e não estamos em contexto de admin, mostramos uma página genérica ou deixamos passar?
    // Se não temos slug, não sabemos qual empresa mostrar.
    // Se não tem usuário e não temos slug, vamos para a entrada global onde ele pode buscar a empresa
    if (!user && !empresa?.slug) return <Navigate to="/entrada" replace />;

    if (isMaster) return <Navigate to="/master" replace />;

    if (empresa?.slug) {
        if (user.isAnonymous) {
            return <Navigate to={`/${empresa.slug}/home`} replace />;
        }
        return <Navigate to={`/${empresa.slug}/admin`} replace />;
    }

    // Se estiver logado mas sem empresa (ex: anônimo na raiz), não temos como saber para onde ir
    // Vamos mandar para o login admin por segurança ou manter na raiz
    return <Navigate to="/admin/login" replace />;
};

const AdminGuard = () => {
    const { user } = useAuth();
    const { tenantSlug } = useParams();

    if (!user || user.isAnonymous) {
        return <Navigate to={`/${tenantSlug}/admin/login`} replace />;
    }

    return <AdminLayout />;
};

export const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<div className="mobile-app-wrapper"><Splash /></div>} />

            {/* Rotas de Login e Redirecionamento (Prioritárias) */}
            <Route path="/admin/login" element={
                !user ? <LoginAdmin /> : <RedirecionadorEntrada />
            } />

            <Route path="/entrada" element={<div className="mobile-app-wrapper"><EntradaGlobal /></div>} />
            <Route path="/admin" element={<RedirecionadorEntrada />} />

            {/* Painel Master (Gerenciamento Global de Empresas) */}
            <Route path="/master" element={
                user && !user.isAnonymous ? <MasterDashboard /> : <Navigate to="/admin/login" replace />
            } />

            {/* Rotas Dinâmicas de Empresa (CLIENTE E ADMIN) */}
            <Route path="/:tenantSlug">
                <Route index element={<div className="mobile-app-wrapper"><Entrada /></div>} />

                {/* Área do Usuário/Cliente */}
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

                {/* Área Administrativa da Empresa Local */}
                <Route path="admin" element={<AdminGuard />}>
                    <Route index element={<Dashboard />} />
                    <Route path="servicos" element={<Servicos />} />
                    <Route path="atendimentos" element={<Atendimentos />} />
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="configuracoes" element={<Configuracoes />} />
                </Route>

                {/* Rota de Login Específica por Empresa */}
                <Route path="admin/login" element={<LoginAdmin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
