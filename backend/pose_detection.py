"""
MediaPipe Pose Detection Module

Extracts 33 body keypoints from images for pose matching.
Backend-only - no client-side detection needed.

Note: MediaPipe 0.10.30+ uses the Tasks API instead of solutions.
"""

import cv2
import numpy as np
from typing import Optional, Tuple
import io
from PIL import Image
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Key landmark indices for matching
UPPER_BODY_LANDMARKS = [0, 11, 12, 13, 14, 15, 16]  # nose, shoulders, elbows, wrists
LOWER_BODY_LANDMARKS = [23, 24, 25, 26, 27, 28]     # hips, knees, ankles

# Landmark names for debugging
LANDMARK_NAMES = {
    0: "nose", 11: "left_shoulder", 12: "right_shoulder",
    13: "left_elbow", 14: "right_elbow", 15: "left_wrist", 16: "right_wrist",
    23: "left_hip", 24: "right_hip", 25: "left_knee", 26: "right_knee",
    27: "left_ankle", 28: "right_ankle"
}

# Global pose landmarker (initialized lazily)
_pose_landmarker = None

def get_pose_landmarker():
    """Get or create pose landmarker instance."""
    global _pose_landmarker
    if _pose_landmarker is None:
        # Create options for pose detection
        base_options = python.BaseOptions(
            model_asset_path="pose_landmarker_lite.task"
        )
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
            min_pose_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        _pose_landmarker = vision.PoseLandmarker.create_from_options(options)
    return _pose_landmarker


def bytes_to_image(image_bytes: bytes) -> np.ndarray:
    """Convert bytes to OpenCV image (RGB)."""
    pil_image = Image.open(io.BytesIO(image_bytes))
    rgb_image = pil_image.convert('RGB')
    return np.array(rgb_image)


def extract_pose(image: np.ndarray) -> Tuple[Optional[np.ndarray], float, dict]:
    """
    Extract pose keypoints from image using MediaPipe Tasks API.
    
    Returns:
        keypoints: Array of (x, y) normalized coordinates, shape (33, 2)
        confidence: Average visibility score (0-1)
        debug_info: Detection metadata
    """
    try:
        # Convert to MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image)
        
        # Get pose landmarker
        landmarker = get_pose_landmarker()
        
        # Detect pose
        results = landmarker.detect(mp_image)
        
        if not results.pose_landmarks or len(results.pose_landmarks) == 0:
            return None, 0.0, {"error": "No pose detected", "partial": False}
        
        # Get first detected pose
        pose_landmarks = results.pose_landmarks[0]
        
        # Extract keypoints
        keypoints = []
        visibilities = []
        
        for landmark in pose_landmarks:
            keypoints.append([landmark.x, landmark.y])
            visibilities.append(landmark.visibility if hasattr(landmark, 'visibility') else 0.5)
        
        keypoints = np.array(keypoints)
        avg_confidence = np.mean(visibilities)
        
        # Check for partial body
        upper_visibility = np.mean([visibilities[i] for i in UPPER_BODY_LANDMARKS if i < len(visibilities)])
        lower_visibility = np.mean([visibilities[i] for i in LOWER_BODY_LANDMARKS if i < len(visibilities)])
        
        debug_info = {
            "total_landmarks": len(keypoints),
            "avg_confidence": round(avg_confidence, 3),
            "upper_body_confidence": round(upper_visibility, 3),
            "lower_body_confidence": round(lower_visibility, 3),
            "partial": lower_visibility < 0.3
        }
        
        return keypoints, avg_confidence, debug_info
        
    except FileNotFoundError:
        # Model file not found - fall back to random matching
        return None, 0.0, {"error": "Pose model not found (run: python download_model.py)", "partial": False}
    except Exception as e:
        return None, 0.0, {"error": str(e), "partial": False}


def extract_pose_from_bytes(image_bytes: bytes) -> Tuple[Optional[np.ndarray], float, dict]:
    """Extract pose from image bytes (for API uploads)."""
    try:
        image = bytes_to_image(image_bytes)
        return extract_pose(image)
    except Exception as e:
        return None, 0.0, {"error": str(e), "partial": False}


def extract_pose_from_file(filepath: str) -> Tuple[Optional[np.ndarray], float, dict]:
    """Extract pose from file path (for dataset preprocessing)."""
    try:
        image = cv2.imread(filepath)
        if image is None:
            return None, 0.0, {"error": f"Could not read file: {filepath}"}
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return extract_pose(image_rgb)
    except Exception as e:
        return None, 0.0, {"error": str(e)}
