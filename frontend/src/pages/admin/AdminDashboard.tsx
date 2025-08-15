import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

export default function AdminDashboard() {
	const [metricas, setMetricas] = useState<any>(null)
	const [inicio, setInicio] = useState<string>('')
	const [fim, setFim] = useState<string>('')
	const [groupBy, setGroupBy] = useState<'day'|'week'|'month'>('day')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	async function load() {
		setLoading(true); setError('')
		try {
			const params: any = { group_by: groupBy }
			if (inicio) params.inicio = inicio
			if (fim) params.fim = fim
			const token = sessionStorage.getItem('admin_token')
			const res = await api.get('/admin/metricas', { params, headers: { Authorization: `Bearer ${token}` } })
			setMetricas(res.data)
		} catch (e: any) {
			setError(e?.response?.data?.detail || 'Erro ao carregar métricas')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [])

	return (
		<AdminLayout title="Dashboard">
			<div className="row g-2 mb-3">
				<div className="col-md-3">
					<label className="form-label">Início</label>
					<input type="date" className="form-control" value={inicio} onChange={e => setInicio(e.target.value)} />
				</div>
				<div className="col-md-3">
					<label className="form-label">Fim</label>
					<input type="date" className="form-control" value={fim} onChange={e => setFim(e.target.value)} />
				</div>
				<div className="col-md-3">
					<label className="form-label">Agrupar por</label>
					<select className="form-select" value={groupBy} onChange={e => setGroupBy(e.target.value as any)}>
						<option value="day">Dia</option>
						<option value="week">Semana</option>
						<option value="month">Mês</option>
					</select>
				</div>
				<div className="col-md-3 d-flex align-items-end">
					<button className="btn btn-primary w-100" onClick={load}>Aplicar</button>
				</div>
			</div>

			{loading && <div>Carregando...</div>}
			{error && <div className="alert alert-danger">{error}</div>}
			{metricas && !loading && (
				<div>
					<div className="row g-3">
						<div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted">Clientes</div><div className="h3">{metricas.total_clientes}</div></div></div></div>
						<div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted">Atendimentos</div><div className="h3">{metricas.total_atendimentos}</div></div></div></div>
						<div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted">Receita</div><div className="h3">R$ {metricas.receita_total.toFixed(2)}</div></div></div></div>
						<div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted">Média visitas/cliente</div><div className="h3">{metricas.media_visitas_por_cliente.toFixed(2)}</div></div></div></div>
					</div>

					<div className="row mt-4 g-3">
						<div className="col-lg-6">
							<div className="card"><div className="card-body">
								<h5>Receita por período</h5>
								<div style={{ width: '100%', height: 300 }}>
									<ResponsiveContainer>
										<LineChart data={metricas.receita_por_periodo}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="date" />
											<YAxis />
											<Tooltip />
											<Line type="monotone" dataKey="receita" stroke="#28a745" strokeWidth={2} />
										</LineChart>
									</ResponsiveContainer>
								</div>
							</div></div>
						</div>
						<div className="col-lg-6">
							<div className="card"><div className="card-body">
								<h5>Atendimentos por período</h5>
								<div style={{ width: '100%', height: 300 }}>
									<ResponsiveContainer>
										<LineChart data={metricas.atendimentos_por_periodo}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="date" />
											<YAxis />
											<Tooltip />
											<Line type="monotone" dataKey="atendimentos" stroke="#0d6efd" strokeWidth={2} />
										</LineChart>
									</ResponsiveContainer>
								</div>
							</div></div>
						</div>
					</div>

					<div className="row mt-4 g-3">
						<div className="col-lg-6">
							<div className="card"><div className="card-body">
								<h5>Serviços mais usados</h5>
								<div style={{ width: '100%', height: 300 }}>
									<ResponsiveContainer>
										<BarChart data={metricas.servicos_mais_usados}>
											<XAxis dataKey="nome" />
											<YAxis />
											<Tooltip />
											<Bar dataKey="quantidade" fill="#6f42c1" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div></div>
						</div>
						<div className="col-lg-6">
							<div className="card"><div className="card-body">
								<h5>Top clientes por visitas</h5>
								<div style={{ width: '100%', height: 300 }}>
									<ResponsiveContainer>
										<BarChart data={metricas.visitas_por_cliente_top} layout="vertical">
											<XAxis type="number" />
											<YAxis type="category" dataKey="nome" width={150} />
											<Tooltip />
											<Bar dataKey="visitas" fill="#fd7e14" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div></div>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	)
}