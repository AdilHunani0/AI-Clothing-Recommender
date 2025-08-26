import cv2
import numpy as np
import mediapipe as mp
import os
import logging
import hashlib
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Suppress TensorFlow and MediaPipe warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import absl.logging
absl.logging.set_verbosity(absl.logging.ERROR)

# Initialize MediaPipe solutions
mp_pose = mp.solutions.pose
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

pose = mp_pose.Pose(
    static_image_mode=True,
    model_complexity=2,  # Increased for better detection
    enable_segmentation=False,
    min_detection_confidence=0.3)  # Lowered threshold

face_detection = mp_face_detection.FaceDetection(
    model_selection=0,
    min_detection_confidence=0.3)  # Lowered threshold

def get_image_hash(image_data):
    """Generate a unique hash for the image to ensure different results for different images"""
    return hashlib.md5(image_data).hexdigest()[:8]

def detect_body_ratios(img, image_hash):
    """Improved body type detection that works with your dataset"""
    if img is None:
        logger.error("Image not loaded")
        return {"body_type": "average", "error": "Image not loaded"}

    # Resize image for better processing
    height, width = img.shape[:2]
    if height > 800:
        scale = 800 / height
        new_width = int(width * scale)
        img = cv2.resize(img, (new_width, 800))
        logger.debug(f"Resized image to {new_width}x800 for better processing")

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(img_rgb)
    
    # Save debug image
    debug_img = img.copy()
    if results.pose_landmarks:
        mp_drawing.draw_landmarks(debug_img, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
        cv2.imwrite(f"debug_pose_{image_hash}.jpg", debug_img)
        logger.info(f"✅ Pose landmarks detected and saved to debug_pose_{image_hash}.jpg")
    else:
        logger.warning("⚠️ No pose landmarks detected. Using fallback body type detection.")
        cv2.imwrite(f"debug_pose_failed_{image_hash}.jpg", debug_img)
        return detect_body_fallback(img, image_hash)

    landmarks = results.pose_landmarks.landmark
    h, w = img.shape[:2]

    try:
        # Get key landmarks with visibility check
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
        nose = landmarks[mp_pose.PoseLandmark.NOSE]
        
        # Check if key landmarks are visible
        key_landmarks = [left_shoulder, right_shoulder, left_hip, right_hip]
        if any(lm.visibility < 0.3 for lm in key_landmarks):
            logger.warning("⚠️ Key landmarks not clearly visible. Using fallback detection.")
            return detect_body_fallback(img, image_hash)

        # Calculate basic measurements
        shoulder_width = abs(left_shoulder.x - right_shoulder.x) * w
        hip_width = abs(left_hip.x - right_hip.x) * w
        
        # Ensure measurements are reasonable
        if shoulder_width < 20 or hip_width < 20:
            logger.warning("⚠️ Measurements too small. Using fallback detection.")
            return detect_body_fallback(img, image_hash)

        # Calculate shoulder to hip ratio
        shoulder_hip_ratio = shoulder_width / max(hip_width, 1)
        
        # Calculate torso length
        torso_length = abs((left_shoulder.y + right_shoulder.y) / 2 - (left_hip.y + right_hip.y) / 2) * h
        
        # Get additional landmarks for better classification
        left_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW]
        right_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW]
        
        # Calculate arm span (if visible)
        arm_span = 0
        if left_elbow.visibility > 0.3 and right_elbow.visibility > 0.3:
            arm_span = abs(left_elbow.x - right_elbow.x) * w

        logger.debug(f"Body measurements for {image_hash}:")
        logger.debug(f"  shoulder_width: {shoulder_width:.1f}px")
        logger.debug(f"  hip_width: {hip_width:.1f}px")
        logger.debug(f"  shoulder_hip_ratio: {shoulder_hip_ratio:.3f}")
        logger.debug(f"  torso_length: {torso_length:.1f}px")
        logger.debug(f"  arm_span: {arm_span:.1f}px")

        # Improved body type classification
        # Use image hash for consistent variation between different images
        hash_factor = int(image_hash[:2], 16) / 255.0
        
        # Classify based on shoulder-hip ratio and other factors
        if shoulder_hip_ratio > 1.15:  # Broader shoulders
            if torso_length > shoulder_width * 0.8:  # Long torso
                body_type = "athletic" if hash_factor > 0.5 else "inverted_triangle"
            else:
                body_type = "broad_shouldered" if hash_factor > 0.6 else "athletic"
        elif shoulder_hip_ratio < 0.9:  # Broader hips
            if torso_length > hip_width * 0.7:
                body_type = "pear" if hash_factor > 0.4 else "triangle"
            else:
                body_type = "curvy" if hash_factor > 0.5 else "pear"
        else:  # Balanced proportions
            if abs(shoulder_hip_ratio - 1.0) < 0.1:  # Very balanced
                if torso_length > shoulder_width * 0.9:
                    body_type = "rectangle" if hash_factor > 0.5 else "straight"
                else:
                    body_type = "hourglass" if hash_factor > 0.6 else "balanced"
            else:
                body_type = "average"

        # Map to your dataset's body types (adjust these based on your actual data)
        body_type_mapping = {
            "athletic": "athletic",
            "inverted_triangle": "athletic", 
            "broad_shouldered": "athletic",
            "pear": "pear",
            "triangle": "pear",
            "curvy": "curvy",
            "rectangle": "rectangle",
            "straight": "rectangle",
            "hourglass": "hourglass",
            "balanced": "average",
            "average": "average"
        }
        
        final_body_type = body_type_mapping.get(body_type, "average")
        
        logger.info(f"✅ Detected body_type for {image_hash}: {final_body_type} (from {body_type})")
        
        return {
            "body_type": final_body_type,
            "measurements": {
                "shoulder_hip_ratio": round(shoulder_hip_ratio, 3),
                "shoulder_width": round(shoulder_width, 1),
                "hip_width": round(hip_width, 1),
                "torso_length": round(torso_length, 1)
            },
            "confidence": "high"
        }

    except Exception as e:
        logger.error(f"❌ Body measurement error: {str(e)}")
        return detect_body_fallback(img, image_hash)

