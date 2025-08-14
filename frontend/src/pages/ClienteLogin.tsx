import { useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import BotaoVoltar from '../components/BotaoVoltar'

export default function ClienteLogin() {
	const [cpfOuTelefone, setCpfOuTelefone] = useState('')
	const [erro, setErro] = useState('')
	const navigate = useNavigate()

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setErro('')
		try {
			const r = await api.get(`/clientes/${encodeURIComponent(cpfOuTelefone)}`)
			sessionStorage.setItem('cliente_id', String(r.data.id))
			// fluxo: login -> escolher-servicos
			navigate('/escolher-servicos')
		} catch {
			setErro('Cliente não encontrado')
		}
	}

	return (
		<div>
			<Navbar />
			<div className="container">
				<BotaoVoltar />
				<h2>Login do Cliente</h2>
				<form className="row g-3" onSubmit={onSubmit}>
					<div className="col-md-8">
						<label className="form-label">CPF ou Telefone</label>
						<input className="form-control" value={cpfOuTelefone} onChange={e => setCpfOuTelefone(e.target.value)} required />
					</div>
					{erro && <div className="col-12"><div className="alert alert-danger">{erro}</div></div>}
					<div className="col-12">
						<button className="btn btn-primary">Entrar</button>
					</div>
				</form>
			</div>
		</div>
	)
}