from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.subscriber import Subscriber
from app.schemas.subscriber import SubscriberCreate, SubscriberResponse

router = APIRouter(
    prefix="/newsletter",
    tags=["Newsletter"]
)


@router.post(
    "/subscribe",
    response_model=SubscriberResponse
)
def subscribe(
    subscriber: SubscriberCreate,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    existing = db.query(Subscriber).filter(
        Subscriber.email == subscriber.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email is already subscribed."
        )

    new_subscriber = Subscriber(
        email=subscriber.email
    )

    db.add(new_subscriber)
    db.commit()
    db.refresh(new_subscriber)

    return new_subscriber