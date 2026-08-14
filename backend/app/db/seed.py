"""Database seeding: course content + a default user + demo leaderboard rivals."""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.base import Base
from app.models.course import Course, Unit, Skill, Lesson, Exercise
from app.models.user import (
    User,
    UserSkillProgress,
    Achievement,
    UserAchievement,
)
from app.db import engine, SessionLocal


def create_tables():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def seed_database(db: Session):
    """Seed the database with sample course content and demo users."""
    from sqlalchemy import select

    create_tables()

    # ---- Course content ----
    existing = db.scalar(select(Course).limit(1))
    if existing is None:
        _seed_course(db)

    # ---- Default (logged-in) user ----
    user = db.scalar(select(User).limit(1))
    if user is None:
        user = _seed_main_user(db)

    # ---- Demo leaderboard rivals ----
    if db.scalar(select(User).filter(User.email.like("%@duo.demo"))) is None:
        _seed_demo_users(db)

    db.commit()
    print("Database seeded successfully!")


def _seed_course(db: Session):
    spanish_course = Course(
        name="Spanish",
        language="Spanish",
        description="Learn Spanish from scratch",
    )
    db.add(spanish_course)
    db.flush()

    # Units
    unit_basics = Unit(
        course_id=spanish_course.id,
        title="Basics",
        description="Basic greetings and expressions",
        order_index=1,
    )
    unit_greetings = Unit(
        course_id=spanish_course.id,
        title="Greetings",
        description="Common greetings and salutations",
        order_index=2,
    )
    unit_food = Unit(
        course_id=spanish_course.id,
        title="Food",
        description="Food and dining vocabulary",
        order_index=3,
    )
    db.add_all([unit_basics, unit_greetings, unit_food])
    db.flush()

    # Skills
    skill_greetings = Skill(
        unit_id=unit_greetings.id,
        title="Greetings",
        description="Basic greeting and farewelling",
        order_index=1,
    )
    db.add(skill_greetings)
    db.flush()

    skill_food = Skill(
        unit_id=unit_food.id,
        title="Food",
        description="Ordering and food vocabulary",
        order_index=1,
    )
    db.add(skill_food)
    db.flush()

    skill_family = Skill(
        unit_id=unit_greetings.id,
        title="Family",
        description="Family member vocabulary",
        order_index=2,
        required_skill_id=skill_greetings.id,
    )
    db.add(skill_family)
    db.flush()

    skill_numbers = Skill(
        unit_id=unit_greetings.id,
        title="Numbers",
        description="Number vocabulary",
        order_index=3,
        required_skill_id=skill_family.id,
    )
    db.add(skill_numbers)
    db.flush()

    skill_phrases = Skill(
        unit_id=unit_greetings.id,
        title="Common Phrases",
        description="Everyday useful phrases",
        order_index=4,
        required_skill_id=skill_numbers.id,
    )
    db.add(skill_phrases)
    db.flush()

    # Lessons
    lesson_greetings = Lesson(
        skill_id=skill_greetings.id,
        title="Greetings Basics",
        order_index=1,
        xp_reward=10,
    )
    lesson_polite = Lesson(
        skill_id=skill_greetings.id,
        title="Polite Phrases",
        order_index=2,
        xp_reward=10,
    )
    lesson_practice = Lesson(
        skill_id=skill_greetings.id,
        title="Greeting Practice",
        order_index=3,
        xp_reward=10,
    )
    lesson_food = Lesson(
        skill_id=skill_food.id,
        title="Ordering Food",
        order_index=1,
        xp_reward=10,
    )
    lesson_menu = Lesson(
        skill_id=skill_food.id,
        title="Menu Vocabulary",
        order_index=2,
        xp_reward=10,
    )
    lesson_family = Lesson(
        skill_id=skill_family.id,
        title="Family Members",
        order_index=1,
        xp_reward=10,
    )
    db.add_all(
        [
            lesson_greetings,
            lesson_polite,
            lesson_practice,
            lesson_food,
            lesson_menu,
            lesson_family,
        ]
    )
    db.flush()

    _seed_exercises(db, lesson_greetings.id)
    _seed_extra_exercises(db, lesson_polite.id, lesson_practice.id)
    _seed_food_exercises(db, lesson_food.id, lesson_menu.id)
    _seed_family_exercises(db, lesson_family.id)


def _add_exercise(db: Session, lesson_id: int, type_: str, order: int, **kwargs):
    db.add(
        Exercise(
            lesson_id=lesson_id,
            type=type_,
            order_index=order,
            **kwargs,
        )
    )


def _seed_exercises(db: Session, lesson_id: int):
    _add_exercise(
        db,
        lesson_id,
        "multiple_choice",
        1,
        question="What does 'Hola' mean?",
        correct_answer="Hello",
        data='{"options": ["Hello", "Goodbye", "Thank you", "Please"]}',
    )
    _add_exercise(
        db,
        lesson_id,
        "multiple_choice",
        2,
        question="What does 'Adiós' mean?",
        correct_answer="Goodbye",
        data='{"options": ["Hello", "Goodbye", "Thank you", "Please"]}',
    )
    _add_exercise(
        db,
        lesson_id,
        "word_bank",
        3,
        question="Translate: I am a student",
        correct_answer="Yo soy estudiante",
        data='{"words": ["soy", "estudiante", "yo"]}',
    )
    _add_exercise(
        db,
        lesson_id,
        "match_pairs",
        4,
        question="Match the translations",
        correct_answer="",
        data='{"pairs": [["Hola", "Hello"], ["Adiós", "Goodbye"], ["Gracias", "Thank you"]]}',
    )
    _add_exercise(
        db,
        lesson_id,
        "fill_blank",
        5,
        question="Fill in the blank: ______ means hello",
        correct_answer="Hola",
    )
    _add_exercise(
        db,
        lesson_id,
        "type_answer",
        6,
        question="Type the Spanish word for 'Hello':",
        correct_answer="Hola",
    )
    db.flush()


