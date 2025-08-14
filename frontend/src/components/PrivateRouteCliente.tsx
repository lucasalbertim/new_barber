import { Navigate } from 'react-router-dom'

export default function PrivateRouteCliente({ children }: { children: JSX.Element }) {
	const clienteId = sessionStorage.getItem('cliente_id')
	if (!clienteId) {
		return <Navigate to="/login-cliente" replace />
	}
	return children
}