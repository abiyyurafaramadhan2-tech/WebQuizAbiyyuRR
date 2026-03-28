import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function AppLayout({ title, children }) {
    return (
        <>
            <Head title={`${title} — ChubbyGenius AI`} />
            <div className="min-h-screen bg-slate-950"
                style={{
                    background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f0f1a 50%, #020617 100%)'
                }}>

                {/* Partikel background */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-indigo-500"
                            style={{
                                width:  `${2 + Math.random() * 3}px`,
                                height: `${2 + Math.random() * 3}px`,
                                left:   `${Math.random() * 100}%`,
                                top:    `${Math.random() * 100}%`,
                                opacity: 0.15,
                            }}
                            animate={{
                                y:       [0, -20, 0],
                                opacity: [0.05, 0.25, 0.05],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 4,
                                repeat:   Infinity,
                                delay:    Math.random() * 4,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10">{children}</div>
            </div>
        </>
    );
}
