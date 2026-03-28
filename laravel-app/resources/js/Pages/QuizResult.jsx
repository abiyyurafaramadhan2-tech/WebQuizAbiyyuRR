import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const SUBJECT_LABELS = {
    math:'Matematika', science:'IPA', indonesian:'B. Indonesia',
    english:'B. Inggris', history:'Sejarah', civics:'PKN',
    geography:'Geografi', biology:'Biologi', chemistry:'Kimia',
    physics:'Fisika', economics:'Ekonomi', arts:'Seni Budaya',
};

export default function QuizResult({ result }) {
    const pct = result.accuracy;
    const isGood = pct >= 70;
    const isPerfect = pct === 100;

    const getGrade = () => {
        if (pct >= 90) return { label:'A', color:'#22c55e',  msg:'Luar Biasa! 🏆' };
        if (pct >= 80) return { label:'B', color:'#3b82f6',  msg:'Bagus! 👏' };
        if (pct >= 70) return { label:'C', color:'#f59e0b',  msg:'Cukup Baik! 💪' };
        if (pct >= 60) return { label:'D', color:'#f97316',  msg:'Perlu Latihan 📚' };
        return { label:'E', color:'#ef4444', msg:'Ayo Belajar Lagi! 🔥' };
    };

    const grade = getGrade();

    return (
        <AppLayout title="Hasil Quiz">
            <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-sm mx-auto">

                {/* Emoji besar */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="text-8xl mb-4"
                >
                    {isPerfect ? '🏆' : isGood ? '🎉' : '📚'}
                </motion.div>

                {/* Grade */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-8xl font-black mb-2"
                    style={{ color: grade.color, textShadow: `0 0 30px ${grade.color}` }}
                >
                    {grade.label}
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-white font-bold text-xl mb-6"
                >
                    {grade.msg}
                </motion.p>

                {/* Stats card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="w-full rounded-3xl p-6 mb-6"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label:'Skor',     value:result.score.toLocaleString(), emoji:'⭐', color:'#fbbf24' },
                            { label:'Akurasi',  value:`${result.accuracy}%`,         emoji:'🎯', color:grade.color },
                            { label:'Benar',    value:`${result.correct_answers}/${result.total_questions}`, emoji:'✅', color:'#22c55e' },
                            { label:'Streak',   value:`×${result.max_streak}`,        emoji:'🔥', color:'#f59e0b' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center p-3 rounded-2xl bg-white/5">
                                <div className="text-2xl mb-1">{stat.emoji}</div>
                                <div className="font-black text-xl" style={{ color: stat.color }}>{stat.value}</div>
                                <div className="text-slate-400 text-xs">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm text-slate-400">
                        <span>📚 {SUBJECT_LABELS[result.subject] || result.subject}</span>
                        <span>⏱ {Math.floor(result.total_time / 60)}m {result.total_time % 60}s</span>
                    </div>
                </motion.div>

                {/* Tombol aksi */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                    className="w-full flex flex-col gap-3"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => router.visit(route('dashboard'))}
                        className="w-full py-4 rounded-2xl font-black text-lg text-white"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        🚀 Main Lagi!
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => router.visit(route('leaderboard'))}
                        className="w-full py-3.5 rounded-2xl font-bold text-sm border border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                    >
                        🏆 Lihat Leaderboard
                    </motion.button>
                </motion.div>
            </div>
        </AppLayout>
    );
                  }
