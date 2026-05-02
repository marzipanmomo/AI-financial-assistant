import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def get_ai_response(prompt: str) -> str:
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"AI Error: {e}")
        return "Sorry, I couldn't generate advice right now. Please try again."

def get_ai_response_stream(messages: list):
    try:
        stream = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as e:
        print(f"AI Stream Error: {e}")
        yield "Sorry, I couldn't generate a response right now. Please try again."
