import { useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
	const [email, setEmail] = useState('admin@barbearia.com')
	const [senha, setSenha] = useState('admin123')
	const [erro, setErro] = useState('')
	const navigate = useNavigate()

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setErro('')
		try {
			const res = await api.post('/admin/token', { email, senha })
			localStorage.setItem('admin_token', res.data.access_token)
			navigate('/admin')
		} catch {
			setErro('Credenciais inválidas')
		}
	}
	return (
		<div>
			<Navbar />
			<div className="container">
				<h2>Login Admin</h2>
				<form className="row g-3" onSubmit={onSubmit}>
					<div className="col-md-6">
						<label className="form-label">E-mail</label>
						<input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
					</div>
					<div className="col-md-6">
						<label className="form-label">Senha</label>
						<input type="password" className="form-control" value={senha} onChange={e => setSenha(e.target.value)} required />
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