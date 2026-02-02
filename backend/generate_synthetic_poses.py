"""
Generate Synthetic Pose Data for All Monkeys

MediaPipe is designed for human pose detection, so many monkey images
don't get detected. This script generates meaningful synthetic pose data
based on the pose type indicated by the image name.
"""

import json
import os
import numpy as np

# Define pose templates for different pose types
# Each template is a list of 33 landmarks (x, y) normalized 0-1
# Based on MediaPipe's POSE_LANDMARKS

def create_base_pose():
    """Create a neutral standing pose as base."""
    return np.array([
        [0.5, 0.15],   # 0: nose
        [0.52, 0.12],  # 1: left eye inner
        [0.53, 0.12],  # 2: left eye
        [0.54, 0.12],  # 3: left eye outer
        [0.48, 0.12],  # 4: right eye inner
        [0.47, 0.12],  # 5: right eye
        [0.46, 0.12],  # 6: right eye outer
        [0.56, 0.13],  # 7: left ear
        [0.44, 0.13],  # 8: right ear
        [0.52, 0.18],  # 9: mouth left
        [0.48, 0.18],  # 10: mouth right
        [0.62, 0.32],  # 11: left shoulder
        [0.38, 0.32],  # 12: right shoulder
        [0.70, 0.45],  # 13: left elbow
        [0.30, 0.45],  # 14: right elbow
        [0.72, 0.58],  # 15: left wrist
        [0.28, 0.58],  # 16: right wrist
        [0.74, 0.60],  # 17: left pinky
        [0.26, 0.60],  # 18: right pinky
        [0.73, 0.59],  # 19: left index
        [0.27, 0.59],  # 20: right index
        [0.72, 0.57],  # 21: left thumb
        [0.28, 0.57],  # 22: right thumb
        [0.58, 0.65],  # 23: left hip
        [0.42, 0.65],  # 24: right hip
        [0.60, 0.80],  # 25: left knee
        [0.40, 0.80],  # 26: right knee
        [0.62, 0.95],  # 27: left ankle
        [0.38, 0.95],  # 28: right ankle
        [0.64, 0.98],  # 29: left heel
        [0.36, 0.98],  # 30: right heel
        [0.60, 0.99],  # 31: left foot index
        [0.40, 0.99],  # 32: right foot index
    ])

def modify_pose(base_pose, modifications):
    """Apply modifications to a base pose."""
    pose = base_pose.copy()
    for idx, new_pos in modifications.items():
        pose[idx] = new_pos
    return pose