def _seed_extra_exercises(db: Session, polite_id: int, practice_id: int):
    _add_exercise(
        db,
        polite_id,
        "multiple_choice",
        1,
        question="What does 'Por favor' mean?",
        correct_answer="Please",
        data='{"options": ["Hello", "Goodbye", "Thank you", "Please"]}',
    )
    _add_exercise(
        db,
        polite_id,
        "type_answer",
        2,
        question="Type the Spanish word for 'Thank you':",
        correct_answer="Gracias",
    )
    _add_exercise(
        db,
        practice_id,
        "multiple_choice",
        1,
        question="Which is a greeting?",
        correct_answer="Hola",
        data='{"options": ["Casa", "Perro", "Hola", "Mesa"]}',
    )
    _add_exercise(
        db,
        practice_id,
        "word_bank",
        2,
        question="Translate: Goodbye my friend",
        correct_answer="Adiós mi amigo",
        data='{"words": ["Adiós", "mi", "amigo"]}',
    )
    db.flush()


def _seed_food_exercises(db: Session, food_id: int, menu_id: int):
    _add_exercise(
        db,
        food_id,
        "multiple_choice",
        1,
        question="What does 'Quiero' mean?",
        correct_answer="I want",
        data='{"options": ["I want", "I like", "I need", "I have"]}',
    )
    _add_exercise(
        db,
        food_id,
        "word_bank",
        2,
        question="Translate: I want water, please",
        correct_answer="Quiero agua, por favor",
        data='{"words": ["quiero", "agua", "por", "favor"]}',
    )
    _add_exercise(
        db,
        menu_id,
        "fill_blank",
        1,
        question="Fill in the blank: ______ es delicioso",
        correct_answer="La comida",
    )
    _add_exercise(
        db,
        menu_id,
        "type_answer",
        2,
        question="Type the Spanish word for 'bread':",
        correct_answer="Pan",
    )
    db.flush()


def _seed_family_exercises(db: Session, lesson_id: int):
    _add_exercise(
        db,
        lesson_id,
        "multiple_choice",
        1,
        question="What does 'madre' mean?",
        correct_answer="Mother",
        data='{"options": ["Mother", "Father", "Sister", "Brother"]}',
    )
    _add_exercise(
        db,
        lesson_id,
        "fill_blank",
        2,
        question="Fill in the blank: ______ means father",
        correct_answer="Padre",
    )
    db.flush()


def _seed_main_user(db: Session):
    # last_active_date is None so the first live lesson activity starts the
    # streak at 1 (instead of being treated as a same-day no-op on day one).
    user = User(
        name="Utkarsh",
        email="utkarsh@example.com",
        xp=0,
        streak=0,
        hearts=5,
        gems=1000,
        daily_goal=20,
        last_active_date=None,
    )
    db.add(user)
    db.flush()

    # Give the default user one completed skill so the path feels alive
    greetings = db.query(Skill).filter(Skill.title == "Greetings").first()
    if greetings:
        db.add(
            UserSkillProgress(
                user_id=user.id,
                skill_id=greetings.id,
                progress=100,
                crowns=1,
                completed=True,
                updated_at=datetime.now(),
            )
        )

    # Achievement definitions
    achievements_def = [
        ("First Lesson", "Complete your first lesson", "🎯", "lessons_completed", 1),
        ("7 Day Streak", "Maintain a 7 day streak", "🔥", "streak", 7),
        ("XP Hunter", "Earn 500 XP", "⭐", "total_xp", 500),
        ("Perfect Lesson", "Complete a perfect lesson", "💯", "perfect_lesson", 1),
    ]
    for name, desc, icon, req_type, req_value in achievements_def:
        db.add(
            Achievement(
                name=name,
                description=desc,
                icon=icon,
                requirement_type=req_type,
                requirement_value=req_value,
            )
        )

    return user


def _seed_demo_users(db: Session):
    rivals = [
        ("Emma", "emma@duo.demo", 2450, 34, 5, 890),
        ("Liam", "liam@duo.demo", 1985, 21, 4, 540),
        ("Olivia", "olivia@duo.demo", 1520, 12, 5, 760),
        ("Noah", "noah@duo.demo", 980, 8, 3, 210),
        ("Ava", "ava@duo.demo", 620, 5, 5, 330),
        ("Mia", "mia@duo.demo", 310, 3, 4, 90),
        ("Lucas", "lucas@duo.demo", 120, 1, 5, 40),
    ]
    for name, email, xp, streak, hearts, gems in rivals:
        db.add(
            User(
                name=name,
                email=email,
                xp=xp,
                streak=streak,
                hearts=hearts,
                gems=gems,
                daily_goal=20,
                last_active_date=datetime.now() - timedelta(days=1),
            )
        )
    db.flush()