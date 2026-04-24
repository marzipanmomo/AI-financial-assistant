from flask import Flask, request, jsonify
from flask_cors import CORS # allows requests from React -> Flask

app = Flask(__name__)
CORS(app) # allows React (port 3000) to talk to Flask (port 5000)

@app.route('/budget', methods=['POST'])
def budget():
    data = request.get_json()
    income = float(data.get("income", 0))
    expenses = float(data.get("expenses",0))
    savings = income - expenses
    # convert from dictionary to json format for react to be able to display
    return jsonify({
        "income": income,
        "expenses": expenses,
        "savings": savings
    })

@app.route('/expenses', methods=['POST'])
def expenses():
    data = request.get_json()
    purchases = data.get("purchases", "")
    # Placeholder AI logic
    return jsonify({"analysis": f"You entered: {purchases}. Try cutting one subscription to save money."})

@app.route('/savings', methods=['POST'])
def savings():
    data = request.get_json()
    goal = float(data.get("goal", 0))
    months = int(data.get("months", 1))
    per_month = goal / months
    return jsonify({"plan": f"Save {per_month:.2f} per month to reach {goal} in {months} months."})

@app.route('/tips', methods=['GET'])
def tips():
    return jsonify({"tip": "Track your daily spending to avoid surprises at the end of the month."})

if __name__ == '__main__':
    app.run(debug=True)
