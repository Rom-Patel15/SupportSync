from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
from models import Ticket


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can access dashboard"
        )

    total_tickets = db.query(Ticket).count()

    open_tickets = (
        db.query(Ticket)
        .filter(Ticket.status == "Open")
        .count()
    )

    in_progress_tickets = (
        db.query(Ticket)
        .filter(Ticket.status == "In Progress")
        .count()
    )

    closed_tickets = (
        db.query(Ticket)
        .filter(Ticket.status == "Closed")
        .count()
    )

    high_priority_tickets = (
        db.query(Ticket)
        .filter(Ticket.priority == "High")
        .count()
    )

    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "closed_tickets": closed_tickets,
        "high_priority_tickets": high_priority_tickets
    }