"""
Simplified Pose Matching Algorithm

Classifies user pose by arm positions and matches to monkey with similar pose.
Focus on clear, distinct pose types for reliable matching.
"""

import numpy as np
import json
import os
import random
from typing import List, Dict, Tuple, Optional
from entropy import should_apply_mutation, add_entropy, get_session, ENTROPY_LOW_CONFIDENCE, ENTROPY_PARTIAL_BODY

# Load monkey dataset
DATASET_PATH = os.path.join(os.path.dirname(__file__), "monkey_dataset.json")

def load_dataset() -> List[Dict]:
    """Load pre-processed monkey poses."""
    if os.path.exists(DATASET_PATH):
        with open(DATASET_PATH, 'r') as f:
            return json.load(f)
    return []

MONKEY_DATASET = load_dataset()

# Pose type categories based on arm positions
def classify_pose(keypoints: np.ndarray) -> Tuple[str, Dict]:
    """
    Classify a pose into a category based on arm positions.
    Returns pose type and debug info.
    """
    if keypoints is None or len(keypoints) < 17:
        return "neutral", {}
    
    keypoints = np.array(keypoints)
    
    # Get key points
    nose_y = keypoints[0][1]
    left_shoulder = keypoints[11]
    right_shoulder = keypoints[12]
    left_elbow = keypoints[13]
    right_elbow = keypoints[14]
    left_wrist = keypoints[15]
    right_wrist = keypoints[16]
    
    shoulder_y = (left_shoulder[1] + right_shoulder[1]) / 2
    shoulder_center_x = (left_shoulder[0] + right_shoulder[0]) / 2
    
    # Calculate arm positions relative to shoulders
    left_wrist_rel_y = left_wrist[1] - shoulder_y  # negative = above
    right_wrist_rel_y = right_wrist[1] - shoulder_y
    
    left_wrist_rel_x = left_wrist[0] - shoulder_center_x  # positive = left
    right_wrist_rel_x = right_wrist[0] - shoulder_center_x  # negative = right
    
    debug = {
        "left_wrist_y": round(left_wrist_rel_y, 3),
        "right_wrist_y": round(right_wrist_rel_y, 3),
        "left_wrist_x": round(left_wrist_rel_x, 3),
        "right_wrist_x": round(right_wrist_rel_x, 3),
    }
    
    # Classification rules (check from most specific to least)
    
    # Both arms raised high (y < -0.1 means above shoulders)
    if left_wrist_rel_y < -0.15 and right_wrist_rel_y < -0.15:
        return "arms_up", debug
    
    # Both hands near center/chest (crossed or praying)
    if abs(left_wrist_rel_x - right_wrist_rel_x) < 0.15 and abs(left_wrist_rel_y) < 0.15:
        if left_wrist_rel_y < 0:
            return "praying", debug
        return "arms_crossed", debug
    
    # Shrug - both elbows out, wrists up
    if left_wrist_rel_y < 0 and right_wrist_rel_y < 0 and abs(left_wrist_rel_x) > 0.15:
        return "shrug", debug
    
    # Left arm only raised (selfie, waving)
    if left_wrist_rel_y < -0.1 and right_wrist_rel_y > 0:
        if left_wrist_rel_x > 0.2:  # arm extended out
            return "selfie", debug
        return "waving", debug
    
    # Right arm only raised (mirror selfie, peace)
    if right_wrist_rel_y < -0.1 and left_wrist_rel_y > 0:
        if right_wrist_rel_x < -0.2:
            return "selfie", debug
        return "peace", debug
    
    # Arms flexed (elbows up, wrists near shoulders)
    left_elbow_rel_y = left_elbow[1] - shoulder_y
    right_elbow_rel_y = right_elbow[1] - shoulder_y
    if left_elbow_rel_y < 0 and right_elbow_rel_y < 0:
        return "flexing", debug
    
    # Hand near face (thinking)
    if (left_wrist_rel_y < 0 and abs(left_wrist_rel_x) < 0.1) or \
       (right_wrist_rel_y < 0 and abs(right_wrist_rel_x) < 0.1):
        if left_wrist[1] < nose_y + 0.1 or right_wrist[1] < nose_y + 0.1:
            return "thinking", debug
    
    # Hands on hips (wrists near hip level, elbows out)
    if left_wrist_rel_y > 0.2 and right_wrist_rel_y > 0.2:
        if abs(left_wrist_rel_x) > 0.1 and abs(right_wrist_rel_x) > 0.1:
            return "hands_hips", debug
    
    # Pointing (one arm extended forward)
    if abs(left_wrist_rel_x) > 0.25 or abs(right_wrist_rel_x) > 0.25:
        return "pointing", debug
    
    return "neutral", debug


