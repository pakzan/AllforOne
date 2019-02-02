# ====== DB endpoints for AllInOne app ====== #
# Here provides DB endpoints for 3 tables -   #
# User, FoodOrder and Event schema to be used #
# by backend functions.                       #
#                                             #
# Author: Tan Hao Hao                         #
# =========================================== #

import datetime
import os
from decimal import Decimal

from flask import Flask, render_template, redirect, url_for, request, Response, session
from flask_bootstrap import Bootstrap
from flask_migrate import Migrate
from flask_wtf import FlaskForm 
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import InputRequired, Email, Length
from flask_sqlalchemy  import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user

app = Flask(__name__)
app.config['SECRET_KEY'] = 'Thisissupposedtobesecret!'

# database location
db_path = os.path.join(os.path.dirname(__file__), 'database.db')
db_uri = 'sqlite:///{}'.format(db_path)
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri

bootstrap = Bootstrap(app)
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
migrate = Migrate(app, db)


# ================= Models ==================== #
class User(UserMixin, db.Model):
    id = db.Column(db.String(9), primary_key=True)      # matric number
    username = db.Column(db.String(15), unique=True)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(80))
    credit_amount = db.Column(db.Numeric(precision=2), default=0.00)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class FoodOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    stall_name = db.Column(db.String(50))
    food_name = db.Column(db.String(50))
    amount = db.Column(db.Integer)
    price = db.Column(db.Numeric(scale=2))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.datetime.now())
    is_collected = db.Column(db.Boolean)
    user_id = db.Column(db.String(9), db.ForeignKey('user.id'))

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_name = db.Column(db.String(50))
    event_description = db.Column(db.String(140))
    event_date = db.Column(db.String(15))
    event_time = db.Column(db.String(15))
    user_id = db.Column(db.String(9), db.ForeignKey('user.id'))

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# ================= Web Forms ==================== #
class LoginForm(FlaskForm):
    username = StringField('username', validators=[InputRequired(), Length(min=4, max=15)])
    password = PasswordField('password', validators=[InputRequired(), Length(min=8, max=80)])
    remember = BooleanField('remember')


class RegisterForm(FlaskForm):
    email = StringField('email', validators=[InputRequired(), Email(message='Invalid email'), Length(max=50)])
    username = StringField('username', validators=[InputRequired(), Length(min=4, max=15)])
    password = PasswordField('password', validators=[InputRequired(), Length(min=8, max=80)])


# Dummy index page for testing only. To be inserted with new ones
@app.route('/', methods=['GET', 'POST'])
@login_required
def index():
    form = request.form
    return render_template('index.html')


# ================= User Login DB Endpoints ==================== #
@app.route('/get_users', methods=['POST'])
def get_users():
    users = User.query.filter_by("test")
    
    filter_users = {}
    for user in users:
        filter_users['username'] = user['username']
        filter_users['status'] = user['status']
        
    return filter_users


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


@app.route('/login', methods=['GET', 'POST'])
def login():
    global name
    if request.method == 'POST':
        data = request.form
        user = User.query.filter_by(username=data['username']).first()
        if user:
            if check_password_hash(user.password, data['password']):
                login_user(user, remember=data['remember'])
                session["user_id"] = user.id
                print('session', session)
                # get name
                name = data['username']
                return redirect(url_for('index'))

            return '<h1>Invalid username or password</h1>'
            #return '<h1>' + form.username.data + ' ' + form.password.data + '</h1>'

    return render_template('login.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    global name

    if request.method == 'POST':
        data = request.form

        hashed_password = generate_password_hash(
            data['password'], method='sha256')

        name = data['username']

        new_user = User(id=data['matric'], username=data['username'],
                        email=data['number'], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return '<h1>New user has been created!</h1>'

    return render_template('signup.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


def topup(user_id, amount):
    user = User.query.filter_by(id=user_id).first()
    print(user.credit_amount)
    user.credit_amount += Decimal(amount)
    print(user.credit_amount)
    db.session.commit()
    return True


def consume(user_id, amount):
    user = User.query.filter_by(id=user_id).first()
    if user.credit_amount < amount:
        print("Insufficient amount.")
        return False
    user.credit_amount -= Decimal(amount)
    db.session.commit()
    return True


# ================= Food Order DB Endpoints ==================== #
@app.route('/orderfood', methods=['GET', 'POST'])
def order_food():
    if request.method == 'POST':
        data = request.form
        new_id = len(FoodOrder.query.all())
        new_order = FoodOrder(id=new_id, stall_name=data['stall_name'], food_name=data['food_name'],
                              amount=data['amount'], price=data['price'], is_collected=False,
                              user_id=session['user_id'])
        db.session.add(new_order)
        db.session.commit()

        return '<h1>New order has been created!</h1>'

    return render_template('food_order.html')


def update_food_collected(order_id, collect_status):
    collected_order = FoodOrder.query.filter_by(id=order_id).first()
    collected_order.is_collected = collect_status
    db.session.commit()


# =================== Event DB Endpoints ======================= #
@app.route('/register_event', methods=['GET', 'POST'])
def register_event():
    if request.method == 'POST':
        data = request.form
        new_id = len(Event.query.all()) + 1
        new_event = Event(id=new_id, event_name=data['event_name'], event_description=data['event_description'],
                          event_date=data['event_date'], event_time=data['event_time'],
                          user_id=session['user_id'])
        db.session.add(new_event)
        db.session.commit()

        return '<h1>New event has been created!</h1>'

    return render_template('register_event.html')


def retrieve_all_events():
    events = Event.query.all()
    result = dict()
    result["events"] = []
    for event in events:
        result["events"].append(event.as_dict())
    return result


if __name__ == '__main__':
    users = User.query.all()
    orders = FoodOrder.query.all()
    # Just for developer viewing purpose for what is in the DB
    print([user.as_dict() for user in users])
    print([order.as_dict() for order in orders])
    print(retrieve_all_events())
    app.run(debug=True)