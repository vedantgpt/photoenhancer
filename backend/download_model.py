"""
Download MediaPipe pose landmarker model.
Run this once before starting the backend.
"""

import urllib.request
import os

MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
MODEL_PATH = "pose_landmarker_lite.task"

def download_model():
    if os.path.exists(MODEL_PATH):
        print(f"✅ Model already exists: {MODEL_PATH}")
        return
    
    print(f"⬇️ Downloading pose landmarker model...")
    print(f"   From: {MODEL_URL}")
    
    try:
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print(f"✅ Model downloaded: {MODEL_PATH}")
    except Exception as e:
        print(f"❌ Download failed: {e}")
        print("   Please download manually from:")
        print(f"   {MODEL_URL}")

if __name__ == "__main__":
    download_model()
