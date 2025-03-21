from app import app
from extensions import db
from models import User, Role

def create_admin_user():
    with app.app_context():
        try:
            # Check if admin already exists
            admin_user = input('please input your username')
            password=input('please enter your passwrod')
            admin = User.query.filter_by(username=admin_user).first()
            if not admin:
                admin = User(
                    username=admin_user,
                    email='admin@example.com',
                    role=Role.ADMIN.value
                )
                admin.set_password(password)
                db.session.add(admin)
                db.session.commit()
                print("Admin user created successfully!")
                print(f"Username: admin")
                print(f"Password: admin123")
                print(f"Role: {admin.role}")
                print(f"Permissions: {admin.permissions}")
            else:
                print("Admin user already exists!")
                print(f"Current role: {admin.role}")
                # Update admin permissions if needed
                if admin.role != Role.ADMIN.value:
                    admin.role = Role.ADMIN.value
                    db.session.commit()
                    print("Updated admin role")
        except Exception as e:
            print(f"Error creating admin: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    create_admin_user() 