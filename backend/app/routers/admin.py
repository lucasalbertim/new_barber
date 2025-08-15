import io
import csv
from datetime import datetime, timedelta, time, date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, and_
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
def metricas(
	inicio: date | str | None = Query(None, description="Data início ISO (YYYY-MM-DD) ou objeto date"),
	fim: date | str | None = Query(None, description="Data fim ISO (YYYY-MM-DD) ou objeto date"),
	group_by: str = Query("day", pattern="^(day|week|month)$"),
	top_n: int = Query(10, ge=1, le=50),
	db: Session = Depends(get_db),
	admin=Depends(get_current_admin)
):
	# Intervalo padrão: últimos 30 dias
	if not inicio or not fim:
		end_d = datetime.utcnow().date()
		start_d = end_d - timedelta(days=29)
	else:
		try:
			start_d = inicio if isinstance(inicio, date) else datetime.fromisoformat(str(inicio)).date()
			end_d = fim if isinstance(fim, date) else datetime.fromisoformat(str(fim)).date()
		except Exception:
			raise HTTPException(status_code=400, detail="Datas inválidas. Use o formato YYYY-MM-DD.")
	if start_d > end_d:
		raise HTTPException(status_code=400, detail="Data início maior que data fim")

	start_dt = datetime.combine(start_d, time.min)
	end_dt_exclusive = datetime.combine(end_d + timedelta(days=1), time.min)
	period_filter = and_(models.Atendimento.data >= start_dt, models.Atendimento.data < end_dt_exclusive)

	# Agregações básicas
	total_clientes = db.query(func.count(models.Cliente.id)).scalar() or 0
	q_base = db.query(models.Atendimento).filter(period_filter)
	total_atendimentos = q_base.count()
	receita_total = float(db.query(func.coalesce(func.sum(models.Atendimento.valor_total), 0)).filter(period_filter).scalar() or 0)

	# Serviços mais usados no período
	servicos_mais_usados = (
		db.query(models.Servico.nome, func.count(models.AtendimentoServico.servico_id).label("qt"))
		.join(models.AtendimentoServico, models.Servico.id == models.AtendimentoServico.servico_id)
		.join(models.Atendimento, models.Atendimento.id == models.AtendimentoServico.atendimento_id)
		.filter(period_filter)
		.group_by(models.Servico.nome)
		.order_by(func.count(models.AtendimentoServico.servico_id).desc())
		.limit(top_n)
		.all()
	)

	# Séries temporais (agrupar por dia)
	date_col = cast(models.Atendimento.data, Date)
	receita_por_periodo = (
		db.query(date_col.label("date"), func.coalesce(func.sum(models.Atendimento.valor_total), 0).label("receita"))
		.filter(period_filter)
		.group_by(date_col)
		.order_by(date_col)
		.all()
	)
	atendimentos_por_periodo = (
		db.query(date_col.label("date"), func.count(models.Atendimento.id).label("atendimentos"))
		.filter(period_filter)
		.group_by(date_col)
		.order_by(date_col)
		.all()
	)

	# Top clientes por visitas no período
	visitas_por_cliente_top = (
		db.query(models.Cliente.id, models.Cliente.nome, func.count(models.Atendimento.id).label("visitas"))
		.join(models.Atendimento, models.Atendimento.cliente_id == models.Cliente.id)
		.filter(period_filter)
		.group_by(models.Cliente.id, models.Cliente.nome)
		.order_by(func.count(models.Atendimento.id).desc())
		.limit(top_n)
		.all()
	)

	media_visitas_por_cliente = 0.0
	if total_clientes > 0:
		media_visitas_por_cliente = (total_atendimentos / total_clientes)

	return {
		"inicio": str(start_d),
		"fim": str(end_d),
		"group_by": group_by,
		"total_clientes": total_clientes,
		"total_atendimentos": total_atendimentos,
		"receita_total": receita_total,
		"servicos_mais_usados": [{"nome": n, "quantidade": int(q)} for n, q in servicos_mais_usados],
		"media_visitas_por_cliente": media_visitas_por_cliente,
		"receita_por_periodo": [{"date": str(d), "receita": float(r)} for d, r in receita_por_periodo],
		"atendimentos_por_periodo": [{"date": str(d), "atendimentos": int(a)} for d, a in atendimentos_por_periodo],
		"visitas_por_cliente_top": [{"cliente_id": int(i), "nome": n, "visitas": int(v)} for i, n, v in visitas_por_cliente_top],
	}

