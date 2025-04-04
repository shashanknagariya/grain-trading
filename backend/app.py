from flask import Flask, make_response, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from extensions import db, migrate, jwt
from auth import auth
from blueprints.grains import grains
from blueprints.purchase import purchase
from blueprints.inventory import inventory
from blueprints.dashboard import dashboard
from blueprints.sale import sale
from blueprints.users import users
from blueprints.godown import godown
from blueprints.payment import payment
from blueprints.metrics import metrics
from blueprints.voice_bill import voice_bill
from commands import init_commands, create_admin

def create_app():
    load_dotenv()
    
    app = Flask(__name__)
    
    # Ensure JWT secret key is set
    if not os.getenv('JWT_SECRET_KEY'):
        app.config['JWT_SECRET_KEY'] = 'dev-temporary-key'  # Only for development
    else:
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    # CORS configuration
    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "https://bpmp.netlify.app",
                "https://shashanknagariya.pythonanywhere.com"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type", "Authorization"]
        }
    })

    # Handle OPTIONS requests for CORS preflight
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response
    
    # Configure SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grain_trading.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Import models
    from models import User, Grain, Purchase, Inventory, Sale
    
    # Register blueprints with the correct URL prefixes
    blueprints = [
        (auth, '/api/auth'),
        (grains, '/api'),  # This will handle /api/grains/*
        (purchase, '/api'),  # This will handle /api/purchases/*
        (inventory, '/api'),  # This will handle /api/inventory/*
        (dashboard, '/api'),  # This will handle /api/dashboard/*
        (sale, '/api'),  # This will handle /api/sales/*
        (users, '/api'),  # This will handle /api/users/*
        (godown, '/api'),  # This will handle /api/godowns/*
        (payment, '/api'),  # This will handle /api/payments/*
        (metrics, '/api'),  # This will handle /api/metrics/*
        (voice_bill, '/api'),  # This will handle /api/voice-bills/*
    ]
    
    for blueprint, prefix in blueprints:
        app.register_blueprint(blueprint, url_prefix=prefix)
    
    # Initialize CLI commands
    init_commands(app)
    app.cli.add_command(create_admin)
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy'}
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)