import sys
import os

# Add the backend directory to Python path so it can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.routes.main import app
