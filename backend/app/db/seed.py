"""Database session and initialization."""

from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.models.base import Base
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def seed_database(db: Session):
    """Seed the database with sample course content and a default user."""
    from app.models.course import Course, Unit, Skill, Lesson, Exercise
    from app.models.user import User, UserSkillProgress, UserAchievement, Achievement, LessonAttempt, UserDailyActivity
    from sqlalchemy import select

    # Check if already seeded
    existing_user = db.scalar(select(User).limit(1))
    if existing_user:
        return  # Already seeded

    # Create course
    spanish_course = Course(
        name="Spanish",
        language="Spanish",
        description="Learn Spanish from scratch",
    )
    db.add(spanish_course)
    db.flush()

    # Unit 1: Basics
    unit1 = Unit(
        course_id=spanish_course.id,
        title="Basics",
        description="Basic greetings and expressions",
        order_index=1,
    )
    db.add(unit1)
    db.flush()

    # Unit 2: Greetings
    unit2 = Unit(
        course_id=spanish_course.id,
        title="Greetings",
        description="Common greetings and salutations",
        order_index=2,
    )
    db.add(unit2)
    db.flush()

    # Unit 3: Food
    unit3 = Unit(
        course_id=spanish_course.id,
        title="Food",
        description="Food and dining vocabulary",
        order_index=3,
    )
    db.add(unit3)
    db.flush()

    # Skill 1: Greetings (in Unit 2)
    skill1 = Skill(
        unit_id=unit2.id,
        title="Greetings",
        description="Basic greeting and farewelling",
        order_index=1,
    )
    db.add(skill1)
    db.flush()

    # Skill 2: Food (in Unit 3)
    skill2 = Skill(
        unit_id=unit3.id,
        title="Food",
        description="Ordering and food vocabulary",
        order_index=1,
    )
    db.add(skill2)
    db.flush()

    # Skill 3: Family (in Unit 2 - unlocks after Greetings)
    skill3 = Skill(
        unit_id=unit2.id,
        title="Family",
        description="Family member vocabulary",
        order_index=2,
        required_skill_id=skill1.id,  # Unlocks after Greetings
    )
    db.add(skill3)
    db.flush()

    # Skill 4: Numbers (in Unit 2 - unlocks after Family)
    skill4 = Skill(
        unit_id=unit2.id,
        title="Numbers",
        description="Number vocabulary",
        order_index=3,
        required_skill_id=skill3.id,  # Unlocks after Family
    )
    db.add(skill4)
    db.flush()

    # Skill 5: Common Phrases (in Unit 2)
    skill5 = Skill(
        unit_id=unit2.id,
        title="Common Phrases",
        description="Everyday useful phrases",
        order_index=4,
    )
    db.add(skill5)
    db.flush()

    # Lessons for Skill 1: Greetings
    lesson1_1 = Lesson(
        skill_id=skill1.id,
        title="Greetings Basics",
        order_index=1,
        xp_reward=10,
    )
    db.add(lesson1_1)
    db.flush()

    lesson1_2 = Lesson(
        skill_id=skill1.id,
        title="Polite Phrases",
        order_index=2,
        xp_reward=10,
    )
    db.add(lesson1_2)
    db.flush()

    lesson1_3 = Lesson(
        skill_id=skill1.id,
        title="Greeting Practice",
        order_index=3,
        xp_reward=10,
    )
    db.add(lesson1_3)
    db.flush()

    # Lessons for Skill 2: Food
    lesson2_1 = Lesson(
        skill_id=skill2.id,
        title="Ordering Food",
        order_index=1,
        xp_reward=10,
    )
    db.add(lesson2_1)
    db.flush()

    lesson2_2 = Lesson(
        skill_id=skill2.id,
        title="Menu Vocabulary",
        order_index=2,
        xp_reward=10,
    )
    db.add(lesson2_2)
    db.flush()

    # Lessons for Skill 3: Family
    lesson3_1 = Lesson(
        skill_id=skill3.id,
        title="Family Members",
        order_index=1,
        xp_reward=10,
    )
    db.add(lesson3_1)
    db.flush()

    # Exercises for lesson1_1 (Greetings Basics)
    exercises_l1_1 = [
        Exercise(
            lesson_id=lesson1_1.id,
            type="multiple_choice",
            question="What does 'Hola' mean?",
            correct_answer="Hello",
            data="{\"options\": [\"Hello\", \"Goodbye\", \"Thank you\", \"Please\"]}",
            order_index=1,
        ),
        Exercise(
            lesson_id=lesson1_1.id,
            type="multiple_choice",
            question="What does 'Adiós' mean?",
            correct_answer="Goodbye",
            data="{\"options\": [\"Hello\", \"Goodbye\", \"Thank you\", \"Please\"]}",
            order_index=2,
        ),
        Exercise(
            lesson_id=lesson1_1.id,
            type="word_bank",
            question="Translate: I am a student",
            correct_answer="Yo soy estudiante",
            data="{\"words\": [\"soy\", \"estudiante\", \"yo\"]}",
            order_index=3,
        ),
        Exercise(
            lesson_id=lesson1_1.id,
            type="match_pairs",
            data="{\"pairs\": [\"Hola\", \"Hello\"], [\"Adiós\", \"Goodbye\"], [\"Gracias\", \"Thank you\"]}",
            order_index=4,
        ),
        Exercise(
            lesson_id=lesson1_1.id,
            type="fill_blank",
            question="Fill in the blank: ______ means hello",
            correct_answer="Hola",
            order_index=5,
        ),
        Exercise(
            lesson_id=lesson1_1.id,
            type="type_answer",
            question="Type the Spanish word for 'Hello':",
            correct_answer="Hola",
            order_index=6,
        ),
    ]
    for ex in exercises_l1_1:
        db.add(ex)

    # Exercises for lesson1_2 (Polite Phrases)
    exercises_l1_2 = [
        Exercise(
            lesson_id=lesson1_2.id,
            type="multiple_choice",
            question="What does 'Por favor' mean?",
            correct_answer="Please",
            data="{\"options\": [\"Hello\", \"Goodbye\", \"Thank you\", \"Please\"]}",
            order_index=1,
        ),
        Exercise(
            lesson_id=lesson1_2.id,
            type="type_answer",
            question="Type the Spanish word for 'Thank you':",
            correct_answer="Gracias",
            order_index=2,
        ),
    ]
    for ex in exercises_l1_2:
        db.add(ex)

    # Exercises for lesson1_3 (Greeting Practice)
    exercises_l1_3 = [
        Exercise(
            lesson_id=lesson1_3.id,
            type="multiple_choice",
            question="Which is a greeting?",
            correct_answer="Hola",
            data="{\"options\": [\"Casa\", \"Perro\", \"Hola\", \"Mesa\"]}",
            order_index=1,
        ),
    ]
    for ex in exercises_l1_3:
        db.add(ex)

    # Exercises for lesson2_1 (Ordering Food)
    exercises_l2_1 = [
        Exercise(
            lesson_id=lesson2_1.id,
            type="multiple_choice",
            question="What does 'Quiero' mean?",
            correct_answer="I want",
            data="{\"options\": [\"I want\", \"I like\", \"I need\", \"I have\"]}",
            order_index=1,
        ),
        Exercise(
            lesson_id=lesson2_1.id,
            type="word_bank",
            question="Translate: I want water, please",
            correct_answer="Quiero agua, por favor",
            data="{\"words\": [\"quiero\", \"agua\", \"por\", \"favor\"]}",
            order_index=2,
        ),
    ]
    for ex in exercises_l2_1:
        db.add(ex)

    # Exercises for lesson2_2 (Menu Vocabulary)
    exercises_l2_2 = [
        Exercise(
            lesson_id=lesson2_2.id,
            type="fill_blank",
            question="Fill in the blank: ______ es delicioso",
            correct_answer="La comida",
            order_index=1,
        ),
    ]
    for ex in exercises_l2_2:
        db.add(ex)

    # Create default user
    default_user = User(
        name="Utkarsh",
        email="utkarsh@example.com",
        xp=0,
        streak=0,
        hearts=5,
        gems=120,
        daily_goal=20,
        last_active_date=datetime.now(),
    )
    db.add(default_user)
    db.flush()

    # Create user skill progress entries
    skills = [skill1, skill2, skill3, skill4, skill5]
    for skill in skills:
        user_skill = UserSkillProgress(user_id=default_user.id, skill_id=skill.id)
        db.add(user_skill)

    # Create achievement DEFINITIONS (the 'achievements' table)
    achievements_def = [
        Achievement(
            name="First Lesson",
            description="Complete your first lesson",
            icon="🎯",
            requirement_type="lessons_completed",
            requirement_value=1,
        ),
        Achievement(
            name="7 Day Streak",
            description="Maintain a 7 day streak",
            icon="🔥",
            requirement_type="streak",
            requirement_value=7,
        ),
        Achievement(
            name="XP Hunter",
            description="Earn 500 XP",
            icon="⭐",
            requirement_type="total_xp",
            requirement_value=500,
        ),
        Achievement(
            name="Perfect Lesson",
            description="Complete a perfect lesson",
            icon="💯",
            requirement_type="perfect_lesson",
            requirement_value=1,
        ),
    ]
    for ach in achievements_def:
        db.add(ach)
    db.flush()

    # NOTE: User achievements are NOT auto-awarded on creation.
    # They are awarded dynamically when gameplay requirements are met
    # (e.g., complete first lesson → First Lesson achievement, etc.)
    # The existing 4 UserAchievement records below have been removed per review.

    db.commit()
    print("Database seeded successfully!")