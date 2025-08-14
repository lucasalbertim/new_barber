import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

interface Servico { id: number; nome: string; preco: number; tempo_estimado: number }

export default function AdminServicos() {
	const [servicos, setServicos] = useState<Servico[]>([])
	const [form, setForm] = useState<{id?: number, nome: string, preco: string, tempo_estimado: string}>({ nome: '', preco: '', tempo_estimado: '' })
	const token = localStorage.getItem('admin_token')

	function load() {
		api.get('/servicos').then(r => setServicos(r.data))
	}
	useEffect(load, [])

	async function salvar(e: React.FormEvent) {
		e.preventDefault()
		const payload = { nome: form.nome, preco: parseFloat(form.preco), tempo_estimado: parseInt(form.tempo_estimado) }
		if (form.id) {
			await api.put(`/servicos/${form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
		} else {
			await api.post('/servicos', payload, { headers: { Authorization: `Bearer ${token}` } })
		}
		setForm({ nome: '', preco: '', tempo_estimado: '' })
		load()
	}

	async function remover(id: number) {
		await api.delete(`/servicos/${id}`, { headers: { Authorization: `Bearer ${token}` } })
		load()
	}

	return (
		<AdminLayout title="Serviços">
			<div className="row">
				<div className="col-md-5">
					<h5>{form.id ? 'Editar Serviço' : 'Novo Serviço'}</h5>
					<form className="row g-3" onSubmit={salvar}>
						<div className="col-12"><label className="form-label">Nome</label><input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required /></div>
						<div className="col-6"><label className="form-label">Preço</label><input className="form-control" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} required /></div>
						<div className="col-6"><label className="form-label">Tempo (min)</label><input className="form-control" value={form.tempo_estimado} onChange={e => setForm({ ...form, tempo_estimado: e.target.value })} required /></div>
						<div className="col-12"><button className="btn btn-primary">Salvar</button> {form.id && <button type="button" className="btn btn-secondary ms-2" onClick={() => setForm({ nome: '', preco: '', tempo_estimado: '' })}>Cancelar</button>}</div>
					</form>
				</div>
				<div className="col-md-7">
					<h5>Serviços</h5>
					<table className="table table-striped">
						<thead><tr><th>Nome</th><th>Preço</th><th>Tempo</th><th></th></tr></thead>
						<tbody>
							{servicos.map(s => (
								<tr key={s.id}>
									<td>{s.nome}</td>
									<td>R$ {s.preco.toFixed(2)}</td>
									<td>{s.tempo_estimado} min</td>
									<td className="text-end">
										<button className="btn btn-sm btn-outline-primary me-2" onClick={() => setForm({ id: s.id, nome: s.nome, preco: String(s.preco), tempo_estimado: String(s.tempo_estimado) })}>Editar</button>
										<button className="btn btn-sm btn-outline-danger" onClick={() => remover(s.id)}>Remover</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</AdminLayout>
	)
}