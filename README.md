# Simple^Math

Check it Out: https://simple-math-xlgm.onrender.com

**Simple^Math** is an AI-powered math solver that explains problems step-by-step based on the student's level.
You can either type a math problem or upload a photo of one (including handwritten problems), and the app will generate a clear explanation.

---

## Features

* Solve math problems from **text input**
* Solve math problems from **images**
* **Mobile camera support** (take a photo and solve)
* **Step-by-step explanations**
* Explanations based on **student level** (school to engineering)
* Clean black & white minimal interface
* LaTeX math rendering
* FastAPI backend + custom frontend

---

## How It Works

The system uses a multi-step AI pipeline:

1. User enters a problem (text or image)
2. If image → AI reads the math problem from the image
3. The AI solves the problem
4. The AI explains the solution step-by-step based on the selected level
5. The result is rendered with proper math formatting (LaTeX)

---

## Tech Stack

**Backend**

* FastAPI
* OpenAI API (GPT-4o-mini)
* Python
* Uvicorn

**Frontend**

* HTML
* CSS
* JavaScript
* KaTeX (for math rendering)
* Markdown parsing

**Deployment**

* Render

---

## Running Locally

1. Clone the repository:

```bash
git clone https://github.com/yourusername/simple-math.git
cd simple-math
```

2. Create a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file and add your OpenAI API key:

```env
OPENAI_API_KEY=your_api_key_here
```

5. Run the server:

```bash
uvicorn main:app --reload
```

6. Open in browser:

```
http://127.0.0.1:8000
```

---

## Usage

* Enter a math problem in the text box **OR**
* Upload an image of the problem **OR**
* Take a photo from your phone
* Select your level
* Click **Solve**
* Get a step-by-step explanation

---

## Disclaimer

Simple^Math can make mistakes.
Always verify important answers.

---

## Future Improvements

* Better math accuracy using symbolic math (SymPy)
* Step-by-step interactive solving
* Practice mode
* Save solved problems history
* More detailed level-based explanations
* Performance improvements

---

## Author

**Ninad Nimkar**
Indie developer building projects and learning in public.

---

## Project Status

**Version 1 — Launched**
The project is functional and deployed, with more improvements planned in future versions.
