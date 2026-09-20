import os
import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)

# HARDCODED SECRET / INSECURE CONFIG
app.config['SECRET_KEY'] = 'dev-insecure-flask-secret-key-9999'

# CRITICAL SECURITY FLAW: Command Injection
@app.route('/api/network/ping', methods=['GET'])
def network_ping():
    host = request.args.get('host', '127.0.0.1')
    
    # DANGEROUS: os.popen or os.system with raw unsanitized host parameter
    # Attacker can pass: 127.0.0.1; cat /etc/passwd or 127.0.0.1 && whoami
    command = f"ping -c 1 {host}"
    output = os.popen(command).read()
    
    return jsonify({
        "host": host,
        "result": output
    })

# PERFORMANCE & ARCHITECTURE FLAW: Unbounded file reading and unhandled exceptions
@app.route('/api/logs/view', methods=['GET'])
def view_logs():
    logfile = request.args.get('file', 'app.log')
    # Path traversal vulnerability
    with open(logfile, 'r') as f:
        data = f.read()
    return data

if __name__ == '__main__':
    # SECURITY FLAW: debug=True exposed on all network interfaces
    app.run(host='0.0.0.0', port=5000, debug=True)
