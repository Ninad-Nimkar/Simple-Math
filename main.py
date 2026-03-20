from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
import os
import io
from PIL import Image
from openai import OpenAI
from dotenv import load_dotenv
import base64
load_dotenv()

app = FastAPI()

API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY)

@app.post("/solve")
async def solve_math(problem:str=(None),
                      level:str=Form("engineering"),
                      file: UploadFile = File(None)):
    if not problem and not file:
        return{"error": "Provide either text or image"}
    
    
                        #CASE 1----------
    if problem:
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

Problem: {problem}, '''
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages= [{
                "role": "user", "content": prompt
            }],
            max_tokens=500
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
First, correctly read the math problem from the image
You are an expert and frinedly math teacher
Student Level: {level}
Follow whis instructions:
1. What is the goal?
2. Check the websites of appropriate level to get the methods used in different boards.
3. Use the methods as per the level and board.
4. Step by step solution.
5. Explain WHY each step is done.
6. Keep langauge friendly to the level.
7. check if the answer is corrent of educational websites.
8. Finale answer clearly.'''
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{base64_image}"}
                }]
            }],
            max_tokens=500
        )
    return{
        "input_type": "image",
        "solution": response.choices[0].message.content
    }