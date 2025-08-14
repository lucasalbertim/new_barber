import { useNavigate } from 'react-router-dom'

export default function BotaoVoltar() {
	const navigate = useNavigate()
	return (
		<button type="button" className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
			← Voltar
		</button>
	)
}