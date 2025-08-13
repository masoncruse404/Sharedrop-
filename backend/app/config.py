from decouple import config
import os

class Settings:
    SECRET_KEY: str = config("SECRET_KEY")
    ALGORITHM: str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)

    # Build DATABASE_URL dynamically
    DB_ENGINE = config("DB_ENGINE", default="sqlite")
    if DB_ENGINE == "sqlite":
        DATABASE_URL = f"sqlite:///{config('DB_NAME', default='./app.db')}"
    else:
        DB_NAME = config("DB_NAME")
        DB_USER = config("DB_USER")
        DB_PASSWORD = config("DB_PASSWORD")
        DB_HOST = config("DB_HOST")
        DB_PORT = config("DB_PORT", cast=int)
        DATABASE_URL = f"{DB_ENGINE}://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    UPLOAD_DIR: str = config("UPLOAD_DIR", default="./uploads")
    MAX_FILE_SIZE: int = config("MAX_FILE_SIZE", default=104857600, cast=int)

    def __init__(self):
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)

settings = Settings()
