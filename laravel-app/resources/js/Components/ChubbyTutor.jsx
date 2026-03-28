import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// Konfigurasi mood karakter
const MOODS = {
    idle:       { bodyColor:'#6366f1', eyeType:'normal', mouthType:'smile',   emoji:'🧠', bounce:false },
    happy:      { bodyColor:'#22c55e', eyeType:'happy',  mouthType:'big',     emoji:'🎉', bounce:true  },
    cheering:   { bodyColor:'#f59e0b', eyeType:'star',   mouthType:'wow',     emoji:'🔥', bounce:true  },
    explaining: { bodyColor:'#3b82f6', eyeType:'normal', mouthType:'talking', emoji:'💡', bounce:false },
    sad:        { bodyColor:'#ef4444', eyeType:'sad',    mouthType:'frown',   emoji:'😅', bounce:false },
    // Mode ujian
    focused:    { bodyColor:'#334155', eyeType:'glasses',mouthType:'serious', emoji:'🎓', bounce:false },
    urgent:     { bodyColor:'#dc2626', eyeType:'glasses',mouthType:'worried', emoji:'⏰', bounce:true  },
    proud:      { bodyColor:'#059669', eyeType:'glasses',mouthType:'smile',   emoji:'✅', bounce:false },
};

function EyesSVG({ type, color }) {
    if (type === 'glasses') return (
        <>
            <rect x="20" y="26" width="20" height="13" rx="4" fill="rgba(200,230,255,0.25)" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="46" y="26" width="20" height="13" rx="4" fill="rgba(200,230,255,0.25)" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="40" y1="33" x2="46" y2="33" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="30" cy="33" r="3.5" fill="#1e293b"/>
            <circle cx="56" cy="33" r="3.5" fill="#1e293b"/>
            <circle cx="32" cy="31" r="1.2" fill="white"/>
            <circle cx="58" cy="31" r="1.2" fill="white"/>
        </>
    );

    if (type === 'star') return (
        <>
            <text x="30" y="42" textAnchor="middle" fontSize="16">⭐</text>
            <text x="56" y="42" textAnchor="middle" fontSize="16">⭐</text>
        </>
    );

    if (type === 'happy') return (
        <>
            <path d="M22 37 Q30 28 38 37" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <path d="M48 37 Q56 28 64 37" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
        </>
    );

    if (type === 'sad') return (
        <>
            <circle cx="30" cy="33" r="6" fill="#1e293b"/>
            <circle cx="56" cy="33" r="6" fill="#1e293b"/>
            <circle cx="32" cy="31" r="2" fill="white"/>
            <circle cx="58" cy="31" r="2" fill="white"/>
            <path d="M30 39 Q28 46 30 48" stroke="rgba(100,160,255,0.7)" strokeWidth="2.5" fill="rgba(100,160,255,0.4)"/>
        </>
    );

    return (
        <>
            <circle cx="30" cy="33" r="6" fill="#1e293b"/>
            <circle cx="56" cy="33" r="6" fill="#1e293b"/>
            <circle cx="32" cy="31" r="2" fill="white"/>
            <circle cx="58" cy="31" r="2" fill="white"/>
        </>
    );
}

function MouthSVG({ type }) {
    if (type === 'big')     return <path d="M22 57 Q43 73 64 57" fill="#1e293b"/>;
    if (type === 'wow')     return <ellipse cx="43" cy="60" rx="11" ry="9" fill="#1e293b"/>;
    if (type === 'frown')   return <path d="M25 66 Q43 55 61 66" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round"/>;
    if (type === 'serious') return <line x1="28" y1="63" x2="58" y2="63" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round"/>;
    if (type === 'worried') return <path d="M26 65 Q43 61 60 65" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/>;
    if (type === 'talking') return (
        <>
            <path d="M26 60 Q43 70 60 60" fill="#1e293b"/>
            <path d="M30 60 Q43 55 56 60" fill="#ffaaaa"/>
        </>
    );
    return <path d="M26 61 Q43 70 60 61" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round"/>;
}

