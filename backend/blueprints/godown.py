from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Godown, BagInventory, db
from sqlalchemy import func

godown = Blueprint('godown', __name__)

@godown.route('/godowns', methods=['GET'])
@jwt_required()
def get_godowns():
    try:
        godowns = Godown.query.all()
        return jsonify([{
            'id': godown.id,
            'name': godown.name,
            'location': godown.location,
            'capacity': godown.capacity,
            'created_at': godown.created_at.isoformat()
        } for godown in godowns])
    except Exception as e:
        print(f"Error fetching godowns: {str(e)}")
        return jsonify({'error': 'Failed to fetch godowns'}), 500

@godown.route('/godowns/available', methods=['GET'])
@jwt_required()
def get_available_godowns():
    try:
        print("Fetching available godowns...")  # Debug log
        
        # Get all godowns with their current bag inventory
        godowns_with_inventory = db.session.query(
            Godown,
            func.coalesce(func.sum(BagInventory.number_of_bags), 0).label('used_bags')
        ).outerjoin(
            BagInventory, Godown.id == BagInventory.godown_id
        ).group_by(
            Godown.id
        ).all()

        response = [{
            'id': godown.id,
            'name': godown.name,
            'location': godown.location,
            'capacity': godown.capacity,
            'available_capacity': godown.capacity - used_bags if godown.capacity else None,
            'used_bags': used_bags,
            'created_at': godown.created_at.isoformat()
        } for godown, used_bags in godowns_with_inventory]

        print(f"Found {len(response)} available godowns")  # Debug log
        return jsonify(response)
        
    except Exception as e:
        print(f"Error fetching available godowns: {str(e)}")
        return jsonify({'error': 'Failed to fetch available godowns'}), 500

@godown.route('/godowns', methods=['POST'])
@jwt_required()
def create_godown():
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Godown name is required'}), 400
            
        godown = Godown(
            name=data['name'],
            location=data.get('location'),
            capacity=data.get('capacity')
        )
        
        db.session.add(godown)
        db.session.commit()
        
        return jsonify({
            'id': godown.id,
            'name': godown.name,
            'location': godown.location,
            'capacity': godown.capacity,
            'created_at': godown.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating godown: {str(e)}")
        return jsonify({'error': 'Failed to create godown'}), 500 