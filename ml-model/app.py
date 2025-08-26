from flask import Flask, request, jsonify
from flask_cors import CORS
from image_analysis import analyze_image
from recommed_outfits import recommend_outfits
from datetime import datetime
import logging
from pymongo import MongoClient
import sys

# Configure logging
logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for all routes and origins - more permissive configuration
CORS(app, 
     origins=["*"],  # Allow all origins for now
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=False)

# MongoDB connection
try:
    client = MongoClient('')
    db = client['']
    logger.debug("MongoDB connection established to fashiondb")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    db = None

# Add a test endpoint to verify server is running
@app.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response
    
    # Handle actual GET request
    logger.info("Health check endpoint accessed")
    response_data = {
        "status": "Server is running", 
        "port": 5001,
        "timestamp": datetime.now().isoformat(),
        "mongodb_connected": db is not None
    }
    
    response = jsonify(response_data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/analyze_image', methods=['POST', 'OPTIONS'])
def analyze_image_endpoint():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
        
    logger.info("Received analyze_image request")
    
    if 'image' not in request.files:
        logger.error("No image file provided in request")
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        logger.error("Empty filename provided")
        return jsonify({"error": "No file selected"}), 400

    try:
        image_data = file.read()
        if not image_data or len(image_data) == 0:
            logger.error("Image data is empty or invalid")
            return jsonify({"error": "Invalid or empty image data"}), 400
    except Exception as e:
        logger.error(f"Failed to read image file: {e}")
        return jsonify({"error": "Failed to process image"}), 400

    logger.debug(f"Received image file: {file.filename}, content length: {len(image_data)} bytes")

    result = analyze_image(image_data)
    if "error" in result:
        logger.error(f"Image analysis failed: {result['error']}")
        return jsonify({
            "features": {
                "body_type": "unclassified", 
                "skin_tone": "neutral", 
                "face_shape": "unclassified"
            }, 
            "error": result["error"]
        }), 400

    features = result
    outfits = recommend_outfits(features)

    if db is not None:
        try:
            collection = db['outfits']
            outfit_ids = [outfit.get('outfit_id') for outfit in outfits if 'outfit_id' in outfit]
            if outfit_ids:
                mongo_outfits = list(collection.find({"outfit_id": {"$in": outfit_ids}}))
                if mongo_outfits:
                    outfits = [
                        {
                            'outfit_id': outfit['outfit_id'],
                            'top': outfit['top']['name'],
                            'top_color': outfit['top']['color'],
                            'bottom': outfit['bottom']['name'],
                            'bottom_color': outfit['bottom']['color'],
                            'occasion': outfit['occasion'],
                            'total_price': outfit.get('total_price', 0),
                            'top_image_url': outfit['top'].get('image_url', ''),
                            'bottom_image_url': outfit['bottom'].get('image_url', '')
                        }
                        for outfit in mongo_outfits
                    ]
                    logger.debug(f"Fetched outfits: {outfits}")
                else:
                    logger.warning("No matches found in MongoDB for outfit_ids")
            else:
                logger.warning("No outfit_ids in predicted outfits")
        except Exception as e:
            logger.error(f"MongoDB query or transformation failed: {e}")
            outfits = []

    response_data = {
        "features": features,
        "image_path": f"uploads/image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg",
        "outfits": outfits
    }

    logger.info(f"Response prepared: {response_data}")
    
    try:
        response = jsonify(response_data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
    except Exception as e:
        logger.error(f"JSON serialization failed: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Starting Fashion Style Analyzer Server")
    print("📍 Server will run on: http://127.0.0.1:5001")
    print("🔗 Health check: http://127.0.0.1:5001/health")
    print("🌐 CORS enabled for all origins")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5001)

