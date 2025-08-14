import Navbar from '../components/Navbar'
import { useState } from 'react'

export default function Pagamento() {
	const [metodo, setMetodo] = useState('pix')
	const [ok, setOk] = useState('')
	return (
		<div>
			<Navbar />
			<div className="container">
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