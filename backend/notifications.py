from flask import Blueprint, jsonify, request
from pywebpush import webpush, WebPushException
import json

notifications = Blueprint('notifications', __name__)

# Store subscriptions in memory (use database in production)
push_subscriptions = set()

@notifications.route('/api/notifications/subscribe', methods=['POST'])
def subscribe():
    subscription_info = request.get_json()
    push_subscriptions.add(json.dumps(subscription_info))
    return jsonify({'status': 'success'})

@notifications.route('/api/notifications/unsubscribe', methods=['POST'])
def unsubscribe():
    subscription_info = request.get_json()
    push_subscriptions.remove(json.dumps(subscription_info))
    return jsonify({'status': 'success'})

def send_push_notification(subscription_info, message):
    try:
        webpush(
            subscription_info=json.loads(subscription_info),
            data=json.dumps(message),
            vapid_private_key="your_private_key",
            vapid_claims={
                "sub": "mailto:your@email.com"
            }
        )
    except WebPushException as e:
        print(f"Push notification failed: {e}")
        if e.response and e.response.status_code == 410:
            push_subscriptions.remove(subscription_info) 