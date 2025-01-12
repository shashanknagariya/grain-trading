from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import BagInventory, Grain, Godown, db, Inventory, Sale, Purchase
from sqlalchemy import func
from datetime import datetime

inventory = Blueprint('inventory', __name__)

@inventory.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    try:
        # Query total bags and weight for each grain in each godown, grouped to avoid duplicates
        inventory_items = db.session.query(
            BagInventory.grain_id,
            BagInventory.godown_id,
            Grain.name.label('grain_name'),
            Godown.name.label('godown_name'),
            func.sum(BagInventory.number_of_bags).label('total_bags')
        ).join(
            Grain, BagInventory.grain_id == Grain.id
        ).join(
            Godown, BagInventory.godown_id == Godown.id
        ).group_by(
            BagInventory.grain_id,
            BagInventory.godown_id,
            Grain.name,
            Godown.name
        ).all()

        return jsonify([{
            'id': f"{item.grain_id}-{item.godown_id}",  # Composite ID
            'grain_name': item.grain_name,
            'godown_name': item.godown_name,
            'total_bags': item.total_bags,
            'total_weight': item.total_bags * 100,  # Assuming standard bag weight
            'last_updated': datetime.utcnow().isoformat()
        } for item in inventory_items])

    except Exception as e:
        print(f"Error fetching inventory: {str(e)}")
        return jsonify({'error': 'Failed to fetch inventory'}), 500

@inventory.route('/inventory/<int:grain_id>/history', methods=['GET'])
@jwt_required()
def get_inventory_history(grain_id):
    grain = Grain.query.get_or_404(grain_id)
    purchases = [{
        'type': 'purchase',
        'quantity': p.quantity,
        'date': p.purchase_date.isoformat(),
        'details': f'Purchased from {p.supplier_name}'
    } for p in grain.purchases]
    
    sales = [{
        'type': 'sale',
        'quantity': -s.quantity,
        'date': s.sale_date.isoformat(),
        'details': f'Sold to {s.customer_name}'
    } for s in grain.sales]
    
    history = sorted(purchases + sales, key=lambda x: x['date'], reverse=True)
    
    return jsonify({
        'grain_name': grain.name,
        'current_stock': sum(item['quantity'] for item in history),
        'history': history
    })

@inventory.route('/inventory/low-stock', methods=['GET'])
@jwt_required()
def get_low_stock():
    # Assuming low stock is less than 1000 units
    low_stock_items = Inventory.query.filter(Inventory.quantity < 1000).all()
    return jsonify([{
        'id': item.id,
        'grain_id': item.grain_id,
        'grain_name': item.grain.name,
        'quantity': item.quantity,
        'last_updated': item.last_updated.isoformat()
    } for item in low_stock_items])

@inventory.route('/inventory/check-availability', methods=['POST'])
@jwt_required()
def check_availability():
    try:
        data = request.get_json()
        grain_id = data.get('grain_id')
        godown_details = data.get('godown_details', [])

        if not grain_id or not godown_details:
            return jsonify({'error': 'Missing required fields'}), 400

        # Check each godown's availability
        for detail in godown_details:
            godown_id = detail.get('godown_id')
            requested_bags = detail.get('number_of_bags')

            if not godown_id or not requested_bags:
                return jsonify({'error': 'Invalid godown details'}), 400

            inventory = BagInventory.query.filter_by(
                grain_id=grain_id,
                godown_id=godown_id
            ).first()

            if not inventory or inventory.number_of_bags < requested_bags:
                godown = db.session.get(Godown, godown_id)
                godown_name = godown.name if godown else f"Godown {godown_id}"
                available = inventory.number_of_bags if inventory else 0
                return jsonify({
                    'error': f'Insufficient stock in {godown_name}. Available: {available} bags'
                }), 400

        return jsonify({'message': 'Stock available'}), 200

    except Exception as e:
        print(f"Error checking inventory: {str(e)}")
        return jsonify({'error': 'Failed to check inventory'}), 500

