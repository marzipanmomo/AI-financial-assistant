from dotenv import load_dotenv
load_dotenv() #loads environment variables, keeps secrets out of code

from flask import Flask
from flask_cors import CORS #so react on port3000 can talk to flask on port 5000
from routes import routes

app = Flask(__name__)
CORS(app)
app.register_blueprint(routes)

if __name__ == '__main__':
    app.run(debug=True)
