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
from models import Purchase, Sale, SaleGodownDetail

voice_bill = Blueprint('voice_bill', __name__)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')
WHISPER_MODEL = os.getenv('OPENAI_WHISPER_MODEL', 'whisper-1')
GPT_MODEL = os.getenv('OPENAI_GPT_MODEL', 'gpt-4-turbo-preview')

# System prompt template for GPT
SYSTEM_PROMPT_TEMPLATE = """
You are a helpful assistant that extracts structured information from Hindi voice transcripts for {bill_type} bills in a grain trading business.
The transcript will contain details about a {bill_type} transaction.

Required fields to extract:
{fields}

Additional context:
- Valid godown names: {godowns}
- All numbers should be extracted as numeric values
- Dates should be in YYYY-MM-DD format
- Currency values should be in INR without symbols

Please format your response as a valid JSON object with the required fields.
Example format:
{{
    "field_name": "value",
    "numeric_field": 123,
    "date_field": "2024-03-28"
}}

If any required field is missing or unclear in the transcript, set its value to null.
"""

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
        if bill.created_by_id != get_jwt_identity():
            return jsonify({'error': 'Unauthorized'}), 403
            
        db.session.delete(bill)
        db.session.commit()
        return jsonify({'message': 'Bill deleted successfully'}), 200
    except Exception as e:
        return handle_error(e)

@voice_bill.route('/api/voice-bills/<int:bill_id>/approve', methods=['POST'])
@jwt_required()
def approve_voice_bill(bill_id):
    """Approve and create final bill from intermediate bill"""
    try:
        bill = IntermediateBill.query.get_or_404(bill_id)
        if bill.created_by_id != get_jwt_identity():
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = bill.parsed_data
        
        # Create final bill based on type
        if bill.bill_type == 'purchase':
            final_bill = create_purchase_bill(data)
        else:
            final_bill = create_sale_bill(data)
            
        # Mark intermediate bill as approved
        bill.status = 'approved'
        db.session.commit()
        
        return jsonify(final_bill.to_dict()), 200
    except Exception as e:
        return handle_error(e)

def create_purchase_bill(data):
    """Create purchase bill from parsed data"""
    # Find grain and godown
    grain = Grain.query.filter_by(name=data['grain_name']).first()
    if not grain:
        raise ValueError(f"Invalid grain name: {data['grain_name']}")
        
    godown = Godown.query.filter_by(name=data['godown_name']).first()
    if not godown:
        raise ValueError(f"Invalid godown name: {data['godown_name']}")
    
    # Calculate total weight and amount
    total_weight = data['number_of_bags'] * data['weight_per_bag']
    total_amount = total_weight * data['rate_per_kg']
    
    # Create purchase bill
    purchase = Purchase(
        grain_id=grain.id,
        godown_id=godown.id,
        supplier_name=data['supplier_name'],
        number_of_bags=data['number_of_bags'],
        weight_per_bag=data['weight_per_bag'],
        rate_per_kg=data['rate_per_kg'],
        total_weight=total_weight,
        total_amount=total_amount,
        purchase_date=datetime.utcnow(),
        payment_status='pending'
    )
    
    db.session.add(purchase)
    db.session.commit()
    
    return purchase

def create_sale_bill(data):
    """Create sale bill from parsed data"""
    # Find grain
    grain = Grain.query.filter_by(name=data['grain_name']).first()
    if not grain:
        raise ValueError(f"Invalid grain name: {data['grain_name']}")
    
    # Calculate total weight and amount
    total_weight = data['number_of_bags'] * data['weight_per_bag']
    total_amount = total_weight * data['rate_per_kg']
    
    # Create sale bill
    sale = Sale(
        grain_id=grain.id,
        buyer_name=data['buyer_name'],
        number_of_bags=data['number_of_bags'],
        total_weight=total_weight,
        rate_per_kg=data['rate_per_kg'],
        total_amount=total_amount,
        transportation_mode=data['transportation_mode'],
        vehicle_number=data['vehicle_number'],
        driver_name=data['driver_name'],
        lr_number=data.get('lr_number'),
        po_number=data.get('po_number'),
        buyer_gst=data.get('buyer_gst'),
        sale_date=datetime.utcnow(),
        payment_status='pending'
    )
    
    db.session.add(sale)
    db.session.commit()
    
    # Add godown details
    for godown_detail in data['godown_details']:
        godown = Godown.query.filter_by(name=godown_detail['name']).first()
        if not godown:
            raise ValueError(f"Invalid godown name: {godown_detail['name']}")
            
        sale_godown = SaleGodownDetail(
            sale_id=sale.id,
            godown_id=godown.id,
            number_of_bags=godown_detail['bags']
        )
        db.session.add(sale_godown)
    
    db.session.commit()
    return sale
