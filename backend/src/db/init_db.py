from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from src.core.config import settings
from src.models.ticket import Ticket
from src.models.category import Category
from src.models.subcategory import SubCategory
from src.models.tag import Tag
from src.models.comment import Comment
from src.models.user import User
from src.models.article import Article
from src.models.agent_info import AgentInfo

async def init_db():
    """
    Initializes the MongoDB connection and registers Beanie document models.
    """
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.get_default_database()
    
    await init_beanie(
        database=db,
        document_models=[
            Ticket,
            Category,
            SubCategory,    
            Tag,
            Comment,
            User,
            Article,
            AgentInfo

        ]
    )

    # Create indexes for SLA monitoring
    ticket_collection = db.get_collection("tickets")
    await ticket_collection.create_index("slaDueDate")
    await ticket_collection.create_index("slaBreached")
    await ticket_collection.create_index([("status", 1), ("slaDueDate", 1)])
    await ticket_collection.create_index([("slaBreached", 1), ("status", 1)])

    print("Finished DB init with SLA indexes.")  # Debug print
