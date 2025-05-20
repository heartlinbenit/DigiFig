from flask import Flask, request, jsonify
from pymongo import MongoClient
import os, random, time, requests
from flask_cors import CORS



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://heartlinbenit:hearty22@cluster0.pzn6mpn.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0')
client = MongoClient(MONGO_URI)
db = client.get_database()
users_collection = db.users

# In-memory store for OTPs: phone -> (otp, timestamp)
otps = {}

@app.route('/send_otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    if not data or 'phone' not in data:
        return jsonify({"error": "Phone number required"}), 400
    phone = data['phone']
    
    # Check if user with this phone exists
    user = users_collection.find_one({'phone': phone})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Generate a 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # Store OTP with current timestamp
    otps[phone] = (otp, time.time())

    # Send OTP via 2factor.in API
    API_KEY = "fb184520-2e5e-11f0-8b17-0200cd936042"  # Replace with env variable in production
    url = f"https://2factor.in/API/V1/{API_KEY}/SMS/{phone}/{otp}"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            response_data = response.json()
            if response_data.get("Status") == "Success":
                print(f"OTP sent successfully to {phone}: {otp}")  # For debug
                return jsonify({"message": "OTP sent successfully"}), 200
            else:
                error_msg = response_data.get("Message", "Unknown error")
                print(f"Failed to send OTP: {error_msg}")
                return jsonify({"error": f"Failed to send OTP: {error_msg}"}), 500
        else:
            print(f"Failed to send OTP, HTTP status: {response.status_code}")
            return jsonify({"error": "Failed to send OTP"}), 500
    except Exception as e:
        print(f"Exception while sending OTP: {str(e)}")
        return jsonify({"error": "Internal server error while sending OTP"}), 500

@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    if not data or 'phone' not in data or 'otp' not in data:
        return jsonify({"error": "Phone number and OTP required"}), 400
    phone = data['phone']
    otp_input = data['otp']

    # Verify OTP existence
    if phone not in otps:
        return jsonify({"error": "OTP not found for this phone"}), 400

    otp_stored, timestamp = otps.get(phone, (None, None))

    # Check OTP expiration (5 minutes = 300 seconds)
    if time.time() - timestamp > 300:
        otps.pop(phone, None)
        return jsonify({"error": "OTP expired"}), 400

    # Check OTP correctness
    if otp_input != otp_stored:
        return jsonify({"error": "Invalid OTP"}), 400

    # Remove OTP after successful verification
    otps.pop(phone, None)
    return jsonify({"message": "OTP verified successfully"}), 200

if __name__ == '__main__':
    app.run(port=4000, debug=True)
