"use client";

import { useRef, useEffect, useState } from "react";
import { RefreshCw, Settings, Sparkles, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CameraScreenProps {
    onCapture: (imageData: string) => void;
    onShowRejection: () => boolean;
}

export default function CameraScreen({ onCapture, onShowRejection }: CameraScreenProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [beautyLevel, setBeautyLevel] = useState(60);
    const [showControls, setShowControls] = useState(true);
    const [activeToggles, setActiveToggles] = useState({
        smooth: true,
        eyes: true,
        contour: true,
        slim: false,
    });
    const [selectedFilter, setSelectedFilter] = useState(0);

    const filters = [
        { colors: ["#ffffff", "#eeeeee"], name: "Natural" },
        { colors: ["#FFD93D", "#FF6B6B"], name: "Warm" },
        { colors: ["#6BCB77", "#4D96FF"], name: "Cool" },
        { colors: ["#C44DFF", "#FF6B9D"], name: "Glow" },
        { colors: ["#333333", "#555555"], name: "B&W" },
    ];

    useEffect(() => {
        startCamera();
        return () => {
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 1280, height: 720 },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => setIsReady(true);
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Camera access is required for the glow up! Please allow camera access.");
        }
    };

    const handleCapture = () => {
        if (onShowRejection()) return;

        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL("image/jpeg");
                onCapture(imageData);
            }
        }
    };

    const toggleEnhancement = (key: keyof typeof activeToggles) => {
        setActiveToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black overflow-hidden flex flex-col"
        >
            {/* Header - Absolute Top */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/60 to-transparent">
                <button className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer bg-white/10 rounded-full backdrop-blur-md">
                    <RefreshCw className="w-5 h-5" />
                </button>
                <div className="bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                    <span className="font-semibold text-white/90 text-sm tracking-wide">AI BEAUTY CAM</span>
                </div>
                <button className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer bg-white/10 rounded-full backdrop-blur-md">
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Camera Feed - Full Screen */}
            <div className="relative flex-1 bg-black">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />

                {/* Beauty Grid Overlay */}
                <svg className="beauty-grid absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="33" y1="0" x2="33" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                    <line x1="66" y1="0" x2="66" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                    <line x1="0" y1="33" x2="100" y2="33" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                    <line x1="0" y1="66" x2="100" y2="66" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />

                    {/* Corners */}
                    <path d="M5,20 V5 H20" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" />
                    <path d="M80,5 H95 V20" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" />
                    <path d="M5,80 V95 H20" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" />
                    <path d="M95,80 V95 H80" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" />
                </svg>

                {/* Loading overlay */}
                {!isReady && (
                    <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                        <div className="text-white/50 animate-pulse">Initializing AI Camera...</div>
                    </div>
                )}
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pb-6 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                <AnimatePresence>
                    {showControls && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="px-4 mb-4 select-none"
                        >
                            {/* Beauty Level & Filters Row */}
                            <div className="flex items-center gap-4 mb-4 px-2">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                                        <span>Natural</span>
                                        <span>AI Glam</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={beautyLevel}
                                        onChange={(e) => setBeautyLevel(Number(e.target.value))}
                                        className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                                        [&::-webkit-slider-thumb]:appearance-none
                                        [&::-webkit-slider-thumb]:w-4
                                        [&::-webkit-slider-thumb]:h-4
                                        [&::-webkit-slider-thumb]:rounded-full
                                        [&::-webkit-slider-thumb]:bg-[#FF6B9D]
                                        [&::-webkit-slider-thumb]:border-2
                                        [&::-webkit-slider-thumb]:border-white"
                                    />
                                </div>

                                {/* Mini Filters */}
                                <div className="flex gap-2">
                                    {filters.slice(0, 3).map((filter, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedFilter(index)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedFilter === index ? 'border-[#FF6B9D] scale-110' : 'border-white/20'}`}
                                            style={{ background: `linear-gradient(135deg, ${filter.colors[0]}, ${filter.colors[1]})` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {Object.entries(activeToggles).map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleEnhancement(key as keyof typeof activeToggles)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all backdrop-blur-sm
                                        ${value
                                                ? "bg-[#FF6B9D]/20 text-[#FF6B9D] border border-[#FF6B9D]/30"
                                                : "bg-white/5 text-white/60 border border-white/10"}`}
                                    >
                                        {value && "✨ "}{key.charAt(0).toUpperCase() + key.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Capture Area */}
                <div className="flex items-center justify-center gap-8 px-8 relative">
                    {/* Toggle Controls Visibility Button */}
                    <button
                        onClick={() => setShowControls(!showControls)}
                        className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        <ChevronUp className={`w-5 h-5 transition-transform duration-300 ${showControls ? "rotate-180" : ""}`} />
                    </button>

                    {/* Main Shutter Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCapture}
                        disabled={!isReady}
                        className="w-20 h-20 rounded-full border-4 border-white/30 p-1 cursor-pointer disabled:opacity-50 hover:border-white/50 transition-colors"
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#C44DFF] flex items-center justify-center shadow-[0_0_30px_rgba(255,107,157,0.4)]">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </motion.button>

                    {/* Gallery Preview Placeholder */}
                    <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
                    </div>
                </div>
            </div>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
        </motion.div>
    );
}
