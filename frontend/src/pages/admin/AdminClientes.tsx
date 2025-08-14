import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

interface Cliente { id: number; nome: string; cpf: string; telefone: string; email?: string; criado_em: string }

function maskCpf(v: string) { return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0,14) }
function maskPhone(v: string) { const d = v.replace(/\D/g, ''); if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3'); return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3') }
function isValidEmail(e: string) { return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

export default function AdminClientes() {
	const [clientes, setClientes] = useState<Cliente[]>([])
	const [busca, setBusca] = useState('')
	const [edit, setEdit] = useState<Partial<Cliente> & { id?: number }>({})
	const token = sessionStorage.getItem('admin_token')

	function load() {
		api.get('/admin/clientes', { params: busca ? { q: busca } : {}, headers: { Authorization: `Bearer ${token}` } }).then(r => setClientes(r.data))
	}
	useEffect(load, [busca])

	function startEdit(c: Cliente) {
		setEdit({ ...c })
	}

	async function salvar() {
		if (!edit.id) return
		if (!isValidEmail(edit.email || '')) { alert('E-mail inválido'); return }
		await api.put(`/admin/clientes/${edit.id}`, {
			nome: edit.nome,
			cpf: edit.cpf,
			telefone: edit.telefone,
			email: edit.email || null
		}, { headers: { Authorization: `Bearer ${token}` } })
		setEdit({})
		load()
	}

	async function remover(id: number) {
		if (!confirm('Remover este cliente?')) return
		await api.delete(`/admin/clientes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
		load()
	}

	return (
		<AdminLayout title="Clientes">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h5 className="mb-0">Lista de Clientes</h5>
				<div className="d-flex gap-2">
					<input className="form-control" placeholder="Pesquisar por nome, CPF ou telefone" style={{ maxWidth: 360 }} value={busca} onChange={e => setBusca(e.target.value)} />
					<button className="btn btn-outline-primary" onClick={load}>Buscar</button>
					<a className="btn btn-outline-secondary" href="#" onClick={e => { e.preventDefault(); const url = new URL(api.defaults.baseURL + '/admin/clientes/csv'); const a = document.createElement('a'); a.href = url.toString(); a.setAttribute('download', 'clientes.csv'); a.click(); }}>Exportar CSV</a>
				</div>
			</div>
			<div className="table-responsive">
				<table className="table table-striped align-middle">
					<thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th>Data</th><th className="text-end">Ações</th></tr></thead>
					<tbody>
						{clientes.map(c => (
							<tr key={c.id}>
								<td>{edit.id === c.id ? <input className="form-control" value={edit.nome || ''} onChange={e => setEdit({ ...edit, nome: e.target.value })} /> : c.nome}</td>
								<td>{edit.id === c.id ? <input className="form-control" value={edit.cpf || ''} onChange={e => setEdit({ ...edit, cpf: maskCpf(e.target.value) })} /> : c.cpf}</td>
								<td>{edit.id === c.id ? <input className="form-control" value={edit.telefone || ''} onChange={e => setEdit({ ...edit, telefone: maskPhone(e.target.value) })} /> : c.telefone}</td>
								<td>{edit.id === c.id ? <input className="form-control" value={edit.email || ''} onChange={e => setEdit({ ...edit, email: e.target.value })} /> : (c.email || '-')}</td>
								<td>{new Date(c.criado_em).toLocaleString()}</td>
								<td className="text-end">
									{edit.id === c.id ? (
										<>
											<button className="btn btn-sm btn-success me-2" onClick={salvar}>Salvar</button>
											<button className="btn btn-sm btn-secondary" onClick={() => setEdit({})}>Cancelar</button>
										</>
									) : (
										<>
											<button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(c)}>Editar</button>
											<button className="btn btn-sm btn-outline-danger" onClick={() => remover(c.id)}>Remover</button>
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</AdminLayout>
	)
}