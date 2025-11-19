from src.langchain_app.config.model_config import llm
import json
import re

async def generate_tags_for_article(article_data: dict) -> list[str]:
    """
    Generate relevant tags for a KB article based on its FULL content.

    Args:
        article_data: Dictionary containing article title and full content

    Returns:
        List of generated tags
    """
    # Build content string with full article content - not just title
    content_parts = []
    
    # Always include title
    content_parts.append(f"Article Title: {article_data['title']}")
    
    # Include FULL content - this is critical for accurate tag generation
    article_content = article_data.get('content', '')
    if article_content and article_content.strip():
        content_parts.append(f"Article Content:\n{article_content}")
    else:
        # Warn if content is empty - this might indicate a bug
        content_parts.append("Article Content: [No content provided - tags will be based on title only]")

    if article_data.get('category'):
        content_parts.append(f"Category: {article_data['category']}")

    if article_data.get('subcategory'):
        content_parts.append(f"Subcategory: {article_data['subcategory']}")

    full_content = "\n".join(content_parts)

    messages = [
        {"role": "system", "content": """You are a helpful assistant that generates relevant tags for knowledge base articles.

Analyze the COMPLETE article content (title AND body text) and generate 5-10 relevant, specific tags that would help users find this article.

IMPORTANT: Base your tags on the FULL article content, not just the title. The article body contains important details, technical terms, and concepts that should be reflected in the tags.

Rules for tags:
- Tags should be lowercase
- Tags should be single words or short phrases (2-3 words max)
- Tags should be specific and relevant to the FULL content
- Avoid generic tags like "article" or "help"
- Include technical terms, product names, and key concepts from the article body
- Cover both the main topic (from title) and specific details (from content)

Return ONLY a JSON array of strings, no other text. Example: ["tag1", "tag2", "tag3"]"""},
        {"role": "user", "content": f"Please generate relevant tags for the following article. Make sure to analyze the full content, not just the title:\n\n{full_content}"}
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
