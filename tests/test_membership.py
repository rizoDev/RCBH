"""
Test suite for membership functionality (Phase 4)
"""
import pytest
from app import create_app

@pytest.fixture
def app():
    """Create and configure a test app instance"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    # Use in-memory SQLite for testing
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    return app

@pytest.fixture
def client(app):
    """Create a test client for the app"""
    return app.test_client()

def test_membership_join_page_loads(client):
    """Test that the membership join page loads"""
    response = client.get('/membership/join')
    assert response.status_code == 200
    assert b'Join the Riding Club' in response.data

def test_membership_thanks_page_loads(client):
    """Test that the membership thanks page loads"""
    response = client.get('/membership/thanks')
    assert response.status_code == 200
    assert b'Thank You!' in response.data

def test_membership_join_form_submission(client, app):
    """Test membership form submission with valid data"""
    with app.app_context():
        from flask_sqlalchemy import SQLAlchemy
        db = SQLAlchemy(app)
        db.create_all()
        
        response = client.post('/membership/join', data={
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'phone': '555-1234',
            'membership_type': 'individual'
        })
        
        # Should redirect to thanks page
        assert response.status_code == 302
        assert '/membership/thanks' in response.location

def test_membership_join_form_validation(client, app):
    """Test membership form validation with missing required fields"""
    with app.app_context():
        from flask_sqlalchemy import SQLAlchemy
        db = SQLAlchemy(app)
        db.create_all()
        
        response = client.post('/membership/join', data={
            'first_name': '',
            'last_name': 'Doe',
            'email': 'invalid-email',
            'membership_type': 'invalid'
        })
        
        # Should return to form with errors
        assert response.status_code == 200
        assert b'First name is required' in response.data
        assert b'Select a valid membership type' in response.data
