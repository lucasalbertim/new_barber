import { Link } from 'react-router-dom'

export default function AdminLayout({ title, children }: { title: string, children: any }) {
	function sair() {
		localStorage.removeItem('admin_token')
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
						<Link to="/" className="btn btn-sm btn-danger" onClick={sair}>Sair</Link>
					</div>
				</div>
			</nav>
			<div className="container mt-4">{children}</div>
		</div>
	)
}