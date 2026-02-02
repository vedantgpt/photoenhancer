"use client";

import { Camera, Lightbulb, Smile, Eye, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TipsScreenProps {
    onReady: () => void;
}

export default function TipsScreen({ onReady }: TipsScreenProps) {
    const tips = [
        {
            icon: Eye,
            text: "Find your best angle — slightly above eye level works best",
        },
        {
            icon: Lightbulb,
            text: "Use natural lighting when possible for authentic results",
        },
        {
            icon: Smile,
            text: "Relax your shoulders and jaw for a natural look",
        },
        {
            icon: Sparkles,
            text: 'Try the "smize" technique — smile with your eyes!',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen px-6 py-12"
        >
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2 mb-2"
            >
                <Camera className="w-8 h-8 text-[#FF6B9D]" />
                <h2 className="text-3xl font-bold text-white">Selfie Pro Tips</h2>
            </motion.div>

            <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white/60 mb-8 text-center max-w-xs"
            >
                Follow these tips for the best AI enhancement results
            </motion.p>

            {/* Tips List */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 w-full max-w-sm mb-8"
            >
                <div className="space-y-5">
                    {tips.map((tip, index) => (
                        <motion.div
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex items-start gap-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#C44DFF] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex items-start gap-3 flex-1">
                                <tip.icon className="w-5 h-5 text-[#FF6B9D] mt-0.5 flex-shrink-0" />
                                <span className="text-white/80 text-sm leading-relaxed">
                                    {tip.text}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* AI Promise */}
            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-white/50 text-sm mb-8 text-center max-w-xs"
            >
                Our AI will analyze your pose and enhance your natural beauty ✨
            </motion.p>

            {/* Ready Button */}
            <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReady}
                className="btn-primary flex items-center gap-2"
            >
                <Camera className="w-5 h-5" />
                I&apos;m Ready! Open Camera
            </motion.button>
        </motion.div>
    );
}
