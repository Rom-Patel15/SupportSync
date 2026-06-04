from sqlalchemy.orm import Session

from models import User
from auth import hash_password


def seed_admin(db: Session):

    existing_admin = (
        db.query(User)
        .filter(User.email == "rom_admin@crm.com")
        .first()
    )

    if existing_admin:
        return

    admin = User(
        name="Admin",
        email="rom_admin@crm.com",
        password=hash_password("rom@2415"),
        role="admin"
    )

    db.add(admin)
    db.commit()

    print("Admin account created.")