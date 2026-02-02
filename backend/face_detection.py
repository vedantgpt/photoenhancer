"""
Face Detection Module

Uses MediaPipe Face Mesh to detect facial landmarks and expressions.
Combined with pose detection for better matching.
"""

import os
import numpy as np
import cv2
from typing import Tuple, Optional, Dict

# Try to import MediaPipe
try:
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("Warning: MediaPipe not available for face detection")

# Model path for face detector
MODEL_PATH = os.path.join(os.path.dirname(__file__), "face_detector.task")
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"

_face_detector = None

def download_face_model():
    """Download face detector model if not present."""
    if not os.path.exists(MODEL_PATH):
        import urllib.request
        print(f"Downloading face detection model...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print(f"Model saved to {MODEL_PATH}")
    return MODEL_PATH

def get_face_detector():
    """Get or create face detector instance."""
    global _face_detector
    
    if not MEDIAPIPE_AVAILABLE:
        return None
    
    if _face_detector is None:
        try:
            model_path = download_face_model()
            base_options = python.BaseOptions(model_asset_path=model_path)
            options = vision.FaceDetectorOptions(base_options=base_options)
            _face_detector = vision.FaceDetector.create_from_options(options)
        except Exception as e:
            print(f"Failed to create face detector: {e}")
            return None
    
    return _face_detector


def detect_face(image: np.ndarray) -> Tuple[Optional[Dict], float]:
    """
    Detect face in image and extract features.
    
    Returns:
        face_data: Dict with face bounding box and keypoints
        confidence: Detection confidence (0-1)
    """
    detector = get_face_detector()
    
    if detector is None:
        return None, 0.0
    
    try:
        # Convert to MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image)
        
        # Detect faces
        results = detector.detect(mp_image)
        
        if not results.detections or len(results.detections) == 0:
            return None, 0.0
        
        # Get first (primary) face
        face = results.detections[0]
        
        # Extract bounding box
        bbox = face.bounding_box
        
        # Extract keypoints (eyes, nose, mouth, ears)
        keypoints = {}
        for kp in face.keypoints:
            keypoints[kp.label if hasattr(kp, 'label') else 'point'] = {
                'x': kp.x,
                'y': kp.y
            }
        
        face_data = {
            'bbox': {
                'x': bbox.origin_x,
                'y': bbox.origin_y,
                'width': bbox.width,
                'height': bbox.height,
            },
            'keypoints': keypoints,
            'center_x': bbox.origin_x + bbox.width / 2,
            'center_y': bbox.origin_y + bbox.height / 2,
        }
        
        return face_data, face.categories[0].score if face.categories else 0.8
        
    except Exception as e:
        print(f"Face detection error: {e}")
        return None, 0.0


def analyze_expression(face_data: Dict, image: np.ndarray) -> Dict:
    """
    Analyze facial expression based on face keypoints.
    
    Returns dict with expression features:
    - mouth_open: bool
    - eye_aspect: float (narrow vs wide)
    - face_tilt: float (head tilt angle)
    """
    if face_data is None:
        return {"expression": "neutral"}
    
    features = {
        "expression": "neutral",
        "face_width": face_data['bbox']['width'],
        "face_height": face_data['bbox']['height'],
    }
    
    # Calculate face aspect ratio (wide smile vs neutral)
    if face_data['bbox']['height'] > 0:
        aspect = face_data['bbox']['width'] / face_data['bbox']['height']
        if aspect > 1.1:
            features["expression"] = "smiling"
        elif aspect < 0.85:
            features["expression"] = "surprised"
    
    return features


def classify_face_expression(image: np.ndarray) -> Tuple[str, float, Dict]:
    """
    Detect face and classify expression.
    
    Returns:
        expression: Expression type (smiling, surprised, neutral, etc.)
        confidence: Detection confidence
        debug_info: Additional debug information
    """
    face_data, confidence = detect_face(image)
    
    if face_data is None:
        return "unknown", 0.0, {"error": "No face detected"}
    
    features = analyze_expression(face_data, image)
    
    debug_info = {
        "face_detected": True,
        "confidence": round(confidence, 3),
        "bbox": face_data['bbox'],
        "features": features,
    }
    
    return features.get("expression", "neutral"), confidence, debug_info


def extract_face_from_file(filepath: str) -> Tuple[str, float, Dict]:
    """Extract face expression from an image file."""
    try:
        image = cv2.imread(filepath)
        if image is None:
            return "unknown", 0.0, {"error": f"Could not read image: {filepath}"}
        
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        return classify_face_expression(image_rgb)
        
    except Exception as e:
        return "unknown", 0.0, {"error": str(e)}
