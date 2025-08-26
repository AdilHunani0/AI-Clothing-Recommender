import pandas as pd
import joblib
from collections import Counter
import logging
import random

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load saved models and dataset
try:
    models = joblib.load('models.pkl')
    df = joblib.load('dataset.pkl')
    target_cols = ["top", "bottom", "top_color", "bottom_color"]
    logger.info(f"✅ Models and dataset loaded successfully. Dataset shape: {df.shape}")
    logger.info(f"📊 Available columns: {list(df.columns)}")
    
    # Log unique values in key columns for debugging
    if not df.empty:
        logger.info(f"🎨 Unique skin tones in dataset: {df['skin_tone'].unique() if 'skin_tone' in df.columns else 'No skin_tone column'}")
        logger.info(f"👤 Unique body types in dataset: {df['body_type'].unique() if 'body_type' in df.columns else 'No body_type column'}")
        logger.info(f"🎯 Unique occasions in dataset: {df['occasion'].unique() if 'occasion' in df.columns else 'No occasion column'}")
        
except Exception as e:
    logger.error(f"❌ Failed to load models or dataset: {e}")
    models = {}
    df = pd.DataFrame()
    target_cols = []

def recommend_outfits(user_input):
    """Enhanced outfit recommendation that works with your actual dataset"""
    logger.info(f"🎯 Starting recommendation process...")
    logger.debug(f"📥 Received user_input: {user_input}")
    
    if not user_input or not isinstance(user_input, dict):
        logger.error("❌ Invalid input to recommend_outfits")
        return []

    # Prepare input data with defaults
    input_data = {
        "body_type": user_input.get("body_type", "average"),
        "skin_tone": user_input.get("skin_tone", "neutral"),
        "face_shape": user_input.get("face_shape", "oval"),
        "occasion": user_input.get("occasion", "casual"),
        "image_hash": user_input.get("image_hash", "default")
    }
    
    logger.info(f"🔍 Processing recommendation for:")
    logger.info(f"   Body Type: {input_data['body_type']}")
    logger.info(f"   Skin Tone: {input_data['skin_tone']}")
    logger.info(f"   Face Shape: {input_data['face_shape']}")
    logger.info(f"   Image Hash: {input_data['image_hash']}")

    # Check if we have actual data to work with
    if df.empty:
        logger.warning("⚠️ No dataset available. Generating synthetic recommendations.")
        return generate_synthetic_outfits(input_data)

    # Try to find outfits using your actual dataset
    recommended_outfits = find_outfits_from_dataset(input_data)
    
    if not recommended_outfits:
        logger.warning("⚠️ No matches found in dataset. Generating synthetic recommendations.")
        recommended_outfits = generate_synthetic_outfits(input_data)

    logger.info(f"✅ Final recommendations: {len(recommended_outfits)} outfits")
    for i, outfit in enumerate(recommended_outfits, 1):
        logger.info(f"   Outfit {i}: {outfit.get('top', 'N/A')} + {outfit.get('bottom', 'N/A')}")
    
    return recommended_outfits

