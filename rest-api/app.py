#!flask/bin/python 
import requests
import os
from flask import Flask, jsonify, request 
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin


app = Flask(__name__) 
cors = CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://' + os.getenv('POSTGRES_USER') + ':' + os.getenv('POSTGRES_PASSWORD').rstrip('\n') + '@' + os.getenv('PERSISTENT_LAYER_SERVICE_SERVICE_HOST') + ':' + os.getenv('PERSISTENT_LAYER_SERVICE_SERVICE_PORT') + '/' + os.getenv('POSTGRES_DB')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Person(db.Model):
	__tablename__ = 'person'
	person_id = db.Column(db.Integer(), primary_key=True)
	name = db.Column(db.String(50), nullable=False)
	age = db.Column(db.Integer(), nullable=False)
      
	def __repr__(self):
		return "<Person %r>" % self.name



@app.route('/')
def index():
    return jsonify({"message":"Welcome to our project"})

@cross_origin()
@app.route('/add_person', methods = ['POST'])
def create_person():
    person_data = request.json
    name = person_data['name']
    age = person_data['age']
    person = Person(name = name, age = age )
    db.session.add(person)
    try:
        db.session.commit()
        return jsonify({"success": True,"response":"Person added"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "response": "Person NOT added - failure"})

@cross_origin()
@app.route("/update_person/<int:person_id>", methods = ['PATCH'])
def update_person(person_id):
    person = Person.query.get(person_id)
    name = request.json['name']
    age = request.json['age']
    if person is None:
        abort(404)
    else:
        person.name = name
        person.age = age
        db.session.add(person)
        db.session.commit()
        return jsonify({"success": True, "response": "Person Details updated"})

@cross_origin()
@app.route("/delete_person/<int:person_id>", methods=['DELETE'])
def delete_person(person_id):
    person = Person.query.get(person_id)
    db.session.delete(person)
    db.session.commit()
    return jsonify({"success": True, "response": "Person Deleted"})

@cross_origin()
@app.route('/get_persons', methods=['GET']) 
def get_persons(): 
	db.create_all()
	db.session.commit()
	all_persons = []
	persons = Person.query.all()
	for person in persons:
		results = {"person_id":person.person_id, "name":person.name, "age":person.age, }
		all_persons.append(results)
	return jsonify({"success": True,"persons": all_persons,"total_persons": len(persons),}) 



if __name__ == '__main__': 
    app.run(debug=True) 
