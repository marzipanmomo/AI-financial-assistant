from sentiment_model import predict_sentiment
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
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

@app.route("/analyze-sentiment", methods=["POST"])
def analyze_sentiment():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400
    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400
    result = predict_sentiment(text)
    return jsonify({
        "input":         text,
        "sentiment":     result["label"],
        "emoji":         result["emoji"],
        "confidence":    result["confidence"],
        "probabilities": result["probabilities"]
    }), 200

if __name__ == '__main__':
    app.run(debug=True)