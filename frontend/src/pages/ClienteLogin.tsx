import { useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import BotaoVoltar from '../components/BotaoVoltar'

function maskCpfOrPhone(v: string) {
	const d = v.replace(/\D/g, '')
	if (d.length <= 11) {
		// pode ser CPF ou telefone sem 9o dígito
		if (d.length <= 11) return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0,14)
	}
	// telefone: tenta máscara de celular (11 dígitos)
	if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
	return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

export default function ClienteLogin() {
	const [cpfOuTelefone, setCpfOuTelefone] = useState('')
	const [erro, setErro] = useState('')
	const navigate = useNavigate()

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setErro('')
		try {
			const r = await api.get(`/clientes/${encodeURIComponent(cpfOuTelefone.replace(/\D/g, ''))}`)
			sessionStorage.setItem('cliente_id', String(r.data.id))
			sessionStorage.setItem('cliente_nome', String(r.data.nome))
			navigate('/boas-vindas-cliente', { state: { mensagem: `Bem-vindo de volta, ${r.data.nome}!` } })
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
						<input className="form-control" value={cpfOuTelefone} onChange={e => setCpfOuTelefone(maskCpfOrPhone(e.target.value))} required />
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