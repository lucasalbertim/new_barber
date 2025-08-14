from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Cliente(Base):
	__tablename__ = "clientes"
	id = Column(Integer, primary_key=True, index=True)
	nome = Column(String(255), nullable=False)
	cpf = Column(String(14), unique=True, index=True, nullable=False)
	telefone = Column(String(20), unique=True, index=True, nullable=False)
	email = Column(String(255), unique=True, index=True, nullable=True)
	criado_em = Column(DateTime, server_default=func.now())

	atendimentos = relationship("Atendimento", back_populates="cliente")

class Servico(Base):
	__tablename__ = "servicos"
	id = Column(Integer, primary_key=True, index=True)
	nome = Column(String(255), nullable=False)
	preco = Column(Numeric(10, 2), nullable=False)
	tempo_estimado = Column(Integer, nullable=False)  # minutos

	atendimentos = relationship("AtendimentoServico", back_populates="servico")

class Atendimento(Base):
	__tablename__ = "atendimentos"
	id = Column(Integer, primary_key=True, index=True)
	cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
	data = Column(DateTime, server_default=func.now())
	valor_total = Column(Numeric(10, 2), nullable=False)
	tempo_total = Column(Integer, nullable=False)

	cliente = relationship("Cliente", back_populates="atendimentos")
	servicos = relationship("AtendimentoServico", back_populates="atendimento")

class AtendimentoServico(Base):
	__tablename__ = "atendimentos_servicos"
	atendimento_id = Column(Integer, ForeignKey("atendimentos.id"), primary_key=True)
	servico_id = Column(Integer, ForeignKey("servicos.id"), primary_key=True)

	atendimento = relationship("Atendimento", back_populates="servicos")
	servico = relationship("Servico", back_populates="atendimentos")

class Admin(Base):
	__tablename__ = "admin"
	id = Column(Integer, primary_key=True, index=True)
	nome = Column(String(255), nullable=False)
	email = Column(String(255), unique=True, index=True, nullable=False)
	senha_hash = Column(String(255), nullable=False)