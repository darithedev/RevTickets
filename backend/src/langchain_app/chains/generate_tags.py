from src.langchain_app.config.model_config import llm
import json
import re

async def generate_tags_for_article(article_data: dict) -> list[str]:
    """
    Generate relevant tags for a KB article based on its content.

    Args:
        article_data: Dictionary containing article title and content

    Returns:
        List of generated tags
    """
    content = (
        f"Article Title: {article_data['title']}\n"
        f"Article Content: {article_data['content']}\n"
    )

    if article_data.get('category'):
        content += f"Category: {article_data['category']}\n"

    if article_data.get('subcategory'):
        content += f"Subcategory: {article_data['subcategory']}\n"

    messages = [
        {"role": "system", "content": """You are a helpful assistant that generates relevant tags for knowledge base articles.

Analyze the article content and generate 5-10 relevant, specific tags that would help users find this article.

Rules for tags:
- Tags should be lowercase
- Tags should be single words or short phrases (2-3 words max)
- Tags should be specific and relevant to the content
- Avoid generic tags like "article" or "help"
- Include technical terms, product names, and key concepts

Return ONLY a JSON array of strings, no other text. Example: ["tag1", "tag2", "tag3"]"""},
        {"role": "user", "content": f"Please generate relevant tags for the following article:\n{content}"}
    ]

    response = await llm.ainvoke(messages)
    response_text = response.content.strip()

    # Parse the JSON response
    try:
        # Try to extract JSON array from the response
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            tags = json.loads(json_match.group())
            # Ensure all tags are strings and lowercase
            tags = [str(tag).lower().strip() for tag in tags if tag]
            return tags[:10]  # Limit to 10 tags
        else:
            return []
    except json.JSONDecodeError:
        # Fallback: try to extract tags from comma-separated text
        tags = [tag.strip().lower() for tag in response_text.split(',') if tag.strip()]
        return tags[:10]
