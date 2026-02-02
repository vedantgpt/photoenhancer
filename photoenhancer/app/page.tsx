"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import LandingScreen from "@/components/LandingScreen";
import TipsScreen from "@/components/TipsScreen";
import CameraScreen from "@/components/CameraScreen";
import ProcessingScreen from "@/components/ProcessingScreen";
import ResultScreen from "@/components/ResultScreen";
import RejectionPopup, { RejectionMessage } from "@/components/RejectionPopup";

type Screen = "landing" | "tips" | "camera" | "processing" | "result";

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Session state from backend
interface SessionState {
  session_id: string;
  entropy: number;
  entropy_level: string;
  attempts: number;
  collapsed: boolean;
  mutations: string[];
  warnings: string[];
  system_unstable: boolean;
}

// API response type
interface AnalyzeResponse {
  success: boolean;
  monkey_image: string;
  monkey_id: string;
  species: string;
  confidence: number;
  real_confidence: number;
  match_quality: string;
  mutations_applied: string[];
  chaos_message?: string;
  session: SessionState;
  attempt: number;
  pose_debug?: {
    avg_confidence: number;
    partial: boolean;
    error?: string;
  };
}

// Glow levels for display
const glowLevels = ["LEGENDARY", "MAXIMUM", "EPIC", "DIVINE", "SUPREME"];

