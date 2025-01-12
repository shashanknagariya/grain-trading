import click
from flask.cli import with_appcontext
from models import User, Role, Grain, db, Godown, BagInventory

@click.command('create-admin')
@with_appcontext
def create_admin():
    """Create an admin user and basic grains"""
    try:
        # Create admin user
        admin = User(
            username='admin',
            email='admin@example.com',
            role=Role.ADMIN.value
        )
        admin.set_password('admin123')
        db.session.add(admin)

        # Create basic grains without variety
        basic_grains = [
            Grain(name='Wheat'),
            Grain(name='Rice'),
            Grain(name='Corn'),
            Grain(name='Barley')
        ]
        
        db.session.bulk_save_objects(basic_grains)
        db.session.commit()

        print('Admin user and basic grains created successfully')
        
    except Exception as e:
        db.session.rollback()
        print(f'Error creating admin: {str(e)}')

@click.command('init-inventory')
@with_appcontext
def init_inventory():
    """Initialize inventory for testing"""
    try:
        # Get first grain and godown
        grain = Grain.query.first()
        godown = Godown.query.first()
        
        if not grain or not godown:
            print("Please create grain and godown first")
            return
            
        # Create inventory
        inventory = BagInventory(
            grain_id=grain.id,
            godown_id=godown.id,
            number_of_bags=100  # Initialize with 100 bags
        )
        
        db.session.add(inventory)
        db.session.commit()
        
        print(f"Initialized inventory: {inventory.number_of_bags} bags of {grain.name} in godown {godown.name}")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing inventory: {str(e)}")

@click.command('init-test-data')
@with_appcontext
def init_test_data():
    """Initialize test data including grains, godowns, and inventory"""
    try:
        # Create grains if they don't exist
        grains = [
            Grain(name='Wheat'),
            Grain(name='Rice'),
            Grain(name='Corn'),
            Grain(name='Barley')
        ]
        for grain in grains:
            if not Grain.query.filter_by(name=grain.name).first():
                db.session.add(grain)
        
        # Create godowns if they don't exist
        godowns = [
            Godown(name='Godown A', location='Location A', capacity=1000),
            Godown(name='Godown B', location='Location B', capacity=1500)
        ]
        for godown in godowns:
            if not Godown.query.filter_by(name=godown.name).first():
                db.session.add(godown)
        
        db.session.commit()
        
        # Get all grains and godowns
        all_grains = Grain.query.all()
        all_godowns = Godown.query.all()
        
        # Create inventory entries
        for grain in all_grains:
            for godown in all_godowns:
                # Check if inventory already exists
                existing = BagInventory.query.filter_by(
                    grain_id=grain.id,
                    godown_id=godown.id
                ).first()
                
                if not existing:
                    inventory = BagInventory(
                        grain_id=grain.id,
                        godown_id=godown.id,
                        number_of_bags=100  # Initialize with 100 bags
                    )
                    db.session.add(inventory)
        
        db.session.commit()
        print("Test data initialized successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing test data: {str(e)}")

@click.command('cleanup-inventory')
@with_appcontext
def cleanup_inventory():
    """Clean up duplicate inventory entries"""
    try:
        # Get all inventory entries
        inventory_items = BagInventory.query.all()
        
        # Create a dictionary to track unique grain-godown combinations
        unique_entries = {}
        duplicates = []
        
        for item in inventory_items:
            key = (item.grain_id, item.godown_id)
            if key in unique_entries:
                # If entry exists, merge the bags and mark for deletion
                unique_entries[key].number_of_bags += item.number_of_bags
                duplicates.append(item)
            else:
                unique_entries[key] = item
        
        # Delete duplicate entries
        for duplicate in duplicates:
            db.session.delete(duplicate)
        
        db.session.commit()
        print(f"Cleaned up {len(duplicates)} duplicate entries")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error cleaning up inventory: {str(e)}")

def init_commands(app):
    app.cli.add_command(create_admin)
    app.cli.add_command(init_inventory)
    app.cli.add_command(init_test_data)
    app.cli.add_command(cleanup_inventory) 