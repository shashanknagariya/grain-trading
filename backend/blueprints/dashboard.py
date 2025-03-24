from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models import Sale, Purchase, Inventory, Grain, db
from sqlalchemy import func
from datetime import datetime, timedelta

dashboard = Blueprint('dashboard', __name__)

@dashboard.route('/dashboard/metrics', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
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

        # Get active grains count
        active_grains = db.session.query(func.count(Grain.id)).scalar() or 0

        # Get monthly data for chart
        now = datetime.now()
        start_date = now - timedelta(days=180)  # Last 6 months

        monthly_sales = db.session.query(
            func.strftime('%Y-%m', Sale.created_at).label('month'),
            func.sum(Sale.total_amount).label('amount')
        ).filter(
            Sale.created_at >= start_date
        ).group_by(
            func.strftime('%Y-%m', Sale.created_at)
        ).all()

        monthly_purchases = db.session.query(
            func.strftime('%Y-%m', Purchase.created_at).label('month'),
            func.sum(Purchase.total_amount).label('amount')
        ).filter(
            Purchase.created_at >= start_date
        ).group_by(
            func.strftime('%Y-%m', Purchase.created_at)
        ).all()

        # Format data for response
        metrics = {
            'total_sales': total_sales,
            'total_purchases': total_purchases,
            'total_inventory': total_inventory,
            'active_grains': active_grains
        }

        chart_data = {
            'labels': [],
            'datasets': [
                {
                    'label': 'Sales',
                    'data': []
                },
                {
                    'label': 'Purchases',
                    'data': []
                }
            ]
        }

        # Process monthly data
        months = set()
        sales_dict = {sale[0]: sale[1] for sale in monthly_sales}
        purchases_dict = {purchase[0]: purchase[1] for purchase in monthly_purchases}

        # Get all months
        months.update([sale[0] for sale in monthly_sales])
        months.update([purchase[0] for purchase in monthly_purchases])
        months = sorted(list(months))

        # Fill in chart data
        chart_data['labels'] = months
        for month in months:
            chart_data['datasets'][0]['data'].append(sales_dict.get(month, 0))
            chart_data['datasets'][1]['data'].append(purchases_dict.get(month, 0))

        return jsonify({
            'metrics': metrics,
            'chartData': chart_data
        })

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