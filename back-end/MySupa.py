import os
import dotenv
import requests

dotenv.load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

MATCH_SHORT_URL= 'https://pzwlpekxngevlesykvfx.supabase.co/rest/v1/rpc/match_short'
MATCH_LONG_URL = 'https://pzwlpekxngevlesykvfx.supabase.co/rest/v1/rpc/match_long'

SIMILARITY_THRESHOLD = 0.1
MATCH_COUNT = 10

async def get_context_long(embedding):
    url = MATCH_LONG_URL
    payload = {
        "match_count": MATCH_COUNT,
        "query_embedding": embedding,
        "similarity_threshold": SIMILARITY_THRESHOLD
    }

    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.ok:
        return response.json()
    else:
        return response.status_code, response.text
    
async def get_context_short(embedding):
    url = MATCH_SHORT_URL
    payload = {
        "match_count": MATCH_COUNT,
        "query_embedding": embedding,
        "similarity_threshold": SIMILARITY_THRESHOLD
    }

    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.ok:
        return response.json()
    else:
        return response.status_code, response.text