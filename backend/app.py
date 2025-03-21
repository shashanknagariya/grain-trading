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
from commands import init_commands, create_admin

def create_app():
    load_dotenv()
    
    app = Flask(__name__)
    
    # Ensure JWT secret key is set
    if not os.getenv('JWT_SECRET_KEY'):
        app.config['JWT_SECRET_KEY'] = 'dev-temporary-key'  # Only for development
    else:
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    # Update CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "https://bpmp.netlify.app"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Configure SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grain_trading.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    @app.after_request
    def after_request(response):
        # Get the origin from the request
        origin = request.headers.get('Origin')
        
        # Allow both localhost and production domain
        if origin in [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://bpmp.netlify.app"
        ]:
            response.headers.add('Access-Control-Allow-Origin', origin)
        
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    @app.after_request
    def add_security_headers(response):
        # Content Security Policy
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://bpmp.netlify.app; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://bpmp.netlify.app https://api.yourservice.com; "
            "frame-ancestors 'none'; "
            "form-action 'self';"
        )
        
        # Additional Security Headers
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = (
            'camera=(), '
            'microphone=(), '
            'geolocation=(self), '
            'payment=(self)'
        )
        
        # API-specific headers
        response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
        response.headers['X-Rate-Limit'] = '100'  # requests per window
        response.headers['X-Rate-Limit-Window'] = '3600'  # 1 hour in seconds
        
        return response
    
    # Initialize extensions
    jwt.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import models
    from models import User, Grain, Purchase, Inventory, Sale
    
    # Register blueprints
    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(grains, url_prefix='/api')
    app.register_blueprint(purchase, url_prefix='/api')
    app.register_blueprint(inventory, url_prefix='/api')
    app.register_blueprint(dashboard, url_prefix='/api')
    app.register_blueprint(sale, url_prefix='/api')
    app.register_blueprint(users, url_prefix='/api')
    app.register_blueprint(godown, url_prefix='/api')
    app.register_blueprint(payment, url_prefix='/api')
    
    # Initialize commands
    init_commands(app)
    app.cli.add_command(create_admin)
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy'}
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True) 