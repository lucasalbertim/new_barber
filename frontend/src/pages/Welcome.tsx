import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

export default function Welcome() {
	return (
		<div>
			<Navbar />
			<header className="bg-light py-5">
				<div className="container text-center">
					<h1 className="display-5 fw-bold">Sistema de Atendimento - Barbearia</h1>
					<p className="lead">Agilidade para seus clientes, controle para você.</p>
					<div className="d-flex justify-content-center gap-3 mt-4">
						<Link to="/cliente" className="btn btn-primary btn-lg">Sou Cliente</Link>
						<Link to="/admin/login" className="btn btn-outline-dark btn-lg">Sou Dono</Link>
					</div>
				</div>
			</header>
		</div>
	)
}