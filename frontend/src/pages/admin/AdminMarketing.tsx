import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

interface Cliente { id: number; nome: string; telefone: string }

export default function AdminMarketing() {
	const [clientes, setClientes] = useState<Cliente[]>([])
	const [mensagem, setMensagem] = useState('Olá! Promoções especiais da Metheus Barber!')
	const [status, setStatus] = useState('')

	useEffect(() => {
		const token = sessionStorage.getItem('admin_token')
		api.get('/admin/clientes', { headers: { Authorization: `Bearer ${token}` } }).then(r => setClientes(r.data))
	}, [])

	async function enviar() {
		setStatus('')
		try {
			const token = sessionStorage.getItem('admin_token')
			const res = await api.post('/admin/marketing/whatsapp', { mensagem }, { headers: { Authorization: `Bearer ${token}` } })
			setStatus(`Enviado: ${res.data.enviados} | Falhas: ${res.data.falhas}`)
		} catch (e: any) {
			setStatus(e?.response?.data?.detail || 'Erro ao enviar as mensagens')
		}
	}

	return (
		<AdminLayout title="Marketing">
			<h5>Enviar mensagem via WhatsApp</h5>
			<div className="mb-3">
				<label className="form-label">Mensagem</label>
				<textarea className="form-control" rows={3} value={mensagem} onChange={e => setMensagem(e.target.value)} />
			</div>
			<button className="btn btn-success" onClick={enviar}>Enviar para todos</button>
			{status && <div className="alert alert-info mt-3">{status}</div>}
			<hr />
			<h6>Números cadastrados</h6>
			<ul>
				{clientes.map(c => (<li key={c.id}>{c.nome}: {c.telefone}</li>))}
			</ul>
		</AdminLayout>
	)
}