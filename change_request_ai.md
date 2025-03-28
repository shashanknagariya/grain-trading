# Change Request: Voice-Activated Bill Creation Feature

## Objective
Add a new sidebar menu option in the portal to enable users to create purchase and sales bills through voice input. This feature is specifically designed to assist users who are not proficient in typing by allowing them to speak their bill details in Hindi. 

## Feature Overview
1. **Voice Input Activation**: Users can click on a new sidebar menu option labeled "Voice Bill Creation" to start recording their instructions.
2. **Speech-to-Text Conversion**: The recorded Hindi voice will be sent to the backend, where OpenAI Whisper API will transcribe it into text.
3. **Text Parsing to JSON**: The transcribed text will be processed using the OpenAI API to convert it into a structured JSON object.
4. **Intermediate Bill Storage**: The parsed JSON will be stored in an intermediate table and returned to the frontend as an API response.
5. **User Review and Approval**: Users can review the intermediate bill and either approve it for final bill creation or edit it before approval.

## User Flow
1. User clicks the "Voice Bill Creation" option in the sidebar.
2. User speaks the bill details in Hindi.
3. Voice input is sent to the backend for transcription and parsing.
4. The backend returns a structured JSON object.
5. The frontend displays the intermediate bill for review.
6. If correct, the user approves the bill; otherwise, the user edits and then approves it.
7. Approved bills are created using existing purchase and sales bill creation APIs.

## Example Input and Output

### Voice Input Example
```
matadin sahu se 20 bori genhu liya, bharti 60 kilo, dar 35. field godam me utra hai.
```

### Parsed JSON for Purchase Bill
```json
{
  "bill_type": "purchase",
  "grain_name": "गेहूँ",
  "supplier_name": "मातादीन साहू",
  "number_of_bags": 20,
  "weight_per_bag": 60,
  "rate_per_kg": 35,
  "godown_name": "फील्ड गोदाम"
}
```

### Purchase Bill API Request
```json
{
  "bill_number": "PB-20250328-0002",
  "extra_weight": 0,
  "grain_name": "गेहूँ",
  "id": 4,
  "number_of_bags": 20,
  "paid_amount": 0,
  "payment_status": "pending",
  "purchase_date": "2025-03-28T16:41:42.459000+00:00",
  "rate_per_kg": 35,
  "supplier_name": "मातादीन साहू",
  "total_amount": 42000,
  "total_weight": 1200,
  "weight_per_bag": 60
}
```

### Purchase Bill API Response
```json
{
  "bill_number": "PB-20250328-0002",
  "extra_weight": 0.0,
  "grain_name": "गेहूँ",
  "id": 4,
  "number_of_bags": 20,
  "paid_amount": 0.0,
  "payment_status": "pending",
  "purchase_date": "2025-03-28T16:41:42.459000+00:00",
  "rate_per_kg": 35,
  "supplier_name": "मातादीन साहू",
  "total_amount": 42000,
  "total_weight": 1200.0,
  "weight_per_bag": 60.0
}
```

### Parsed JSON for Sales Bill
```json
{
  "bill_type": "sales",
  "grain_id": 1,
  "buyer_name": "pharma and company",
  "godown_details": [],
  "total_weight": "200.33",
  "rate_per_kg": "41",
  "transportation_mode": "truck",
  "vehicle_number": "MP14H3434",
  "driver_name": "manoj",
  "lr_number": "",
  "po_number": "",
  "buyer_gst": "23ABC234dldsasc",
  "number_of_bags": "400"
}
```

### Sales Bill API Request
```json
{
  "grain_id": 1,
  "buyer_name": "pharma and company",
  "godown_details": [],
  "total_weight": "200.33",
  "rate_per_kg": "41",
  "transportation_mode": "truck",
  "vehicle_number": "MP14H3434",
  "driver_name": "manoj",
  "lr_number": "",
  "po_number": "",
  "buyer_gst": "23ABC234dldsasc",
  "number_of_bags": "400"
}
```

### Sales Bill API Response
```json
{
  "bill_number": "SB-20250328-0003",
  "id": 4,
  "message": "Sale created successfully"
}
```

## Technical Requirements
1. **Frontend**
   - Add a new sidebar menu option labeled "Voice Bill Creation".
   - Implement voice recording functionality.
   - Display intermediate bills for review and editing.
   - Trigger bill creation APIs based on user approval.

2. **Backend**
   - Integrate OpenAI Whisper API for speech-to-text.
   - Parse the transcribed text to JSON using OpenAI API.
   - Store parsed JSON in an intermediate table.
   - Return intermediate bill data to the frontend.
   - Use existing purchase and sales bill creation APIs.


## Risks and Mitigation
1. **Accuracy of Speech Recognition**: Ensure robust parsing for better accuracy.
2. **Edge Cases**: Validate with various Hindi dialects and speech patterns.

## Conclusion
This feature will simplify the bill creation process for users with limited typing abilities by leveraging voice input and AI parsing.

