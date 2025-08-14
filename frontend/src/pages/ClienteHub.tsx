import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import BotaoVoltar from '../components/BotaoVoltar'

export default function ClienteHub() {
	return (
		<div>
			<Navbar />
			<div className="container">
				<BotaoVoltar />
				<h2>Sou Cliente</h2>
				<p className="text-muted">Escolha uma opção para continuar:</p>
				<div className="d-flex gap-3">
					<Link to="/login-cliente" className="btn btn-primary">Login</Link>
					<Link to="/cadastro-cliente" className="btn btn-outline-secondary">Cadastro</Link>
				</div>
			</div>
		</div>
	)
}