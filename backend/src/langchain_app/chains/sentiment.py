from src.langchain_app.config.model_config import llm
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel
from typing import List, Optional

class SentimentResult(BaseModel):
    sentiment: str  # positive, neutral, negative
    score: float    # -1.0 to 1.0
    confidence: float  # 0.0 to 1.0
    emotions: List[str]  # detected emotions
    escalation_recommended: bool
    summary: str

parser = JsonOutputParser(pydantic_object=SentimentResult)

async def analyze_sentiment(text: str) -> dict:
    """Analyze sentiment of the given text using AI."""
    messages = [
        {"role": "system", "content": """You are a sentiment analysis expert for a customer support ticketing system.

         Analyze the sentiment of the given text and provide:
         1. sentiment: "positive", "neutral", or "negative"
         2. score: A float from -1.0 (most negative) to 1.0 (most positive)
         3. confidence: A float from 0.0 to 1.0 indicating confidence in the analysis
         4. emotions: A list of detected emotions (e.g., "frustrated", "satisfied", "confused", "angry", "grateful")
         5. escalation_recommended: Boolean indicating if this should be escalated due to strong negative sentiment
         6. summary: A brief 1-2 sentence summary of the sentiment

         Escalation should be recommended when:
         - Score is below -0.5
         - Emotions include "angry" or "frustrated" with high intensity
         - Language suggests urgency or dissatisfaction

         Output in JSON format:
         {
           "sentiment": "negative",
           "score": -0.7,
           "confidence": 0.85,
           "emotions": ["frustrated", "confused"],
           "escalation_recommended": true,
           "summary": "Customer appears frustrated with the service and needs urgent attention."
         }
         """},
        {"role": "user", "content": f"Please analyze the sentiment of the following text:\n\n{text}"}
    ]

    chain = llm | parser

    response = await chain.ainvoke(messages)

    return response


async def analyze_sentiment_batch(texts: List[str]) -> List[dict]:
    """Analyze sentiment of multiple texts."""
    results = []
    for text in texts:
        result = await analyze_sentiment(text)
        results.append(result)
    return results


async def get_sentiment_trends(sentiments: List[dict]) -> dict:
    """Calculate sentiment trends from a list of sentiment results."""
    if not sentiments:
        return {
            "average_score": 0,
            "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
            "escalation_rate": 0,
            "common_emotions": []
        }

    total_score = sum(s.get("score", 0) for s in sentiments)
    average_score = total_score / len(sentiments)

    distribution = {"positive": 0, "neutral": 0, "negative": 0}
    for s in sentiments:
        sentiment = s.get("sentiment", "neutral")
        if sentiment in distribution:
            distribution[sentiment] += 1

    escalations = sum(1 for s in sentiments if s.get("escalation_recommended", False))
    escalation_rate = escalations / len(sentiments) if sentiments else 0

    # Collect all emotions
    all_emotions = []
    for s in sentiments:
        all_emotions.extend(s.get("emotions", []))

    # Count emotion frequencies
    emotion_counts = {}
    for emotion in all_emotions:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

    # Sort by frequency
    common_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "average_score": round(average_score, 2),
        "sentiment_distribution": distribution,
        "escalation_rate": round(escalation_rate, 2),
        "common_emotions": [{"emotion": e[0], "count": e[1]} for e in common_emotions]
    }
