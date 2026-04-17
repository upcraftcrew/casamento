import React from 'react';
import { motion } from 'framer-motion';
import MetaLabel from '../components/wedding/MetaLabel';
import { Calendar, MapPin, Shirt, Gift } from 'lucide-react';

const events = [
    {
        title: 'Chá de Lingerie',
        subtitle: 'Só para elas',
        date: '18 · Out · 2025',
        time: '15h',
        location: 'Casa da Ana · Jardins, SP',
        dress: 'Brunch chic · tons pastéis',
        detail: 'Tarde de risada, champagne e presentes íntimos. Pedimos que cada convidada traga uma peça da lista ou uma mensagem manuscrita.',
    },
    {
        title: 'Bar dos Noivos',
        subtitle: 'Só para eles',
        date: '25 · Out · 2025',
        time: '20h',
        location: 'Bar Luz · Vila Madalena, SP',
        dress: 'Casual moderno',
        detail: 'Uma noite de whisky, charutos e brindes à amizade. Venha contar histórias — e talvez deixar uma ou duas aos noivos.',
    },
];

export default function Cha() {
    return (
        <div className="relative pt-32 pb-20">
            <section className="px-[5vw] md:px-[8vw] mb-20 md:mb-28">
                <MetaLabel className="mb-6">04 · Pré-celebração</MetaLabel>
                <h1
                    className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
                    style={{ fontSize: 'clamp(3rem, 10vw, 9rem)', letterSpacing: '-0.04em' }}
                >
                    Chá & Bar
                </h1>
                <p className="mt-10 max-w-xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
                    Duas celebrações íntimas antes do grande dia. Momentos reservados
                    para quem constrói com a gente, dia após dia.
                </p>
            </section>

            <section className="px-[5vw] md:px-[8vw]">
                <div className="grid md:grid-cols-2 gap-[1px] bg-[hsl(var(--border))]">
                    {events.map((e, i) => (
                        <motion.article
                            key={e.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="bg-background p-8 md:p-12 flex flex-col min-h-[520px]"
                        >
                            <div className="flex items-start justify-between mb-10">
                                <MetaLabel>{e.subtitle}</MetaLabel>
                                <span className="font-mono text-xs text-[hsl(var(--primary))]">
                                    0{i + 1}
                                </span>
                            </div>

                            <h2
                                className="font-display italic leading-[0.95] mb-2"
                                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
                            >
                                {e.title}
                            </h2>

                            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed my-8 text-lg max-w-md">
                                {e.detail}
                            </p>

                            <div className="mt-auto space-y-5 pt-8 border-t border-[hsl(var(--border))]">
                                <DetailRow icon={Calendar} label="Quando" value={`${e.date} · ${e.time}`} />
                                <DetailRow icon={MapPin} label="Onde" value={e.location} />
                                <DetailRow icon={Shirt} label="Dress code" value={e.dress} />
                            </div>

                            <button className="group mt-10 flex items-center gap-3 text-[hsl(var(--primary))] hover:gap-5 transition-all">
                                <Gift className="w-4 h-4" />
                                <span className="meta-label text-[hsl(var(--primary))]">
                                    Ver lista de presentes
                                </span>
                                <span className="h-px w-8 bg-[hsl(var(--primary))] group-hover:w-16 transition-all" />
                            </button>
                        </motion.article>
                    ))}
                </div>
            </section>
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-4">
            <Icon className="w-4 h-4 text-[hsl(var(--accent))] mt-1 flex-shrink-0" />
            <div>
                <div className="meta-label mb-1">{label}</div>
                <div className="text-[hsl(var(--foreground))]">{value}</div>
            </div>
        </div>
    );
}