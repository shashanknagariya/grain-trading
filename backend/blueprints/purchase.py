from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Purchase, Grain, BagInventory, Godown, PaymentHistory, Permission, db
from datetime import datetime, timezone
from utils.permissions import require_permission
import re

purchase = Blueprint('purchase', __name__)

@purchase.route('/purchases', methods=['GET'])
@jwt_required()
def get_purchases():
    try:
        purchases = db.session.query(
            Purchase.id,
            Purchase.bill_number,
            Grain.name.label('grain_name'),
            Purchase.supplier_name,
            Purchase.number_of_bags,
            Purchase.weight_per_bag,
            Purchase.extra_weight,
            Purchase.total_weight,
            Purchase.rate_per_kg,
            Purchase.total_amount,
            Purchase.payment_status,
            Purchase.paid_amount,
            Purchase.purchase_date
        ).join(Grain, Purchase.grain_id == Grain.id)\
        .order_by(Purchase.purchase_date.desc())\
        .all()

        return jsonify([{
            'id': p.id,
            'bill_number': p.bill_number,
            'grain_name': p.grain_name,
            'supplier_name': p.supplier_name,
            'number_of_bags': p.number_of_bags,
            'weight_per_bag': float(p.weight_per_bag),
            'extra_weight': float(p.extra_weight) if p.extra_weight else 0,
            'total_weight': float(p.total_weight),
            'rate_per_kg': float(p.rate_per_kg),
            'total_amount': float(p.total_amount),
            'payment_status': p.payment_status,
            'paid_amount': float(p.paid_amount),
            'purchase_date': p.purchase_date.isoformat()
        } for p in purchases])
    except Exception as e:
        print(f"Error fetching purchases: {str(e)}")
        return jsonify({'error': 'Failed to fetch purchases'}), 500

def generate_bill_number():
    # Format: PB-YYYYMMDD-XXXX
    date_part = datetime.now().strftime('%Y%m%d')
    
    # Get the latest bill number for today
    latest_purchase = Purchase.query.filter(
        Purchase.bill_number.like(f'PB-{date_part}-%')
    ).order_by(Purchase.bill_number.desc()).first()
    
    if latest_purchase:
        # Extract the sequence number and increment
        match = re.search(r'PB-\d{8}-(\d{4})', latest_purchase.bill_number)
        if match:
            sequence = int(match.group(1)) + 1
        else:
            sequence = 1
    else:
        sequence = 1
    
    return f'PB-{date_part}-{sequence:04d}'

