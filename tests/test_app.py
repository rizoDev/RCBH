"""
Test suite for the main Flask application
"""
import pytest
from app import create_app

@pytest.fixture
def app():
    """Create and configure a test app instance"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    return app

@pytest.fixture
def client(app):
    """Create a test client for the app"""
    return app.test_client()

def test_app_creation():
    """Test that the app can be created"""
    app = create_app()
    assert app is not None
    assert app.config['TESTING'] == False

def test_home_page(client):
    """Test that the home page loads"""
    response = client.get('/')
    assert response.status_code == 200

def test_about_page(client):
    """Test that the about page loads"""
    response = client.get('/about')
    assert response.status_code == 200

def test_trails_page(client):
    """Test that the trails page loads"""
    response = client.get('/trails')
    assert response.status_code == 200

def test_board_page(client):
    """Test that the board page loads"""
    response = client.get('/board')
    assert response.status_code == 200

def test_calendar_page(client):
    """Test that the calendar page loads"""
    response = client.get('/calendar')
    assert response.status_code == 200

def test_events_page(client):
    """Test that the events page loads"""
    response = client.get('/events')
    assert response.status_code == 200

def test_newsletter_page(client):
    """Test that the newsletter page loads"""
    response = client.get('/newsletter')
    assert response.status_code == 200

def test_membership_page(client):
    """Test that the membership page loads"""
    response = client.get('/membership')
    assert response.status_code == 200

def test_donations_page(client):
    """Test that the donations page loads"""
    response = client.get('/donations')
    assert response.status_code == 200

def test_nonexistent_page(client):
    """Test that 404 is returned for nonexistent pages"""
    response = client.get('/nonexistent')
    assert response.status_code == 404
