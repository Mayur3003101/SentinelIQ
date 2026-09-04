from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import initialize_database
from .routes import router

app = FastAPI(
    title="SentinelIQ Risk API",
    version="0.2.0",
    description="Development API for the SentinelIQ risk operations dashboard.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)
app.include_router(router)


@app.on_event("startup")
def startup() -> None:
    initialize_database()


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
