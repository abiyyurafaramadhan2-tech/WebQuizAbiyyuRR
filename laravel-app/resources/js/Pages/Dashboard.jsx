import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';

// Data kelas 1-12
const GRADES = Array.from({ length: 12 }, (_, i) => ({
    id:    `grade_${i + 1}`,
    label: `Kelas ${i + 1}`,
    emoji: ['🐣','🐥','🌱','🌿','🌲','🌳','🎒','🚀','⚡','🔥','💎','👑'][i],
    color: ['#4ade80','#22d3ee','#818cf8','#c084fc','#fb7185','#f97316',
            '#facc15','#34d399','#60a5fa','#a78bfa','#f472b6','#fbbf24'][i],
}));

// Data mata pelajaran
const SUBJECTS = [
    { id:'math',       label:'Matematika',       emoji:'🔢', color:'#6366f1' },
    { id:'science',    label:'IPA',              emoji:'🔬', color:'#22c55e' },
    { id:'indonesian', label:'Bahasa Indonesia', emoji:'📚', color:'#f59e0b' },
    { id:'english',    label:'Bahasa Inggris',   emoji:'🌐', color:'#06b6d4' },
    { id:'history',    label:'Sejarah',          emoji:'🏛️', color:'#84cc16' },
    { id:'civics',     label:'PKN',              emoji:'🏳️', color:'#ef4444' },
    { id:'geography',  label:'Geografi',         emoji:'🌍', color:'#8b5cf6' },
    { id:'biology',    label:'Biologi',          emoji:'🧬', color:'#10b981' },
    { id:'chemistry',  label:'Kimia',            emoji:'⚗️', color:'#f59e0b' },
    { id:'physics',    label:'Fisika',           emoji:'⚛️', color:'#3b82f6' },
    { id:'economics',  label:'Ekonomi',          emoji:'📊', color:'#f97316' },
    { id:'arts',       label:'Seni Budaya',      emoji:'🎨', color:'#ec4899' },
];

// Komponen pilihan kartu kelas/mapel
function ChoiceCard({ item, selected, onSelect }) {
    return (
        <motion.button
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(item.id)}
            className="p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all text-center"
            style={{
                background:   selected ? `${item.color}20` : 'rgba(255,255,255,0.04)',
                borderColor:  selected ? item.color : 'rgba(255,255,255,0.1)',
                boxShadow:    selected ? `0 0 18px ${item.color}44` : 'none',
            }}
        >
            <span className="text-3xl">{item.emoji}</span>
            <span className="text-xs font-bold text-white leading-tight">{item.label}</span>
        </motion.button>
    );
}