# Pose type templates with specific modifications
POSE_TEMPLATES = {
    # Arms raised above head - celebration
    "arms_up": {
        11: [0.62, 0.30], 12: [0.38, 0.30],  # shoulders slightly up
        13: [0.60, 0.15], 14: [0.40, 0.15],  # elbows up high
        15: [0.58, 0.05], 16: [0.42, 0.05],  # wrists above head
    },
    
    # Arms crossed over chest
    "arms_crossed": {
        13: [0.55, 0.42], 14: [0.45, 0.42],  # elbows across
        15: [0.35, 0.38], 16: [0.65, 0.38],  # wrists crossed
    },
    
    # Hands on hips - superhero pose
    "hands_hips": {
        13: [0.68, 0.50], 14: [0.32, 0.50],  # elbows out
        15: [0.60, 0.60], 16: [0.40, 0.60],  # wrists at hips
    },
    
    # Fist pump - one arm raised
    "fist_pump": {
        13: [0.58, 0.12], 14: [0.30, 0.45],  # left elbow up, right normal
        15: [0.55, 0.02], 16: [0.28, 0.58],  # left fist up high
    },
    
    # Selfie - arm extended
    "selfie": {
        13: [0.75, 0.25], 14: [0.30, 0.42],  # left arm extended forward
        15: [0.85, 0.15], 16: [0.28, 0.55],  # left wrist far out
    },
    
    # Duck face selfie
    "duck_face": {
        13: [0.78, 0.22], 14: [0.32, 0.40],
        15: [0.88, 0.12], 16: [0.30, 0.52],
    },
    
    # Waving - one arm up waving
    "waving": {
        13: [0.55, 0.18], 14: [0.30, 0.45],  # left elbow up
        15: [0.50, 0.05], 16: [0.28, 0.58],  # left wrist high
    },
    
    # Peace sign
    "peace": {
        13: [0.58, 0.22], 14: [0.30, 0.45],
        15: [0.55, 0.10], 16: [0.28, 0.58],
    },
    
    # Pointing - arm extended forward
    "pointing": {
        13: [0.80, 0.32], 14: [0.30, 0.45],  # left arm extended
        15: [0.92, 0.32], 16: [0.28, 0.58],  # pointing forward
    },
    
    # Flexing - both arms bent showing muscles
    "flexing": {
        13: [0.65, 0.25], 14: [0.35, 0.25],  # elbows up and out
        15: [0.60, 0.20], 16: [0.40, 0.20],  # wrists near shoulders
    },
    
    # Thinking - hand on chin
    "thinking": {
        13: [0.58, 0.32], 14: [0.32, 0.45],
        15: [0.52, 0.18], 16: [0.28, 0.58],  # left hand near face
    },
    
    "think": {
        13: [0.58, 0.32], 14: [0.32, 0.45],
        15: [0.52, 0.18], 16: [0.28, 0.58],
    },
    
    # Thinker pose
    "thinker": {
        13: [0.55, 0.35], 14: [0.32, 0.45],
        15: [0.50, 0.20], 16: [0.28, 0.58],
    },
    
    # Yoga - meditation pose
    "yoga": {
        13: [0.58, 0.48], 14: [0.42, 0.48],  # elbows at sides
        15: [0.55, 0.55], 16: [0.45, 0.55],  # hands on knees
        25: [0.55, 0.72], 26: [0.45, 0.72],  # legs crossed
    },
    
    # Surprised - arms slightly out
    "surprised": {
        13: [0.72, 0.40], 14: [0.28, 0.40],  # arms out to sides
        15: [0.78, 0.42], 16: [0.22, 0.42],
    },
    
    # Happy - slight wave/open pose
    "happy": {
        13: [0.70, 0.38], 14: [0.30, 0.38],
        15: [0.75, 0.35], 16: [0.25, 0.35],
    },
    
    # Cool - relaxed lean
    "cool": {
        13: [0.68, 0.45], 14: [0.32, 0.42],
        15: [0.70, 0.50], 16: [0.30, 0.48],
    },
    
    # Head tilt
    "head_tilt": {
        0: [0.52, 0.16],  # nose slightly off center
        13: [0.72, 0.32], 14: [0.30, 0.50],
        15: [0.80, 0.22], 16: [0.28, 0.60],
    },
    
    # Tongue out
    "tongue_out": {
        13: [0.75, 0.28], 14: [0.32, 0.48],
        15: [0.82, 0.18], 16: [0.30, 0.58],
    },
    
    # Chin up - model pose
    "chin_up": {
        0: [0.5, 0.12],  # chin raised
    },
    
    # Wink
    "wink": {
        13: [0.75, 0.25], 14: [0.32, 0.45],
        15: [0.82, 0.18], 16: [0.30, 0.55],
    },
    
    # Looking up
    "looking_up": {
        0: [0.5, 0.10],  # head tilted up
    },
    
    # Hand on face
    "hand_face": {
        13: [0.55, 0.30], 14: [0.32, 0.45],
        15: [0.52, 0.15], 16: [0.28, 0.58],  # hand near face
    },
    
    # Shrug
    "shrug": {
        11: [0.64, 0.28], 12: [0.36, 0.28],  # shoulders up
        13: [0.72, 0.35], 14: [0.28, 0.35],
        15: [0.78, 0.38], 16: [0.22, 0.38],  # palms up
    },
    
    # Looking to side
    "looking_side": {
        0: [0.55, 0.15],  # face turned
    },
    
    # Praying - hands together
    "praying": {
        13: [0.55, 0.38], 14: [0.45, 0.38],  # elbows together
        15: [0.50, 0.30], 16: [0.50, 0.30],  # hands pressed together
    },
    
    # Self hug
    "hugging": {
        13: [0.55, 0.40], 14: [0.45, 0.40],
        15: [0.38, 0.38], 16: [0.62, 0.38],  # arms wrapped
    },
    
    # Screaming
    "screaming": {
        13: [0.68, 0.38], 14: [0.32, 0.38],
        15: [0.72, 0.35], 16: [0.28, 0.35],
    },
    
    # Sleepy
    "sleepy": {
        11: [0.60, 0.34], 12: [0.40, 0.34],  # slouched shoulders
    },
    
    # Side eye
    "sideeye": {
        0: [0.48, 0.15],  # face slightly turned
    },
    
    # Influencer
    "influencer": {
        13: [0.78, 0.25], 14: [0.32, 0.42],
        15: [0.88, 0.15], 16: [0.30, 0.50],
    },
    
    # Gym bro
    "gymbro": {
        13: [0.68, 0.22], 14: [0.32, 0.22],
        15: [0.62, 0.18], 16: [0.38, 0.18],
    },
    
    # Tourist
    "tourist": {
        13: [0.75, 0.30], 14: [0.30, 0.48],
        15: [0.82, 0.22], 16: [0.28, 0.58],
    },
    
    # Messy/morning
    "messy": {
        11: [0.60, 0.34], 12: [0.40, 0.34],  # slouched
    },
}

