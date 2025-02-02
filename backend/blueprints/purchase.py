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
                inventory = BagInventory(
                    grain_id=data['grain_id'],
                    godown_id=data['godown_id'],
                    number_of_bags=0
                )
                db.session.add(inventory)
            
            inventory.add_bags(data['number_of_bags'])
            
            db.session.commit()
            
            return jsonify({
                'message': 'Purchase created successfully',
                'purchase': {
                    'id': purchase.id,
                    'bill_number': purchase.bill_number,
                    'total_amount': purchase.total_amount
                }
            }), 201
            
        except Exception as e:
            db.session.rollback()
            raise e
            
    except Exception as e:
        print(f"Error creating purchase: {str(e)}")
        return jsonify({'error': str(e)}), 500

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