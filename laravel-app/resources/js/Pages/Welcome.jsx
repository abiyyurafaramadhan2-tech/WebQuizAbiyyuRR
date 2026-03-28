import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Welcome({ canLogin, canRegister }) {
    return (
        <AppLayout title="Selamat Datang">
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">

                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-7xl mb-4 animate-bounce">🧠</div>
                    <h1 className="text-4xl font-black text-white mb-2">
                        Chubby<span className="text-indigo-400">Genius</span> AI
                    </h1>
                    <p className="text-slate-400 text-lg mb-2">
                        Belajar lebih seru dengan AI Tutor! 🚀
                    </p>
                    <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
                        Soal otomatis dari AI · Kelas 1-12 · 12 Mata Pelajaran
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-3 w-full max-w-xs"
                >
                    {canRegister && (
                        <Link
                            href={route('register')}
                            className="w-full py-4 rounded-2xl font-black text-xl text-white text-center transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            🚀 Daftar Gratis!
                        </Link>
                    )}
                    {canLogin && (
                        <Link
                            href={route('login')}
                            className="w-full py-3.5 rounded-2xl font-bold text-indigo-300 text-center border-2 border-indigo-500/30 bg-indigo-500/10 hover:border-indigo-500/60 transition-all"
                        >
                            Sudah punya akun → Login
                        </Link>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="mt-10 grid grid-cols-3 gap-4 text-center"
                >
                    {[
                        { emoji:'🤖', label:'AI Soal', desc:'Generate otomatis' },
                        { emoji:'🔥', label:'Streak',  desc:'Makin susah jika bagus' },
                        { emoji:'🏆', label:'Ranking', desc:'Bersaing global' },
                    ].map(f => (
                        <div key={f.label} className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-2xl mb-1">{f.emoji}</div>
                            <div className="text-white text-xs font-bold">{f.label}</div>
                            <div className="text-slate-500 text-[10px]">{f.desc}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </AppLayout>
    );
}
