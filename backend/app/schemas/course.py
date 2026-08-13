"""Course content schemas."""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class CourseSummary(BaseModel):
    id: int
    name: str
    language: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class CourseDetail(CourseSummary):
    units_count: int = 0
    lessons_count: int = 0

    class Config:
        from_attributes = True


class UnitSummary(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    order_index: int

    class Config:
        from_attributes = True


class UnitDetail(UnitSummary):
    skills_count: int = 0

    class Config:
        from_attributes = True


class SkillSummary(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    order_index: int
    status: str = "locked"  # locked, available, completed
    progress: int = 0  # 0-100
    crowns: int = 0

    class Config:
        from_attributes = True


class LessonSummary(BaseModel):
    id: int
    title: str
    order_index: int
    xp_reward: int

    class Config:
        from_attributes = True


class ExerciseBase(BaseModel):
    type: str = Field(..., min_length=1)
    question: str = Field(..., min_length=1)
    correct_answer: str = Field(..., min_length=1)


class MultipleChoiceExercise(ExerciseBase):
    type: str = "multiple_choice"
    options: List[str] = Field(min_length=2)


class WordBankExercise(ExerciseBase):
    type: str = "word_bank"
    words: List[str] = Field(min_length=1)
    answer: str


class MatchPairsExercise(ExerciseBase):
    type: str = "match_pairs"
    pairs: List[List[str]] = Field(min_length=1)


class FillBlankExercise(ExerciseBase):
    type: str = "fill_blank"
    question: str = Field(..., min_length=1)
    correct_answer: str = Field(..., min_length=1)


class TypeAnswerExercise(ExerciseBase):
    type: str = "type_answer"
    question: str = Field(..., min_length=1)
    correct_answer: str = Field(..., min_length=1)


class ExerciseResponse(BaseModel):
    id: int
    lesson_id: int
    type: str
    question: str
    data: Optional[dict] = None

    class Config:
        from_attributes = True