def get_monkeys_by_pose_type(pose_type: str) -> List[Dict]:
    """Find all monkeys that match a pose type."""
    matches = []
    
    # Mapping from pose types to monkey ID patterns
    type_patterns = {
        "arms_up": ["arms_up", "fist_pump", "waving", "victory"],
        "arms_crossed": ["arms_crossed", "cool"],
        "praying": ["praying", "yoga"],
        "shrug": ["shrug", "surprised"],
        "selfie": ["selfie", "duck_face", "head_tilt", "tongue_out", "influencer"],
        "waving": ["waving", "peace", "happy"],
        "peace": ["peace", "waving", "happy"],
        "flexing": ["flexing", "gymbro", "fist_pump"],
        "thinking": ["think", "thinker", "hand_face", "chin_up"],
        "hands_hips": ["hands_hips", "cool", "arms_crossed"],
        "pointing": ["pointing", "looking_side"],
        "neutral": ["monkey1", "monkey2", "monkey3", "monkey4", "monkey5"],
    }
    
    patterns = type_patterns.get(pose_type, ["monkey"])
    
    for monkey in MONKEY_DATASET:
        monkey_id = monkey.get("id", "").lower()
        for pattern in patterns:
            if pattern in monkey_id:
                matches.append(monkey)
                break
    
    return matches


def calculate_pose_distance(user_keypoints: np.ndarray, monkey_keypoints: np.ndarray) -> float:
    """Calculate simple distance between two poses."""
    if user_keypoints is None or monkey_keypoints is None:
        return 999.0
    
    user_kp = np.array(user_keypoints)
    monkey_kp = np.array(monkey_keypoints)
    
    if len(user_kp) < 17 or len(monkey_kp) < 17:
        return 999.0
    
    # Compare key upper body joints
    key_indices = [11, 12, 13, 14, 15, 16]  # shoulders, elbows, wrists
    
    total_dist = 0.0
    for idx in key_indices:
        dist = np.linalg.norm(user_kp[idx] - monkey_kp[idx])
        total_dist += dist
    
    return total_dist / len(key_indices)


