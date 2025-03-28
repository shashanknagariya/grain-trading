import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import openai
from werkzeug.utils import secure_filename
from models.intermediate_bill import IntermediateBill
from models.godown import Godown
from models.grain import Grain
from database import db
from utils.error_handlers import handle_error
from utils.validators import validate_audio_file

voice_bill = Blueprint('voice_bill', __name__)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')
WHISPER_MODEL = os.getenv('OPENAI_WHISPER_MODEL', 'whisper-1')
GPT_MODEL = os.getenv('OPENAI_GPT_MODEL', 'gpt-4-turbo-preview')
SYSTEM_PROMPT_TEMPLATE = os.getenv('SYSTEM_PROMPT_TEMPLATE')

def get_valid_godowns():
    """Get list of valid godown names for prompt"""
    godowns = Godown.query.all()
    return [g.name for g in godowns]

def get_valid_grains():
    """Get list of valid grain names for prompt"""
    grains = Grain.query.all()
    return [g.name for g in grains]

def get_field_list(bill_type):
    """Get list of required fields based on bill type"""
    common_fields = ['number_of_bags', 'weight_per_bag', 'rate_per_kg']
    if bill_type == 'purchase':
        return common_fields + ['supplier_name', 'godown_name']
    else:
        return common_fields + [
            'buyer_name', 'godown_details', 'buyer_gst',
            'transportation_mode', 'vehicle_number',
            'driver_name', 'lr_number', 'po_number'
        ]

@voice_bill.route('/api/voice-bills', methods=['POST'])
@jwt_required()
def create_voice_bill():
    """Create a new intermediate bill from voice input"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        bill_type = request.form.get('bill_type', 'purchase')
        
        # Validate audio file
        if not validate_audio_file(audio_file):
            return jsonify({'error': 'Invalid audio file'}), 400

        # Get audio transcript using Whisper API
        transcript = openai.Audio.transcribe(
            model=WHISPER_MODEL,
            file=audio_file,
            response_format="text"
        )

        # Prepare prompt for GPT
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            bill_type=bill_type,
            fields=", ".join(get_field_list(bill_type)),
            godowns=", ".join(get_valid_godowns())
        )

        # Parse transcript using GPT
        completion = openai.ChatCompletion.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript}
            ]
        )

        parsed_data = completion.choices[0].message.content

        # Create intermediate bill
        intermediate_bill = IntermediateBill(
            bill_type=bill_type,
            raw_transcript=transcript,
            parsed_data=parsed_data,
            created_by_id=get_jwt_identity()
        )
        db.session.add(intermediate_bill)
        db.session.commit()

        return jsonify(intermediate_bill.to_dict()), 201

    except Exception as e:
        return handle_error(e)

@voice_bill.route('/api/voice-bills/<int:bill_id>', methods=['DELETE'])
@jwt_required()
def delete_voice_bill(bill_id):
    """Delete an intermediate bill"""
    try:
        bill = IntermediateBill.query.get_or_404(bill_id)
        db.session.delete(bill)
        db.session.commit()
        return jsonify({'message': 'Intermediate bill deleted'}), 200
    except Exception as e:
        return handle_error(e)

@voice_bill.route('/api/voice-bills/<int:bill_id>/approve', methods=['POST'])
@jwt_required()
def approve_voice_bill(bill_id):
    """Approve and create final bill from intermediate bill"""
    try:
        bill = IntermediateBill.query.get_or_404(bill_id)
        
        # Create actual bill based on type
        if bill.bill_type == 'purchase':
            response = create_purchase_bill(bill.parsed_data)
        else:
            response = create_sale_bill(bill.parsed_data)

        # Mark intermediate bill as approved
        bill.status = 'approved'
        db.session.commit()

        return jsonify(response), 200

    except Exception as e:
        bill.status = 'error'
        bill.error_message = str(e)
        db.session.commit()
        return handle_error(e)

def create_purchase_bill(data):
    """Create purchase bill from parsed data"""
    # Call existing purchase bill creation API
    response = requests.post(
        f"{request.host_url}api/purchases",
        json=data,
        headers={'Authorization': request.headers.get('Authorization')}
    )
    return response.json()

def create_sale_bill(data):
    """Create sale bill from parsed data"""
    # Call existing sale bill creation API
    response = requests.post(
        f"{request.host_url}api/sales",
        json=data,
        headers={'Authorization': request.headers.get('Authorization')}
    )
    return response.json()
