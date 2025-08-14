import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import BotaoVoltar from '../components/BotaoVoltar'

type Servico = {
	id: number
	nome: string
	preco: number
	tempo_estimado: number
}

export default function EscolherServicos() {
	const [servicos, setServicos] = useState<Servico[]>([])
	const [selecionados, setSelecionados] = useState<number[]>([])
	const navigate = useNavigate()

	useEffect(() => {
		const cliente = sessionStorage.getItem('cliente_id')
		if (!cliente) navigate('/login-cliente', { replace: true })
		api.get('/servicos').then(r => setServicos(r.data))
	}, [navigate])

	function toggleServico(id: number) {
		setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
	}

	function continuar() {
		const escolhidos = servicos.filter(s => selecionados.includes(s.id))
		navigate('/resumo', { state: { escolhidos } })
	}

	return (
		<div>
			<Navbar />
			<div className="container">
				<BotaoVoltar />
				<h2>Escolha de Serviços</h2>
				<div className="row">
					{servicos.map(s => (
						<div className="col-md-4" key={s.id}>
							<div className={`card mb-3 ${selecionados.includes(s.id) ? 'border-primary' : ''}`} onClick={() => toggleServico(s.id)} style={{ cursor: 'pointer' }}>
								<div className="card-body">
									<h5 className="card-title">{s.nome}</h5>
									<p className="card-text mb-1">Preço: R$ {s.preco.toFixed(2)}</p>
									<p className="card-text">Tempo: {s.tempo_estimado} min</p>
								</div>
							</div>
						</div>
					))}
				</div>
				<div className="mt-3">
					<button className="btn btn-primary" disabled={selecionados.length === 0} onClick={continuar}>Continuar</button>
				</div>
			</div>
		</div>
	)
}