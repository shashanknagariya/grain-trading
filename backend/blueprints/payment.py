from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Purchase, PaymentHistory, PaymentStatus
from utils.permissions import require_permission
from models import Permission
from datetime import datetime

payment = Blueprint('payment', __name__)

@payment.route('/purchases/<int:purchase_id>/payment-status', methods=['PUT'])
@jwt_required()
@require_permission(Permission.MANAGE_INVENTORY.value)
def update_payment_status(purchase_id):
    try:
        data = request.get_json()
        purchase = Purchase.query.get_or_404(purchase_id)
        new_status = data.get('status')
        amount = data.get('amount', 0)
        description = data.get('description', '')

        if new_status not in [status.value for status in PaymentStatus]:
            return jsonify({'error': 'Invalid payment status'}), 400

        # Validate amount for partially paid status
        if new_status == PaymentStatus.PARTIALLY_PAID.value:
            if not amount or amount <= 0:
                return jsonify({'error': 'Amount is required for partially paid status'}), 400
            if amount >= purchase.total_amount:
                return jsonify({'error': 'Amount should be less than total for partially paid status'}), 400

        # Handle paid status
        if new_status == PaymentStatus.PAID.value:
            amount = purchase.total_amount - purchase.paid_amount

        # Create payment history entry
        if amount > 0:
            payment_history = PaymentHistory(
                purchase_id=purchase.id,
                amount=amount,
                description=description,
                payment_date=datetime.utcnow()
            )
            db.session.add(payment_history)
            purchase.paid_amount += amount

        purchase.payment_status = new_status
        db.session.commit()

        return jsonify({
            'message': 'Payment status updated successfully',
            'status': new_status,
            'paid_amount': purchase.paid_amount
        })

    except Exception as e:
        print(f"Error updating payment status: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update payment status'}), 500

@payment.route('/purchases/<int:purchase_id>/payments', methods=['GET'])
@jwt_required()
def get_payment_history(purchase_id):
    try:
        purchase = Purchase.query.get_or_404(purchase_id)
        payments = purchase.payment_history.order_by(PaymentHistory.payment_date.desc()).all()
        
        return jsonify([{
            'id': payment.id,
            'amount': payment.amount,
            'description': payment.description,
            'payment_date': payment.payment_date.isoformat(),
            'created_at': payment.created_at.isoformat()
        } for payment in payments])

    except Exception as e:
        print(f"Error fetching payment history: {str(e)}")
        return jsonify({'error': 'Failed to fetch payment history'}), 500 