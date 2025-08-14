import { Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import ClienteCadastro from './pages/ClienteCadastro'
import ClienteLogin from './pages/ClienteLogin'
import EscolherServicos from './pages/EscolherServicos'
import Resumo from './pages/Resumo'
import Pagamento from './pages/Pagamento'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminServicos from './pages/admin/AdminServicos'
import AdminRelatorios from './pages/admin/AdminRelatorios'

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Welcome />} />
			<Route path="/cadastro-cliente" element={<ClienteCadastro />} />
			<Route path="/login-cliente" element={<ClienteLogin />} />
			<Route path="/escolher-servicos" element={<EscolherServicos />} />
			<Route path="/resumo" element={<Resumo />} />
			<Route path="/pagamento" element={<Pagamento />} />

			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/admin" element={<AdminDashboard />} />
			<Route path="/admin/servicos" element={<AdminServicos />} />
			<Route path="/admin/relatorios" element={<AdminRelatorios />} />
		</Routes>
	)
}