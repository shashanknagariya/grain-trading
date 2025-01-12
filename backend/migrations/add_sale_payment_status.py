"""Add payment status to sales

Revision ID: xxx
Revises: xxx
Create Date: 2024-01-12 xx:xx:xx.xxx

"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('sale', sa.Column('payment_status', sa.String(20), server_default='pending'))

def downgrade():
    op.drop_column('sale', 'payment_status') 