"""Course content models: Course, Unit, Skill, Lesson, Exercise."""

from sqlalchemy import (
    DateTime,
    Integer,
    String,
    ForeignKey,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from .base import Base


class Course(Base):
    __tablename__ = "course"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    language: Mapped[str] = mapped_column(String(64), nullable=False, default="Spanish")
    description: Mapped[str] = mapped_column(String(512), nullable=True)
    order_index: Mapped[int] = mapped_column(default=0)

    units: Mapped[list["Unit"]] = relationship(back_populates="course", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "unit"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(
        ForeignKey("course.id", ondelete="CASCADE")
    )
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(String(512), nullable=True)
    order_index: Mapped[int] = mapped_column(default=0)

    course: Mapped["Course"] = relationship(back_populates="units")
    skills: Mapped[list["Skill"]] = relationship(
        back_populates="unit", cascade="all, delete-orphan"
    )


class Skill(Base):
    __tablename__ = "skill"

    id: Mapped[int] = mapped_column(primary_key=True)
    unit_id: Mapped[int] = mapped_column(
        ForeignKey("unit.id", ondelete="CASCADE")
    )
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(String(512), nullable=True)
    order_index: Mapped[int] = mapped_column(default=0)
    required_skill_id: Mapped[int | None] = mapped_column(
        ForeignKey("skill.id"), nullable=True
    )

    unit: Mapped["Unit"] = relationship(back_populates="skills")
    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="skill", cascade="all, delete-orphan"
    )
    user_progress: Mapped[list["UserSkillProgress"]] = relationship(
        back_populates="skill"
    )


class Lesson(Base):
    __tablename__ = "lesson"

    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skill.id", ondelete="CASCADE")
    )
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(String(512), nullable=True)
    order_index: Mapped[int] = mapped_column(default=0)
    xp_reward: Mapped[int] = mapped_column(default=10)

    skill: Mapped["Skill"] = relationship(back_populates="lessons")
    exercises: Mapped[list["Exercise"]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan"
    )
    attempts: Mapped[list["LessonAttempt"]] = relationship(
        back_populates="lesson"
    )


class Exercise(Base):
    __tablename__ = "exercise"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lesson.id", ondelete="CASCADE")
    )
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    question: Mapped[str] = mapped_column(String(512), nullable=True)
    correct_answer: Mapped[str] = mapped_column(String(256), nullable=True)
    data: Mapped[str] = mapped_column(
        nullable=True
    )  # JSON stored as text
    order_index: Mapped[int] = mapped_column(default=0)

    lesson: Mapped["Lesson"] = relationship(back_populates="exercises")