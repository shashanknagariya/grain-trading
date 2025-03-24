from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Grain, db

grains = Blueprint('grains', __name__)

@grains.route('/grains', methods=['GET'])
@jwt_required()
def get_grains():
    try:
        grains = Grain.query.all()
        return jsonify([{
            'id': grain.id,
            'name': grain.name
        } for grain in grains]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
            'name': grain.name
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@grains.route('/grains/<int:grain_id>', methods=['PUT'])
@jwt_required()
def update_grain(grain_id):
    try:
        grain = Grain.query.get(grain_id)
        if not grain:
            return jsonify({'error': 'Grain not found'}), 404
            
        data = request.get_json()
        if 'name' in data:
            grain.name = data['name']
            
        db.session.commit()
        
        return jsonify({
            'id': grain.id,
            'name': grain.name
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@grains.route('/grains/<int:grain_id>', methods=['DELETE'])
@jwt_required()
def delete_grain(grain_id):
    try:
        grain = Grain.query.get(grain_id)
        if not grain:
            return jsonify({'error': 'Grain not found'}), 404
            
        db.session.delete(grain)
        db.session.commit()
        
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500