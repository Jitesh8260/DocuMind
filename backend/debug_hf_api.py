import os
import requests
from dotenv import load_dotenv

# Load .env file
load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
print(HF_TOKEN)
if not HF_TOKEN:
    raise ValueError("❌ HF_TOKEN not found in environment. Please set it in your .env file.")

headers = {"authorization": f"Bearer {HF_TOKEN}"}

# Step 1: Check token validity
print("🔍 Testing Hugging Face token...")
whoami = requests.get("https://huggingface.co/api/whoami-v2", headers=headers)

print("Status:", whoami.status_code)
print("Response:", whoami.text)

# Step 2: Simple inference test (text generation)
print("\n📝 Testing text generation...")

API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
payload = {"inputs": "Hello, my name is"}
response = requests.post(API_URL, headers=headers, json=payload)

print("Status:", response.status_code)
print("Response:", response.text)
