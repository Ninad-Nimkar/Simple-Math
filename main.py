from fastapi import FastAPI
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY)

@app.post("/solve")
def solve_math(problem :str, level: str):

    prompt = f''' 
You are an expert and frinedly math teacher
Student Level: {level}

Follow whis instructions:
1. What is the goal?
2. Check the websites of appropriate level to get the methods used in different boards.
3. Use the methods as per the level and board.
4. Step by step solution
5. Explain WHY each step is done
6. Keep langauge friendly to the level
7.check if the answer is corrent of educational websites
8. Finale answer clearly

Problem: {problem}'''
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": prompt
        }]
    )

    return{
        "solution": response.choices[0].message.content
    }