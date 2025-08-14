import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import BotaoVoltar from '../components/BotaoVoltar'
import { useNavigate } from 'react-router-dom'

export default function Pagamento() {
	const [metodo, setMetodo] = useState('pix')
	const [ok, setOk] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		if (!sessionStorage.getItem('cliente_id')) navigate('/login-cliente', { replace: true })
	}, [navigate])

	return (
		<div>
			<Navbar />
			<div className="container">
				<BotaoVoltar />
				<h2>Pagamento</h2>
				<div className="mb-3">
					<label className="form-label">Método de Pagamento</label>
					<select className="form-select" value={metodo} onChange={e => setMetodo(e.target.value)}>
						<option value="pix">Pix</option>
						<option value="cartao">Cartão</option>
						<option value="dinheiro">Dinheiro</option>
					</select>
				</div>
				<button className="btn btn-primary" onClick={() => setOk('Pagamento registrado (simulação)!')}>Pagar</button>
				{ok && <div className="alert alert-success mt-3">{ok}</div>}
			</div>
		</div>
	)
}