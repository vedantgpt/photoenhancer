"use client";

import { useEffect, useState } from "react";
import { Share2, RefreshCw, Send, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

// Session state from backend
interface SessionState {
    entropy: number;
    entropy_level: string;
    collapsed: boolean;
    warnings: string[];
    system_unstable: boolean;
    attempts: number;
}

interface ResultScreenProps {
    monkeyImage: string;
    species: string;
    confidence: number;
    glowLevel: string;
    onTryAgain: () => void;
    onShare: () => void;
    sessionState?: SessionState | null;
    mutations?: string[];
    chaosMessage?: string;
}

export default function ResultScreen({
    monkeyImage,
    species,
    confidence,
    glowLevel,
    onTryAgain,
    onShare,
    sessionState,
    mutations,
    chaosMessage,
}: ResultScreenProps) {
    const [showGlitch, setShowGlitch] = useState(false);
    const [glitchedConfidence, setGlitchedConfidence] = useState(confidence);

    const isUnstable = sessionState?.system_unstable || false;
    const isCollapsed = sessionState?.collapsed || false;
    const entropy = sessionState?.entropy || 0;

    // Apply visual glitches when system is unstable
    useEffect(() => {
        if (!isUnstable) return;

        const glitchInterval = setInterval(() => {
            setShowGlitch(true);
            // Randomly corrupt the confidence display
            if (Math.random() > 0.5) {
                setGlitchedConfidence(confidence + (Math.random() - 0.5) * 20);
            }
            setTimeout(() => {
                setShowGlitch(false);
                setGlitchedConfidence(confidence);
            }, 150);
        }, 2000);

        return () => clearInterval(glitchInterval);
    }, [isUnstable, confidence]);

    // Get stability indicator color
    const getStabilityColor = () => {
        if (entropy < 0.3) return "text-green-400";
        if (entropy < 0.6) return "text-yellow-400";
        if (entropy < 0.8) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex flex-col items-center min-h-screen px-6 py-8 ${showGlitch ? "animate-pulse" : ""
                }`}
            style={{
                filter: showGlitch ? "hue-rotate(180deg)" : undefined,
            }}
        >
            {/* Title */}
            <motion.h2
                initial={{ y: -20, scale: 0.8 }}
                animate={{
                    y: 0,
                    scale: 1,
                }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-3xl font-bold text-center mb-6"
            >
                <span className="text-4xl">{isCollapsed ? "💀" : "🐒"}</span>
                <span
                    className="gradient-text mx-2"
                    style={{
                        textShadow: showGlitch
                            ? "2px 2px 0px #FF0000, -2px -2px 0px #00FFFF"
                            : undefined,
                    }}
                >
                    {isCollapsed ? "SYSTEM COLLAPSED!" : "YOUR TRUE GLOW UP!"}
                </span>
                <span className="text-4xl">{isCollapsed ? "💀" : "🐒"}</span>
            </motion.h2>

            {/* Monkey Image */}
            <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{
                    scale: 1,
                    rotate: 0,
                }}
                transition={{ type: "spring", delay: 0.2 }}
                className="relative w-72 h-72 rounded-3xl overflow-hidden mb-6 shadow-2xl"
                style={{
                    boxShadow: isUnstable
                        ? "0 25px 80px rgba(255, 0, 0, 0.4)"
                        : "0 25px 80px rgba(255, 107, 157, 0.4)",
                }}
            >
                <Image
                    src={monkeyImage}
                    alt="Your Monkey Twin"
                    fill
                    className="object-cover"
                    style={{
                        filter: showGlitch ? "saturate(2) contrast(1.5)" : undefined,
                    }}
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white text-sm font-medium px-3 py-1 bg-black/40 rounded-full backdrop-blur-sm">
                        {isCollapsed ? "⚠️ Chaotic Match" : "↑ Your Selfie Twin!"}
                    </span>
                </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`glass-card p-5 w-full max-w-sm mb-6 ${isUnstable ? "border-red-500/30" : ""
                    }`}
            >
                <h3 className="text-white/60 text-sm font-medium mb-4 text-center">
                    {isCollapsed ? '"Corrupted" Results' : '"Scientific" Results'}
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">📊 Pose Match</span>
                        <span
                            className={`font-bold ${isUnstable ? "text-red-400 font-mono" : "text-[#FF6B9D]"}`}
                            style={{
                                textShadow: showGlitch ? "1px 1px 0px #00FF00" : undefined,
                            }}
                        >
                            {glitchedConfidence.toFixed(1)}%
                            {showGlitch && <span className="text-green-400 ml-1">??</span>}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">🐵 Species</span>
                        <span className="text-white font-medium">{species}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">✨ Glow Level</span>
                        <span className="gradient-text font-bold">{glowLevel}</span>
                    </div>

                    {/* System Stability */}
                    {sessionState && (
                        <div className="flex justify-between items-center py-2">
                            <span className="text-white/70">🔧 System Status</span>
                            <span className={`font-mono text-sm ${getStabilityColor()}`}>
                                {sessionState.entropy_level}
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Chaos Message */}
            {chaosMessage && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg"
                >
                    <p className="text-purple-300 text-sm text-center italic">
                        "{chaosMessage}"
                    </p>
                </motion.div>
            )}

            {/* Mutations Applied (debug info) */}
            {mutations && mutations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-4 text-center"
                >
                    <p className="text-white/40 text-xs font-mono">
                        Mutations: {mutations.join(", ")}
                    </p>
                </motion.div>
            )}

            {/* Fun Message */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/50 text-sm text-center mb-6 max-w-xs"
            >
                {isCollapsed ? (
                    <>
                        "System collapse complete."
                        <br />
                        <span className="text-red-400">All matches are now chaotic 🧬</span>
                    </>
                ) : (
                    <>
                        "We found your perfect match!"
                        <br />
                        <span className="text-[#FF6B9D]">AI enhancement complete 🧬</span>
                    </>
                )}
            </motion.p>

            {/* System Warnings */}
            {sessionState?.warnings && sessionState.warnings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 w-full max-w-sm"
                >
                    {sessionState.warnings.slice(0, 2).map((warning, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-orange-400/80 font-mono mb-1"
                        >
                            <AlertTriangle className="w-3 h-3" />
                            <span>{warning}</span>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4 w-full max-w-sm mb-4"
            >
                <button
                    onClick={onShare}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                    <Share2 className="w-5 h-5" />
                    Share
                </button>
                <button
                    onClick={onTryAgain}
                    className={`btn-secondary flex-1 flex items-center justify-center gap-2 ${isUnstable ? "border-red-500/30 hover:bg-red-500/10" : ""
                        }`}
                >
                    <RefreshCw className="w-5 h-5" />
                    {isCollapsed ? "Chaos Again" : "Again"}
                </button>
            </motion.div>

            {/* Attempt Counter */}
            {sessionState && sessionState.attempts > 1 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/30 text-xs font-mono mb-4"
                >
                    Attempt #{sessionState.attempts} | Entropy: {(sessionState.entropy * 100).toFixed(0)}%
                </motion.p>
            )}

            {/* Prank a Friend */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
                <Send className="w-4 h-4" />
                Prank a Friend
            </motion.button>
        </motion.div>
    );
}
