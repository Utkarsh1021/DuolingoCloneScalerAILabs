"""Path / course API routes."""

from sqlalchemy.orm import Session
from sqlalchemy import select

from fastapi import APIRouter, Depends

from ...db import get_db
from ...models.course import Course, Unit, Skill
from ...models.user import User
from ...schemas.course import (
    CourseSummary,
    UnitSummary,
    SkillSummary,
    LessonSummary,
    SkillPathResponse,
    PathUnitResponse,
)


router = APIRouter(prefix="/api", tags=["path"])


@router.get("/path", response_model=list[PathUnitResponse])
def get_path(db: Session = Depends(get_db)):
    """Get the learning path with units and skills."""
    course = db.scalar(select(Course))
    if not course:
        return []

    units = course.units
    result = []

    for unit in units:
        skills_data = []
        for skill in unit.skills:
            # Determine skill status based on user progress
            user = db.scalar(select(User))
            user_skill = (
                db.query(...).filter(...).first()
            )

            # For now, determine status simply:
            # If user_skill.completed -> "completed"
            # If user_skill exists and progress > 0 -> "available"
            # Otherwise -> "locked"

            if user_skill and user_skill.completed:
                status = "completed"
                progress = user_skill.progress
                crowns = user_skill.crowns
            elif user_skill and user_skill.progress > 0:
                status = "available"
                progress = user_skill.progress
                crowns = user_skill.crowns
            else:
                status = "locked"
                progress = 0
                crowns = 0

            lessons_count = len(skill.lessons) if skill.lessons else 0

            skills_data.append(
                SkillPathResponse(
                    id=skill.id,
                    title=skill.title,
                    description=skill.description,
                    order_index=skill.order_index,
                    status=status,
                    progress=progress,
                    crowns=crowns,
                    lessons_count=lessons_count,
                )
            )

        result.append(
            PathUnitResponse(
                id=unit.id,
                title=unit.title,
                description=unit.description,
                order_index=unit.order_index,
                skills=skills_data,
            )
        )

    return result