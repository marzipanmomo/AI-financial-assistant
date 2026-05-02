from flask import Blueprint, request, jsonify, Response, stream_with_context
from ai_helper import get_ai_response, get_ai_response_stream
import requests as http_requests
import json

routes = Blueprint('routes', __name__)



# ── 1. Budget Breakdown ──────────────────────────────────────────────────────
@routes.route('/api/budget', methods=['POST'])
def budget():
    data = request.json
    income = float(data.get('income', 0))
    expenses = data.get('expenses', [])

    if income <= 0:
        return jsonify({'error': 'Income must be greater than 0'}), 400

    breakdown = []
    total_spent = 0
    for item in expenses:
        amount = float(item['amount'])
        total_spent += amount
        breakdown.append({
            'name': item['name'],
            'amount': amount,
            'percentage': round((amount / income) * 100, 1)
        })

    remaining = income - total_spent
    savings_rate = round((remaining / income) * 100, 1)

    prompt = f"""
    A user has a monthly income of ${income:.2f}.
    Their expenses are: {', '.join([f"{e['name']}: ${e['amount']}" for e in expenses])}.
    Total spent: ${total_spent:.2f}. Remaining: ${remaining:.2f} ({savings_rate}% savings rate).
    Give a SHORT (2-3 sentences) friendly financial insight. Be specific and practical.
    """
    ai_insight = get_ai_response(prompt)

    return jsonify({
        'income': income,
        'total_spent': round(total_spent, 2),
        'remaining': round(remaining, 2),
        'savings_rate': savings_rate,
        'breakdown': breakdown,
        'ai_insight': ai_insight
    })


# ── 2. Savings Goal Planner ──────────────────────────────────────────────────
@routes.route('/api/savings', methods=['POST'])
def savings():
    data = request.json
    goal_amount = float(data.get('goal_amount', 0))
    months = int(data.get('months', 1))
    current_savings = float(data.get('current_savings', 0))

    if goal_amount <= 0 or months <= 0:
        return jsonify({'error': 'Goal amount and months must be positive'}), 400

    remaining_needed = max(goal_amount - current_savings, 0)
    monthly_target = round(remaining_needed / months, 2)
    weekly_target = round(monthly_target / 4.33, 2)
    daily_target = round(monthly_target / 30, 2)

    prompt = f"""
    A user wants to save ${goal_amount:.2f} in {months} month(s).
    They currently have ${current_savings:.2f} saved.
    They need to save ${monthly_target:.2f}/month or ${weekly_target:.2f}/week.
    Give a SHORT (2-3 sentences) motivational tip with ONE specific actionable idea to hit this goal.
    """
    ai_tip = get_ai_response(prompt)

    return jsonify({
        'goal_amount': goal_amount,
        'current_savings': current_savings,
        'remaining_needed': round(remaining_needed, 2),
        'monthly_target': monthly_target,
        'weekly_target': weekly_target,
        'daily_target': daily_target,
        'months': months,
        'ai_tip': ai_tip
    })


# ── 3. Expense Analyzer ──────────────────────────────────────────────────────
@routes.route('/api/expenses', methods=['POST'])
def expenses():
    data = request.json
    purchases = data.get('purchases', '')

    if not purchases.strip():
        return jsonify({'error': 'Please enter some purchases'}), 400

    prompt = f"""
    A user's recent purchases: {purchases}
    Analyze their spending habits in a FRIENDLY and SLIGHTLY PLAYFUL tone (2-4 sentences).
    Identify patterns and give one practical tip.
    """
    ai_analysis = get_ai_response(prompt)

    return jsonify({
        'purchases': purchases,
        'ai_analysis': ai_analysis
    })


# ── 4. Financial Tips ────────────────────────────────────────────────────────
@routes.route('/api/tips', methods=['GET'])
def tips():
    prompt = "Give one short, practical, specific financial tip for a young person. One sentence only."
    tip = get_ai_response(prompt)
    return jsonify({'tip': tip})


# ── 5. Loan & EMI Calculator ─────────────────────────────────────────────────
@routes.route('/api/loan', methods=['POST'])
def loan():
    data = request.json
    principal = float(data.get('principal', 0))
    annual_rate = float(data.get('annual_rate', 0))
    months = int(data.get('months', 1))

    if principal <= 0 or months <= 0:
        return jsonify({'error': 'Loan amount and duration must be positive'}), 400

    if annual_rate == 0:
        emi = round(principal / months, 2)
        total_payment = round(principal, 2)
        total_interest = 0.0
    else:
        monthly_rate = annual_rate / 100 / 12
        emi = round(principal * monthly_rate * (1 + monthly_rate) ** months / ((1 + monthly_rate) ** months - 1), 2)
        total_payment = round(emi * months, 2)
        total_interest = round(total_payment - principal, 2)

    prompt = f"""
    A user is taking a loan of ${principal:.2f} at {annual_rate}% annual interest for {months} months.
    Their monthly EMI is ${emi:.2f}. Total interest paid: ${total_interest:.2f}.
    Give a SHORT (2-3 sentences) practical tip about managing this loan wisely.
    """
    ai_tip = get_ai_response(prompt)

    return jsonify({
        'principal': principal,
        'annual_rate': annual_rate,
        'months': months,
        'emi': emi,
        'total_payment': total_payment,
        'total_interest': total_interest,
        'ai_tip': ai_tip
    })


