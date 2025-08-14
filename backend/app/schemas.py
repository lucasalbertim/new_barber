from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class ClienteCreate(BaseModel):
	nome: str
	cpf: str
	telefone: str
	email: Optional[EmailStr] = None

class ClienteOut(BaseModel):
	id: int
	nome: str
	cpf: str
	telefone: str
	email: Optional[EmailStr] = None
	criado_em: datetime
	class Config:
		from_attributes = True

class ClienteLogin(BaseModel):
	cpf_ou_telefone: str = Field(..., description="CPF ou telefone")

class ServicoBase(BaseModel):
	nome: str
	preco: float
	tempo_estimado: int

class ServicoCreate(ServicoBase):
	pass

class ServicoOut(ServicoBase):
	id: int
	class Config:
		from_attributes = True

class AtendimentoServicoItem(BaseModel):
	servico_id: int

class AtendimentoCreate(BaseModel):
	cliente_id: int
	servicos: List[AtendimentoServicoItem]

class AtendimentoOut(BaseModel):
	id: int
	cliente_id: int
	data: datetime
	valor_total: float
	tempo_total: int
	class Config:
		from_attributes = True

class Token(BaseModel):
	access_token: str
	token_type: str

class AdminLogin(BaseModel):
	email: EmailStr
	senha: str

class AdminOut(BaseModel):
	id: int
	nome: str
	email: EmailStr
	class Config:
		from_attributes = True

class RelatorioFiltro(BaseModel):
	inicio: datetime
	fim: datetime