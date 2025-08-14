import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

interface Cliente { id: number; nome: string; telefone: string }

export default function AdminMarketing() {
	const [clientes, setClientes] = useState<Cliente[]>([])
	const [mensagem, setMensagem] = useState('Olá! Promoções especiais da Metheus Barber!')
	const [status, setStatus] = useState('')
	const [token, setToken] = useState('')
	const [phoneId, setPhoneId] = useState('')
	const [imagem, setImagem] = useState<File | null>(null)

	useEffect(() => {
		const jwt = sessionStorage.getItem('admin_token')
		api.get('/admin/clientes', { headers: { Authorization: `Bearer ${jwt}` } }).then(r => setClientes(r.data))
		api.get('/admin/marketing/config', { headers: { Authorization: `Bearer ${jwt}` } }).then(r => {
			setToken(r.data?.WHATSAPP_CLOUD_API_TOKEN || '')
			setPhoneId(r.data?.WHATSAPP_PHONE_ID || '')
		})
	}, [])

	async function salvarConfig() {
		setStatus('')
		try {
			const jwt = sessionStorage.getItem('admin_token')
			const form = new FormData()
			form.append('token', token)
			form.append('phone_id', phoneId)
			await api.post('/admin/marketing/config', form, { headers: { Authorization: `Bearer ${jwt}` } })
			setStatus('Configurações salvas')
		} catch (e: any) {
			setStatus(e?.response?.data?.detail || 'Erro ao salvar configurações')
		}
	}

	async function enviar() {
		setStatus('')
		try {
			const jwt = sessionStorage.getItem('admin_token')
			const form = new FormData()
			form.append('mensagem', mensagem)
			if (imagem) form.append('imagem', imagem)
			const res = await api.post('/admin/marketing/whatsapp', form, { headers: { Authorization: `Bearer ${jwt}` } })
			setStatus(`Enviado: ${res.data.enviados} | Falhas: ${res.data.falhas}`)
		} catch (e: any) {
			setStatus(e?.response?.data?.detail || 'Erro ao enviar as mensagens')
		}
	}

	return (
		<AdminLayout title="Marketing">
			<h5>Configuração WhatsApp Cloud API</h5>
			<div className="row g-2 mb-3">
				<div className="col-md-6"><input className="form-control" placeholder="Token" value={token} onChange={e => setToken(e.target.value)} /></div>
				<div className="col-md-6"><input className="form-control" placeholder="Phone Number ID" value={phoneId} onChange={e => setPhoneId(e.target.value)} /></div>
				<div className="col-12"><button className="btn btn-outline-primary" onClick={salvarConfig}>Salvar Configuração</button></div>
			</div>

			<h5>Enviar mensagem via WhatsApp</h5>
			<div className="mb-3">
				<label className="form-label">Mensagem</label>
				<textarea className="form-control" rows={3} value={mensagem} onChange={e => setMensagem(e.target.value)} />
			</div>
			<div className="mb-3">
				<label className="form-label">Imagem (opcional)</label>
				<input type="file" className="form-control" accept="image/*" onChange={e => setImagem(e.target.files?.[0] || null)} />
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