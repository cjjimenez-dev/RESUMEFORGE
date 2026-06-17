import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("Starting API verification tests...")
    
    # 1. Register a test user
    email = "testuser_antigravity@example.com"
    password = "SuperSecurePassword123"
    
    print("\n1. Testing User Registration...")
    reg_payload = {"email": email, "password": password}
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
        if r.status_code == 201:
            print("SUCCESS: User registered successfully!")
        elif r.status_code == 400 and "already registered" in r.text.lower():
            print("INFO: User already registered. Continuing...")
        else:
            print(f"FAILED: Status Code {r.status_code}, Response: {r.text}")
            sys.exit(1)
    except Exception as e:
        print(f"ERROR: Could not connect to API server: {e}")
        sys.exit(1)
        
    # 2. Login
    print("\n2. Testing User Login...")
    login_payload = {"email": email, "password": password}
    r = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    if r.status_code != 200:
        print(f"FAILED: Login failed. Status Code {r.status_code}, Response: {r.text}")
        sys.exit(1)
    
    token_data = r.json()
    token = token_data.get("access_token")
    print("SUCCESS: Logged in! Access token acquired.")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 3. Test get user profile
    print("\n3. Testing /auth/me profile fetching...")
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if r.status_code != 200:
        print(f"FAILED: Get profile failed. Status Code {r.status_code}, Response: {r.text}")
        sys.exit(1)
    print(f"SUCCESS: Profile fetched for user: {r.json().get('email')}")
    
    # 4. Create resume
    print("\n4. Testing Resume Creation...")
    resume_payload = {
        "title": "Antigravity's Test Resume",
        "template_name": "classic",
        "content": {
            "personal_info": {
                "full_name": "Test Antigravity",
                "title": "AI Assistant",
                "email": "test@antigravity.ai"
            },
            "experience": [
                {
                    "job_title": "Code Helper",
                    "company": "DeepMind",
                    "start_date": "2024",
                    "end_date": "Present",
                    "current": True,
                    "description": "Helping people write awesome code."
                }
            ],
            "skills": [
                {"name": "Python", "category": "Languages"},
                {"name": "FastAPI", "category": "Backend"}
            ]
        }
    }
    r = requests.post(f"{BASE_URL}/resumes", json=resume_payload, headers=headers)
    if r.status_code != 201:
        print(f"FAILED: Resume creation failed. Status Code {r.status_code}, Response: {r.text}")
        sys.exit(1)
        
    resume_data = r.json()
    resume_id = resume_data.get("id")
    print(f"SUCCESS: Resume created successfully! ID: {resume_id}")
    
    # 5. Export to DOCX
    print("\n5. Testing Word (.docx) Export...")
    # Word export uses token in URL query parameter since it's opened via _blank in frontend
    r = requests.get(f"{BASE_URL}/resumes/{resume_id}/export/docx?token={token}")
    if r.status_code != 200:
        print(f"FAILED: Word export failed. Status Code {r.status_code}, Response: {r.text}")
        sys.exit(1)
        
    content_type = r.headers.get("Content-Type", "")
    content_disposition = r.headers.get("Content-Disposition", "")
    if "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in content_type and "attachment" in content_disposition:
        print(f"SUCCESS: Word document streamed successfully! Filename: {content_disposition}")
    else:
        print(f"FAILED: Content-Type '{content_type}' or Content-Disposition '{content_disposition}' incorrect.")
        sys.exit(1)
        
    print("\nAll backend API integration tests passed successfully!")

if __name__ == "__main__":
    run_tests()
