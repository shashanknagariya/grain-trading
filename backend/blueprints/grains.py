from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Grain, db

grains = Blueprint('grains', __name__)

@grains.route('/grains', methods=['POST'])
@jwt_required()
def create_grain():
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Grain name is required'}), 400
            
        grain = Grain(name=data['name'])
        
        db.session.add(grain)
        db.session.commit()
        
        return jsonify({
            'id': grain.id,
            'name': grain.name,
            'created_at': grain.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating grain: {str(e)}")
        return jsonify({'error': 'Failed to create grain'}), 500

@grains.route('/grains', methods=['GET'])
@jwt_required()
def get_grains():
    try:
        print("Fetching grains...")  # Debug log
        grains = Grain.query.all()
        response = [{
            'id': grain.id,
            'name': grain.name,
            'created_at': grain.created_at.isoformat()
        } for grain in grains]
        print(f"Found {len(response)} grains")  # Debug log
        return jsonify(response)
    except Exception as e:
        print(f"Error fetching grains: {str(e)}")  # Error log
        return jsonify({'error': 'Failed to fetch grains'}), 500 