from flask import Blueprint, request, jsonify
import hashlib
import db

auth = Blueprint('auth', __name__)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@auth.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    conn = db.get_db()
    try:
        conn.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            (username, hash_password(password))
        )
        conn.commit()
        user = conn.execute('SELECT id, username FROM users WHERE username = ?', (username,)).fetchone()
        return jsonify({'message': 'Account created!', 'user': {'id': user['id'], 'username': user['username']}})
    except Exception:
        return jsonify({'error': 'Username already taken'}), 409
    finally:
        conn.close()

@auth.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    conn = db.get_db()
    user = conn.execute(
        'SELECT id, username FROM users WHERE username = ? AND password = ?',
        (username, hash_password(password))
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401

    return jsonify({'message': 'Login successful!', 'user': {'id': user['id'], 'username': user['username']}})

@auth.route('/api/history', methods=['POST'])
def save_history():
    data = request.json
    user_id = data.get('user_id')
    module = data.get('module')
    input_data = data.get('input_data')
    result_data = data.get('result_data')

    if not all([user_id, module, input_data, result_data]):
        return jsonify({'error': 'Missing data'}), 400

    import json
    conn = db.get_db()
    conn.execute(
        'INSERT INTO history (user_id, module, input_data, result_data) VALUES (?, ?, ?, ?)',
        (user_id, module, json.dumps(input_data), json.dumps(result_data))
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Saved!'})

@auth.route('/api/history/<int:user_id>', methods=['GET'])
def get_history(user_id):
    import json
    conn = db.get_db()
    rows = conn.execute(
        'SELECT module, input_data, result_data, created_at FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
        (user_id,)
    ).fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            'module': row['module'],
            'input': json.loads(row['input_data']),
            'result': json.loads(row['result_data']),
            'date': row['created_at']
        })
    return jsonify({'history': history})