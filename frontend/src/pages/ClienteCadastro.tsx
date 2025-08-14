import { useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import BotaoVoltar from '../components/BotaoVoltar'

function validarCPF(cpf: string) {
	cpf = cpf.replace(/\D/g, '')
	if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false
	let soma = 0
	for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i)
	let resto = (soma * 10) % 11
	if (resto === 10 || resto === 11) resto = 0
	if (resto !== parseInt(cpf.charAt(9))) return false
	soma = 0
	for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i)
	resto = (soma * 10) % 11
	if (resto === 10 || resto === 11) resto = 0
	if (resto !== parseInt(cpf.charAt(10))) return false
	return true
}

function validarTelefone(t: string) {
	const d = t.replace(/\D/g, '')
	return d.length >= 10 && d.length <= 11
}

function maskCpf(v: string) { return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0,14) }
function maskPhone(v: string) { const d = v.replace(/\D/g, ''); if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3'); return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3') }
function isValidEmail(e: string) { return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

export default function ClienteCadastro() {
	const [nome, setNome] = useState('')
	const [cpf, setCpf] = useState('')
	const [telefone, setTelefone] = useState('')
	const [email, setEmail] = useState('')
	const [erro, setErro] = useState('')
	const navigate = useNavigate()

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setErro('')
		if (!validarCPF(cpf)) return setErro('CPF inválido')
		if (!validarTelefone(telefone)) return setErro('Telefone inválido')
		if (!isValidEmail(email)) return setErro('E-mail inválido')
		try {
			const resp = await api.post('/clientes', { nome, cpf: cpf.replace(/\D/g, ''), telefone: telefone.replace(/\D/g, ''), email: email || null })
			sessionStorage.setItem('cliente_id', String(resp.data.id))
			sessionStorage.setItem('cliente_nome', String(resp.data.nome))
			navigate('/boas-vindas-cliente', { state: { mensagem: `Seja bem-vindo, ${resp.data.nome}!` } })
		} catch (err: any) {
			setErro(err?.response?.data?.detail || 'Erro ao cadastrar')
		}
	}

	return (
		<div>
			<Navbar />
			<div className="container">
				<BotaoVoltar />
				<h2>Cadastro de Cliente</h2>
				<form className="row g-3" onSubmit={onSubmit}>
					<div className="col-md-6">
						<label className="form-label">Nome</label>
						<input className="form-control" value={nome} onChange={e => setNome(e.target.value)} required />
					</div>
					<div className="col-md-6">
						<label className="form-label">CPF</label>
						<input className="form-control" value={cpf} onChange={e => setCpf(maskCpf(e.target.value))} required />
					</div>
					<div className="col-md-6">
						<label className="form-label">Telefone (WhatsApp)</label>
						<input className="form-control" value={telefone} onChange={e => setTelefone(maskPhone(e.target.value))} required />
					</div>
					<div className="col-md-6">
						<label className="form-label">E-mail (opcional)</label>
						<input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
					</div>
					{erro && <div className="col-12"><div className="alert alert-danger">{erro}</div></div>}
					<div className="col-12">
						<button className="btn btn-primary">Cadastrar</button>
					</div>
				</form>
			</div>
		</div>
	)
}