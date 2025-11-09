"""
Test suite to verify project structure is properly set up
"""
import os
import pytest

def test_project_structure():
    """Test that all required directories exist"""
    required_dirs = [
        'templates',
        'static',
        'static/css',
        'static/js',
        'tests'
    ]
    
    for directory in required_dirs:
        assert os.path.exists(directory), f"Directory {directory} should exist"
        assert os.path.isdir(directory), f"{directory} should be a directory"

def test_required_files():
    """Test that all required files exist"""
    required_files = [
        'app.py',
        'requirements.txt',
        'pytest.ini',
        'tests/__init__.py',
        'tests/test_app.py',
        'tests/test_project_structure.py'
    ]
    
    for file_path in required_files:
        assert os.path.exists(file_path), f"File {file_path} should exist"
        assert os.path.isfile(file_path), f"{file_path} should be a file"

def test_app_import():
    """Test that the main app can be imported"""
    try:
        from app import create_app
        assert create_app is not None
    except ImportError as e:
        pytest.fail(f"Could not import create_app: {e}")

def test_requirements_file():
    """Test that requirements.txt contains expected packages"""
    with open('requirements.txt', 'r') as f:
        content = f.read()
        
    expected_packages = [
        'Flask',
        'pytest',
        'PyMySQL',
        'SQLAlchemy',
        'google-api-python-client',
        'paypalrestsdk'
    ]
    
    for package in expected_packages:
        assert package in content, f"Package {package} should be in requirements.txt"