# ── 6. Currency Converter ────────────────────────────────────────────────────
@routes.route('/api/currency', methods=['POST'])
def currency():
    data = request.json
    amount = float(data.get('amount', 0))
    from_currency = data.get('from_currency', 'USD').upper()
    to_currency = data.get('to_currency', 'PKR').upper()

    if amount <= 0:
        return jsonify({'error': 'Amount must be positive'}), 400

    try:
        api_url = f"https://open.er-api.com/v6/latest/{from_currency}"
        response = http_requests.get(api_url, timeout=15)
        fx_data = response.json()
        
        if fx_data.get('result') != 'success':
            return jsonify({'error': 'Could not fetch exchange rates.'}), 500
            
        rate = fx_data['rates'].get(to_currency)
        if not rate:
            return jsonify({'error': f'{to_currency} is not supported.'}), 400
            
        converted = round(amount * rate, 2)
        rate = round(rate, 4)
    except Exception:
        return jsonify({'error': 'Could not fetch exchange rates. Please try again.'}), 500

    return jsonify({
        'amount': amount,
        'from_currency': from_currency,
        'to_currency': to_currency,
        'rate': rate,
        'converted': converted
    })

# ── 7. Net Worth Tracker ─────────────────────────────────────────────────────
@routes.route('/api/networth', methods=['POST'])
def networth():
    data = request.json
    assets = data.get('assets', [])
    liabilities = data.get('liabilities', [])

    total_assets = sum(float(a['amount']) for a in assets)
    total_liabilities = sum(float(l['amount']) for l in liabilities)
    net_worth = round(total_assets - total_liabilities, 2)

    prompt = f"""
    A user's total assets: ${total_assets:.2f}, total liabilities: ${total_liabilities:.2f}, net worth: ${net_worth:.2f}.
    Assets include: {', '.join([f"{a['name']}: ${a['amount']}" for a in assets]) or 'none'}.
    Liabilities include: {', '.join([f"{l['name']}: ${l['amount']}" for l in liabilities]) or 'none'}.
    Give a SHORT (2-3 sentences) honest and practical assessment of their financial health.
    """
    ai_insight = get_ai_response(prompt)

    return jsonify({
        'total_assets': round(total_assets, 2),
        'total_liabilities': round(total_liabilities, 2),
        'net_worth': net_worth,
        'ai_insight': ai_insight
    })


# ── 8. Bill Splitter ─────────────────────────────────────────────────────────
@routes.route('/api/split', methods=['POST'])
def split():
    data = request.json
    total = float(data.get('total', 0))
    people = int(data.get('people', 2))
    tip_percent = float(data.get('tip_percent', 0))

    if total <= 0 or people < 2:
        return jsonify({'error': 'Total must be positive and people must be 2 or more'}), 400

    tip_amount = round(total * tip_percent / 100, 2)
    grand_total = round(total + tip_amount, 2)
    per_person = round(grand_total / people, 2)

    return jsonify({
        'original_total': total,
        'tip_percent': tip_percent,
        'tip_amount': tip_amount,
        'grand_total': grand_total,
        'people': people,
        'per_person': per_person
    })


# ── 9. Investment Returns ────────────────────────────────────────────────────
@routes.route('/api/investment', methods=['POST'])
def investment():
    data = request.json
    initial = float(data.get('initial', 0))
    monthly_contribution = float(data.get('monthly_contribution', 0))
    annual_return = float(data.get('annual_return', 0))
    years = int(data.get('years', 1))

    if initial < 0 or years <= 0:
        return jsonify({'error': 'Invalid values provided'}), 400

    monthly_rate = annual_return / 100 / 12
    months = years * 12
    if monthly_rate == 0:
        future_value = initial + monthly_contribution * months
    else:
        future_value = initial * (1 + monthly_rate) ** months + \
            monthly_contribution * (((1 + monthly_rate) ** months - 1) / monthly_rate)

    future_value = round(future_value, 2)
    total_contributed = round(initial + monthly_contribution * months, 2)
    total_gains = round(future_value - total_contributed, 2)
    roi = round((total_gains / total_contributed) * 100, 1) if total_contributed > 0 else 0

    prompt = f"""
    A user invests ${initial:.2f} upfront plus ${monthly_contribution:.2f}/month at {annual_return}% annual return for {years} years.
    Final value: ${future_value:.2f}. Total contributed: ${total_contributed:.2f}. Gains: ${total_gains:.2f} ({roi}% ROI).
    Give a SHORT (2-3 sentences) encouraging insight about the power of their investment strategy.
    """
    ai_insight = get_ai_response(prompt)

    return jsonify({
        'initial': initial,
        'monthly_contribution': monthly_contribution,
        'annual_return': annual_return,
        'years': years,
        'future_value': future_value,
        'total_contributed': total_contributed,
        'total_gains': total_gains,
        'roi': roi,
        'ai_insight': ai_insight
    })

# ── 10. AI Chat (streaming with memory) ─────────────────────────────────────
@routes.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])

    if not messages:
        return jsonify({'error': 'Messages cannot be empty'}), 400

    groq_messages = [
        {"role": "system", "content": "You are a helpful, friendly financial assistant. Answer questions about budgeting, investing, saving, and loans clearly and practically in 3-5 sentences max."}
    ]
    for msg in messages:
        if msg.get('role') in ('user', 'assistant') and msg.get('text'):
            groq_messages.append({"role": msg['role'], "content": msg['text']})

    def generate():
        for chunk in get_ai_response_stream(groq_messages):
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'}
    )

# ── Health check ─────────────────────────────────────────────────────────────
@routes.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok', 'message': 'Flask is running!'})