def find_best_match(
    user_pose: np.ndarray,
    session_id: str,
    confidence: float,
    partial_body: bool,
    expression: str = "neutral"  # NEW: face expression
) -> Dict:
    """
    Find best matching monkey using pose classification + face expression.
    
    Now combines:
    - Pose type (arms_up, selfie, etc.)
    - Face expression (smiling, surprised, neutral)
    """
    session = get_session(session_id)
    mutations = []
    
    # Add entropy for low confidence or partial body
    if confidence < 0.6:
        add_entropy(session_id, ENTROPY_LOW_CONFIDENCE, "low_confidence")
    if partial_body:
        add_entropy(session_id, ENTROPY_PARTIAL_BODY, "partial_body")
    
    # Classify user's pose
    pose_type, debug_info = classify_pose(user_pose)
    print(f"[MATCH] Classified pose as: {pose_type}")
    print(f"[MATCH] Face expression: {expression}")
    print(f"[MATCH] Debug: {debug_info}")
    
    # DISABLED FOR TESTING - Entropy mutations
    # if should_apply_mutation(session_id, "swap_joints"):
    #     wrong_types = ["neutral", "shrug", "flexing", "pointing"]
    #     pose_type = random.choice(wrong_types)
    #     mutations.append(f"POSE_MISCLASSIFY:{pose_type}")
    
    # Find matching monkeys by pose type
    matching_monkeys = get_monkeys_by_pose_type(pose_type)
    
    if not matching_monkeys:
        # Fallback to all monkeys
        matching_monkeys = MONKEY_DATASET
    
    # Boost monkeys that match both pose AND expression
    expression_patterns = {
        "smiling": ["happy", "waving", "peace", "selfie", "cool"],
        "surprised": ["surprised", "screaming", "shrug", "looking_up"],
        "neutral": ["think", "thinker", "cool", "pointing", "sideeye"],
    }
    
    expression_boost_patterns = expression_patterns.get(expression, [])
    
    # DISABLED FOR TESTING - Dataset shuffle
    # if should_apply_mutation(session_id, "dataset_shuffle"):
    #     random.shuffle(matching_monkeys)
    #     mutations.append("DATASET_SHUFFLE")
    
    # Score within matching set
    best_score = 0.0
    best_match = None
    all_scores = []
    
    for monkey in matching_monkeys:
        monkey_id = monkey.get("id", "").lower()
        monkey_pose = np.array(monkey.get("pose", []))
        
        if len(monkey_pose) == 0:
            score = random.uniform(70, 85)
        else:
            distance = calculate_pose_distance(user_pose, monkey_pose)
            # Convert distance to score (lower distance = higher score)
            score = max(0, 100 - (distance * 30))
        
        # BOOST score if monkey matches expression  
        for pattern in expression_boost_patterns:
            if pattern in monkey_id:
                score = min(100, score + 10)  # +10 bonus for expression match!
                break
        
        all_scores.append((monkey["id"], round(score, 1)))
        
        if score > best_score or best_match is None:
            best_score = score
            best_match = monkey
    
    # DISABLED FOR TESTING - Score manipulation
    displayed_score = best_score
    # if should_apply_mutation(session_id, "score_lies"):
    #     lie_factor = random.uniform(0.9, 1.15)
    #     displayed_score = min(99.9, best_score * lie_factor)
    #     mutations.append(f"SCORE_LIE")
    
    # Fallback
    if best_match is None:
        best_match = random.choice(MONKEY_DATASET) if MONKEY_DATASET else {
            "id": "unknown",
            "image": "/monkeys/monkey1.jpg",
            "species": "Mystery Primate",
        }
        displayed_score = random.uniform(75, 90)
        best_score = displayed_score
    
    print(f"[MATCH] Selected: {best_match['id']} with score {best_score:.1f}")
    print(f"[MATCH] Top 3: {sorted(all_scores, key=lambda x: -x[1])[:3]}")
    
    return {
        "monkey": best_match,
        "real_score": round(best_score, 1),
        "displayed_score": round(displayed_score, 1),
        "mutations_applied": mutations,
        "pose_type": pose_type,
        "all_scores": sorted(all_scores, key=lambda x: -x[1])[:3]
    }


def productive_failure(session_id: str, error_reason: str) -> Dict:
    """Never return errors - always find a chaotic match."""
    add_entropy(session_id, 0.2, f"productive_failure:{error_reason}")
    
    if MONKEY_DATASET:
        monkey = random.choice(MONKEY_DATASET)
    else:
        monkey = {
            "id": "chaos",
            "image": "/monkeys/monkey1.jpg",
            "species": "Evolutionary Anomaly"
        }
    
    fake_score = random.uniform(80, 95)
    
    return {
        "monkey": monkey,
        "real_score": 0.0,
        "displayed_score": round(fake_score, 1),
        "mutations_applied": ["PRODUCTIVE_FAILURE", error_reason.upper()],
        "chaos_message": get_chaos_message(error_reason),
        "pose_type": "unknown"
    }


def get_chaos_message(error_reason: str) -> str:
    """Generate thematic error messages."""
    messages = {
        "no_pose": "Specimen exceeds evolutionary recognition limits",
        "low_confidence": "Quantum pose superposition detected",
        "image_error": "Temporal anomaly in image processing",
        "default": "The void gazes back... and finds kinship"
    }
    return messages.get(error_reason, messages["default"])
