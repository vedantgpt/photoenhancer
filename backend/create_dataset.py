"""
Monkey Dataset Creator

Pre-processes monkey images to extract pose keypoints.
Run this once to generate monkey_dataset.json
"""

import os
import json
from pose_detection import extract_pose_from_file

# Monkey metadata (id -> species name)
MONKEY_METADATA = {
    "monkey1": "Curious George",
    "monkey2": "Capuchin Captain", 
    "monkey3": "Cheeky Chimp",
    "monkey4": "Wise Orangutan",
    "monkey5": "Sneaky Macaque",
    "monkey_influencer": "Influencer King",
    "monkey_gymbro": "Gym Bro",
    "monkey_messy": "Morning Mood",
    "monkey_thinker": "Deep Thinker",
    "monkey_tourist": "Tourist Vibe",
    "monkey_sideeye": "Judgemental Judy",
    # New monkeys to be added
    "monkey_yoga": "Zen Master",
    "monkey_flexing": "Muscle Monkey",
    "monkey_waving": "Friendly Primate",
    "monkey_pointing": "Direction Guru",
    "monkey_peace": "Peace Ambassador"
}


def create_dataset(images_dir: str, output_path: str):
    """
    Create monkey dataset by extracting poses from all images.
    
    Args:
        images_dir: Path to directory containing monkey images
        output_path: Path to save monkey_dataset.json
    """
    dataset = []
    
    print(f"Scanning {images_dir} for monkey images...")
    
    # Supported extensions
    extensions = ('.jpg', '.jpeg', '.png', '.webp')
    
    for filename in os.listdir(images_dir):
        if not filename.lower().endswith(extensions):
            continue
            
        filepath = os.path.join(images_dir, filename)
        monkey_id = os.path.splitext(filename)[0]
        
        print(f"Processing {filename}...")
        
        # Extract pose
        keypoints, confidence, debug_info = extract_pose_from_file(filepath)
        
        if keypoints is None:
            print(f"  ⚠ No pose detected: {debug_info.get('error', 'unknown')}")
            # Still include in dataset with empty pose (for random matching)
            dataset.append({
                "id": monkey_id,
                "image": f"/monkeys/{filename}",
                "species": MONKEY_METADATA.get(monkey_id, "Mystery Monkey"),
                "pose": [],
                "confidence": 0,
                "has_pose": False
            })
        else:
            print(f"  ✓ Pose detected (confidence: {confidence:.2f})")
            dataset.append({
                "id": monkey_id,
                "image": f"/monkeys/{filename}",
                "species": MONKEY_METADATA.get(monkey_id, "Mystery Monkey"),
                "pose": keypoints.tolist(),
                "confidence": round(confidence, 3),
                "has_pose": True,
                "upper_body_conf": debug_info.get("upper_body_confidence", 0),
                "lower_body_conf": debug_info.get("lower_body_confidence", 0)
            })
    
    # Save dataset
    with open(output_path, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"\n✅ Dataset saved to {output_path}")
    print(f"   Total monkeys: {len(dataset)}")
    print(f"   With pose: {sum(1 for m in dataset if m['has_pose'])}")
    
    return dataset


if __name__ == "__main__":
    # Default paths
    IMAGES_DIR = "../photoenhancer/public/monkeys"
    OUTPUT_PATH = "monkey_dataset.json"
    
    # Make paths absolute
    script_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.normpath(os.path.join(script_dir, IMAGES_DIR))
    output_path = os.path.join(script_dir, OUTPUT_PATH)
    
    print("=" * 50)
    print("MONKEY DATASET CREATOR")
    print("=" * 50)
    
    if not os.path.exists(images_dir):
        print(f"Error: Images directory not found: {images_dir}")
        exit(1)
    
    create_dataset(images_dir, output_path)
