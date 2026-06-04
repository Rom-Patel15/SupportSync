from pydantic import BaseModel, EmailStr
from datetime import datetime


# -------------------------
# USER SCHEMAS
# -------------------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# -------------------------
# TICKET SCHEMAS
# -------------------------

class TicketCreate(BaseModel):
    subject: str
    description: str
    priority: str = "Medium"


class TicketUpdate(BaseModel):
    subject: str
    description: str
    priority: str


class TicketResponse(BaseModel):
    ticket_id: str
    subject: str
    description: str
    priority: str
    status: str

    class Config:
        from_attributes = True


# -------------------------
# COMMENT SCHEMAS
# -------------------------

class CommentCreate(BaseModel):
    message: str


class CommentResponse(BaseModel):
    id: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str