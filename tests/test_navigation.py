"""
Test suite for navigation functionality and accessibility
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

def test_navigation_structure(client):
    """Test that navigation elements are present in HTML"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check for main navigation
    assert '<nav' in html
    assert 'role="navigation"' in html
    assert 'aria-label="Main navigation"' in html
    
    # Check for logo
    assert 'RCBH_Logo_RGB_White_Full-Logo.png' in html
    
    # Check for main menu items
    assert 'About Us' in html
    assert 'Calendar' in html
    assert 'Activities' in html
    assert 'Membership' in html
    assert 'Donations' in html

def test_submenu_structure(client):
    """Test that sub-menus are properly structured"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check About Us submenu
    assert 'aria-controls="about-menu"' in html
    assert 'aria-haspopup="true"' in html
    assert 'href="/trails"' in html
    assert 'href="/board"' in html
    
    # Check Activities submenu
    assert 'aria-controls="activities-menu"' in html
    assert 'href="/events"' in html
    assert 'href="/newsletter"' in html

def test_mobile_navigation(client):
    """Test mobile navigation elements"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check mobile menu button
    assert 'aria-controls="mobile-menu"' in html
    assert 'aria-expanded="false"' in html
    assert 'aria-label="Toggle main menu"' in html
    
    # Check mobile menu structure
    assert 'id="mobile-menu"' in html
    assert 'md:hidden' in html
    
    # Check mobile submenus
    assert 'aria-controls="mobile-about-menu"' in html
    assert 'aria-controls="mobile-activities-menu"' in html

def test_aria_attributes(client):
    """Test ARIA attributes for accessibility"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check role attributes
    assert 'role="menuitem"' in html
    assert 'role="menu"' in html
    
    # Check aria-expanded attributes
    assert 'aria-expanded="false"' in html
    
    # Check aria-current for active page
    assert 'aria-current="page"' in html or 'aria-current="{% if request.endpoint ==' in html

def test_responsive_classes(client):
    """Test responsive design classes"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check responsive visibility classes
    assert 'hidden md:flex' in html  # Desktop menu
    assert 'md:hidden' in html       # Mobile menu
    assert 'hidden sm:block' in html # Logo text on small screens

def test_navigation_links(client):
    """Test that all navigation links are valid"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check that all main navigation links exist and are properly formed
    links_to_check = [
        'href="/"',
        'href="/about"',
        'href="/trails"',
        'href="/board"',
        'href="/calendar"',
        'href="/events"',
        'href="/newsletter"',
        'href="/membership"',
        'href="/donations"'
    ]
    
    for link in links_to_check:
        assert link in html

def test_javascript_integration(client):
    """Test that JavaScript files are included"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check for JavaScript file inclusion
    assert 'main.js' in html
    assert 'src="{{ url_for(\'static\', filename=\'js/main.js\') }}"' in html

def test_css_classes_for_styling(client):
    """Test that proper CSS classes are used for styling"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check for warm color palette classes
    assert 'bg-warm-800' in html
    assert 'text-white' in html
    assert 'hover:text-warm-200' in html
    assert 'hover:bg-warm-600' in html
    
    # Check for transition classes
    assert 'transition duration-300' in html
    
    # Check for shadow classes
    assert 'shadow-lg' in html

def test_navigation_accessibility_patterns(client):
    """Test accessibility patterns and best practices"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check for proper semantic structure
    assert '<nav' in html
    assert '</nav>' in html
    
    # Check for proper button elements
    assert '<button type="button"' in html
    
    # Check for proper link structure
    assert '<a href=' in html
    
    # Check for proper heading hierarchy (if any in nav)
    # This would be tested if there were headings in the navigation

def test_mobile_menu_functionality_structure(client):
    """Test mobile menu structure for JavaScript functionality"""
    response = client.get('/')
    html = response.data.decode()
    
    # Check that mobile menu has proper IDs for JavaScript targeting
    assert 'id="mobile-menu"' in html
    assert 'id="mobile-about-menu"' in html
    assert 'id="mobile-activities-menu"' in html
    
    # Check that buttons have proper aria-controls
    assert 'aria-controls="mobile-menu"' in html
    assert 'aria-controls="mobile-about-menu"' in html
    assert 'aria-controls="mobile-activities-menu"' in html

def test_navigation_consistency_across_pages(client):
    """Test that navigation is consistent across all pages"""
    pages = ['/', '/about', '/trails', '/board', '/calendar', '/events', '/newsletter', '/membership', '/donations']
    
    for page in pages:
        response = client.get(page)
        assert response.status_code == 200
        
        html = response.data.decode()
        
        # Check that navigation is present on all pages
        assert '<nav' in html
        assert 'About Us' in html
        assert 'Calendar' in html
        assert 'Activities' in html
        assert 'Membership' in html
        assert 'Donations' in html
