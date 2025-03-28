from datetime import datetime
from database import db

class IntermediateBill(db.Model):
    """Model for storing intermediate bills generated from voice input"""
    id = db.Column(db.Integer, primary_key=True)
    bill_type = db.Column(db.String(10), nullable=False)  # 'purchase' or 'sale'
    raw_transcript = db.Column(db.Text, nullable=False)
    parsed_data = db.Column(db.JSON, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, approved, error
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    created_by = db.relationship('User', backref=db.backref('intermediate_bills', lazy=True))

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'bill_type': self.bill_type,
            'raw_transcript': self.raw_transcript,
            'parsed_data': self.parsed_data,
            'status': self.status,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'created_by_id': self.created_by_id
        }

    @classmethod
    def cleanup_old_records(cls, retention_hours=24):
        """Delete old intermediate bills that are no longer needed"""
        cutoff_time = datetime.utcnow() - timedelta(hours=retention_hours)
        cls.query.filter(
            cls.created_at < cutoff_time,
            cls.status.in_(['approved', 'error'])
        ).delete()
        db.session.commit()
