import { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ChubbyTutor  from '@/Components/ChubbyTutor';
import TimerRing    from '@/Components/TimerRing';
import StreakEffect from '@/Components/StreakEffect';
import AppLayout    from '@/Layouts/AppLayout';

const OPT_COLORS = { A:'#6366f1', B:'#22c55e', C:'#f59e0b', D:'#ef4444' };

export default function QuizArena({ session, config }) {
    const [questions,    setQuestions]    = useState(session.questions);
    const [idx,          setIdx]          = useState(session.current_question);
    const [score,        setScore]        = useState(session.score);
    const [streak,       setStreak]       = useState(session.streak);
    const [selected,     setSelected]     = useState(null);
    const [result,       setResult]       = useState(null);
    const [tutorMood,    setTutorMood]    = useState(session.mode === 'exam' ? 'focused' : 'idle');
    const [tutorMsg,     setTutorMsg]     = useState('');
    const [showStreak,   setShowStreak]   = useState(false);
    const [timerKey,     setTimerKey]     = useState(0);
    const [submitting,   setSubmitting]   = useState(false);
    const [ptsPopup,     setPtsPopup]     = useState(null);
    const startRef = useRef(Date.now());

    const q      = questions[idx];
    const isLast = idx >= questions.length - 1;
    const lang   = session.language;
    const mode   = session.mode;

    // Pesan sambutan
    useEffect(() => {
        if (mode === 'learning') {
            setTutorMood('happy');
            setTutorMsg(lang === 'id' ? 'Siap belajar? Aku bantu kamu! 🧠' : "Let's learn! I'm here to help! 🧠");
        } else {
            setTutorMood('focused');
            setTutorMsg(lang === 'id' ? 'Mode ujian. Fokus ya! 📝' : 'Exam mode. Stay focused! 📝');
        }
    }, []);

    const submitAnswer = useCallback(async (answer, timeTaken) => {
        if (submitting || result) return;
        setSubmitting(true);
        setSelected(answer);

        try {
            const { data } = await axios.post(route('quiz.jawab', session.session_token), {
                question_index: idx,
                answer,
                time_taken: Math.floor(timeTaken),
            });

            setResult(data);
            setScore(data.total_score);
            setStreak(data.new_streak);

            // Popup poin
            setPtsPopup({ pts: data.points_earned, bonus: data.time_bonus + data.streak_bonus });
            setTimeout(() => setPtsPopup(null), 1800);

            // Streak effect
            if (data.new_streak > 0 && data.new_streak % config.streakThreshold === 0) {
                setShowStreak(true);
                setTimeout(() => setShowStreak(false), 1600);
            }

            // Reaksi ChubbyTutor
            if (mode === 'learning') {
                if (data.is_correct) {
                    setTutorMood(data.new_streak >= 5 ? 'cheering' : 'happy');
                    setTutorMsg(data.new_streak >= 5
                        ? (lang === 'id' ? '🔥 LUAR BIASA! Kamu on fire!' : '🔥 AMAZING! You\'re on fire!')
                        : (lang === 'id' ? '✨ Benar! Bagus sekali!' : '✨ Correct! Well done!')
                    );
                } else {
                    setTutorMood('explaining');
                    setTutorMsg(data.explanation || '');
                }
            } else {
                setTutorMood(data.is_correct ? 'proud' : 'focused');
                setTutorMsg(data.is_correct ? '✓' : (lang === 'id' ? 'Review materi ini ya.' : 'Review this topic.'));
            }

        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    }, [idx, session.session_token, submitting, result, mode, lang, config.streakThreshold]);

    const handleTimerExpire = useCallback(() => {
        if (!result && !submitting) {
            submitAnswer('A', config.timePerQuestion);
            setTutorMood(mode === 'exam' ? 'urgent' : 'sad');
            setTutorMsg(lang === 'id' ? '⏰ Waktu habis!' : '⏰ Time\'s up!');
        }
    }, [result, submitting, submitAnswer, mode, lang, config.timePerQuestion]);

    const nextQuestion = useCallback(() => {
        if (isLast) {
            router.post(route('quiz.selesai', session.session_token));
            return;
        }
        setIdx(i => i + 1);
        setSelected(null);
        setResult(null);
        setTutorMood(mode === 'exam' ? 'focused' : 'idle');
        setTutorMsg('');
        setTimerKey(k => k + 1);
        startRef.current = Date.now();
    }, [isLast, session.session_token, mode]);

    if (!q) return null;

    const progress = (idx / questions.length) * 100;

    return (
        <AppLayout title="Quiz Arena">
            <StreakEffect streak={streak} show={showStreak} />

            <div className="min-h-screen flex flex-col max-w-lg mx-auto p-4">

                {/* Top bar */}
                <div className="flex items-center gap-2 mb-3">
                    <button
                        onClick={() => {
                            if (window.confirm(lang === 'id' ? 'Keluar dari quiz?' : 'Quit quiz?')) {
                                axios.post(route('quiz.keluar', session.session_token))
                                    .then(() => router.visit(route('dashboard')));
                            }
                        }}
                        className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                    >✕</button>

                    <div className="flex-1 h-3 rounded-full overflow-hidden bg-white/10">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', width: `${progress}%` }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>

                    <span className="text-slate-400 text-xs font-mono">{idx + 1}/{questions.length}</span>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {/* Score */}
                        <motion.div
                            key={score}
                            initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                            className="px-3 py-1.5 rounded-xl font-black text-white text-sm"
                            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
                        >
                            ⭐ {score.toLocaleString()}
                        </motion.div>

                        {/* Streak badge */}
                        {streak > 0 && (
                            <motion.div
                                key={streak}
                                initial={{ scale: 1.4 }} animate={{ scale: 1 }}
                                className="px-2.5 py-1.5 rounded-xl text-sm font-bold"
                                style={{ background:'rgba(245,158,11,0.2)', border:'1px solid rgba(245,158,11,0.4)', color:'#f59e0b' }}
                            >
                                🔥 ×{streak}
                            </motion.div>
                        )}
                    </div>

                    <TimerRing
                        key={timerKey}
                        duration={config.timePerQuestion}
                        onExpire={handleTimerExpire}
                        isPaused={!!result}
                    />
                </div>

                {/* ChubbyTutor */}
                <div className="flex justify-center mb-3">
                    <ChubbyTutor mood={tutorMood} message={tutorMsg} mode={mode} size={85} />
                </div>

                {/* Points popup */}
                <AnimatePresence>
                    {ptsPopup && (
                        <motion.div
                            className="fixed top-1/3 left-1/2 -translate-x-1/2 text-center z-40 pointer-events-none"
                            initial={{ y:0, opacity:1, scale:0.9 }}
                            animate={{ y:-60, opacity:0, scale:1.2 }}
                            transition={{ duration: 1.4 }}
                        >
                            <div className="text-3xl font-black text-yellow-400">+{ptsPopup.pts}</div>
                            {ptsPopup.bonus > 0 && (
                                <div className="text-sm text-orange-300 font-bold">+{ptsPopup.bonus} bonus!</div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Question card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={idx}
                        initial={{ opacity:0, y:25, scale:0.97 }}
                        animate={{ opacity:1, y:0,  scale:1 }}
                        exit={{   opacity:0, y:-20, scale:0.97 }}
                        className="rounded-3xl p-5 mb-4"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(16px)',
                        }}
                    >
                        {q.topic && (
                            <div className="text-indigo-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                                📌 {q.topic}
                            </div>
                        )}

                        <p className="text-white font-semibold text-base leading-relaxed mb-5">
                            {q.question}
                        </p>

                        {/* Pilihan jawaban */}
                        <div className="flex flex-col gap-2.5">
                            {Object.entries(q.options).map(([key, text]) => {
                                const isSel     = selected === key;
                                const isCorrect = result?.correct_answer === key;
                                const isWrong   = isSel && result && !result.is_correct;

                                let bg = 'rgba(255,255,255,0.04)';
                                let border = 'rgba(255,255,255,0.12)';
                                let glow = 'none';

                                if (result) {
                                    if (isCorrect) {
                                        bg = 'rgba(34,197,94,0.18)'; border = '#22c55e';
                                        glow = '0 0 18px rgba(34,197,94,0.4)';
                                    } else if (isWrong) {
                                        bg = 'rgba(239,68,68,0.18)'; border = '#ef4444';
                                        glow = '0 0 18px rgba(239,68,68,0.3)';
                                    }
                                } else if (isSel) {
                                    bg = `${OPT_COLORS[key]}25`; border = OPT_COLORS[key];
                                }

                                return (
                                    <motion.button
                                        key={key}
                                        whileHover={!result ? { scale:1.02, x:4 } : {}}
                                        whileTap={!result ? { scale:0.98 } : {}}
                                        onClick={() => {
                                            if (result || submitting) return;
                                            const elapsed = (Date.now() - startRef.current) / 1000;
                                            submitAnswer(key, elapsed);
                                        }}
                                        className="flex items-center gap-3 p-3.5 rounded-2xl text-left font-semibold text-sm transition-all"
                                        style={{ background:bg, border:`2px solid ${border}`, boxShadow:glow, color:'white' }}
                                        disabled={!!result || submitting}
                                    >
                                        <span
                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                                            style={{ background: OPT_COLORS[key] }}
                                        >
                                            {key}
                                        </span>
                                        <span className="flex-1">{text}</span>
                                        {result && isCorrect && <span className="text-green-400 text-lg">✓</span>}
                                        {result && isWrong   && <span className="text-red-400 text-lg">✗</span>}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Tombol next */}
                <AnimatePresence>
                    {result && (
                        <motion.button
                            initial={{ opacity:0, y:15 }}
                            animate={{ opacity:1, y:0 }}
                            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                            onClick={nextQuestion}
                            className="w-full py-4 rounded-2xl font-black text-lg text-white"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {isLast
                                ? (lang === 'id' ? '🏆 Lihat Hasil!' : '🏆 See Results!')
                                : (lang === 'id' ? '⚡ Soal Berikutnya →' : '⚡ Next Question →')
                            }
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
    }