// Step indicator
function StepDot({ n, current, label }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                current >= n ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-500'
            }`}>
                {current > n ? '✓' : n}
            </div>
            <span className={`text-xs hidden sm:block ${current >= n ? 'text-white' : 'text-slate-500'}`}>
                {label}
            </span>
        </div>
    );
}

export default function Dashboard({ user, recentSessions }) {
    const [step,    setStep]    = useState(1);
    const [grade,   setGrade]   = useState(user.grade  || null);
    const [subject, setSubject] = useState(null);
    const [lang,    setLang]    = useState(user.preferred_language || 'id');
    const [mode,    setMode]    = useState('learning');
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    const gradeObj   = GRADES.find(g => g.id === grade);
    const subjectObj = SUBJECTS.find(s => s.id === subject);

    const handleStart = () => {
        if (!grade || !subject) return;
        setError('');
        setLoading(true);

        router.post(route('quiz.start'), { grade, subject, language: lang, mode }, {
            onError: (errs) => {
                setError(errs.ai || 'Gagal membuat soal. Cek API Key di .env');
                setLoading(false);
            },
        });
    };

    return (
        <AppLayout title="Dashboard">
            <div className="min-h-screen p-4 max-w-xl mx-auto">

                {/* Header user */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-6 pt-2"
                >
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 flex-shrink-0"
                        style={{ background: `${user.avatar_color}22`, borderColor: user.avatar_color }}
                    >
                        {user.avatar_emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-white font-black text-lg leading-tight">
                            Halo, {user.name}! 👋
                        </h1>
                        <p className="text-slate-400 text-xs">
                            ⭐ {user.total_score.toLocaleString()} poin · 🔥 Best streak: {user.best_streak}
                        </p>
                    </div>
                    <a
                        href={route('leaderboard')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                    >
                        🏆 Board
                    </a>
                </motion.div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                    <StepDot n={1} current={step} label="Kelas" />
                    <div className="flex-1 h-px bg-white/10" />
                    <StepDot n={2} current={step} label="Mapel" />
                    <div className="flex-1 h-px bg-white/10" />
                    <StepDot n={3} current={step} label="Setting" />
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <AnimatePresence mode="wait">

                    {/* Step 1: Pilih Kelas */}
                    {step === 1 && (
                        <motion.div key="s1"
                            initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}>
                            <h2 className="text-white font-black text-lg mb-4">📚 Pilih Kelasmu</h2>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                                {GRADES.map(g => (
                                    <ChoiceCard
                                        key={g.id} item={g}
                                        selected={grade === g.id}
                                        onSelect={(id) => { setGrade(id); setStep(2); }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Pilih Mata Pelajaran */}
                    {step === 2 && (
                        <motion.div key="s2"
                            initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}>
                            <div className="flex items-center gap-3 mb-4">
                                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white text-sm">
                                    ← Kelas
                                </button>
                                <h2 className="text-white font-black text-lg">
                                    🎯 Pilih Mapel
                                    {gradeObj && <span className="text-indigo-400 ml-2 text-base">({gradeObj.label})</span>}
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                {SUBJECTS.map(s => (
                                    <motion.button
                                        key={s.id}
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => { setSubject(s.id); setStep(3); }}
                                        className="flex items-center gap-3 p-3.5 rounded-xl border-2 text-left"
                                        style={{
                                            background:  subject === s.id ? `${s.color}20` : 'rgba(255,255,255,0.04)',
                                            borderColor: subject === s.id ? s.color : 'rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <span className="text-2xl">{s.emoji}</span>
                                        <span className="text-sm font-semibold text-white">{s.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Konfigurasi & Mulai */}
                    {step === 3 && (
                        <motion.div key="s3"
                            initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}>

                            <div className="flex items-center gap-3 mb-5">
                                <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white text-sm">
                                    ← Mapel
                                </button>
                                <h2 className="text-white font-black text-lg">⚙️ Pengaturan Quiz</h2>
                            </div>

                            {/* Ringkasan pilihan */}
                            <div
                                className="flex items-center gap-3 p-4 rounded-2xl mb-5"
                                style={{ background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)' }}
                            >
                                <span className="text-3xl">{subjectObj?.emoji}</span>
                                <div>
                                    <div className="text-white font-bold">{subjectObj?.label}</div>
                                    <div className="text-slate-400 text-sm">{gradeObj?.label}</div>
                                </div>
                                <span className="ml-auto text-3xl">{gradeObj?.emoji}</span>
                            </div>

                            {/* Pilih mode */}
                            <p className="text-slate-400 text-sm font-semibold mb-2">🎮 Mode Belajar</p>
                            <div className="grid grid-cols-2 gap-2.5 mb-4">
                                {[
                                    { id:'learning', emoji:'📖', label:'Belajar', desc:'Ada penjelasan AI', color:'#22c55e' },
                                    { id:'exam',     emoji:'📝', label:'Ujian',   desc:'Mode serius!',      color:'#ef4444' },
                                ].map(m => (
                                    <button key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className="p-3.5 rounded-xl border-2 text-left transition-all"
                                        style={{
                                            background:  mode === m.id ? `${m.color}20` : 'rgba(255,255,255,0.04)',
                                            borderColor: mode === m.id ? m.color : 'rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <div className="text-xl mb-1">{m.emoji}</div>
                                        <div className="text-white font-bold text-sm">{m.label}</div>
                                        <div className="text-slate-400 text-xs">{m.desc}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Pilih bahasa */}
                            <p className="text-slate-400 text-sm font-semibold mb-2">🌐 Bahasa</p>
                            <div className="grid grid-cols-2 gap-2.5 mb-6">
                                {[
                                    { id:'id', label:'🇮🇩 Indonesia' },
                                    { id:'en', label:'🇬🇧 English'  },
                                ].map(l => (
                                    <button key={l.id}
                                        onClick={() => setLang(l.id)}
                                        className="py-3 rounded-xl border-2 font-semibold text-sm transition-all"
                                        style={{
                                            background:  lang === l.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                                            borderColor: lang === l.id ? '#6366f1' : 'rgba(255,255,255,0.1)',
                                            color:       lang === l.id ? 'white' : '#94a3b8',
                                        }}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tombol mulai */}
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: '0 0 35px rgba(99,102,241,0.5)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStart}
                                disabled={loading}
                                className="w-full py-5 rounded-2xl font-black text-xl text-white relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <motion.span
                                            className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                        />
                                        AI membuat soal...
                                    </span>
                                ) : (
                                    '🚀 MULAI QUIZ!'
                                )}
                                {!loading && (
                                    <motion.div
                                        className="absolute inset-0"
                                        style={{ background: 'linear-gradient(45deg,transparent 40%,rgba(255,255,255,0.1) 50%,transparent 60%)' }}
                                        animate={{ x: ['-100%','200%'] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                    />
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
