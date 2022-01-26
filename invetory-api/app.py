from flask import Flask, jsonify, request

app = Flask(__name__)

#for whenever the database is ready
#import sqlite3
#conn = sqlite3.connect('database_name")
#cursor = conn.cursor()
#cursor.execute('some querry')
#books = cursor.fetchall()
#for book in books:
#	print(f'{book[1]} {book[2]}')

books = [
    {
        'id': 1,
        'title': u'La Divina Commedia',
        'author': u'Dante Alighieri',
        'quantity': 3
    },
    {
        'id': 2,
        'title': u'The sun also rises',
        'description': u'Ernest Hemingway',
        'quantity': 1
    }
]

@app.route('/inventory/api/v1.0/books', methods=['GET'])
def get_books():
    return jsonify({'books': books})

@app.route('/inventory/api/v1.0/getbook', methods=['POST'])
def get_book():
   book = {
	    'id': books[-1]['id'] + 1,
	    'title': request.json['title'],
	    'description': request.json.get('description', ""),
            'quantity': 3
   }
   books.append(book)
   return jsonify({'book': book})

if __name__ == '__main__':
    app.run(debug=True)

