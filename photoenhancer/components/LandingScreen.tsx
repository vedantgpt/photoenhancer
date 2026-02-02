"use client";

import { Sparkles, Camera, Wand2, Sun, Star, Download, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface LandingScreenProps {
    onStart: () => void;
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
    const features = [
        { icon: Sparkles, text: "AI Skin Smoothing" },
        { icon: Camera, text: "Perfect Pose Guidance" },
        { icon: Sun, text: "Pro Lighting Adjustment" },
        { icon: Wand2, text: "Real-time Beauty Filters" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center"
        >
            {/* Logo */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF6B9D] to-[#C44DFF] flex items-center justify-center mb-6 shadow-2xl"
            >
                <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold mb-2 gradient-text"
            >
                Glow Up Selfie Pro
            </motion.h1>

            {/* Tagline */}
            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/70 mb-8 max-w-xs"
            >
                AI-Powered Beauty Enhancement
            </motion.p>

            {/* Features */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 mb-8 w-full max-w-sm"
            >
                <div className="space-y-4">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="flex items-center gap-3 text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B9D]/20 to-[#C44DFF]/20 flex items-center justify-center">
                                <feature.icon className="w-5 h-5 text-[#FF6B9D]" />
                            </div>
                            <span className="text-white/90 font-medium">{feature.text}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white"
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                            scale: Math.random() * 0.5 + 0.5,
                            opacity: Math.random() * 0.5 + 0.2,
                        }}
                        animate={{
                            y: [0, -100],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5,
                        }}
                        style={{
                            width: Math.random() * 4 + 2 + "px",
                            height: Math.random() * 4 + 2 + "px",
                        }}
                    />
                ))}
            </div>

            {/* Trust Badges */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-4 mb-8 text-sm text-white/60"
            >
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>4.9 Rating</span>
                </div>
                <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>2M+ Downloads</span>
                </div>
                <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>Editor&apos;s Choice</span>
                </div>
            </motion.div>

            {/* CTA Button */}
            <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStart}
                className="btn-primary flex items-center gap-2 text-lg"
            >
                <Sparkles className="w-5 h-5" />
                Start Your Glow Up
            </motion.button>
        </motion.div>
    );
}