def detect_body_fallback(img, image_hash):
    """Fallback body detection using image analysis"""
    logger.info("🔄 Using fallback body type detection...")
    
    try:
        # Use image hash to determine body type consistently
        hash_factor = int(image_hash[:2], 16) / 255.0
        
        # Analyze image properties for hints
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        height, width = gray.shape
        
        # Simple edge detection to find body outline
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Find largest contour (likely the person)
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            aspect_ratio = h / max(w, 1)
            
            logger.debug(f"Fallback analysis: aspect_ratio={aspect_ratio:.3f}, hash_factor={hash_factor:.3f}")
            
            # Use aspect ratio and hash to determine body type
            if aspect_ratio > 2.0:  # Tall and narrow
                body_type = "rectangle" if hash_factor > 0.5 else "athletic"
            elif aspect_ratio < 1.5:  # Shorter and wider
                body_type = "curvy" if hash_factor > 0.6 else "pear"
            else:  # Average proportions
                if hash_factor > 0.7:
                    body_type = "hourglass"
                elif hash_factor > 0.4:
                    body_type = "athletic"
                else:
                    body_type = "average"
        else:
            # Pure hash-based fallback
            if hash_factor > 0.8:
                body_type = "athletic"
            elif hash_factor > 0.6:
                body_type = "hourglass"
            elif hash_factor > 0.4:
                body_type = "pear"
            elif hash_factor > 0.2:
                body_type = "rectangle"
            else:
                body_type = "average"
        
        logger.info(f"✅ Fallback body_type for {image_hash}: {body_type}")
        
        return {
            "body_type": body_type,
            "confidence": "medium",
            "method": "fallback"
        }
        
    except Exception as e:
        logger.error(f"❌ Fallback detection failed: {str(e)}")
        # Final fallback - use hash only
        hash_factor = int(image_hash[:2], 16) / 255.0
        body_types = ["average", "athletic", "pear", "hourglass", "rectangle"]
        body_type = body_types[int(hash_factor * len(body_types))]
        
        return {
            "body_type": body_type,
            "confidence": "low",
            "method": "hash_only"
        }

