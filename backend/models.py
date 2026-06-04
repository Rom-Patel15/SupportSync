from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    role = Column(String, default="customer")

    created_at = Column(DateTime, default=datetime.utcnow)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(String, unique=True, nullable=False)

    customer_id = Column(Integer, ForeignKey("users.id"))

    customer_name = Column(String, nullable=False)

    customer_email = Column(String, nullable=False)

    subject = Column(String, nullable=False)

    description = Column(Text, nullable=False)

    priority = Column(String, default="Medium")

    status = Column(String, default="Open")

    attachment_path = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(Integer, ForeignKey("tickets.id"))

    user_id = Column(Integer, ForeignKey("users.id"))

    message = Column(Text, nullable=False)

    attachment_path = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)