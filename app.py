"""
Riding Club of Barrington Hills - Main Application
"""
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime, date, time
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables
load_dotenv()

"""Application factory pattern"""

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', '')
app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB', 'rcbh_website')

# SQLAlchemy DB URI - use SQLite for development/testing, MySQL for production
if os.environ.get('FLASK_ENV') == 'production':
    default_db_uri = f"mysql+pymysql://{app.config['MYSQL_USER']}:{app.config['MYSQL_PASSWORD']}@{app.config['MYSQL_HOST']}/{app.config['MYSQL_DB']}"
else:
    default_db_uri = 'sqlite:///rcbh_website.db'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', default_db_uri)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

class Member(db.Model):
    __tablename__ = 'members'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    membership_type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class CalendarEvent(db.Model):
    __tablename__ = 'calendar_events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

with app.app_context():
    members = Member.query.all()
    for member in members:
        print(f"id: {member.id}, first_name: {member.first_name}")

# Register blueprints (will be added in future phases)
# from app.routes import main_bp
# app.register_blueprint(main_bp)

@app.route('/')
def home():
    """Home page"""
    return render_template('index.html')

@app.route('/about')
def about():
    """About Us page"""
    return render_template('about.html')

@app.route('/trails')
def trails():
    """Trails page"""
    return render_template('trails.html')

@app.route('/board')
def board():
    """Board page"""
    return render_template('board.html')

@app.route('/calendar')
def calendar():
    """Calendar page"""
    return render_template('calendar.html')

@app.route('/rcbhcalendar')
def rcbhcalendar():
    """RCBH Calendar page - Google Calendar-like interface"""
    return render_template('rcbhcalendar.html')

@app.route('/api/calendar/events')
def get_calendar_events():
    """Get calendar events for a specific month"""
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    
    if not year or not month:
        return jsonify({'error': 'Year and month are required'}), 400
    
    # Get events for the specified month
    events = CalendarEvent.query.filter(
        db.extract('year', CalendarEvent.date) == year,
        db.extract('month', CalendarEvent.date) == month
    ).all()
    
    events_data = []
    for event in events:
        events_data.append({
            'id': event.id,
            'title': event.title,
            'date': event.date.isoformat(),
            'start_time': event.start_time.strftime('%H:%M'),
            'end_time': event.end_time.strftime('%H:%M'),
            'description': event.description
        })
    
    return jsonify(events_data)

@app.route('/api/calendar/events', methods=['POST'])
def create_calendar_event():
    """Create a new calendar event"""
    data = request.get_json()
    
    try:
        # Parse the date and times
        event_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        
        # Create new event
        new_event = CalendarEvent(
            title=data['title'],
            date=event_date,
            start_time=start_time,
            end_time=end_time,
            description=data.get('description', '')
        )
        
        db.session.add(new_event)
        db.session.commit()
        
        return jsonify({
            'id': new_event.id,
            'title': new_event.title,
            'date': new_event.date.isoformat(),
            'start_time': new_event.start_time.strftime('%H:%M'),
            'end_time': new_event.end_time.strftime('%H:%M'),
            'description': new_event.description
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/calendar/events/<int:event_id>', methods=['PUT'])
def update_calendar_event(event_id):
    """Update an existing calendar event"""
    event = CalendarEvent.query.get_or_404(event_id)
    data = request.get_json()
    
    try:
        # Update event fields
        event.title = data['title']
        event.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        event.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        event.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        event.description = data.get('description', '')
        
        db.session.commit()
        
        return jsonify({
            'id': event.id,
            'title': event.title,
            'date': event.date.isoformat(),
            'start_time': event.start_time.strftime('%H:%M'),
            'end_time': event.end_time.strftime('%H:%M'),
            'description': event.description
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/calendar/events/<int:event_id>', methods=['DELETE'])
def delete_calendar_event(event_id):
    """Delete a calendar event"""
    event = CalendarEvent.query.get_or_404(event_id)
    
    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({'message': 'Event deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/events')
def events():
    """Events page"""
    return render_template('events.html')

@app.route('/newsletter')
def newsletter():
    """Newsletter page"""
    return render_template('newsletter.html')

@app.route('/membership')
def membership():
    """Membership page"""
    return render_template('membership.html')

@app.route('/membership/join', methods=['GET', 'POST'])
def membership_join():
    """Membership join form (Phase 4)"""
    if request.method == 'POST':
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        email = request.form.get('email', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        membership_type = request.form.get('membership_type', '').strip()

        errors = []
        if not first_name:
            errors.append('First name is required.')
        if not last_name:
            errors.append('Last name is required.')
        if not email:
            errors.append('Email is required.')
        if membership_type not in ['individual', 'family']:
            errors.append('Select a valid membership type.')

        if errors:
            for e in errors:
                flash(e, 'error')
            return render_template('membership_join.html', form=request.form)

        # Persist new member
        try:
            new_member = Member(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone or None,
                membership_type=membership_type,
            )
            db.session.add(new_member)
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            flash('Could not save your membership. Please try again.', 'error')
            return render_template('membership_join.html', form=request.form)

        return redirect(url_for('membership_thanks'))

    return render_template('membership_join.html')

@app.route('/membership/thanks')
def membership_thanks():
    return render_template('membership_thanks.html')

@app.route('/donations')
def donations():
    """Donations page"""
    return render_template('donations.html')

@app.route('/membersShow')
def membersShow():
    """Show Members page"""
    data = Member.query.all()
    # cur = db.connection.cursor()
    # cur.execute("SELECT * FROM users")
    # data = cur.fetchall()
    # cur.close()
    return render_template('membersShow.html', data=data)


if __name__ == '__main__':
    # Create tables if they do not exist
    with app.app_context():
        from flask_sqlalchemy import SQLAlchemy as _SQLAlchemy  # type: ignore
        db: _SQLAlchemy = app.extensions['sqlalchemy']  # type: ignore
        db.create_all()
    app.run(debug=True)
