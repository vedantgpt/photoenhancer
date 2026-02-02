"use client";

import { Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface RejectionMessage {
    title: string;
    message: string;
    icon: string;
}

interface RejectionPopupProps {
    isOpen: boolean;
    rejection: RejectionMessage;
    attemptCount: number;
    onTryAgain: () => void;
}

export default function RejectionPopup({
    isOpen,
    rejection,
    attemptCount,
    onTryAgain,
}: RejectionPopupProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                >


                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 20 }}
                        className="glass-card p-8 max-w-sm w-full text-center"
                        style={{
                            background: "linear-gradient(135deg, #1A1A2E, #16213E)",
                        }}
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                            className="text-5xl mb-4"
                        >
                            {rejection.icon}
                        </motion.div>

                        {/* Title */}
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-semibold text-[#FF6B9D] mb-3"
                        >
                            {rejection.title}
                        </motion.h3>

                        {/* Message */}
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-white/70 mb-6 leading-relaxed"
                        >
                            {rejection.message}
                        </motion.p>

                        {/* Try Again Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onTryAgain}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Camera className="w-5 h-5" />
                            Try Again
                        </motion.button>

                        {/* Attempt Counter */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white/40 text-sm mt-4"
                        >
                            Attempt {attemptCount} of 3
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
