import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, SessionLocal
from models import Base, User

from seed_admin import seed_admin

from routes.auth_routes import router as auth_router
from routes.ticket_routes import router as ticket_router
from routes.dashboard_routes import router as dashboard_router


Base.metadata.create_all(bind=engine)

db = SessionLocal()

seed_admin(db)

db.close()

app = FastAPI(
    title="SupportSync API"
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/tickets", exist_ok=True)
os.makedirs("uploads/comments", exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(ticket_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "message": "SupportSync API Running"
    }


@app.get("/users")
def get_users():

    db = SessionLocal()

    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]