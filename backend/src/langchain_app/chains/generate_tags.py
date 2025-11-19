from src.langchain_app.config.model_config import llm
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel
from typing import List

class GeneratedTags(BaseModel):
    tags: List[str]

parser = JsonOutputParser(pydantic_object=GeneratedTags)

async def generate_tags(article_data: dict) -> List[str]:
    """Generate relevant tags for a knowledge base article using AI."""
    content = (
        f"Article Title: {article_data['title']}\n"
        f"Category: {article_data['category']}\n"
        f"Subcategory: {article_data['subcategory']}\n"
        f"Content: {article_data['content']}\n"
    )

    messages = [
        {"role": "system", "content": """You are a helpful assistant that generates relevant tags for knowledge base articles.

         Generate 3-7 concise, relevant tags that describe the article's content and topics.
         Tags should be:
         - Single words or short phrases (1-3 words)
         - Lowercase
         - Relevant to the article's main topics
         - Useful for searching and categorizing

         Output in JSON format:
         {"tags": ["tag1", "tag2", "tag3", ...]}
         """},
        {"role": "user", "content": f"Please generate relevant tags for the following article:\n{content}"}
    ]

    chain = llm | parser

    response = await chain.ainvoke(messages)

    return response.get("tags", [])
