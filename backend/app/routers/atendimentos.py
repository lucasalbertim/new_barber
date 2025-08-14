from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import schemas, models
from ..auth import get_current_admin

router = APIRouter(prefix="/atendimentos", tags=["atendimentos"])

@router.post("", response_model=schemas.AtendimentoOut)
def criar_atendimento(payload: schemas.AtendimentoCreate, db: Session = Depends(get_db)):
	cliente = db.get(models.Cliente, payload.cliente_id)
	if not cliente:
		raise HTTPException(status_code=404, detail="Cliente não encontrado")
	servicos = db.query(models.Servico).filter(models.Servico.id.in_([s.servico_id for s in payload.servicos])).all()
	if len(servicos) != len(payload.servicos):
		raise HTTPException(status_code=400, detail="Um ou mais serviços inválidos")
	valor_total = sum([float(s.preco) for s in servicos])
	tempo_total = sum([int(s.tempo_estimado) for s in servicos])
	atendimento = models.Atendimento(cliente_id=payload.cliente_id, valor_total=valor_total, tempo_total=tempo_total)
	db.add(atendimento)
	db.flush()
	for s in servicos:
		link = models.AtendimentoServico(atendimento_id=atendimento.id, servico_id=s.id)
		db.add(link)
	db.commit()
	db.refresh(atendimento)
	return atendimento

@router.get("", response_model=list[schemas.AtendimentoOut])
def listar_atendimentos(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	atendimentos = db.query(models.Atendimento).order_by(models.Atendimento.data.desc()).all()
	return atendimentos