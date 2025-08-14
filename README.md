# Mini SaaS - Sistema de Atendimento para Barbearia

Este repositório contém frontend (React + Vite + Bootstrap) e backend (FastAPI + SQLAlchemy) com PostgreSQL (via Docker Compose). Para desenvolvimento local rápido sem Docker, o backend usa SQLite automaticamente.

## Rodar localmente (dev rápido)

- Frontend
  - cd frontend
  - npm install
  - npm run dev

- Backend (usa SQLite em dev)
  - Instalar dependências mínimas: `pip3 install -r backend/requirements-dev.txt --break-system-packages`
  - Executar: `python3 -m uvicorn app.main:app --reload --port 8000 --app-dir backend`

Credenciais admin seed: email `admin@barbearia.com`, senha `admin123`.

## Endpoints principais
- Clientes: POST /clientes, GET /clientes/{cpf_ou_telefone}
- Serviços: GET /servicos, POST/PUT/DELETE /servicos (JWT admin)
- Atendimentos: POST /atendimentos, GET /atendimentos (JWT admin)
- Admin: POST /admin/token, GET /admin/metricas, GET /admin/relatorios/csv, GET /admin/relatorios/pdf

## Docker Compose (produção/sandbox)
- Requer Docker + Compose. Configure e rode `docker-compose up --build`.
