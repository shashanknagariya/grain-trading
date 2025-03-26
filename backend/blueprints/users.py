from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, db, Permission, Role
from utils.permissions import require_permission

users = Blueprint('users', __name__)

@users.route('/users', methods=['GET'])
@jwt_required()
@require_permission(Permission.MANAGE_USERS.value)
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'role': u.role,
        'permissions': u.permissions
    } for u in users])

@users.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
@require_permission(Permission.MANAGE_USERS.value)
def update_user_role(user_id):
    data = request.get_json()
    user = User.query.get_or_404(user_id)
    
    # Convert role to lowercase for validation
    role = data['role'].lower()
    if role not in [r.value.lower() for r in Role]:
        return jsonify({'error': f'Invalid role. Must be one of: {", ".join([r.value for r in Role])}'}), 400
    
    user.role = role
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'permissions': user.permissions
    })

@users.route('/users', methods=['POST'])
@jwt_required()
@require_permission(Permission.MANAGE_USERS.value)
def create_user():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['username', 'email', 'password', 'role']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Check if username exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
            
        # Check if email exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
            
        # Validate role (case-insensitive)
        role = data['role'].lower()
        if role not in [r.value for r in Role]:
            return jsonify({'error': f'Invalid role. Must be one of: {", ".join([r.value for r in Role])}'}, 400)
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            role=role  # Use the lowercase role
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'permissions': user.permissions
        }), 201
        
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Failed to create user'}), 500 

@users.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@require_permission(Permission.MANAGE_USERS.value)
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent deleting yourself
        current_user_id = get_jwt_identity()
        if user_id == current_user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        print(f"Error deleting user: {str(e)}")
        return jsonify({'error': 'Failed to delete user'}), 500 

@users.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@require_permission(Permission.MANAGE_USERS.value)
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Validate email if changed
        if 'email' in data and data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        
        # Update password if provided
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        # Update role if provided
        if 'role' in data:
            if data['role'] not in [role.value for role in Role]:
                return jsonify({'error': 'Invalid role'}), 400
            user.role = data['role']
        
        db.session.commit()
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'permissions': user.permissions
        })
        
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        return jsonify({'error': 'Failed to update user'}), 500 