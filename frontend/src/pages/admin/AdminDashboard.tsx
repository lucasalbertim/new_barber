import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
	const [metricas, setMetricas] = useState<any>(null)

	useEffect(() => {
		const token = sessionStorage.getItem('admin_token')
		api.get('/admin/metricas', { headers: { Authorization: `Bearer ${token}` } })
			.then(r => setMetricas(r.data))
	}, [])

	return (
		<AdminLayout title="Dashboard">
			{!metricas ? <div>Carregando...</div> : (
				<div>
					<div className="row g-3">
						<div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted">Clientes</div><div className="h3">{metricas.total_clientes}</div></div></div></div>
						<div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted">Atendimentos</div><div className="h3">{metricas.total_atendimentos}</div></div></div></div>
						<div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted">Receita</div><div className="h3">R$ {metricas.receita_total.toFixed(2)}</div></div></div></div>
						<div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted">Média visitas/cliente</div><div className="h3">{metricas.media_visitas_por_cliente.toFixed(2)}</div></div></div></div>
					</div>
					<div className="card mt-4">
						<div className="card-body">
							<h5>Serviços mais usados</h5>
							<div style={{ width: '100%', height: 300 }}>
								<ResponsiveContainer>
									<BarChart data={metricas.servicos_mais_usados}>
										<XAxis dataKey="nome" />
										<YAxis />
										<Tooltip />
										<Bar dataKey="quantidade" fill="#0d6efd" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	)
}