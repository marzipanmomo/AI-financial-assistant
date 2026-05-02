from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from routes import routes
from auth import auth
import db

app = Flask(__name__)
CORS(app)

db.init_db()

app.register_blueprint(routes)
app.register_blueprint(auth)

@app.route("/ping")
def ping():
    return {"status": "ok", "message": "Backend is running!"}

if __name__ == '__main__':
    app.run(debug=True)