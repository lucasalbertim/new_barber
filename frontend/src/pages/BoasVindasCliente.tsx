import Navbar from '../components/Navbar'
import BotaoVoltar from '../components/BotaoVoltar'
import { useLocation, useNavigate } from 'react-router-dom'

export default function BoasVindasCliente() {
	const location = useLocation() as any
	const navigate = useNavigate()
	const msg = location?.state?.mensagem
	const nome = sessionStorage.getItem('cliente_nome')
	const mensagem = msg || (nome ? `Olá, ${nome}!` : 'Olá!')
	return (
		<div>
			<Navbar />
			<div className="container">
				<BotaoVoltar />
				<h2>{mensagem}</h2>
				<p className="text-muted">Pronto para agendar seu atendimento?</p>
				<button className="btn btn-success" onClick={() => navigate('/escolher-servicos')}>Escolher Serviços</button>
			</div>
		</div>
	)
}