from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app, resource={
    r"/*":{
        "origins":"*"
    }
})

@app.route("/auth", methods=['POST'])
def auth():
    print(request.get_json())
    return jsonify({
        'name': 'Samuel',
        'email': 'samuel.jansenn@gmail.com',
        'picture': 'https://lh3.googleusercontent.com/a-/AFdZucrH8P5SxXO6oxneg4h7QbJ5gGKjGKOblAhjqM97sQ=s96-c',
        'status': 'SUCCESS'
    }), 201

if __name__ == '__main__':
    app.run(port=7889)
