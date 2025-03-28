from flask import jsonify
import openai

def handle_error(error):
    """Handle different types of errors and return appropriate responses"""
    if isinstance(error, openai.error.InvalidRequestError):
        return jsonify({
            'error': 'Invalid request to OpenAI API',
            'details': str(error)
        }), 400
        
    if isinstance(error, openai.error.AuthenticationError):
        return jsonify({
            'error': 'OpenAI API authentication failed',
            'details': 'Please check your API key'
        }), 401
        
    if isinstance(error, openai.error.RateLimitError):
        return jsonify({
            'error': 'OpenAI API rate limit exceeded',
            'details': 'Please try again later'
        }), 429
        
    # Generic error handler
    return jsonify({
        'error': 'An unexpected error occurred',
        'details': str(error)
    }), 500
