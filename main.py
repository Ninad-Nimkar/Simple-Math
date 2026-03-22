from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import io
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from openai import OpenAI
from dotenv import load_dotenv
import base64
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse("static/index.html")

@app.post("/solve")
async def solve_math(problem: str = Form(None),
                      level: str = Form(None),
                      file: UploadFile = File(None)):
    if not problem and not file:
        return{"error": "Provide either text or image"}
    
    
                        #CASE 1----------
    if problem:
        prompt = f'''  
You are a clear, reliable and friendly math teacher.

Student Level: {level}

Rules:
- Solve step-by-step
- Explain briefly
- Do NOT skip steps
- Keep it simple

FORMATTING RULES (very important):
- Use markdown for structure: headings (##, ###), **bold**, bullet points, numbered lists
- Use LaTeX for ALL math expressions:
  - Inline math: $expression$ (e.g. $2x + 5 = 13$)
  - Display/block math: $$expression$$ (e.g. $$\\frac{{dy}}{{dx}} = 2x$$)
- NEVER write math expressions as plain text. Always wrap them in $ or $$
- Use proper LaTeX commands: \\frac, \\sqrt, \\int, \\sum, \\partial, etc.

IMPORTANT:
- After solving, VERIFY the answer by substituting it back into the original equation
- Only give the final answer if it is correct

Follow these instructions:
1. What is the goal?
2. Use the methods as per the level and board.
3. Step by step solution
4. Explain WHY each step is done
5. Keep language friendly to the level
6. Check if the answer is correct on educational websites
7. Final answer clearly

Problem: {problem}'''
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages= [{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.3
        )

        return{
            "input_type": "text",
            "solution": response.choices[0].message.content
        }
    
                        #CASE 2------------
    if file:
        image_bytes = await file.read()
        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [{
                    "type": "text",
                    "text":f'''
First, correctly read the math problem from the image.
You are an expert and friendly math teacher.
Student Level: {level}

FORMATTING RULES (very important):
- Use markdown for structure: headings (##, ###), **bold**, bullet points, numbered lists
- Use LaTeX for ALL math expressions:
  - Inline math: $expression$ (e.g. $2x + 5 = 13$)
  - Display/block math: $$expression$$ (e.g. $$\\frac{{dy}}{{dx}} = 2x$$)
- NEVER write math expressions as plain text. Always wrap them in $ or $$
- Use proper LaTeX commands: \\frac, \\sqrt, \\int, \\sum, \\partial, etc.

Follow these instructions:
1. What is the goal?
2. Check the websites of appropriate level to get the methods used in different boards.
3. Use the methods as per the level and board.
4. Step by step solution.
5. Explain WHY each step is done.
6. Keep language friendly to the level.
7. Check if the answer is correct on educational websites.
8. Final answer clearly.'''
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{base64_image}"}
                }]
            }],
            max_tokens=1500,
            temperature=0.3
        )
    return{
        "input_type": "image",
        "solution": response.choices[0].message.content
    }