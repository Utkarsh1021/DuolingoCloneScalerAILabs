"""Path / course API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db import get_db
from app.models.course import Course
from app.models.user import User, UserSkillProgress
from app.schemas.progress import PathUnitResponse, SkillPathResponse


router = APIRouter(prefix="/api", tags=["path"])


@router.get("/path", response_model=list[PathUnitResponse])
def get_path(db: Session = Depends(get_db)):
    """Get the learning path with units and skills."""
    course = db.scalar(select(Course).order_by(Course.id))
    if not course:
        return []

    user = db.scalar(select(User).order_by(User.id))
    result = []

    def skill_completed(skill_id: int) -> bool:
        if not user:
            return False
        up = (
            db.query(UserSkillProgress)
            .filter(
                UserSkillProgress.user_id == user.id,
                UserSkillProgress.skill_id == skill_id,
            )
            .first()
        )
        return bool(up and up.completed)

    for unit in sorted(course.units, key=lambda u: u.order_index):
        if not unit.skills:
            continue

        skills_data = []
        for skill in sorted(unit.skills, key=lambda s: s.order_index):
            first_lesson = None
            if skill.lessons:
                first_lesson = min(skill.lessons, key=lambda l: l.order_index)

            progress = 0
            crowns = 0
            completed = False
            started = False

            if user:
                up = (
                    db.query(UserSkillProgress)
                    .filter(
                        UserSkillProgress.user_id == user.id,
                        UserSkillProgress.skill_id == skill.id,
                    )
                    .first()
                )
                if up:
                    progress = up.progress
                    crowns = up.crowns
                    completed = up.completed
                    started = up.progress > 0 or up.completed

            if completed:
                status = "completed"
            elif started:
                status = "available"
            elif skill.required_skill_id is None or skill_completed(skill.required_skill_id):
                status = "available"
            else:
                status = "locked"

            skills_data.append(
                SkillPathResponse(
                    id=skill.id,
                    title=skill.title,
                    description=skill.description,
                    order_index=skill.order_index,
                    status=status,
                    progress=progress,
                    crowns=crowns,
                    lessons_count=len(skill.lessons) if skill.lessons else 0,
                    first_lesson_id=first_lesson.id if first_lesson else None,
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