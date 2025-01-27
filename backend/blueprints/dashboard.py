from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import Sale, Purchase, Inventory, Grain, db
from sqlalchemy import func
from datetime import datetime, timedelta

dashboard = Blueprint('dashboard', __name__)

@dashboard.route('/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    try:
        # Get current date and start of month
        today = datetime.utcnow()
        start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Monthly sales
        monthly_sales = db.session.query(
            func.sum(Sale.total_amount).label('total_amount'),
            func.count(Sale.id).label('count')
        ).filter(Sale.sale_date >= start_of_month).first()

        # Monthly purchases
        monthly_purchases = db.session.query(
            func.sum(Purchase.total_amount).label('total_amount'),
            func.count(Purchase.id).label('count')
        ).filter(Purchase.purchase_date >= start_of_month).first()

        # Current inventory value
        inventory_value = db.session.query(
            func.sum(Inventory.quantity * Purchase.rate_per_kg).label('total_value')
        ).join(
            Purchase, Purchase.grain_id == Inventory.grain_id
        ).first()

        # Recent transactions
        recent_sales = Sale.query.order_by(Sale.created_at.desc()).limit(5).all()
        recent_purchases = Purchase.query.order_by(Purchase.created_at.desc()).limit(5).all()

        return jsonify({
            'monthly_sales': {
                'amount': float(monthly_sales.total_amount or 0),
                'count': monthly_sales.count or 0
            },
            'monthly_purchases': {
                'amount': float(monthly_purchases.total_amount or 0),
                'count': monthly_purchases.count or 0
            },
            'inventory_value': float(inventory_value.total_value or 0),
            'recent_sales': [{
                'id': sale.id,
                'bill_number': sale.bill_number,
                'buyer_name': sale.buyer_name,
                'amount': sale.total_amount,
                'date': sale.sale_date.isoformat()
            } for sale in recent_sales],
            'recent_purchases': [{
                'id': purchase.id,
                'bill_number': purchase.bill_number,
                'supplier_name': purchase.supplier_name,
                'amount': purchase.total_amount,
                'date': purchase.purchase_date.isoformat()
            } for purchase in recent_purchases]
        })

    except Exception as e:
        print(f"Dashboard Error: {str(e)}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500 