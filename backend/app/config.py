from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
	secret_key: str = os.getenv("SECRET_KEY", "change-this-key")
	algorithm: str = os.getenv("ALGORITHM", "HS256")
	access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
	database_url: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
	cors_origins: List[str] = (os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","))
	# WhatsApp Cloud API
	whatsapp_cloud_api_token: str = os.getenv("WHATSAPP_CLOUD_API_TOKEN", "")
	whatsapp_phone_id: str = os.getenv("WHATSAPP_PHONE_ID", "")

settings = Settings()