export default function ChubbyTutor({ mood = 'idle', message = '', mode = 'learning', size = 110 }) {
    const [showBounce, setShowBounce] = useState(false);
    const cfg = MOODS[mood] || MOODS.idle;

    useEffect(() => {
        if (cfg.bounce) {
            setShowBounce(true);
            const t = setTimeout(() => setShowBounce(false), 800);
            return () => clearTimeout(t);
        }
    }, [mood, cfg.bounce]);

    const isExam = mode === 'exam';

    return (
        <div className="flex flex-col items-center gap-2">
            <motion.div
                animate={{
                    y:     showBounce ? [0, -22, 0, -10, 0] : [0, -5, 0],
                    scale: showBounce ? [1, 1.12, 1] : 1,
                    rotate: mood === 'cheering' ? [-6, 6, -3, 0] : 0,
                }}
                transition={{
                    duration:  showBounce ? 0.7 : 3.5,
                    repeat:    showBounce ? 0 : Infinity,
                    ease:      'easeInOut',
                }}
            >
                <svg width={size} height={size * 1.1} viewBox="0 0 86 95">
                    {/* Bayangan */}
                    <ellipse cx="43" cy="93" rx="25" ry="4" fill="rgba(0,0,0,0.2)"/>

                    {/* Badan */}
                    <ellipse cx="43" cy="70" rx="26" ry="20" fill={cfg.bodyColor}/>

                    {/* Tangan */}
                    {mood === 'cheering' ? (
                        <>
                            <path d="M17 58 Q5 38 9 26" stroke={cfg.bodyColor} strokeWidth="10" fill="none" strokeLinecap="round"/>
                            <path d="M69 58 Q81 38 77 26" stroke={cfg.bodyColor} strokeWidth="10" fill="none" strokeLinecap="round"/>
                            <circle cx="9"  cy="25" r="7" fill={cfg.bodyColor}/>
                            <circle cx="77" cy="25" r="7" fill={cfg.bodyColor}/>
                        </>
                    ) : (
                        <>
                            <path d="M17 64 Q7 68 9 78" stroke={cfg.bodyColor} strokeWidth="9" fill="none" strokeLinecap="round"/>
                            <path d="M69 64 Q79 68 77 78" stroke={cfg.bodyColor} strokeWidth="9" fill="none" strokeLinecap="round"/>
                        </>
                    )}

                    {/* Kaki */}
                    <rect x="28" y="85" width="10" height="11" rx="5" fill={cfg.bodyColor}/>
                    <rect x="48" y="85" width="10" height="11" rx="5" fill={cfg.bodyColor}/>

                    {/* Kepala */}
                    <circle cx="43" cy="38" r="30" fill={cfg.bodyColor}/>

                    {/* Pipi */}
                    <circle cx="16" cy="44" r="9" fill="rgba(255,200,200,0.35)"/>
                    <circle cx="70" cy="44" r="9" fill="rgba(255,200,200,0.35)"/>

                    {/* Highlight kepala */}
                    <circle cx="36" cy="21" r="9" fill="rgba(255,255,255,0.12)"/>

                    {/* Mata */}
                    <EyesSVG type={cfg.eyeType} color={cfg.bodyColor}/>

                    {/* Mulut */}
                    <MouthSVG type={cfg.mouthType}/>

                    {/* Badge emoji */}
                    <motion.text
                        x="61" y="17"
                        fontSize="17"
                        textAnchor="middle"
                        animate={{
                            scale:  [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    >
                        {cfg.emoji}
                    </motion.text>
                </svg>
            </motion.div>

            {/* Speech bubble */}
            <AnimatePresence mode="wait">
                {message && (
                    <motion.div
                        key={message.slice(0, 20)}
                        initial={{ opacity: 0, y: 8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.92 }}
                        transition={{ duration: 0.25 }}
                        className="max-w-[240px] text-center"
                    >
                        <div
                            className="relative px-4 py-2.5 rounded-2xl text-sm text-slate-200 leading-snug"
                            style={{
                                background: `${cfg.bodyColor}25`,
                                border: `2px solid ${cfg.bodyColor}50`,
                            }}
                        >
                            {/* Segitiga speech bubble */}
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0"
                                style={{
                                    borderLeft:   '7px solid transparent',
                                    borderRight:  '7px solid transparent',
                                    borderBottom: `10px solid ${cfg.bodyColor}50`,
                                }}
                            />
                            {message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
