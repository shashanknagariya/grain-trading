from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Sale, BagInventory, SaleGodownDetail, db
from datetime import datetime
import re

sale = Blueprint('sale', __name__)

def generate_bill_number():
    # Format: SB-YYYYMMDD-XXXX
    date_part = datetime.now().strftime('%Y%m%d')
    
    # Get the latest bill number for today
    latest_sale = Sale.query.filter(
        Sale.bill_number.like(f'SB-{date_part}-%')
    ).order_by(Sale.bill_number.desc()).first()
    
    if latest_sale:
        # Extract the sequence number and increment
        match = re.search(r'SB-\d{8}-(\d{4})', latest_sale.bill_number)
        if match:
            sequence = int(match.group(1)) + 1
        else:
            sequence = 1
    else:
        sequence = 1
    
    return f'SB-{date_part}-{sequence:04d}'

@sale.route('/sales', methods=['GET'])
@jwt_required()
def get_sales():
    sales = Sale.query.order_by(Sale.created_at.desc()).all()
    return jsonify([{
        'id': sale.id,
        'bill_number': sale.bill_number,
        'grain_name': sale.grain.name,
        'buyer_name': sale.buyer_name,
        'number_of_bags': sale.number_of_bags,
        'total_weight': sale.total_weight,
        'rate_per_kg': sale.rate_per_kg,
        'total_amount': sale.total_amount,
        'sale_date': sale.sale_date.isoformat(),
        'created_at': sale.created_at.isoformat(),
        'payment_status': sale.payment_status
    } for sale in sales])

@sale.route('/sales', methods=['POST'])
@jwt_required()
def create_sale():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['grain_id', 'buyer_name', 'number_of_bags', 
                         'total_weight', 'rate_per_kg', 'godown_details',
                         'transportation_mode', 'vehicle_number', 'driver_name']
        
        if not all(k in data for k in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Begin transaction
        db.session.begin_nested()
        
        try:
            # Convert string numbers to integers
            data['number_of_bags'] = int(data['number_of_bags'])
            data['total_weight'] = float(data['total_weight'])
            data['rate_per_kg'] = float(data['rate_per_kg'])
            
            # Check inventory in each godown
            for godown_detail in data['godown_details']:
                godown_detail['number_of_bags'] = int(godown_detail['number_of_bags'])
                inventory = BagInventory.query.filter_by(
                    grain_id=data['grain_id'],
                    godown_id=godown_detail['godown_id']
                ).with_for_update().first()  # Lock the row for update
                
                if not inventory:
                    raise ValueError(f'No inventory found in godown {godown_detail["godown_id"]}')
                    
                if inventory.number_of_bags < godown_detail['number_of_bags']:
                    raise ValueError(
                        f'Insufficient stock in godown {godown_detail["godown_id"]}. '
                        f'Available: {inventory.number_of_bags}, Requested: {godown_detail["number_of_bags"]}'
                    )

            # Calculate total amount
            total_amount = data['total_weight'] * data['rate_per_kg']
            
            # Create sale record
            sale = Sale(
                bill_number=generate_bill_number(),
                grain_id=data['grain_id'],
                buyer_name=data['buyer_name'],
                number_of_bags=data['number_of_bags'],
                total_weight=data['total_weight'],
                rate_per_kg=data['rate_per_kg'],
                total_amount=total_amount,
                transportation_mode=data['transportation_mode'],
                vehicle_number=data['vehicle_number'],
                driver_name=data['driver_name'],
                lr_number=data.get('lr_number'),
                po_number=data.get('po_number'),
                buyer_gst=data.get('buyer_gst'),
                sale_date=datetime.now()
            )
            
            # Add and flush to get the sale_id
            db.session.add(sale)
            db.session.flush()  # This generates the sale_id
            
            # Now create godown details with the sale_id
            for godown_detail in data['godown_details']:
                # Create sale godown detail
                sale_godown = SaleGodownDetail(
                    sale_id=sale.id,  # Now we have the sale_id
                    godown_id=godown_detail['godown_id'],
                    number_of_bags=godown_detail['number_of_bags']
                )
                db.session.add(sale_godown)
                
                # Update inventory
                inventory = BagInventory.query.filter_by(
                    grain_id=data['grain_id'],
                    godown_id=godown_detail['godown_id']
                ).first()
                
                inventory.remove_bags(godown_detail['number_of_bags'])
            
            # Finally commit everything
            db.session.commit()
            
            return jsonify({
                'message': 'Sale created successfully',
                'bill_number': sale.bill_number
            }), 201
            
        except ValueError as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400
            
    except Exception as e:
        print(f"Error creating sale: {str(e)}")
        return jsonify({'error': 'Failed to create sale'}), 500

@sale.route('/sales/<int:sale_id>', methods=['GET'])
@jwt_required()
def get_sale(sale_id):
    sale = Sale.query.get_or_404(sale_id)
    return jsonify({
        'id': sale.id,
        'bill_number': sale.bill_number,
        'grain_id': sale.grain_id,
        'grain_name': sale.grain.name,
        'buyer_name': sale.buyer_name,
        'number_of_bags': sale.number_of_bags,
        'total_weight': sale.total_weight,
        'rate_per_kg': sale.rate_per_kg,
        'total_amount': sale.total_amount,
        'transportation_mode': sale.transportation_mode,
        'vehicle_number': sale.vehicle_number,
        'driver_name': sale.driver_name,
        'lr_number': sale.lr_number,
        'po_number': sale.po_number,
        'buyer_gst': sale.buyer_gst,
        'sale_date': sale.sale_date.isoformat(),
        'created_at': sale.created_at.isoformat(),
        'payment_status': sale.payment_status
    }) 

@sale.route('/sales/<int:sale_id>/payment-status', methods=['PUT'])
@jwt_required()
def update_payment_status(sale_id):
    try:
        sale = Sale.query.get_or_404(sale_id)
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
            
        if data['status'] not in ['pending', 'paid']:
            return jsonify({'error': 'Invalid status'}), 400
            
        sale.payment_status = data['status']
        db.session.commit()
        
        return jsonify({
            'message': 'Payment status updated successfully',
            'status': sale.payment_status
        })
        
    except Exception as e:
        print(f"Error updating payment status: {str(e)}")
        return jsonify({'error': 'Failed to update payment status'}), 500 