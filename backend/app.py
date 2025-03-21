from flask import Flask
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
    
    # Update CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "https://bpmp.netlify.app"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Configure SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grain_trading.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'https://bpmp.netlify.app')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
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