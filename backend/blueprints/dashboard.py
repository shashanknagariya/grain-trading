from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models import Sale, Purchase, Inventory, Grain, db
from sqlalchemy import func
from datetime import datetime, timedelta

dashboard = Blueprint('dashboard', __name__)

@dashboard.route('/dashboard/metrics', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_dashboard_metrics():
    # Handle OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Get total sales
        total_sales = db.session.query(
            func.sum(Sale.total_amount).label('total_amount')
        ).scalar() or 0

        # Get total purchases
        total_purchases = db.session.query(
            func.sum(Purchase.total_amount).label('total_amount')
        ).scalar() or 0

        # Get total inventory
        total_inventory = db.session.query(
            func.sum(Inventory.quantity).label('total_quantity')
        ).scalar() or 0

        # Get inventory by grain type for chart
        inventory_by_grain = db.session.query(
            Grain.name,
            func.sum(Inventory.quantity).label('quantity')
        ).join(
            Inventory, Inventory.grain_id == Grain.id
        ).group_by(
            Grain.name
        ).all()

        chart_data = {
            'labels': [item[0] for item in inventory_by_grain],
            'datasets': [{
                'label': 'Inventory by Grain',
                'data': [float(item[1]) for item in inventory_by_grain],
                'backgroundColor': [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        }

        return jsonify({
            'metrics': {
                'totalSales': float(total_sales),
                'totalPurchases': float(total_purchases),
                'inventory': float(total_inventory)
            },
            'chartData': chart_data
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
                'buyer_name': sale.buyer_name,
                'amount': float(sale.total_amount),
                'date': sale.sale_date.isoformat()
            } for sale in recent_sales],
            'recent_purchases': [{
                'id': purchase.id,
                'seller_name': purchase.seller_name,
                'amount': float(purchase.total_amount),
                'date': purchase.purchase_date.isoformat()
            } for purchase in recent_purchases]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500