import { useState } from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';

const MEDALS = { 1:'🥇', 2:'🥈', 3:'🥉' };
const MEDAL_COLORS = { 1:'#fbbf24', 2:'#94a3b8', 3:'#d97706' };

export default function Leaderboard({ entries, myBestScore, myRank, filters }) {
    const [period, setPeriod] = useState(filters.period || 'all');

    const changePeriod = (p) => {
        setPeriod(p);
        router.get(route('leaderboard'), { period: p }, { preserveState: true });
    };

    const topThree = entries.slice(0, 3);
    const rest     = entries.slice(3);

    return (
        <AppLayout title="Leaderboard">
            <div className="min-h-screen p-4 max-w-lg mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
                    className="text-center mb-6 pt-2"
                >
                    <h1 className="text-3xl font-black text-white mb-1">🏆 Leaderboard</h1>
                    <p className="text-slate-400 text-sm">
                        Rankmu: <span className="text-indigo-400 font-bold">#{myRank}</span>
                        {' · '} Best: <span className="text-yellow-400 font-bold">{myBestScore.toLocaleString()}</span>
                    </p>
                </motion.div>

                {/* Filter periode */}
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                    {[
                        { id:'today', label:'Hari Ini'  },
                        { id:'week',  label:'Minggu Ini'},
                        { id:'month', label:'Bulan Ini' },
                        { id:'all',   label:'Semua'     },
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => changePeriod(p.id)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border-2 transition-all"
                            style={{
                                background:  period === p.id ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                                borderColor: period === p.id ? '#6366f1' : 'rgba(255,255,255,0.1)',
                                color:       period === p.id ? 'white' : '#94a3b8',
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Top 3 Podium */}
                {topThree.length === 3 && (
                    <div className="flex items-end justify-center gap-2 mb-6 h-44">
                        {[topThree[1], topThree[0], topThree[2]].map((e, pi) => {
                            const rank   = [2, 1, 3][pi];
                            const height = [110, 145, 88][pi];
                            return (
                                <motion.div
                                    key={e.rank}
                                    initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
                                    transition={{ delay: rank === 1 ? 0.1 : rank === 2 ? 0.2 : 0.15 }}
                                    className="flex flex-col items-center flex-1"
                                >
                                    <div
                                        className="w-11 h-11 rounded-full flex items-center justify-center text-xl mb-1 border-2"
                                        style={{
                                            background:   `${e.avatar_color}30`,
                                            borderColor:  MEDAL_COLORS[rank],
                                            boxShadow:    `0 0 12px ${MEDAL_COLORS[rank]}66`,
                                        }}
                                    >
                                        {e.avatar_emoji}
                                    </div>
                                    <div className="text-white text-xs font-bold text-center truncate w-full px-1 mb-0.5">
                                        {e.user_name}
                                    </div>
                                    <div className="font-black text-sm text-yellow-400 mb-1">
                                        {e.score.toLocaleString()}
                                    </div>
                                    <div
                                        className="w-full rounded-t-2xl flex items-center justify-center font-black text-2xl"
                                        style={{
                                            height,
                                            background: `${MEDAL_COLORS[rank]}22`,
                                            border: `2px solid ${MEDAL_COLORS[rank]}55`,
                                        }}
                                    >
                                        {MEDALS[rank]}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Daftar lengkap */}
                <div className="space-y-2">
                    {entries.map((e, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity:0, x:-15 }} animate={{ opacity:1, x:0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-3 p-3.5 rounded-2xl border transition-all"
                            style={{
                                background:  e.is_current_user ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                                borderColor: e.is_current_user ? '#6366f1' : 'rgba(255,255,255,0.07)',
                                boxShadow:   e.is_current_user ? '0 0 15px rgba(99,102,241,0.2)' : 'none',
                            }}
                        >
                            {/* Rank */}
                            <div className="w-9 text-center font-black text-base flex-shrink-0"
                                style={{ color: MEDAL_COLORS[e.rank] || '#475569' }}>
                                {e.rank <= 3 ? MEDALS[e.rank] : `#${e.rank}`}
                            </div>

                            {/* Avatar */}
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                                style={{ background:`${e.avatar_color}25`, border:`2px solid ${e.avatar_color}` }}
                            >
                                {e.avatar_emoji}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-bold truncate">
                                    {e.user_name}
                                    {e.is_current_user && (
                                        <span className="text-indigo-400 text-xs ml-1 font-normal">(Kamu)</span>
                                    )}
                                </div>
                                <div className="text-slate-500 text-xs">
                                    🔥 {e.max_streak}x · ✓ {e.accuracy}% · {e.date}
                                </div>
                            </div>

                            {/* Skor */}
                            <div className="text-yellow-400 font-black text-sm flex-shrink-0">
                                {e.score.toLocaleString()}
                            </div>
                        </motion.div>
                    ))}

                    {entries.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <div className="text-4xl mb-3">🏆</div>
                            <p className="text-sm">Belum ada data. Jadilah yang pertama!</p>
                        </div>
                    )}
                </div>

                {/* Tombol main lagi */}
                <motion.button
                    whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => router.visit(route('dashboard'))}
                    className="w-full mt-6 py-4 rounded-2xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    🚀 Main Lagi!
                </motion.button>
            </div>
        </AppLayout>
    );
              }
