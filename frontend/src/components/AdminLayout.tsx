import { Link, useNavigate } from 'react-router-dom'
import BotaoVoltar from './BotaoVoltar'

export default function AdminLayout({ title, children }: { title: string, children: any }) {
	const navigate = useNavigate()
	function sair() {
		sessionStorage.removeItem('admin_token')
		navigate('/admin/login')
	}
	return (
		<div>
			<nav className="navbar navbar-dark bg-dark">
				<div className="container d-flex justify-content-between">
					<Link to="/admin" className="navbar-brand">Admin - {title}</Link>
					<div>
						<Link to="/admin" className="btn btn-sm btn-outline-light me-2">Dashboard</Link>
						<Link to="/admin/servicos" className="btn btn-sm btn-outline-light me-2">Serviços</Link>
						<Link to="/admin/relatorios" className="btn btn-sm btn-outline-light me-2">Relatórios</Link>
						<button className="btn btn-sm btn-danger" onClick={sair}>Sair</button>
					</div>
				</div>
			</nav>
			<div className="container mt-4">
				<BotaoVoltar />
				{children}
			</div>
		</div>
	)
}