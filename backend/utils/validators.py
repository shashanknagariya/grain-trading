import os
from werkzeug.utils import secure_filename

def validate_audio_file(file):
    """Validate audio file format and size"""
    if not file:
        return False

    # Get allowed formats from env
    allowed_formats = os.getenv('ALLOWED_AUDIO_FORMATS', 'wav,mp3,ogg').split(',')
    max_size_mb = int(os.getenv('MAX_AUDIO_FILE_SIZE_MB', 10))

    # Check filename and extension
    filename = secure_filename(file.filename)
    if not filename or '.' not in filename:
        return False
    
    extension = filename.rsplit('.', 1)[1].lower()
    if extension not in allowed_formats:
        return False

    # Check file size
    file.seek(0, os.SEEK_END)
    size_mb = file.tell() / (1024 * 1024)  # Convert to MB
    file.seek(0)  # Reset file pointer
    
    if size_mb > max_size_mb:
        return False

    return True
