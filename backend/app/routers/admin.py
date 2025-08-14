import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import schemas, models
from ..auth import create_access_token, verify_password, hash_password, get_current_admin
from ..config import settings
import requests

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/token", response_model=schemas.Token)
def login_admin(credentials: schemas.AdminLogin, db: Session = Depends(get_db)):
	admin = db.query(models.Admin).filter(models.Admin.email == credentials.email).first()
	if not admin or not verify_password(credentials.senha, admin.senha_hash):
		raise HTTPException(status_code=401, detail="Credenciais inválidas")
	token = create_access_token({"sub": admin.email})
	return {"access_token": token, "token_type": "bearer"}

@router.get("/metricas")
def metricas(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	total_clientes = db.query(func.count(models.Cliente.id)).scalar() or 0
	total_atendimentos = db.query(func.count(models.Atendimento.id)).scalar() or 0
	receita_total = float(db.query(func.coalesce(func.sum(models.Atendimento.valor_total), 0)).scalar() or 0)
	servicos_mais_usados = (
		db.query(models.Servico.nome, func.count(models.AtendimentoServico.servico_id).label("qt"))
		.join(models.AtendimentoServico, models.Servico.id == models.AtendimentoServico.servico_id)
		.group_by(models.Servico.nome)
		.order_by(func.count(models.AtendimentoServico.servico_id).desc())
		.limit(5)
		.all()
	)
	media_visitas_por_cliente = 0.0
	if total_clientes > 0:
		media_visitas_por_cliente = (total_atendimentos / total_clientes)
	return {
		"total_clientes": total_clientes,
		"total_atendimentos": total_atendimentos,
		"receita_total": receita_total,
		"servicos_mais_usados": [{"nome": n, "quantidade": int(q)} for n, q in servicos_mais_usados],
		"media_visitas_por_cliente": media_visitas_por_cliente,
	}

# Listagem de clientes e export CSV
@router.get("/clientes")
def listar_clientes(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	clientes = db.query(models.Cliente).order_by(models.Cliente.criado_em.desc()).all()
	return clientes

@router.get("/clientes/csv")
def exportar_clientes_csv(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	clientes = db.query(models.Cliente).order_by(models.Cliente.criado_em.desc()).all()
	buffer = io.StringIO()
	writer = csv.writer(buffer)
	writer.writerow(["id", "nome", "cpf", "telefone", "email", "criado_em"])
	for c in clientes:
		writer.writerow([c.id, c.nome, c.cpf, c.telefone, c.email or "", c.criado_em.isoformat()])
	buffer.seek(0)
	return StreamingResponse(iter([buffer.getvalue().encode()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=clientes.csv"})

# Marketing WhatsApp Cloud API
# Configure no .env:
# WHATSAPP_CLOUD_API_TOKEN=seu_token_gerado_no_Meta
# WHATSAPP_PHONE_ID=seu_phone_number_id (ID do remetente)
@router.post("/marketing/whatsapp")
def enviar_marketing_whatsapp(payload: dict, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	mensagem = payload.get("mensagem")
	if not mensagem:
		raise HTTPException(status_code=400, detail="Mensagem obrigatória")
	if not settings.whatsapp_cloud_api_token or not settings.whatsapp_phone_id:
		raise HTTPException(status_code=500, detail="Configuração da WhatsApp Cloud API ausente")
	clientes = db.query(models.Cliente.telefone).all()
	url = f"https://graph.facebook.com/v20.0/{settings.whatsapp_phone_id}/messages"
	headers = {
		"Authorization": f"Bearer {settings.whatsapp_cloud_api_token}",
		"Content-Type": "application/json"
	}
	enviados = 0
	falhas = 0
	for (telefone,) in clientes:
		# Ajuste de formatação pode ser necessário conforme padrão internacional E.164
		data = {
			"messaging_product": "whatsapp",
			"to": telefone,
			"type": "text",
			"text": {"body": mensagem}
		}
		try:
			resp = requests.post(url, json=data, headers=headers, timeout=10)
			if resp.status_code in (200, 201):
				enviados += 1
			else:
				falhas += 1
		except Exception:
			falhas += 1
	return {"enviados": enviados, "falhas": falhas}

@router.get("/relatorios/csv")
def exportar_csv(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	atendimentos = db.query(models.Atendimento).order_by(models.Atendimento.data.desc()).all()
	buffer = io.StringIO()
	writer = csv.writer(buffer)
	writer.writerow(["id", "cliente_id", "data", "valor_total", "tempo_total"])
	for a in atendimentos:
		writer.writerow([a.id, a.cliente_id, a.data.isoformat(), float(a.valor_total), a.tempo_total])
	buffer.seek(0)
	return StreamingResponse(iter([buffer.getvalue().encode()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=atendimentos.csv"})

# Placeholder simples para PDF: retornamos CSV com outro content-type por ora
@router.get("/relatorios/pdf")
def exportar_pdf(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	return exportar_csv(db, admin)