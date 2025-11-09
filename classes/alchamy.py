
class Member():
    def __init__(self, db.Model) -> None:
        __tablename__ = 'members'
        self.id = db.Column(db.Integer, primary_key=True)
        self.first_name = db.Column(db.String(100), nullable=False)
        self.last_name = db.Column(db.String(100), nullable=False)
        self.email = db.Column(db.String(255), unique=True, nullable=False)
        self.phone = db.Column(db.String(50), nullable=True)
        self.membership_type = db.Column(db.String(50), nullable=False)
        self.created_at = db.Column(db.DateTime, server_default=db.func.now())
