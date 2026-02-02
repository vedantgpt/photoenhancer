"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Session state from backend
interface SessionState {
    entropy: number;
    entropy_level: string;
    collapsed: boolean;
    warnings: string[];
    system_unstable: boolean;
}

interface ProcessingScreenProps {
    onComplete: () => void;
    sessionState?: SessionState | null;
}

// Fake beauty loading messages (Phase 1 - The Disguise)
const beautyMessages = [
    "Analyzing facial features...",
    "Detecting skin tone...",
    "Applying AI enhancement...",
    "Optimizing lighting balance...",
    "Enhancing natural beauty...",
    "Processing beauty filters...",
    "Perfecting your glow...",
];

// System collapse messages (when entropy is high)
const collapseMessages = [
    "Neural pathway fragmentation...",
    "Pose memory corrupting...",
    "Cross-referencing chaos database...",
    "Recalibrating broken sensors...",
    "Quantum superposition detected...",
    "Reality check failing...",
];

export default function ProcessingScreen({ onComplete, sessionState }: ProcessingScreenProps) {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [showGlitch, setShowGlitch] = useState(false);

    // Determine which messages to use based on entropy
    const isUnstable = sessionState?.system_unstable || false;
    const isCollapsed = sessionState?.collapsed || false;
    const messages = isCollapsed ? collapseMessages : beautyMessages;

    useEffect(() => {
        // Animate progress bar
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                const increment = Math.random() * 15;
                const newProgress = prev + increment;

                // Dramatic pause at 99%
                if (newProgress >= 99) {
                    clearInterval(progressInterval);
                    return 99;
                }
                return newProgress;
            });
        }, 150);

        // Cycle through messages
        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 600);

        // Trigger glitch effects when unstable
        let glitchInterval: ReturnType<typeof setInterval>;
        if (isUnstable) {
            glitchInterval = setInterval(() => {
                setShowGlitch(true);
                setTimeout(() => setShowGlitch(false), 100);
            }, 800);
        }

        // Auto-complete after delay (actual completion is controlled by parent)
        const completeTimeout = setTimeout(() => {
            setProgress(100);
        }, 2500);

        return () => {
            clearInterval(progressInterval);
            clearInterval(messageInterval);
            if (glitchInterval) clearInterval(glitchInterval);
            clearTimeout(completeTimeout);
        };
    }, [messages.length, isUnstable]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex flex-col items-center justify-center min-h-screen px-6 ${showGlitch ? "animate-pulse" : ""
                }`}
            style={{
                background: isUnstable
                    ? "linear-gradient(135deg, #1A1A2E 0%, #2D1B3D 50%, #1A1A2E 100%)"
                    : undefined,
            }}
        >
            {/* Animated Spinner */}
            <motion.div
                animate={{
                    rotate: 360,
                    scale: showGlitch ? [1, 1.1, 0.9, 1] : 1,
                }}
                transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 0.1 },
                }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-8 relative"
                style={{
                    background: isUnstable
                        ? "linear-gradient(135deg, #FF6B9D, #FF0000, #C44DFF)"
                        : "linear-gradient(135deg, #FF6B9D, #C44DFF)",
                    boxShadow: isUnstable
                        ? "0 0 40px rgba(255, 0, 0, 0.4), 0 0 80px rgba(255, 107, 157, 0.2)"
                        : "0 0 40px rgba(255, 107, 157, 0.4)",
                }}
            >
                <span className="text-4xl">
                    {isCollapsed ? "💀" : isUnstable ? "⚠️" : "✨"}
                </span>

                {/* Glitch overlay */}
                {showGlitch && (
                    <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping" />
                )}
            </motion.div>

            {/* Loading Text */}
            <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-lg mb-6 text-center ${isUnstable ? "text-red-300 font-mono" : "text-white/90"
                    }`}
                style={{
                    textShadow: showGlitch ? "2px 2px 0px #FF0000, -2px -2px 0px #00FFFF" : undefined,
                }}
            >
                {messages[messageIndex]}
            </motion.p>

            {/* Progress Bar */}
            <div className="w-full max-w-xs">
                <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{
                        background: isUnstable ? "rgba(255,0,0,0.2)" : "rgba(255,255,255,0.2)",
                    }}
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full"
                        style={{
                            background: isUnstable
                                ? "linear-gradient(90deg, #FF6B9D, #FF0000, #C44DFF)"
                                : "linear-gradient(90deg, #FF6B9D, #C44DFF)",
                        }}
                    />
                </div>
                <p className="text-white/50 text-sm text-center mt-2">
                    {progress.toFixed(0)}%
                </p>
            </div>

            {/* Entropy indicator (when unstable) */}
            {isUnstable && sessionState && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 text-center"
                >
                    <p className="text-red-400 text-xs font-mono mb-2">
                        SYSTEM ENTROPY: {(sessionState.entropy * 100).toFixed(0)}%
                    </p>
                    {sessionState.warnings.slice(0, 2).map((warning, i) => (
                        <p key={i} className="text-red-300/60 text-xs font-mono">
                            {warning}
                        </p>
                    ))}
                </motion.div>
            )}

            {/* Collapse warning */}
            {isCollapsed && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-6 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg"
                >
                    <p className="text-red-400 text-sm font-mono text-center">
                        ⚠️ CRITICAL: System stability compromised
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