def get_pose_type_from_id(monkey_id):
    """Extract pose type from monkey ID."""
    # Try to match against known templates
    for template_name in POSE_TEMPLATES.keys():
        if template_name in monkey_id.lower():
            return template_name
    return None

def generate_pose_for_monkey(monkey_id):
    """Generate appropriate pose data for a monkey."""
    base_pose = create_base_pose()
    
    # Get pose type from ID
    pose_type = get_pose_type_from_id(monkey_id)
    
    if pose_type and pose_type in POSE_TEMPLATES:
        pose = modify_pose(base_pose, POSE_TEMPLATES[pose_type])
    else:
        # Add slight random variation to base pose for uniqueness
        pose = base_pose + np.random.normal(0, 0.02, base_pose.shape)
        pose = np.clip(pose, 0, 1)  # Keep within bounds
    
    return pose.tolist()

def update_dataset_with_synthetic_poses(dataset_path):
    """Update existing dataset with synthetic poses for all monkeys."""
    
    # Load existing dataset
    with open(dataset_path, 'r') as f:
        dataset = json.load(f)
    
    updated_count = 0
    
    for monkey in dataset:
        if not monkey.get('has_pose') or len(monkey.get('pose', [])) == 0:
            # Generate synthetic pose
            monkey['pose'] = generate_pose_for_monkey(monkey['id'])
            monkey['has_pose'] = True
            monkey['confidence'] = 0.75  # Synthetic confidence
            monkey['synthetic'] = True  # Mark as synthetic
            updated_count += 1
            print(f"  ✓ Generated pose for {monkey['id']}")
    
    # Save updated dataset
    with open(dataset_path, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"\n✅ Updated {updated_count} monkeys with synthetic poses")
    print(f"   All {len(dataset)} monkeys now have pose data!")
    
    return dataset

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, "monkey_dataset.json")
    
    print("=" * 50)
    print("SYNTHETIC POSE GENERATOR")
    print("=" * 50)
    print("Generating poses for monkeys without detected poses...")
    
    update_dataset_with_synthetic_poses(dataset_path)
