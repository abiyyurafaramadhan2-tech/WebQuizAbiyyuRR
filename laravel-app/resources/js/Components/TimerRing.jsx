import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export default function TimerRing({ duration = 30, onExpire, isPaused = false }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const timerRef = useRef(null);

    const r        = 34;
    const circ     = 2 * Math.PI * r;
    const ratio    = timeLeft / duration;
    const color    = timeLeft > 10 ? '#22c55e' : timeLeft > 5 ? '#f59e0b' : '#ef4444';
    const isUrgent = timeLeft <= 5;

    useEffect(() => {
        setTimeLeft(duration);
    }, [duration]);

    useEffect(() => {
        if (isPaused) return;
        if (timeLeft <= 0) { onExpire?.(); return; }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { onExpire?.(); return 0; }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [timeLeft, isPaused]);

    useEffect(() => {
        if (isPaused) clearInterval(timerRef.current);
    }, [isPaused]);

    return (
        <div className="relative flex items-center justify-center w-[80px] h-[80px]">
            <svg width="80" height="80" viewBox="0 0 80 80">
                {/* Lingkaran background */}
                <circle cx="40" cy="40" r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="5.5"
                />
                {/* Lingkaran progress */}
                <motion.circle
                    cx="40" cy="40" r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - ratio)}
                    transform="rotate(-90 40 40)"
                    style={{ filter: `drop-shadow(0 0 5px ${color})` }}
                    transition={{ duration: 0.9, ease: 'linear' }}
                />
            </svg>

            {/* Angka */}
            <motion.div
                className="absolute font-black text-2xl"
                style={{ color }}
                animate={isUrgent ? { scale: [1, 1.25, 1] } : {}}
                transition={isUrgent ? { duration: 0.5, repeat: Infinity } : {}}
            >
                {timeLeft}
            </motion.div>
        </div>
    );
}
