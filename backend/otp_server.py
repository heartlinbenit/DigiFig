from flask import Flask, request, jsonify
from flask_cors import CORS
import os, random, time, requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# In-memory store for OTPs: phone -> (otp, timestamp)
otps = {}

@app.route('/send_otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    if not data or 'phone' not in data:
        return jsonify({"error": "Phone number required"}), 400

    phone = data['phone']

    # ✅ No user validation here — it’s already done in the middleware
    otp = str(random.randint(100000, 999999))
    otps[phone] = (otp, time.time())

    API_KEY = "fb184520-2e5e-11f0-8b17-0200cd936042"  # Replace with env var in production
    url = f"https://2factor.in/API/V1/{API_KEY}/SMS/{phone}/{otp}"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            response_data = response.json()
            if response_data.get("Status") == "Success":
                print(f"✅ OTP sent to {phone}: {otp}")
                return jsonify({"message": "OTP sent successfully"}), 200
            else:
                return jsonify({"error": f"Failed to send OTP: {response_data.get('Message', 'Unknown error')}"}), 500
        else:
            return jsonify({"error": f"Failed to send OTP, HTTP {response.status_code}"}), 500
    except Exception as e:
        print(f"❌ Exception while sending OTP: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    if not data or 'phone' not in data or 'otp' not in data:
        return jsonify({"error": "Phone number and OTP required"}), 400

    phone = data['phone']
    otp_input = data['otp']

    if phone not in otps:
        return jsonify({"error": "OTP not found for this phone"}), 400

    otp_stored, timestamp = otps.get(phone, (None, None))

    if time.time() - timestamp > 300:
        otps.pop(phone, None)
        return jsonify({"error": "OTP expired"}), 400

    if otp_input != otp_stored:
        return jsonify({"error": "Invalid OTP"}), 400

    otps.pop(phone, None)
    return jsonify({"message": "OTP verified successfully"}), 200

if __name__ == '__main__':
    app.run(port=4000, debug=True)