@inventory.route('/inventory/godown-stock/<int:grain_id>', methods=['GET'])
@jwt_required()
def get_godown_stock(grain_id):
    try:
        # Get all godowns first
        godowns = Godown.query.all()
        
        # Get inventory for the specific grain
        inventories = BagInventory.query.filter_by(grain_id=grain_id).all()
        
        # Create a mapping of godown_id to inventory
        inventory_map = {inv.godown_id: inv.number_of_bags for inv in inventories}
        
        # Prepare response with all godowns
        result = [{
            'id': godown.id,
            'name': godown.name,
            'available_bags': inventory_map.get(godown.id, 0)  # Default to 0 if no inventory
        } for godown in godowns]

        return jsonify(result)

    except Exception as e:
        print(f"Error fetching godown stock: {str(e)}")
        return jsonify({'error': 'Failed to fetch godown stock'}), 500

@inventory.route('/inventory/check/<int:grain_id>/<int:godown_id>', methods=['GET'])
@jwt_required()
def check_inventory(grain_id, godown_id):
    try:
        inventory = BagInventory.query.filter_by(
            grain_id=grain_id,
            godown_id=godown_id
        ).first()
        
        if not inventory:
            return jsonify({
                'available': 0,
                'message': 'No inventory found'
            })
            
        return jsonify({
            'available': inventory.number_of_bags,
            'message': f'Available bags: {inventory.number_of_bags}'
        })
        
    except Exception as e:
        print(f"Error checking inventory: {str(e)}")
        return jsonify({'error': 'Failed to check inventory'}), 500

@inventory.route('/inventory/summary', methods=['GET'])
@jwt_required()
def get_inventory_summary():
    try:
        # Get current inventory with grain details and latest rates
        inventory_summary = db.session.query(
            BagInventory,
            Grain,
            db.func.max(Sale.rate_per_kg).label('latest_rate')
        ).join(
            Grain, BagInventory.grain_id == Grain.id
        ).outerjoin(  # Use outer join to include grains without sales
            Sale, BagInventory.grain_id == Sale.grain_id
        ).group_by(
            BagInventory.id,
            Grain.id
        ).all()

        total_bags = 0
        total_value = 0

        result = []
        for inv, grain, latest_rate in inventory_summary:
            # Use latest rate or a default rate if no sales
            rate = latest_rate or 0  # You might want to set a different default
            value = inv.number_of_bags * 100 * rate  # Assuming 100kg per bag

            total_bags += inv.number_of_bags
            total_value += value

            result.append({
                'grain_name': grain.name,
                'number_of_bags': inv.number_of_bags,
                'total_weight': inv.number_of_bags * 100,  # Assuming 100kg per bag
                'rate_per_kg': rate,
                'value': value
            })

        return jsonify({
            'inventory': result,
            'total_bags': total_bags,
            'total_weight': total_bags * 100,  # Assuming 100kg per bag
            'total_value': total_value
        })

    except Exception as e:
        print(f"Error fetching inventory summary: {str(e)}")
        return jsonify({'error': 'Failed to fetch inventory summary'}), 500

@inventory.route('/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    try:
        # Get total pending incoming payments (Sales)
        pending_incoming = db.session.query(
            db.func.sum(Sale.total_amount)
        ).filter(
            Sale.payment_status == 'pending'
        ).scalar() or 0

        # Get total pending outgoing payments (Purchases)
        pending_outgoing = db.session.query(
            db.func.sum(Purchase.total_amount - Purchase.paid_amount)
        ).filter(
            Purchase.payment_status != 'PAID'
        ).scalar() or 0

        # Get current inventory value
        inventory_value = db.session.query(
            db.func.sum(
                BagInventory.number_of_bags * 100 * db.func.coalesce(
                    db.session.query(Sale.rate_per_kg)
                    .filter(Sale.grain_id == BagInventory.grain_id)
                    .order_by(Sale.created_at.desc())
                    .limit(1)
                    .as_scalar(),
                    0
                )
            )
        ).scalar() or 0

        return jsonify({
            'pending_incoming': pending_incoming,
            'pending_outgoing': pending_outgoing,
            'inventory_value': inventory_value
        })

    except Exception as e:
        print(f"Error fetching dashboard summary: {str(e)}")
        return jsonify({'error': 'Failed to fetch dashboard summary'}), 500 