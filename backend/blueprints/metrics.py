from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import Purchase, Sale, BagInventory, db
from sqlalchemy import func
from datetime import datetime, timedelta

metrics = Blueprint('metrics', __name__)

@metrics.route('/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    try:
        # Get current date for time-based calculations
        current_date = datetime.utcnow()
        thirty_days_ago = current_date - timedelta(days=30)

        # Calculate total purchases and sales
        total_purchases = db.session.query(func.sum(Purchase.total_amount)).scalar() or 0
        total_sales = db.session.query(func.sum(Sale.total_amount)).scalar() or 0

        # Get total inventory (sum of all bags)
        total_inventory = db.session.query(func.sum(BagInventory.number_of_bags)).scalar() or 0

        # Get recent purchases (last 30 days)
        recent_purchases = db.session.query(
            Purchase.id,
            Purchase.bill_number,
            Purchase.supplier_name,
            Purchase.total_amount,
            Purchase.purchase_date
        ).filter(
            Purchase.purchase_date >= thirty_days_ago
        ).order_by(Purchase.purchase_date.desc()).limit(5).all()

        # Get recent sales (last 30 days)
        recent_sales = db.session.query(
            Sale.id,
            Sale.bill_number,
            Sale.buyer_name,
            Sale.total_amount,
            Sale.sale_date
        ).filter(
            Sale.sale_date >= thirty_days_ago
        ).order_by(Sale.sale_date.desc()).limit(5).all()

        # Get inventory summary
        inventory_summary = db.session.query(
            BagInventory.grain_id,
            func.sum(BagInventory.number_of_bags).label('total_bags')
        ).group_by(BagInventory.grain_id).all()

        return jsonify({
            'totalPurchases': float(total_purchases),
            'totalSales': float(total_sales),
            'totalInventory': int(total_inventory),
            'totalRevenue': float(total_sales - total_purchases),
            'recentPurchases': [{
                'id': p.id,
                'billNumber': p.bill_number,
                'supplierName': p.supplier_name,
                'amount': float(p.total_amount),
                'date': p.purchase_date.isoformat()
            } for p in recent_purchases],
            'recentSales': [{
                'id': s.id,
                'billNumber': s.bill_number,
                'buyerName': s.buyer_name,
                'amount': float(s.total_amount),
                'date': s.sale_date.isoformat()
            } for s in recent_sales],
            'inventorySummary': [{
                'grainId': i.grain_id,
                'totalBags': int(i.total_bags)
            } for i in inventory_summary]
        })
    except Exception as e:
        print(f"Error fetching metrics: {str(e)}")
        return jsonify({'error': 'Failed to fetch metrics'}), 500