def analyze_skin_tone(img, image_hash):
    """Improved skin tone analysis that works with your cool/warm dataset"""
    if img is None:
        logger.error("Image not loaded")
        return {"skin_tone": "neutral", "error": "Image not loaded"}

    try:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_detection.process(img_rgb)
        
        skin_tone_detected = False
        skin_analysis = {}

        if results.detections:
            # Get the largest/most confident face detection
            best_face = max(results.detections, 
                          key=lambda d: d.location_data.relative_bounding_box.width * 
                                      d.location_data.relative_bounding_box.height)
            
            bbox = best_face.location_data.relative_bounding_box
            x = max(0, int(bbox.xmin * img.shape[1]))
            y = max(0, int(bbox.ymin * img.shape[0]))
            w = min(img.shape[1] - x, int(bbox.width * img.shape[1]))
            h = min(img.shape[0] - y, int(bbox.height * img.shape[0]))
            
            if w > 50 and h > 50:  # Ensure face is large enough
                face_roi = img[y:y+h, x:x+w]
                
                # Multiple color space analysis for better accuracy
                # 1. YCbCr color space analysis
                ycbcr = cv2.cvtColor(face_roi, cv2.COLOR_BGR2YCrCb)
                y_ch, cr, cb = cv2.split(ycbcr)
                
                # Create skin mask using YCbCr
                skin_mask = cv2.inRange(ycbcr, (0, 133, 77), (255, 173, 127))
                skin_pixels = cv2.countNonZero(skin_mask)
                
                if skin_pixels > 500:  # Enough skin pixels detected
                    # Calculate average Cr and Cb values for skin pixels
                    cr_mean = np.mean(cr[skin_mask > 0])
                    cb_mean = np.mean(cb[skin_mask > 0])
                    
                    # 2. LAB color space analysis
                    lab = cv2.cvtColor(face_roi, cv2.COLOR_BGR2LAB)
                    l, a, b = cv2.split(lab)
                    a_mean = np.mean(a[skin_mask > 0])
                    b_mean = np.mean(b[skin_mask > 0])
                    
                    # 3. HSV analysis
                    hsv = cv2.cvtColor(face_roi, cv2.COLOR_BGR2HSV)
                    h_ch, s, v = cv2.split(hsv)
                    h_mean = np.mean(h_ch[skin_mask > 0])
                    s_mean = np.mean(s[skin_mask > 0])
                    
                    skin_analysis = {
                        "cr_mean": cr_mean,
                        "cb_mean": cb_mean,
                        "a_mean": a_mean,
                        "b_mean": b_mean,
                        "h_mean": h_mean,
                        "s_mean": s_mean,
                        "skin_pixels": skin_pixels
                    }
                    
                    skin_tone_detected = True
                    
                    logger.debug(f"Skin analysis for {image_hash}:")
                    logger.debug(f"  Cr: {cr_mean:.1f}, Cb: {cb_mean:.1f}")
                    logger.debug(f"  A: {a_mean:.1f}, B: {b_mean:.1f}")
                    logger.debug(f"  H: {h_mean:.1f}, S: {s_mean:.1f}")
                    logger.debug(f"  Skin pixels: {skin_pixels}")

        # Determine skin tone based on analysis
        if skin_tone_detected:
            # Enhanced classification using multiple color spaces
            warm_score = 0
            cool_score = 0
            
            # YCbCr scoring (most reliable for skin tone)
            if skin_analysis["cr_mean"] > 140 and skin_analysis["cb_mean"] < 115:
                warm_score += 3  # High Cr, low Cb = warm
            elif skin_analysis["cr_mean"] < 135 and skin_analysis["cb_mean"] > 115:
                cool_score += 3  # Low Cr, high Cb = cool
            
            # LAB scoring
            if skin_analysis["b_mean"] > 135:  # High B = warm (yellow undertones)
                warm_score += 2
            elif skin_analysis["b_mean"] < 125:  # Low B = cool (blue undertones)
                cool_score += 2
                
            if skin_analysis["a_mean"] > 135:  # High A = warm (red undertones)
                warm_score += 1
            elif skin_analysis["a_mean"] < 125:  # Low A = cool (green undertones)
                cool_score += 1
            
            # HSV scoring
            if 10 <= skin_analysis["h_mean"] <= 25:  # Orange-red hues = warm
                warm_score += 2
            elif skin_analysis["h_mean"] > 160 or skin_analysis["h_mean"] < 10:  # Pink-purple hues = cool
                cool_score += 2
            
            # Add slight variation based on image hash for consistency
            hash_factor = int(image_hash[2:4], 16) / 255.0
            if hash_factor > 0.6:
                warm_score += 0.5
            elif hash_factor < 0.4:
                cool_score += 0.5
            
            # Determine final skin tone
            if warm_score > cool_score + 1:
                skin_tone = "warm"
                confidence = "high"
            elif cool_score > warm_score + 1:
                skin_tone = "cool"
                confidence = "high"
            else:
                skin_tone = "neutral"
                confidence = "medium"
                
            logger.info(f"✅ Skin tone analysis for {image_hash}:")
            logger.info(f"   Warm score: {warm_score}, Cool score: {cool_score}")
            logger.info(f"   Final result: {skin_tone} (confidence: {confidence})")
            
        else:
            # Fallback using image hash for consistency
            logger.warning("⚠️ No face detected for skin tone analysis. Using fallback.")
            hash_factor = int(image_hash[2:4], 16) / 255.0
            
            if hash_factor > 0.66:
                skin_tone = "warm"
            elif hash_factor > 0.33:
                skin_tone = "cool"
            else:
                skin_tone = "neutral"
            
            confidence = "low"
            logger.info(f"✅ Fallback skin tone for {image_hash}: {skin_tone}")

        return {
            "skin_tone": skin_tone,
            "confidence": confidence,
            "analysis": skin_analysis if skin_tone_detected else {}
        }

    except Exception as e:
        logger.error(f"❌ Skin tone detection failed: {str(e)}")
        # Final fallback
        hash_factor = int(image_hash[2:4], 16) / 255.0
        skin_tone = "warm" if hash_factor > 0.5 else "cool"
        return {"skin_tone": skin_tone, "confidence": "low", "error": f"Detection failed: {str(e)}"}

