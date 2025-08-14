import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

export default function AdminRelatorios() {
	const [inicio, setInicio] = useState('')
	const [fim, setFim] = useState('')
	const token = localStorage.getItem('admin_token')

	function baixarCsv() {
		api.get('/admin/relatorios/csv', { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }).then(res => {
			const url = URL.createObjectURL(res.data)
			const a = document.createElement('a')
			a.href = url
			a.download = 'atendimentos.csv'
			a.click()
			URL.revokeObjectURL(url)
		})
	}

	function baixarPdf() {
		api.get('/admin/relatorios/pdf', { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }).then(res => {
			const url = URL.createObjectURL(res.data)
			const a = document.createElement('a')
			a.href = url
			a.download = 'atendimentos.pdf'
			a.click()
			URL.revokeObjectURL(url)
		})
	}

	return (
		<AdminLayout title="Relatórios">
			<div className="row g-3">
				<div className="col-md-4">
					<label className="form-label">Início</label>
					<input type="date" className="form-control" value={inicio} onChange={e => setInicio(e.target.value)} />
				</div>
				<div className="col-md-4">
					<label className="form-label">Fim</label>
					<input type="date" className="form-control" value={fim} onChange={e => setFim(e.target.value)} />
				</div>
				<div className="col-md-4 d-flex align-items-end">
					<button className="btn btn-primary me-2" onClick={baixarCsv}>Exportar CSV</button>
					<button className="btn btn-outline-secondary" onClick={baixarPdf}>Exportar PDF</button>
				</div>
			</div>
		</AdminLayout>
	)
}