// Rejection messages for "Unexpected Resistance"
const rejectionMessages: RejectionMessage[] = [
  {
    title: "⚠️ Lighting Issue Detected",
    message: "Please move to an area with better lighting for optimal AI enhancement.",
    icon: "💡",
  },
  {
    title: "📐 Pose Alignment Required",
    message: "Please center your face in the frame and keep shoulders relaxed.",
    icon: "🧘",
  },
  {
    title: "🔄 Angle Adjustment Needed",
    message: "Tilt your chin slightly down for the perfect angle.",
    icon: "📸",
  },
  {
    title: "👀 Eye Contact Required",
    message: "Look directly at the camera for best results.",
    icon: "👁️",
  },
  {
    title: "🤖 AI Calibration Error",
    message: "Unable to detect facial landmarks. Please adjust position.",
    icon: "⚙️",
  },
  {
    title: "📊 Quality Check Failed",
    message: "Image clarity below threshold. Hold camera steady.",
    icon: "📷",
  },
  {
    title: "✨ Aura Not Aligned",
    message: "Your energy seems off. Take a deep breath and try again.",
    icon: "🌟",
  },
];

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [showRejection, setShowRejection] = useState(false);
  const [currentRejection, setCurrentRejection] = useState<RejectionMessage>(rejectionMessages[0]);
  
  // Backend response state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [monkeyResult, setMonkeyResult] = useState<AnalyzeResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Audio refs
  const drumrollRef = useRef<HTMLAudioElement | null>(null);
  const tadaRef = useRef<HTMLAudioElement | null>(null);
  const glitchRef = useRef<HTMLAudioElement | null>(null);

  // Initialize session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/session`, { method: "POST" });
        const data = await response.json();
        setSessionId(data.session_id);
      } catch {
        // Fallback: generate local session ID
        setSessionId(`local-${Date.now()}`);
      }
    };
    initSession();
  }, []);

  // Check if should reject capture (Unexpected Resistance)
  const shouldRejectCapture = useCallback(() => {
    const newAttempts = captureAttempts + 1;
    setCaptureAttempts(newAttempts);

    // First attempt: 70% chance of rejection
    if (newAttempts === 1 && Math.random() < 0.7) {
      const randomRejection = rejectionMessages[Math.floor(Math.random() * rejectionMessages.length)];
      setCurrentRejection(randomRejection);
      setShowRejection(true);
      return true;
    }

    // Second attempt: 50% chance of rejection
    if (newAttempts === 2 && Math.random() < 0.5) {
      const randomRejection = rejectionMessages[Math.floor(Math.random() * rejectionMessages.length)];
      setCurrentRejection(randomRejection);
      setShowRejection(true);
      return true;
    }

    // Third+ attempt: Always accept
    return false;
  }, [captureAttempts]);

  // Send image to backend for analysis
  const analyzeImage = useCallback(async (imageData: string) => {
    setIsAnalyzing(true);
    setApiError(null);

    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append("image", blob, "selfie.jpg");

      // Send to backend
      const apiResponse = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "X-Session-ID": sessionId || "",
        },
        body: formData,
      });

      const result: AnalyzeResponse = await apiResponse.json();
      
      setMonkeyResult(result);
      setSessionState(result.session);

      // Play sound effects based on system state
      if (result.session.system_unstable && glitchRef.current) {
        glitchRef.current.play().catch(() => {});
      }

      return result;
    } catch {
      // Fallback: use random monkey (productive failure!)
      setApiError("Backend unavailable - using chaos mode");
      
      const fallbackMonkeys = [
        { image: "/monkeys/monkey1.jpg", species: "Mystery Primate" },
        { image: "/monkeys/monkey_yoga.jpg", species: "Zen Master" },
        { image: "/monkeys/monkey_peace.jpg", species: "Peace Ambassador" },
      ];
      const randomMonkey = fallbackMonkeys[Math.floor(Math.random() * fallbackMonkeys.length)];
      
      const fallbackResult: AnalyzeResponse = {
        success: true,
        monkey_image: randomMonkey.image,
        monkey_id: "chaos",
        species: randomMonkey.species,
        confidence: 85 + Math.random() * 14,
        real_confidence: 0,
        match_quality: "MYSTERIOUS",
        mutations_applied: ["OFFLINE_CHAOS"],
        chaos_message: "The void gazes back... and finds kinship",
        session: {
          session_id: sessionId || "offline",
          entropy: 0.9,
          entropy_level: "CRITICAL",
          attempts: captureAttempts,
          collapsed: true,
          mutations: ["OFFLINE_MODE"],
          warnings: ["Backend unreachable - chaos mode active"],
          system_unstable: true,
        },
        attempt: captureAttempts,
      };
      
      setMonkeyResult(fallbackResult);
      setSessionState(fallbackResult.session);
      return fallbackResult;
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, captureAttempts]);

  const handleCapture = useCallback(async (imageData: string) => {
    // Reset attempts and go to processing
    setCaptureAttempts(0);
    setCurrentScreen("processing");

    // Play drumroll if available
    if (drumrollRef.current) {
      drumrollRef.current.play().catch(() => {});
    }

    // Analyze with backend
    await analyzeImage(imageData);

    // Short delay for dramatic effect, then reveal
    setTimeout(() => {
      // Play tada on result
      if (tadaRef.current) {
        tadaRef.current.play().catch(() => {});
      }
      setCurrentScreen("result");
    }, 2500);
  }, [analyzeImage]);

  const handleTryAgain = useCallback(() => {
    setCaptureAttempts(0);
    setMonkeyResult(null);
    setCurrentScreen("camera");
  }, []);

  const handleShare = useCallback(async () => {
    if (!monkeyResult) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Glow Up Result! 🐒",
          text: `I'm ${monkeyResult.confidence.toFixed(1)}% ${monkeyResult.species}! Get your glow up at:`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      // Fallback: copy link
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied! Share your glow up with friends 🐒");
    }
  }, [monkeyResult]);

  // Get current glow level
  const currentGlowLevel = monkeyResult?.match_quality || 
    glowLevels[Math.floor(Math.random() * glowLevels.length)];

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Audio Elements */}
      <audio ref={drumrollRef} src="/sounds/drumroll.mp3" preload="auto" />
      <audio ref={tadaRef} src="/sounds/tada.mp3" preload="auto" />
      <audio ref={glitchRef} src="/sounds/glitch.mp3" preload="auto" />

      {/* System Status Bar (visible when unstable) */}
      {sessionState?.system_unstable && currentScreen !== "landing" && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/20 backdrop-blur-sm border-b border-red-500/50 px-4 py-2">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <span className="text-red-400 text-xs font-mono animate-pulse">
              ⚠️ SYSTEM UNSTABLE
            </span>
            <span className="text-red-300 text-xs font-mono">
              Entropy: {((sessionState?.entropy || 0) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentScreen === "landing" && (
          <LandingScreen
            key="landing"
            onStart={() => setCurrentScreen("tips")}
          />
        )}

        {currentScreen === "tips" && (
          <TipsScreen
            key="tips"
            onReady={() => setCurrentScreen("camera")}
          />
        )}

        {currentScreen === "camera" && (
          <CameraScreen
            key="camera"
            onCapture={handleCapture}
            onShowRejection={shouldRejectCapture}
          />
        )}

        {currentScreen === "processing" && (
          <ProcessingScreen
            key="processing"
            onComplete={() => setCurrentScreen("result")}
            sessionState={sessionState}
          />
        )}

        {currentScreen === "result" && monkeyResult && (
          <ResultScreen
            key="result"
            monkeyImage={monkeyResult.monkey_image}
            species={monkeyResult.species}
            confidence={monkeyResult.confidence}
            glowLevel={currentGlowLevel}
            onTryAgain={handleTryAgain}
            onShare={handleShare}
            sessionState={sessionState}
            mutations={monkeyResult.mutations_applied}
            chaosMessage={monkeyResult.chaos_message}
          />
        )}
      </AnimatePresence>

      {/* Rejection Popup */}
      <RejectionPopup
        isOpen={showRejection}
        rejection={currentRejection}
        attemptCount={captureAttempts}
        onTryAgain={() => setShowRejection(false)}
      />

      {/* Debug info (hidden in production) */}
      {process.env.NODE_ENV === "development" && apiError && (
        <div className="fixed bottom-4 left-4 right-4 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/50 rounded-lg px-4 py-2 z-50">
          <span className="text-yellow-400 text-xs font-mono">{apiError}</span>
        </div>
      )}
    </main>
  );
}