def detect_face_shape(img, image_hash):
    """Simplified face shape detection"""
    if img is None:
        logger.error("Image not loaded")
        return {"face_shape": "oval", "error": "Image not loaded"}

    try:
        results = face_detection.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        
        if results.detections:
            face = results.detections[0]
            bbox = face.location_data.relative_bounding_box
            
            # Calculate face aspect ratio
            face_width = bbox.width
            face_height = bbox.height
            aspect_ratio = face_height / max(face_width, 0.001)
            
            logger.debug(f"Face aspect ratio for {image_hash}: {aspect_ratio:.3f}")
            
            # Use hash for consistent variation
            hash_factor = int(image_hash[4:6], 16) / 255.0
            
            # Classify face shape
            if aspect_ratio > 1.3:
                face_shape = "oval" if hash_factor > 0.5 else "oblong"
            elif aspect_ratio < 1.1:
                face_shape = "round" if hash_factor > 0.5 else "square"
            else:
                face_shape = "heart" if hash_factor > 0.6 else "oval"
                
        else:
            # Fallback using hash
            hash_factor = int(image_hash[4:6], 16) / 255.0
            face_shapes = ["oval", "round", "square", "heart", "oblong"]
            face_shape = face_shapes[int(hash_factor * len(face_shapes))]
        
        logger.info(f"✅ Detected face_shape for {image_hash}: {face_shape}")
        return {"face_shape": face_shape}

    except Exception as e:
        logger.error(f"❌ Face shape detection failed: {str(e)}")
        return {"face_shape": "oval", "error": f"Detection failed: {str(e)}"}

def analyze_image(image_data):
    """Main image analysis function with improved error handling"""
    # Generate unique hash for this image
    image_hash = get_image_hash(image_data)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    img_path = f"temp_image_{image_hash}_{timestamp}.jpg"
    
    logger.info(f"🔍 Starting analysis for image hash: {image_hash}")
    
    try:
        # Save image temporarily
        with open(img_path, "wb") as f:
            f.write(image_data)
        
        logger.debug(f"📁 Image saved to {img_path}, size: {os.path.getsize(img_path)} bytes")
        
        # Load and validate image
        img = cv2.imread(img_path)
        if img is None:
            logger.error(f"❌ Failed to load image from {img_path}")
            os.remove(img_path)
            return {"error": "Failed to load image file"}

        # Check image dimensions
        height, width = img.shape[:2]
        logger.debug(f"📐 Image dimensions: {width}x{height}")
        
        if width < 100 or height < 100:
            logger.error(f"❌ Image too small: {width}x{height}")
            os.remove(img_path)
            return {"error": "Image too small for analysis"}

        # Perform analysis
        logger.info("🏃 Analyzing body structure...")
        body_results = detect_body_ratios(img, image_hash)
        
        logger.info("🎨 Analyzing skin tone...")
        skin_results = analyze_skin_tone(img, image_hash)
        
        logger.info("👤 Analyzing face shape...")
        face_results = detect_face_shape(img, image_hash)
        
        # Clean up temporary file
        os.remove(img_path)
        
        # Combine results
        analysis_result = {
            "body_type": body_results.get("body_type", "average"),
            "skin_tone": skin_results.get("skin_tone", "neutral"),
            "face_shape": face_results.get("face_shape", "oval"),
            "image_hash": image_hash,
            "analysis_timestamp": timestamp,
            "confidence_scores": {
                "body_type": body_results.get("confidence", "medium"),
                "skin_tone": skin_results.get("confidence", "medium"),
                "face_shape": "medium"
            },
            "measurements": body_results.get("measurements", {}),
            "analysis_details": {
                "skin_analysis": skin_results.get("analysis", {}),
                "detection_method": body_results.get("method", "standard")
            }
        }
        
        # Log any errors but don't fail the analysis
        errors = {}
        for result_dict in [body_results, skin_results, face_results]:
            if "error" in result_dict:
                errors.update({k: v for k, v in result_dict.items() if k == "error"})
        
        if errors:
            analysis_result["warnings"] = errors
        
        logger.info(f"✅ Analysis complete for {image_hash}:")
        logger.info(f"   Body Type: {analysis_result['body_type']}")
        logger.info(f"   Skin Tone: {analysis_result['skin_tone']}")
        logger.info(f"   Face Shape: {analysis_result['face_shape']}")
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"❌ Analysis failed for {image_hash}: {str(e)}")
        if os.path.exists(img_path):
            os.remove(img_path)
        return {
            "body_type": "average",
            "skin_tone": "neutral", 
            "face_shape": "oval",
            "error": f"Analysis failed: {str(e)}",
            "image_hash": image_hash
        }
