from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config import settings
from .database import Base, engine, get_db, SessionLocal
from .models import Admin, Servico
from .auth import hash_password
from .routers import clientes, servicos, atendimentos, admin as admin_router

app = FastAPI(title="Mini SaaS Barbearia", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.cors_origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Garantir seed imediato
try:
	db = SessionLocal()
	def seed_admin(db: Session):
		admin = db.query(Admin).first()
		if not admin:
			admin = Admin(nome="Dono", email="admin@barbearia.com", senha_hash=hash_password("admin123"))
			db.add(admin)
			db.commit()
	def seed_servicos(db: Session):
		defaults = [
			{"nome": "Corte", "preco": 40.0, "tempo_estimado": 40},
			{"nome": "Barba", "preco": 30.0, "tempo_estimado": 30},
			{"nome": "Sobrancelha", "preco": 20.0, "tempo_estimado": 15},
		]
		count = db.query(Servico).count()
		if count == 0:
			for d in defaults:
				serv = Servico(**d)
				db.add(serv)
			db.commit()
	seed_admin(db)
	seed_servicos(db)
finally:
	try:
		db.close()
	except Exception:
		pass

@app.on_event("startup")
def seed_data():
	with next(get_db()) as db:  # type: ignore
		seed_admin(db)
		seed_servicos(db)

app.include_router(clientes.router)
app.include_router(servicos.router)
app.include_router(atendimentos.router)
app.include_router(admin_router.router)