def find_outfits_from_dataset(input_data):
    """Find outfits from your actual dataset with multiple fallback strategies"""
    
    body_type = input_data["body_type"]
    skin_tone = input_data["skin_tone"]
    face_shape = input_data["face_shape"]
    image_hash = input_data["image_hash"]
    
    logger.info(f"🔍 Searching dataset for matches...")
    
    # Strategy 1: Try exact match on body_type and skin_tone
    if 'body_type' in df.columns and 'skin_tone' in df.columns:
        exact_matches = df[
            (df['body_type'].str.lower() == body_type.lower()) & 
            (df['skin_tone'].str.lower() == skin_tone.lower())
        ]
        
        if not exact_matches.empty:
            logger.info(f"✅ Found {len(exact_matches)} exact matches (body_type + skin_tone)")
            return format_outfits(exact_matches.head(3), image_hash)
    
    # Strategy 2: Try skin_tone only (since you mentioned you have cool/warm data)
    if 'skin_tone' in df.columns:
        skin_matches = df[df['skin_tone'].str.lower() == skin_tone.lower()]
        
        if not skin_matches.empty:
            logger.info(f"✅ Found {len(skin_matches)} skin tone matches")
            return format_outfits(skin_matches.head(3), image_hash)
    
    # Strategy 3: Try body_type only
    if 'body_type' in df.columns:
        body_matches = df[df['body_type'].str.lower() == body_type.lower()]
        
        if not body_matches.empty:
            logger.info(f"✅ Found {len(body_matches)} body type matches")
            return format_outfits(body_matches.head(3), image_hash)
    
    # Strategy 4: Try occasion-based matching
    if 'occasion' in df.columns:
        occasion_matches = df[df['occasion'].str.lower().str.contains('casual|formal|party', na=False)]
        
        if not occasion_matches.empty:
            logger.info(f"✅ Found {len(occasion_matches)} occasion-based matches")
            return format_outfits(occasion_matches.head(3), image_hash)
    
    # Strategy 5: Use ML models if available
    if models and target_cols:
        logger.info("🤖 Trying ML model predictions...")
        ml_outfits = get_ml_predictions(input_data)
        if ml_outfits:
            return ml_outfits
    
    # Strategy 6: Random selection from dataset
    if not df.empty:
        logger.info("🎲 Using random selection from dataset")
        random_selection = df.sample(n=min(3, len(df)))
        return format_outfits(random_selection, image_hash)
    
    logger.warning("❌ No matches found in dataset")
    return []

def format_outfits(df_subset, image_hash):
    """Format dataset rows into outfit format"""
    outfits = []
    
    for idx, row in df_subset.iterrows():
        # Use hash to add some variation to prices
        hash_factor = int(image_hash[:2], 16) if image_hash != "default" else 50
        base_price = hash_factor % 100 + 50  # Price between 50-150
        
        outfit = {
            "outfit_id": int(row.get('outfit_id', idx)),
            "top": str(row.get('top', 'shirt')),
            "top_color": str(row.get('top_color', 'blue')),
            "bottom": str(row.get('bottom', 'pants')),
            "bottom_color": str(row.get('bottom_color', 'black')),
            "occasion": str(row.get('occasion', 'casual')),
            "total_price": int(row.get('total_price', base_price))
        }
        
        # Add image URLs if available
        if 'top_image_url' in row:
            outfit['top_image_url'] = str(row['top_image_url'])
        if 'bottom_image_url' in row:
            outfit['bottom_image_url'] = str(row['bottom_image_url'])
            
        outfits.append(outfit)
    
    return outfits

def get_ml_predictions(input_data):
    """Use ML models to predict outfit components"""
    try:
        predictions = {}
        
        # Make predictions for each target
        for target in target_cols:
            if target not in models:
                continue
                
            model_data = models[target]
            pipeline = model_data["pipeline"]
            encoder = model_data["encoder"]
            
            # Make prediction
            pred_encoded = pipeline.predict(pd.DataFrame([input_data]))[0]
            pred_label = encoder.inverse_transform([pred_encoded])[0]
            predictions[target] = pred_label
            
            logger.debug(f"🤖 ML predicted {target}: {pred_label}")
        
        if len(predictions) >= 4:  # We have all predictions
            # Create outfit from predictions
            hash_factor = int(input_data.get('image_hash', 'default')[:2], 16) if input_data.get('image_hash') != 'default' else 50
            
            outfit = {
                "outfit_id": 9000 + (hash_factor % 100),
                "top": predictions.get("top", "shirt"),
                "top_color": predictions.get("top_color", "blue"),
                "bottom": predictions.get("bottom", "pants"),
                "bottom_color": predictions.get("bottom_color", "black"),
                "occasion": input_data.get("occasion", "casual"),
                "total_price": hash_factor % 100 + 75
            }
            
            logger.info("✅ Generated ML-based outfit")
            return [outfit]
            
    except Exception as e:
        logger.error(f"❌ ML prediction failed: {str(e)}")
    
    return []

