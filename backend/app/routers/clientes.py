from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, models

router = APIRouter(prefix="/clientes", tags=["clientes"])

@router.post("", response_model=schemas.ClienteOut)
def criar_cliente(payload: schemas.ClienteCreate, db: Session = Depends(get_db)):
	existente = db.query(models.Cliente).filter(
		(models.Cliente.cpf == payload.cpf) | (models.Cliente.telefone == payload.telefone)
	).first()
	if existente:
		raise HTTPException(status_code=400, detail="CPF ou telefone já cadastrado")
	cliente = models.Cliente(
		nome=payload.nome,
		cpf=payload.cpf,
		telefone=payload.telefone,
		email=payload.email,
	)
	db.add(cliente)
	db.commit()
	db.refresh(cliente)
	return cliente

@router.get("/{cpf_ou_telefone}", response_model=schemas.ClienteOut)
def obter_cliente(cpf_ou_telefone: str, db: Session = Depends(get_db)):
	cliente = db.query(models.Cliente).filter(
		(models.Cliente.cpf == cpf_ou_telefone) | (models.Cliente.telefone == cpf_ou_telefone)
	).first()
	if not cliente:
		raise HTTPException(status_code=404, detail="Cliente não encontrado")
	return cliente