# Listagem de clientes e export CSV
@router.get("/clientes")
def listar_clientes(q: str | None = None, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	query = db.query(models.Cliente)
	if q:
		like = f"%{q}%"
		query = query.filter(
			(models.Cliente.nome.ilike(like)) |
			(models.Cliente.cpf.ilike(like)) |
			(models.Cliente.telefone.ilike(like))
		)
	clientes = query.order_by(models.Cliente.criado_em.desc()).all()
	return clientes

@router.put("/clientes/{cliente_id}")
def atualizar_cliente(cliente_id: int, payload: dict, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	cliente = db.get(models.Cliente, cliente_id)
	if not cliente:
		raise HTTPException(status_code=404, detail="Cliente não encontrado")
	for k in ["nome", "cpf", "telefone", "email"]:
		if k in payload:
			setattr(cliente, k, payload[k])
	db.commit()
	db.refresh(cliente)
	return cliente

@router.delete("/clientes/{cliente_id}")
def remover_cliente(cliente_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	cliente = db.get(models.Cliente, cliente_id)
	if not cliente:
		raise HTTPException(status_code=404, detail="Cliente não encontrado")
	db.delete(cliente)
	db.commit()
	return {"ok": True}

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
# Configuração WhatsApp via config table
@router.get("/marketing/config")
def obter_marketing_config(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	items = db.query(models.ConfigKV).filter(models.ConfigKV.key.in_(["WHATSAPP_CLOUD_API_TOKEN", "WHATSAPP_PHONE_ID"]))
	data = {i.key: i.value for i in items}
	return data

@router.post("/marketing/config")
def salvar_marketing_config(
	token: str = Form(...),
	phone_id: str = Form(...),
	db: Session = Depends(get_db),
	admin=Depends(get_current_admin)
):
	for key, value in [("WHATSAPP_CLOUD_API_TOKEN", token), ("WHATSAPP_PHONE_ID", phone_id)]:
		row = db.get(models.ConfigKV, key)
		if not row:
			row = models.ConfigKV(key=key, value=value)
			db.add(row)
		else:
			row.value = value
	db.commit()
	return {"ok": True}

# Envio marketing com texto e imagem (banner opcional)
@router.post("/marketing/whatsapp")
def enviar_marketing_whatsapp(
	mensagem: str = Form(""),
	imagem: UploadFile | None = File(None),
	db: Session = Depends(get_db),
	admin=Depends(get_current_admin)
):
	# Prioriza config do banco; fallback para env
	cfg = obter_marketing_config(db, admin)
	token = cfg.get("WHATSAPP_CLOUD_API_TOKEN") or settings.whatsapp_cloud_api_token
	phone_id = cfg.get("WHATSAPP_PHONE_ID") or settings.whatsapp_phone_id
	if not token or not phone_id:
		raise HTTPException(status_code=500, detail="Configuração da WhatsApp Cloud API ausente")
	clientes = db.query(models.Cliente.telefone).all()
	base_url = "https://graph.facebook.com/v20.0"
	headers = {"Authorization": f"Bearer {token}"}
	enviados = 0
	falhas = 0
	media_id = None
	# Se houver imagem, subir primeiro (media upload)
	if imagem is not None:
		files = {"file": (imagem.filename, imagem.file, imagem.content_type)}
		params = {"messaging_product": "whatsapp"}
		resp = requests.post(f"{base_url}/{phone_id}/media", headers=headers, params=params, files=files, timeout=30)
		if resp.status_code in (200, 201):
			media_id = resp.json().get("id")
		else:
			falhas += len(clientes)
			return {"enviados": enviados, "falhas": falhas, "erro": "Falha ao enviar mídia"}
	
	for (telefone,) in clientes:
		# Ajustar para formato E.164 conforme necessário
		if media_id:
			payload = {
				"messaging_product": "whatsapp",
				"to": telefone,
				"type": "image",
				"image": {"id": media_id, "caption": mensagem or ""}
			}
		else:
			payload = {
				"messaging_product": "whatsapp",
				"to": telefone,
				"type": "text",
				"text": {"body": mensagem}
			}
		resp = requests.post(f"{base_url}/{phone_id}/messages", headers={**headers, "Content-Type": "application/json"}, json=payload, timeout=15)
		if resp.status_code in (200, 201):
			enviados += 1
		else:
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