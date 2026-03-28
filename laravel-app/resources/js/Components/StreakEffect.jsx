import { motion, AnimatePresence } from 'framer-motion';

const MILESTONES = {
    3:  { text:'🔥 On Fire!',       color:'#f59e0b' },
    5:  { text:'⚡ Unstoppable!',   color:'#6366f1' },
    7:  { text:'🚀 Beast Mode!',    color:'#8b5cf6' },
    10: { text:'👑 LEGENDARY!!!',   color:'#fbbf24' },
};

export default function StreakEffect({ streak, show }) {
    const milestone = Object.entries(MILESTONES)
        .reverse()
        .find(([k]) => streak >= Number(k));

    return (
        <AnimatePresence>
            {show && milestone && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="flex flex-col items-center gap-3"
                        initial={{ scale: 0, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.5, y: -50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    >
                        <motion.div
                            className="text-8xl"
                            animate={{ rotate: [-15, 15, -10, 10, 0], scale: [0.7, 1.3, 1] }}
                            transition={{ duration: 0.6 }}
                        >
                            {milestone[1].text.split(' ')[0]}
                        </motion.div>

                        <div
                            className="px-8 py-3 rounded-2xl text-2xl font-black text-center backdrop-blur"
                            style={{
                                background: `${milestone[1].color}25`,
                                border:     `3px solid ${milestone[1].color}`,
                                color:      milestone[1].color,
                                boxShadow:  `0 0 50px ${milestone[1].color}55`,
                            }}
                        >
                            {milestone[1].text}
                            <div className="text-base font-semibold opacity-70 mt-1">
                                {streak}x Streak!
                            </div>
                        </div>
                    </motion.div>

                    {/* Partikel ledakan */}
                    {[...Array(10)].map((_, i) => (
                        <motion.div key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{ background: milestone[1].color }}
                            initial={{ x: 0, y: 0, opacity: 1 }}
                            animate={{
                                x: Math.cos((i / 10) * Math.PI * 2) * 140,
                                y: Math.sin((i / 10) * Math.PI * 2) * 140,
                                opacity: 0, scale: 0,
                            }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
