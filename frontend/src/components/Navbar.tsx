import { Link } from 'react-router-dom'

export default function Navbar() {
	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 fixed-top">
			<div className="container">
				<Link to="/" className="navbar-brand">Metheus Barber</Link>
				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div id="navContent" className="collapse navbar-collapse">
					<ul className="navbar-nav me-auto">
						<li className="nav-item"><Link className="nav-link" to="/cadastro-cliente">Cadastro</Link></li>
						<li className="nav-item"><Link className="nav-link" to="/login-cliente">Login Cliente</Link></li>
						<li className="nav-item"><Link className="nav-link" to="/escolher-servicos">Serviços</Link></li>
					</ul>
					<ul className="navbar-nav ms-auto">
						<li className="nav-item"><Link className="nav-link" to="/admin/login">Admin</Link></li>
					</ul>
				</div>
			</div>
		</nav>
	)
}