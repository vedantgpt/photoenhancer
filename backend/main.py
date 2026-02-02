"""
Monkey Doppelgänger API - System Collapse Edition

FastAPI backend with entropy-driven degradation.
The system gets worse the more you use it!

Now with FACE DETECTION for expression matching!
"""

from fastapi import FastAPI, File, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import time
import cv2
import numpy as np

from entropy import (
    create_session, get_session, increment_attempt, 
    get_session_stats, add_entropy, ENTROPY_DETECTION_FAILURE
)
from pose_detection import extract_pose_from_bytes
from matching import find_best_match, productive_failure, MONKEY_DATASET
from face_detection import classify_face_expression

app = FastAPI(
    title="Monkey Doppelgänger API",
    description="Pose-matching with System Collapse mechanics",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hackathon: allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint with system info."""
    return {
        "name": "Monkey Doppelgänger API",
        "version": "1.0.0",
        "status": "operational",
        "warning": "System stability not guaranteed",
        "monkeys_loaded": len(MONKEY_DATASET)
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "monkeys_loaded": len(MONKEY_DATASET),
        "timestamp": time.time()
    }


@app.post("/session")
async def create_new_session():
    """Create a new session with fresh entropy."""
    session_id = create_session()
    return {
        "session_id": session_id,
        "message": "New session created. System stability: 100%"
    }


@app.get("/session/{session_id}")
async def get_session_info(session_id: str):
    """Get current session statistics."""
    return get_session_stats(session_id)


@app.post("/analyze")
async def analyze_pose(
    image: UploadFile = File(...),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Analyze pose AND face to find monkey match.
    
    This is where the magic (and chaos) happens!
    Now with facial expression detection for better matching!
    
    Headers:
        X-Session-ID: Session identifier for entropy tracking
    
    Returns:
        Monkey match with entropy-dependent mutations applied
    """
    # Get or create session
    session_id = x_session_id or create_session()
    
    # Increment attempt (adds entropy)
    attempt_num = increment_attempt(session_id)
    
    # Read image
    try:
        image_bytes = await image.read()
    except Exception as e:
        # Productive failure - never crash!
        result = productive_failure(session_id, "image_error")
        stats = get_session_stats(session_id)
        return {
            **result,
            "session": stats,
            "attempt": attempt_num
        }
    
    # Convert to numpy array for face detection
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        cv_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if cv_image is not None:
            cv_image_rgb = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB)
            # Detect face expression
            expression, face_confidence, face_debug = classify_face_expression(cv_image_rgb)
        else:
            expression = "unknown"
            face_confidence = 0.0
            face_debug = {"error": "Could not decode image"}
    except Exception as e:
        expression = "unknown"
        face_confidence = 0.0
        face_debug = {"error": str(e)}
    
    # Extract pose
    keypoints, confidence, debug_info = extract_pose_from_bytes(image_bytes)
    
    # Handle no pose detection (productive failure)
    if keypoints is None:
        add_entropy(session_id, ENTROPY_DETECTION_FAILURE, "detection_failure")
        result = productive_failure(session_id, "no_pose")
        stats = get_session_stats(session_id)
        return {
            **result,
            "session": stats,
            "attempt": attempt_num,
            "pose_debug": debug_info,
            "face_expression": expression,
            "face_debug": face_debug
        }
    
    # Find best match with entropy mutations (now includes expression)
    partial_body = debug_info.get("partial", False)
    match_result = find_best_match(
        keypoints, 
        session_id, 
        confidence, 
        partial_body,
        expression=expression  # Pass face expression!
    )
    
    # Get session stats
    stats = get_session_stats(session_id)
    
    # Build response
    monkey = match_result["monkey"]
    
    return {
        "success": True,
        "monkey_image": monkey.get("image", "/monkeys/monkey1.jpg"),
        "monkey_id": monkey.get("id", "unknown"),
        "species": monkey.get("species", "Mystery Primate"),
        "confidence": match_result["displayed_score"],
        "real_confidence": match_result["real_score"],
        "match_quality": get_match_quality(match_result["displayed_score"]),
        "mutations_applied": match_result["mutations_applied"],
        "chaos_message": match_result.get("chaos_message"),
        "pose_type": match_result.get("pose_type", "unknown"),
        "face_expression": expression,
        "session": stats,
        "attempt": attempt_num,
        "pose_debug": debug_info,
        "face_debug": face_debug
    }


def get_match_quality(score: float) -> str:
    """Get fun match quality label."""
    if score >= 95:
        return "LEGENDARY"
    elif score >= 90:
        return "EPIC"
    elif score >= 85:
        return "REMARKABLE"
    elif score >= 80:
        return "STRONG"
    else:
        return "CURIOUS"


@app.get("/monkeys")
async def list_monkeys():
    """List all available monkeys in dataset."""
    return {
        "count": len(MONKEY_DATASET),
        "monkeys": [
            {
                "id": m.get("id"),
                "image": m.get("image"),
                "species": m.get("species")
            }
            for m in MONKEY_DATASET
        ]
    }


@app.post("/reset/{session_id}")
async def reset_session(session_id: str):
    """Reset session entropy (for testing)."""
    session = get_session(session_id)
    session.entropy = 0.0
    session.attempts = 0
    session.collapsed = False
    session.mutations = ["SESSION_RESET"]
    
    return {
        "message": "Session reset. Stability restored.",
        "session": get_session_stats(session_id)
    }


# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
