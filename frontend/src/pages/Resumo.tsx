import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import BotaoVoltar from '../components/BotaoVoltar'

type Servico = { id: number; nome: string; preco: number; tempo_estimado: number }

export default function Resumo() {
	const { state } = useLocation() as any
	const escolhidos: Servico[] = state?.escolhidos || []
	const [erro, setErro] = useState('')
	const [ok, setOk] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		if (!sessionStorage.getItem('cliente_id')) navigate('/login-cliente', { replace: true })
	}, [navigate])

	const total = escolhidos.reduce((acc, s) => acc + s.preco, 0)
	const tempo = escolhidos.reduce((acc, s) => acc + s.tempo_estimado, 0)

	async function confirmar() {
		setErro(''); setOk('')
		try {
			const cliente_id = Number(sessionStorage.getItem('cliente_id'))
			await api.post('/atendimentos', {
				cliente_id,
				servicos: escolhidos.map(s => ({ servico_id: s.id }))
			})
			setOk('Atendimento registrado!')
			setTimeout(() => navigate('/pagamento'), 800)
		} catch (e: any) {
			setErro(e?.response?.data?.detail || 'Erro ao confirmar atendimento')
		}
	}

	return (
		<div>
			<Navbar />
			<div className="container">
				<BotaoVoltar />
				<h2>Resumo</h2>
				<ul className="list-group">
					{escolhidos.map(s => (
						<li key={s.id} className="list-group-item d-flex justify-content-between">
							<span>{s.nome} ({s.tempo_estimado}min)</span>
							<span>R$ {s.preco.toFixed(2)}</span>
						</li>
					))}
					<li className="list-group-item d-flex justify-content-between fw-bold">
						<span>Total tempo</span>
						<span>{tempo} min</span>
					</li>
					<li className="list-group-item d-flex justify-content-between fw-bold">
						<span>Total</span>
						<span>R$ {total.toFixed(2)}</span>
					</li>
				</ul>
				<div className="mt-3 d-flex gap-2">
					<button className="btn btn-success" onClick={confirmar}>Confirmar Atendimento</button>
					<button className="btn btn-outline-secondary" onClick={() => navigate('/pagamento')}>Pagar Agora</button>
				</div>
				{erro && <div className="alert alert-danger mt-3">{erro}</div>}
				{ok && <div className="alert alert-success mt-3">{ok}</div>}
			</div>
		</div>
	)
}