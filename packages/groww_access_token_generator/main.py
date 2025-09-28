import os
from dotenv import load_dotenv
from growwapi import GrowwAPI
import pyotp
from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

app = FastAPI()


class TOTPRequestBody(BaseModel):
    api_key: str
    api_secret: str


@app.post("/")
async def generate_groww_token(body: TOTPRequestBody):
    try:
        print(body)
        api_key = body.api_key
        api_secret = body.api_secret
        totp_gen = pyotp.TOTP(api_secret)
        totp = totp_gen.now()
        access_token = GrowwAPI.get_access_token(api_key, totp)
        return {"access_token": access_token}
    except Exception as e:
        return {"error": str(e)}
