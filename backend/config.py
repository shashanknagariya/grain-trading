import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
    # CORS settings
    CORS_ORIGINS = [
        'http://localhost:5173',
        'https://bpmp.netlify.app'  # Add your Netlify URL here
    ] 