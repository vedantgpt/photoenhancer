# 🐒 Monkey Doppelgänger

> A viral-ready prank web application that matches your selfie pose with a monkey doppelgänger!

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=nextdotjs)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green?logo=fastapi)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)

## 🎭 The Concept

**Monkey Doppelgänger** presents itself as a legitimate selfie enhancement app called "Glow Up Selfie Pro" – complete with beauty tips, filters, and professional photography advice. However, when users take their "perfect selfie," the app reveals its true purpose: matching them with a **monkey in the exact same pose**!

### The Prank Flow
1. 🎭 **The Disguise** - User opens what appears to be a professional selfie enhancement app
2. 📸 **The Setup** - App provides selfie tips, filter previews, and "AI enhancement" promises  
3. ⏳ **The Resistance** - System "rejects" 1-2 attempts with fake pose errors (building anticipation)
4. 🐒 **The Reveal** - After "processing," their monkey twin is revealed instead!

## ✨ Features

- **Pose Detection** - Uses MediaPipe for accurate full-body pose estimation
- **Face Expression Detection** - Matches facial expressions for better monkey pairing
- **Entropy System** - The system gets progressively "chaotic" with more usage
- **Fake Rejections** - Builds suspense by randomly rejecting captures with convincing excuses
- **Beautiful UI** - Glassmorphism design with smooth Framer Motion animations
- **Session Tracking** - Tracks entropy and mutations across user sessions

## 🏗️ Project Structure

```
monkeyproject/
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # FastAPI server with endpoints
│   ├── pose_detection.py       # MediaPipe pose extraction
│   ├── face_detection.py       # Facial expression classification
│   ├── matching.py             # Pose matching algorithm
│   ├── entropy.py              # Session entropy/chaos system
│   ├── monkey_dataset.json     # Pre-processed monkey poses
│   └── requirements.txt        # Python dependencies
│
├── photoenhancer/              # Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # Main app with screen routing
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles & design tokens
│   ├── components/
│   │   ├── LandingScreen.tsx   # "Glow Up Selfie Pro" landing
│   │   ├── TipsScreen.tsx      # Selfie tips (building trust)
│   │   ├── CameraScreen.tsx    # Camera capture with fake filters
│   │   ├── RejectionPopup.tsx  # Fake pose rejection messages
│   │   ├── ProcessingScreen.tsx# "AI Enhancement" loading
│   │   └── ResultScreen.tsx    # Monkey reveal + share options
│   └── package.json
│
└── PRD.md                      # Product Requirements Document
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm or bun
- Webcam access for selfie capture

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend
cd photoenhancer

# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:3000`

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | System info & status |
| `GET` | `/health` | Health check |
| `POST` | `/session` | Create new session |
| `GET` | `/session/{id}` | Get session stats |
| `POST` | `/analyze` | **Main endpoint** - Analyze pose & match monkey |
| `GET` | `/monkeys` | List all available monkeys |
| `POST` | `/reset/{id}` | Reset session entropy |

### Analyze Endpoint

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "X-Session-ID: your-session-id" \
  -F "image=@selfie.jpg"
```

**Response:**
```json
{
  "success": true,
  "monkey_image": "/monkeys/monkey1.jpg",
  "monkey_id": "curious_george",
  "species": "Curious George Vibes",
  "confidence": 94.7,
  "match_quality": "REMARKABLE",
  "face_expression": "happy",
  "pose_type": "arms_raised",
  "session": {
    "entropy": 15.2,
    "stability": 84.8,
    "attempts": 3
  }
}
```

## 🎨 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **MediaPipe Tasks Vision** - Client-side pose preview

### Backend
- **FastAPI** - Modern Python web framework
- **MediaPipe** - Pose & face detection
- **OpenCV** - Image processing
- **NumPy** - Numerical operations
- **Pillow** - Image handling

## 🧠 How It Works

### Pose Matching Algorithm

1. **Pose Extraction** - MediaPipe extracts 33 body keypoints from the selfie
2. **Normalization** - Poses are centered, scaled, and rotated for comparison
3. **Weighted Matching** - Upper body keypoints (shoulders, elbows, wrists) are weighted higher
4. **Expression Boost** - Face expression similarity adds bonus points
5. **Best Match** - Returns the monkey with the highest similarity score

### Entropy System (The Chaos)

The app has a hidden "entropy" system that increases with each attempt:
- Higher entropy = more chaotic/random results
- System applies "mutations" like score manipulation, pose misclassification
- After many attempts, the "system collapses" with glitchy effects

## 📸 Screenshots

The app features:
- Glassmorphism landing page with sparkle animations
- Professional camera UI with fake beauty controls
- Convincing rejection popups with "AI" excuses
- Dramatic reveal screen with match statistics

## 🤝 Contributing

This project was built for hackathon purposes. Feel free to:
- Add more monkey images to the dataset
- Improve pose matching accuracy
- Create new "rejection" messages
- Add more chaos mutations

## 📄 License

MIT License - Feel free to prank responsibly! 🐵

---

<p align="center">
  Made with 💜 and a lot of 🐒
</p>