@purchase.route('/purchases', methods=['POST'])
@jwt_required()
@require_permission(Permission.MAKE_PURCHASE.value)  
def create_purchase():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['grain_id', 'godown_id', 'number_of_bags', 
                         'weight_per_bag', 'rate_per_kg', 'supplier_name', 
                         'purchase_date']
        if not all(k in data for k in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Generate bill number if not provided
        bill_number = data.get('bill_number') or generate_bill_number()
        
        # Calculate total weight and amount
        total_weight = (data['number_of_bags'] * data['weight_per_bag']) + data.get('extra_weight', 0)
        total_amount = total_weight * data['rate_per_kg']
        
        # Begin transaction
        db.session.begin_nested()
        
        try:
            # Validate grain and godown exist
            grain = Grain.query.get(data['grain_id'])
            if not grain:
                return jsonify({'error': 'Invalid grain_id'}), 400
                
            godown = Godown.query.get(data['godown_id'])
            if not godown:
                return jsonify({'error': 'Invalid godown_id'}), 400
            
            # Create purchase record
            purchase = Purchase(
                bill_number=bill_number,
                grain_id=data['grain_id'],
                godown_id=data['godown_id'],
                number_of_bags=data['number_of_bags'],
                weight_per_bag=data['weight_per_bag'],
                extra_weight=data.get('extra_weight', 0),
                rate_per_kg=data['rate_per_kg'],
                total_weight=total_weight,
                total_amount=total_amount,
                supplier_name=data['supplier_name'],
                purchase_date=datetime.fromisoformat(data['purchase_date'].replace('Z', '+00:00')),
                payment_status='pending',
                paid_amount=0
            )
            
            db.session.add(purchase)
            
            # Update inventory
            inventory = BagInventory.query.filter_by(
                grain_id=data['grain_id'],
                godown_id=data['godown_id']
            ).with_for_update().first()  # Lock the row for update
            
            if not inventory:
                # Create new inventory record
                inventory = BagInventory(
                    grain_id=data['grain_id'],
                    godown_id=data['godown_id'],
                    number_of_bags=data['number_of_bags']
                )
                db.session.add(inventory)
            else:
                # Update existing inventory
                inventory.number_of_bags += data['number_of_bags']
            
            db.session.commit()
            
            # Return the created purchase with grain name
            return jsonify({
                'id': purchase.id,
                'bill_number': purchase.bill_number,
                'grain_name': grain.name,
                'supplier_name': purchase.supplier_name,
                'number_of_bags': purchase.number_of_bags,
                'weight_per_bag': float(purchase.weight_per_bag),
                'extra_weight': float(purchase.extra_weight),
                'total_weight': float(purchase.total_weight),
                'rate_per_kg': float(purchase.rate_per_kg),
                'total_amount': float(purchase.total_amount),
                'payment_status': purchase.payment_status,
                'paid_amount': float(purchase.paid_amount),
                'purchase_date': purchase.purchase_date.isoformat()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            print(f"Error in transaction: {str(e)}")
            return jsonify({'error': 'Transaction failed'}), 500
            
    except Exception as e:
        print(f"Error creating purchase: {str(e)}")
        return jsonify({'error': 'Failed to create purchase'}), 500

@purchase.route('/purchases/<int:purchase_id>', methods=['GET'])
@jwt_required()
def get_purchase(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    return jsonify({
        'id': purchase.id,
        'bill_number': purchase.bill_number,
        'grain_id': purchase.grain_id,
        'grain_name': purchase.grain.name,
        'godown_id': purchase.godown_id,
        'godown_name': purchase.godown.name,
        'number_of_bags': purchase.number_of_bags,
        'weight_per_bag': purchase.weight_per_bag,
        'extra_weight': purchase.extra_weight,
        'rate_per_kg': purchase.rate_per_kg,
        'total_weight': purchase.total_weight,
        'total_amount': purchase.total_amount,
        'payment_status': purchase.payment_status,
        'paid_amount': purchase.paid_amount,
        'supplier_name': purchase.supplier_name,
        'purchase_date': purchase.purchase_date.isoformat(),
        'created_at': purchase.created_at.isoformat()
    }) 

@purchase.route('/purchases/<int:purchase_id>', methods=['DELETE'])
@jwt_required()
@require_permission(Permission.MANAGE_INVENTORY.value)
def delete_purchase(purchase_id):
    try:
        purchase = Purchase.query.get_or_404(purchase_id)
        
        # Update bag inventory
        bag_inventory = BagInventory.query.filter_by(
            grain_id=purchase.grain_id,
            godown_id=purchase.godown_id
        ).first()
        
        if bag_inventory:
            bag_inventory.number_of_bags -= purchase.number_of_bags
            if bag_inventory.number_of_bags < 0:
                return jsonify({'error': 'Cannot delete: Inventory already used'}), 400
        
        # Delete payment history
        PaymentHistory.query.filter_by(purchase_id=purchase_id).delete()
        
        # Delete purchase
        db.session.delete(purchase)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        print(f"Error deleting purchase: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete purchase'}), 500 

@purchase.route('/purchases/<int:purchase_id>', methods=['PUT'])
@jwt_required()
@require_permission(Permission.EDIT_PURCHASE)
def update_purchase(purchase_id):
    try:
        data = request.get_json()
        purchase = Purchase.query.get_or_404(purchase_id)
        
        # Begin transaction
        db.session.begin_nested()
        
        try:
            # Update basic fields
            if 'supplier_name' in data:
                purchase.supplier_name = data['supplier_name']
            if 'purchase_date' in data:
                purchase.purchase_date = datetime.fromisoformat(data['purchase_date'].replace('Z', '+00:00'))
            
            # Update quantity and amount related fields
            if any(key in data for key in ['number_of_bags', 'weight_per_bag', 'rate_per_kg', 'extra_weight']):
                # Get current values or new values from request
                number_of_bags = data.get('number_of_bags', purchase.number_of_bags)
                weight_per_bag = data.get('weight_per_bag', purchase.weight_per_bag)
                rate_per_kg = data.get('rate_per_kg', purchase.rate_per_kg)
                extra_weight = data.get('extra_weight', purchase.extra_weight)
                
                # Calculate new totals
                total_weight = (number_of_bags * weight_per_bag) + extra_weight
                total_amount = total_weight * rate_per_kg
                
                # Update purchase record
                purchase.number_of_bags = number_of_bags
                purchase.weight_per_bag = weight_per_bag
                purchase.rate_per_kg = rate_per_kg
                purchase.extra_weight = extra_weight
                purchase.total_weight = total_weight
                purchase.total_amount = total_amount
            
            # Update inventory if godown changed
            if 'godown_id' in data and data['godown_id'] != purchase.godown_id:
                # Remove bags from old godown
                old_inventory = BagInventory.query.filter_by(
                    grain_id=purchase.grain_id,
                    godown_id=purchase.godown_id
                ).with_for_update().first()
                
                if old_inventory:
                    old_inventory.number_of_bags -= purchase.number_of_bags
                    
                # Add bags to new godown
                new_inventory = BagInventory.query.filter_by(
                    grain_id=purchase.grain_id,
                    godown_id=data['godown_id']
                ).with_for_update().first()
                
                if not new_inventory:
                    new_inventory = BagInventory(
                        grain_id=purchase.grain_id,
                        godown_id=data['godown_id'],
                        number_of_bags=0
                    )
                    db.session.add(new_inventory)
                
                new_inventory.number_of_bags += purchase.number_of_bags
                purchase.godown_id = data['godown_id']
            
            db.session.commit()
            return jsonify({
                'message': 'Purchase updated successfully',
                'purchase': {
                    'id': purchase.id,
                    'bill_number': purchase.bill_number,
                    'grain_name': purchase.grain.name,
                    'supplier_name': purchase.supplier_name,
                    'total_amount': float(purchase.total_amount),
                    'payment_status': purchase.payment_status,
                    'paid_amount': float(purchase.paid_amount),
                    'purchase_date': purchase.purchase_date.isoformat()
                }
            })
            
        except Exception as e:
            db.session.rollback()
            raise e
            
    except Exception as e:
        print(f"Error updating purchase: {str(e)}")
        return jsonify({'error': str(e)}), 500