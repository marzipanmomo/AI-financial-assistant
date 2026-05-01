import os #lets you access environment variables (API keys)
from groq import Groq #python client for groq's ai models

#create groq client using your api key
#stores in environment variable GROQ_API_KEY
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def get_ai_response(prompt: str) -> str:
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"AI Error: {e}")
        return "Sorry, I couldn't generate advice right now. Please try again."