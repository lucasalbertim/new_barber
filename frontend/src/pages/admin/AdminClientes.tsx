import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

interface Cliente { id: number; nome: string; cpf: string; telefone: string; email?: string; criado_em: string }

export default function AdminClientes() {
	const [clientes, setClientes] = useState<Cliente[]>([])

	useEffect(() => {
		const token = sessionStorage.getItem('admin_token')
		api.get('/admin/clientes', { headers: { Authorization: `Bearer ${token}` } }).then(r => setClientes(r.data))
	}, [])

	function exportarCsv() {
		const token = sessionStorage.getItem('admin_token')
		api.get('/admin/clientes/csv', { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }).then(res => {
			const url = URL.createObjectURL(res.data)
			const a = document.createElement('a')
			a.href = url
			a.download = 'clientes.csv'
			a.click()
			URL.revokeObjectURL(url)
		})
	}

	return (
		<AdminLayout title="Clientes">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h5 className="mb-0">Lista de Clientes</h5>
				<button className="btn btn-outline-primary" onClick={exportarCsv}>Exportar CSV</button>
			</div>
			<div className="table-responsive">
				<table className="table table-striped">
					<thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th>Data de Cadastro</th></tr></thead>
					<tbody>
						{clientes.map(c => (
							<tr key={c.id}>
								<td>{c.nome}</td>
								<td>{c.cpf}</td>
								<td>{c.telefone}</td>
								<td>{c.email || '-'}</td>
								<td>{new Date(c.criado_em).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</AdminLayout>
	)
}