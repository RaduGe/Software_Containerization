#!flask/bin/python 
import requests
from flask import Flask, jsonify, request 
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin


app = Flask(__name__) 
cors = CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgresadmin:admin123@10.152.183.171:5432/postgresdb' 
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
@app.route('/persons', methods = ['POST'])
def create_person():
    person_data = request.json
    name = person_data['name']
    age = person_data['age']
    person = Person(name = name, age = age )
    db.session.add(person)
    db.session.commit()
    return jsonify({"success": True,"response":"Person added"})

@cross_origin()
@app.route("/persons/<int:person_id>", methods = ['PATCH'])
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
@app.route("/persons/<int:person_id>", methods=['DELETE'])
def delete_person(person_id):
    person = Person.query.get(person_id)
    db.session.delete(person)
    db.session.commit()
    return jsonify({"success": True, "response": "Person Deleted"})

@cross_origin()
@app.route('/getpersons', methods=['GET']) 
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
