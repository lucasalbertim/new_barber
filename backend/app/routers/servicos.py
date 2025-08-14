from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, models
from ..auth import get_current_admin

router = APIRouter(prefix="/servicos", tags=["servicos"])

@router.get("", response_model=list[schemas.ServicoOut])
def listar_servicos(db: Session = Depends(get_db)):
	servicos = db.query(models.Servico).order_by(models.Servico.nome.asc()).all()
	return servicos

@router.post("", response_model=schemas.ServicoOut, status_code=status.HTTP_201_CREATED)
def criar_servico(payload: schemas.ServicoCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	servico = models.Servico(**payload.model_dump())
	db.add(servico)
	db.commit()
	db.refresh(servico)
	return servico

@router.put("/{servico_id}", response_model=schemas.ServicoOut)
def atualizar_servico(servico_id: int, payload: schemas.ServicoCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	servico = db.get(models.Servico, servico_id)
	if not servico:
		raise HTTPException(status_code=404, detail="Serviço não encontrado")
	for field, value in payload.model_dump().items():
		setattr(servico, field, value)
	db.commit()
	db.refresh(servico)
	return servico

@router.delete("/{servico_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_servico(servico_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
	servico = db.get(models.Servico, servico_id)
	if not servico:
		raise HTTPException(status_code=404, detail="Serviço não encontrado")
	db.delete(servico)
	db.commit()
	return None