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