from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Grain, db
from datetime import datetime

grain = Blueprint('grain', __name__)

@grain.route('/grains', methods=['GET'])
@jwt_required()
def get_grains():
    grains = Grain.query.all()
    return jsonify([{
        'id': g.id,
        'name': g.name,
        'variety': g.variety,
        'description': g.description,
        'created_at': g.created_at.isoformat()
    } for g in grains])

@grain.route('/grains', methods=['POST'])
@jwt_required()
def create_grain():
    data = request.get_json()
    
    grain = Grain(
        name=data['name'],
        variety=data.get('variety'),
        description=data.get('description')
    )
    
    db.session.add(grain)
    db.session.commit()
    
    return jsonify({
        'id': grain.id,
        'name': grain.name,
        'variety': grain.variety,
        'description': grain.description,
        'created_at': grain.created_at.isoformat()
    }), 201

@grain.route('/grains/<int:grain_id>', methods=['GET'])
@jwt_required()
def get_grain(grain_id):
    grain = Grain.query.get_or_404(grain_id)
    return jsonify({
        'id': grain.id,
        'name': grain.name,
        'variety': grain.variety,
        'description': grain.description,
        'created_at': grain.created_at.isoformat()
    })

@grain.route('/grains/<int:grain_id>', methods=['PUT'])
@jwt_required()
def update_grain(grain_id):
    grain = Grain.query.get_or_404(grain_id)
    data = request.get_json()
    
    grain.name = data.get('name', grain.name)
    grain.variety = data.get('variety', grain.variety)
    grain.description = data.get('description', grain.description)
    
    db.session.commit()
    
    return jsonify({
        'id': grain.id,
        'name': grain.name,
        'variety': grain.variety,
        'description': grain.description,
        'created_at': grain.created_at.isoformat()
    })

@grain.route('/grains/<int:grain_id>', methods=['DELETE'])
@jwt_required()
def delete_grain(grain_id):
    grain = Grain.query.get_or_404(grain_id)
    db.session.delete(grain)
    db.session.commit()
    
    return '', 204 