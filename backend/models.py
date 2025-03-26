from extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from enum import Enum
from sqlalchemy import func

class Role(str, Enum):
    ADMIN = 'admin'
    MANAGER = 'manager'
    STAFF = 'staff'

class Permission(str, Enum):
    READ_ALL = 'read:all'
    WRITE_ALL = 'write:all'
    MANAGE_USERS = 'manage:users'
    MANAGE_INVENTORY = 'manage:inventory'
    MAKE_PURCHASE = 'make:purchase'
    EDIT_PURCHASE = 'edit:purchase'
    DELETE_PURCHASE = 'delete:purchase'
    MAKE_SALE = 'make:sale'
    EDIT_SALE = 'edit:sale'
    DELETE_SALE = 'delete:sale'
    VIEW_REPORTS = 'view:reports'

# Define role permissions
ROLE_PERMISSIONS = {
    Role.ADMIN: [perm.value for perm in Permission],
    Role.MANAGER: [
        Permission.READ_ALL.value,
        Permission.MANAGE_INVENTORY.value,
        Permission.MAKE_PURCHASE.value,
        Permission.EDIT_PURCHASE.value,
        Permission.DELETE_PURCHASE.value,
        Permission.MAKE_SALE.value,
        Permission.EDIT_SALE.value,
        Permission.DELETE_SALE.value,
        Permission.VIEW_REPORTS.value
    ],
    Role.STAFF: [
        Permission.READ_ALL.value,
        Permission.MAKE_SALE.value
    ]
}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    role = db.Column(db.String(20), nullable=False, default=Role.STAFF.value)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reset_token = db.Column(db.String(100), unique=True)
    reset_token_expires = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @property
    def permissions(self):
        return ROLE_PERMISSIONS.get(Role(self.role.lower()), [])
    
    def has_permission(self, permission):
        return permission in self.permissions

class Grain(db.Model):
    __tablename__ = 'grains'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PaymentStatus(str, Enum):
    PENDING = 'pending'
    PARTIALLY_PAID = 'partially_paid'
    PAID = 'paid'

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    grain_id = db.Column(db.Integer, db.ForeignKey('grains.id', name='fk_purchase_grain'), nullable=False)
    godown_id = db.Column(db.Integer, db.ForeignKey('godowns.id', name='fk_purchase_godown'), nullable=False)
    bill_number = db.Column(db.String(50), unique=True, nullable=False)
    number_of_bags = db.Column(db.Integer, nullable=False)
    weight_per_bag = db.Column(db.Float, nullable=False)  # in kg
    extra_weight = db.Column(db.Float, default=0)  # in kg
    rate_per_kg = db.Column(db.Float, nullable=False)
    total_weight = db.Column(db.Float, nullable=False)  # Calculated field
    total_amount = db.Column(db.Float, nullable=False)  # Calculated field
    payment_status = db.Column(db.String(20), nullable=False, default=PaymentStatus.PENDING.value)
    paid_amount = db.Column(db.Float, default=0)
    supplier_name = db.Column(db.String(200), nullable=False)
    purchase_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    grain = db.relationship('Grain', backref='purchases')
    godown = db.relationship('Godown', backref='purchases')
    payment_history = db.relationship('PaymentHistory', backref='purchase', lazy='dynamic')

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    grain_id = db.Column(db.Integer, db.ForeignKey('grains.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    
    grain = db.relationship('Grain', backref='inventory')

class Sale(db.Model):
    __tablename__ = 'sale'
    
    id = db.Column(db.Integer, primary_key=True)
    bill_number = db.Column(db.String(20), unique=True, nullable=False)
    grain_id = db.Column(db.Integer, db.ForeignKey('grains.id'), nullable=False)
    buyer_name = db.Column(db.String(100), nullable=False)
    number_of_bags = db.Column(db.Integer, nullable=False)
    total_weight = db.Column(db.Float, nullable=False)  # Total weight in kg
    rate_per_kg = db.Column(db.Float, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    transportation_mode = db.Column(db.String(50), nullable=False)
    vehicle_number = db.Column(db.String(20), nullable=False)
    driver_name = db.Column(db.String(100), nullable=False)
    lr_number = db.Column(db.String(50))
    po_number = db.Column(db.String(50))
    buyer_gst = db.Column(db.String(20))
    sale_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    payment_status = db.Column(db.String(20), default='pending')
    
    grain = db.relationship('Grain', backref='sales')
    godown_details = db.relationship('SaleGodownDetail', 
                                   backref='sale',
                                   cascade='all, delete-orphan',
                                   foreign_keys='SaleGodownDetail.sale_id')

class SaleGodownDetail(db.Model):
    __tablename__ = 'sale_godown_detail'
    
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sale.id', name='fk_salegodowndetail_sale'), nullable=False)
    godown_id = db.Column(db.Integer, db.ForeignKey('godowns.id', name='fk_salegodowndetail_godown'), nullable=False)
    number_of_bags = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    godown = db.relationship('Godown', backref='sale_details')

class Godown(db.Model):
    __tablename__ = 'godowns'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    capacity = db.Column(db.Integer)  # Total bag capacity
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class BagInventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    godown_id = db.Column(db.Integer, db.ForeignKey('godowns.id', name='fk_baginventory_godown'), nullable=False)
    grain_id = db.Column(db.Integer, db.ForeignKey('grains.id', name='fk_baginventory_grain'), nullable=False)
    number_of_bags = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Add unique constraint
    __table_args__ = (
        db.UniqueConstraint('grain_id', 'godown_id', name='uq_grain_godown'),
    )
    
    godown = db.relationship('Godown', backref='bag_inventory')
    grain = db.relationship('Grain', backref='bag_inventory')

    def add_bags(self, number_of_bags):
        """Add bags to inventory"""
        self.number_of_bags += number_of_bags
        self.last_updated = datetime.utcnow()

    def remove_bags(self, number_of_bags):
        """Remove bags from inventory"""
        if self.number_of_bags < number_of_bags:
            raise ValueError(f"Insufficient stock. Available: {self.number_of_bags}, Requested: {number_of_bags}")
        self.number_of_bags -= number_of_bags
        self.last_updated = datetime.utcnow()

class PaymentHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column(db.Integer, db.ForeignKey('purchase.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    payment_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 