def generate_synthetic_outfits(input_data):
    """Generate synthetic outfits when dataset is not available"""
    logger.info("🎨 Generating synthetic outfits...")
    
    body_type = input_data["body_type"]
    skin_tone = input_data["skin_tone"]
    image_hash = input_data.get("image_hash", "default")
    
    # Define clothing options based on body type and skin tone
    clothing_options = {
        "athletic": {
            "tops": ["polo_shirt", "henley", "fitted_tee", "tank_top"],
            "bottoms": ["chinos", "athletic_shorts", "straight_jeans", "dress_pants"]
        },
        "pear": {
            "tops": ["blazer", "structured_shirt", "fitted_top", "cardigan"],
            "bottoms": ["a_line_skirt", "straight_pants", "bootcut_jeans", "wide_leg_pants"]
        },
        "hourglass": {
            "tops": ["wrap_top", "fitted_shirt", "belted_blouse", "bodycon_top"],
            "bottoms": ["pencil_skirt", "high_waist_jeans", "fitted_pants", "midi_skirt"]
        },
        "rectangle": {
            "tops": ["peplum_top", "ruffled_blouse", "layered_shirt", "textured_sweater"],
            "bottoms": ["skinny_jeans", "pleated_skirt", "tapered_pants", "flare_jeans"]
        },
        "average": {
            "tops": ["button_shirt", "sweater", "blouse", "tee_shirt"],
            "bottoms": ["jeans", "dress_pants", "skirt", "shorts"]
        }
    }
    
    # Color options based on skin tone
    color_options = {
        "warm": {
            "colors": ["coral", "peach", "gold", "warm_red", "orange", "cream", "brown"],
            "neutrals": ["beige", "ivory", "warm_gray", "camel"]
        },
        "cool": {
            "colors": ["navy", "royal_blue", "emerald", "cool_pink", "purple", "silver"],
            "neutrals": ["charcoal", "cool_gray", "white", "black"]
        },
        "neutral": {
            "colors": ["gray", "navy", "white", "beige", "soft_blue", "sage_green"],
            "neutrals": ["black", "white", "gray", "cream"]
        }
    }
    
    # Get options for this user
    tops = clothing_options.get(body_type, clothing_options["average"])["tops"]
    bottoms = clothing_options.get(body_type, clothing_options["average"])["bottoms"]
    colors = color_options.get(skin_tone, color_options["neutral"])["colors"]
    neutrals = color_options.get(skin_tone, color_options["neutral"])["neutrals"]
    
    # Generate 3 different outfits using image hash for consistency
    outfits = []
    
    for i in range(3):
        # Use hash to select items consistently but differently for each outfit
        hash_seed = int(image_hash[i*2:(i*2)+2], 16) if len(image_hash) > i*2+1 else i * 50
        
        top_idx = hash_seed % len(tops)
        bottom_idx = (hash_seed + 1) % len(bottoms)
        top_color_idx = hash_seed % len(colors)
        bottom_color_idx = (hash_seed + 2) % len(neutrals)
        
        outfit = {
            "outfit_id": 8000 + hash_seed % 100 + i,
            "top": tops[top_idx],
            "top_color": colors[top_color_idx],
            "bottom": bottoms[bottom_idx],
            "bottom_color": neutrals[bottom_color_idx],
            "occasion": "casual" if i == 0 else ("smart_casual" if i == 1 else "formal"),
            "total_price": (hash_seed % 80) + 60 + (i * 20)  # Vary prices
        }
        
        outfits.append(outfit)
    
    logger.info(f"✅ Generated {len(outfits)} synthetic outfits")
    return outfits
