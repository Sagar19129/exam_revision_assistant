"""
model_config.py
---------------
Centralized configuration for Gemini model and utilities.
Reduces redundancy and makes it easy to switch models globally.
"""

import os
import json
import re
from google import genai

# ── Model Configuration ────────────────────────────────────────────────────────
MODEL = "models/gemini-flash-latest"






def get_client():
    """Get a configured Gemini API client."""
    return genai.Client(api_key=os.environ["GOOGLE_API_KEY"])

def parse_json_response(raw: str) -> list:
    """
    Parse JSON from model response.
    Removes markdown code fences and handles common formatting issues.
    
    Args:
        raw: Raw response text from the model
        
    Returns:
        Parsed JSON as a list, or empty list if parsing fails
    """
    # Remove markdown code fences
    raw = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
    try:
        result = json.loads(raw)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass
    return []
