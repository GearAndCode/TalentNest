import json
from openai import OpenAI

from app.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)


def parse_resume_with_ai(text: str):

    prompt = f"""
You are an ATS Resume Parser.

Extract every important detail from the resume.

Return ONLY valid JSON.

Format:

{{
"name":"",
"email":"",
"phone":"",
"skills":[],
"education":[],
"experience":[],
"projects":[],
"certifications":[],
"languages":[]
}}

Resume:

{text}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    content = response.choices[0].message.content

    return json.loads(content)