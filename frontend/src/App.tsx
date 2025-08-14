import { Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import ClienteCadastro from './pages/ClienteCadastro'
import ClienteLogin from './pages/ClienteLogin'
import ClienteHub from './pages/ClienteHub'
import BoasVindasCliente from './pages/BoasVindasCliente'
import EscolherServicos from './pages/EscolherServicos'
import Resumo from './pages/Resumo'
import Pagamento from './pages/Pagamento'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminServicos from './pages/admin/AdminServicos'
import AdminRelatorios from './pages/admin/AdminRelatorios'
import AdminClientes from './pages/admin/AdminClientes'
import AdminMarketing from './pages/admin/AdminMarketing'
import PrivateRouteCliente from './components/PrivateRouteCliente'
import PrivateRouteAdmin from './components/PrivateRouteAdmin'

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Welcome />} />
			<Route path="/cliente" element={<ClienteHub />} />
			<Route path="/cadastro-cliente" element={<ClienteCadastro />} />
			<Route path="/login-cliente" element={<ClienteLogin />} />
			<Route path="/boas-vindas-cliente" element={<PrivateRouteCliente><BoasVindasCliente /></PrivateRouteCliente>} />
			<Route path="/escolher-servicos" element={<PrivateRouteCliente><EscolherServicos /></PrivateRouteCliente>} />
			<Route path="/resumo" element={<PrivateRouteCliente><Resumo /></PrivateRouteCliente>} />
			<Route path="/pagamento" element={<PrivateRouteCliente><Pagamento /></PrivateRouteCliente>} />

			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/admin" element={<PrivateRouteAdmin><AdminDashboard /></PrivateRouteAdmin>} />
			<Route path="/admin/servicos" element={<PrivateRouteAdmin><AdminServicos /></PrivateRouteAdmin>} />
			<Route path="/admin/relatorios" element={<PrivateRouteAdmin><AdminRelatorios /></PrivateRouteAdmin>} />
			<Route path="/admin/clientes" element={<PrivateRouteAdmin><AdminClientes /></PrivateRouteAdmin>} />
			<Route path="/admin/marketing" element={<PrivateRouteAdmin><AdminMarketing /></PrivateRouteAdmin>} />
		</Routes>
	)
}