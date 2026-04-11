import requests
import os

try:
    response = requests.get('http://localhost:8000/health', timeout=5)
    print(f"Health Status: {response.status_code}")
    print(f"Health Detail: {response.json()}")
except Exception as e:
    print(f"Error connecting to ML service: {e}")
