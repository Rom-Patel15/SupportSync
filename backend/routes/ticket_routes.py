import os
import uuid
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    UploadFile,
    File,
    Form
)
from sqlalchemy.orm import Session
from sqlalchemy import or_

from auth import get_current_user
from database import get_db

from models import Ticket, Comment, User

from schemas import (
    TicketCreate,
    TicketUpdate,
    StatusUpdate,
    CommentCreate
)

BACKEND_URL = "http://127.0.0.1:8000"

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)


# ------------------------
# Current User Profile
# ------------------------

@router.get("/me")
def get_my_profile(
    current_user=Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


# ------------------------
# Create Ticket
# ------------------------

@router.post("/")
def create_ticket(
    subject: str = Form(...),
    description: str = Form(...),
    priority: str = Form("Medium"),
    attachment: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    total_tickets = db.query(Ticket).count()

    generated_ticket_id = f"TKT-{total_tickets + 1:03d}"

    attachment_path = None

    if attachment:

        file_extension = os.path.splitext(
            attachment.filename
        )[1]

        unique_filename = (
            f"{uuid.uuid4()}{file_extension}"
        )

        file_location = os.path.join(
            "uploads",
            "tickets",
            unique_filename
        )

        with open(file_location, "wb") as buffer:
            buffer.write(
                attachment.file.read()
            )

        attachment_path = file_location

    new_ticket = Ticket(
        ticket_id=generated_ticket_id,
        customer_id=current_user.id,
        customer_name=current_user.name,
        customer_email=current_user.email,
        subject=subject,
        description=description,
        priority=priority,
        status="Open",
        attachment_path=attachment_path
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return {
        "message": "Ticket created successfully",
        "ticket_id": new_ticket.ticket_id,
        "status": new_ticket.status,
        "attachment_path": attachment_path
    }

# ------------------------
# List + Search + Filter
# ------------------------

@router.get("/")
def get_tickets(
    status: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    query = db.query(Ticket)

    if current_user.role != "admin":
        query = query.filter(
            Ticket.customer_id == current_user.id
        )

    if status:
        query = query.filter(
            Ticket.status == status
        )

    if search:
        query = query.filter(
            or_(
                Ticket.ticket_id.ilike(f"%{search}%"),
                Ticket.customer_name.ilike(f"%{search}%"),
                Ticket.customer_email.ilike(f"%{search}%"),
                Ticket.subject.ilike(f"%{search}%"),
                Ticket.description.ilike(f"%{search}%")
            )
        )

    tickets = query.all()

    return [
        {
            "ticket_id": ticket.ticket_id,
            "customer_name": ticket.customer_name,
            "customer_email": ticket.customer_email,
            "subject": ticket.subject,
            "priority": ticket.priority,
            "status": ticket.status,
            "created_at": ticket.created_at
        }
        for ticket in tickets
    ]

# ------------------------
# Edit Ticket
# ------------------------

@router.put("/{ticket_id}")
def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if (
        current_user.role != "admin"
        and ticket.customer_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    ticket.subject = ticket_data.subject
    ticket.description = ticket_data.description
    ticket.priority = ticket_data.priority

    db.commit()
    db.refresh(ticket)

    return {
        "message": "Ticket updated successfully",
        "ticket_id": ticket.ticket_id,
        "subject": ticket.subject,
        "description": ticket.description,
        "priority": ticket.priority
    }


# ------------------------
# Update Ticket Status
# ------------------------

@router.put("/{ticket_id}/status")
def update_ticket_status(
    ticket_id: str,
    status_data: StatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can update ticket status"
        )

    allowed_statuses = [
        "Open",
        "In Progress",
        "Closed"
    ]

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    ticket.status = status_data.status

    db.commit()
    db.refresh(ticket)

    return {
        "message": "Ticket status updated successfully",
        "ticket_id": ticket.ticket_id,
        "status": ticket.status
    }


# ------------------------
# Add Comment
# ------------------------

@router.post("/{ticket_id}/comments")
def add_comment(
    ticket_id: str,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if (
        current_user.role != "admin"
        and ticket.customer_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    new_comment = Comment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=comment.message
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "message": "Comment added successfully"
    }


# ------------------------
# Get Comments
# ------------------------

@router.get("/{ticket_id}/comments")
def get_comments(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if (
        current_user.role != "admin"
        and ticket.customer_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    comments = (
        db.query(Comment)
        .filter(Comment.ticket_id == ticket.id)
        .all()
    )

    result = []

    for comment in comments:

        user = (
            db.query(User)
            .filter(User.id == comment.user_id)
            .first()
        )

        result.append(
            {
                "id": comment.id,
                "user_id": comment.user_id,
                "user_name": user.name if user else "Unknown",
                "role": user.role if user else "Unknown",
                "message": comment.message,
                "created_at": comment.created_at
            }
        )

    return result


# ------------------------
# View Ticket Details
# ------------------------

@router.get("/{ticket_id}")
def get_ticket_details(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if (
        current_user.role != "admin"
        and ticket.customer_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return {
    "ticket_id": ticket.ticket_id,
    "customer_name": ticket.customer_name,
    "customer_email": ticket.customer_email,
    "subject": ticket.subject,
    "description": ticket.description,
    "priority": ticket.priority,
    "status": ticket.status,
    "attachment_path": ticket.attachment_path,
    "attachment_url": (
        f"{BACKEND_URL}/{ticket.attachment_path}"
        if ticket.attachment_path
        else None
    ),
    "created_at": ticket.created_at,
    "updated_at": ticket.updated_at
}

# ------------------------
# Delete Ticket
# ------------------------

@router.delete("/{ticket_id}")
def delete_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if (
        current_user.role != "admin"
        and ticket.customer_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    db.query(Comment).filter(
        Comment.ticket_id == ticket.id
    ).delete()

    db.delete(ticket)

    db.commit()

    return {
        "message": "Ticket deleted successfully"
    }