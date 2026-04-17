import React from 'react';
import { motion } from 'framer-motion';
import MetaLabel from '../components/wedding/MetaLabel';
import { Calendar, MapPin, Clock, Plus } from 'lucide-react';

const schedule = [
    {
        time: '16:00',
        title: 'Cerimônia',
        place: 'Capela Santa Terezinha',
        address: 'Rua das Oliveiras, 120 · Alto de Pinheiros',
        dress: 'Black Tie',
        description: 'O momento em que dois viram um. Recepção dos convidados a partir das 15h30.',
    },
    {
        time: '17:30',
        title: 'Coquetel',
        place: 'Jardim do Espaço Luz',
        address: 'Rua das Oliveiras, 120 · Alto de Pinheiros',
        dress: 'Black Tie',
        description: 'Champagne, canapés e o pôr-do-sol enquanto os noivos finalizam as fotos.',
    },
    {
        time: '19:00',
        title: 'Recepção',
        place: 'Salão Principal',
        address: 'Espaço Luz · Alto de Pinheiros',
        dress: 'Black Tie',
        description: 'Jantar harmonizado, discursos e as primeiras valsas da nova família.',
    },
    {
        time: '22:00',
        title: 'Pista',
        place: 'Terraço',
        address: 'Espaço Luz · Alto de Pinheiros',
        dress: 'Black Tie · sapatos confortáveis recomendados',
        description: 'Bar aberto, DJ e a madrugada toda para celebrar.',
    },
];

export default function Cerimonia() {
    return (
        <div className="relative pt-32 pb-20">
            <section className="px-[5vw] md:px-[8vw] mb-20 md:mb-28">
                <MetaLabel className="mb-6">05 · O dia</MetaLabel>
                <h1
                    className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
                    style={{ fontSize: 'clamp(3rem, 10vw, 9rem)', letterSpacing: '-0.04em' }}
                >
                    Cerimônia<br />& Recepção
                </h1>
                <div className="mt-10 grid md:grid-cols-3 gap-8 max-w-5xl">
                    <InfoBlock icon={Calendar} label="Data" value="15 de Novembro, 2025" />
                    <InfoBlock icon={Clock} label="Horário" value="A partir das 15h30" />
                    <InfoBlock icon={MapPin} label="Local" value="Espaço Luz · São Paulo" />
                </div>
            </section>

            {/* Horizontal timeline */}
            <section className="mb-28">
                <div className="px-[5vw] md:px-[8vw] mb-10 flex items-end justify-between">
                    <MetaLabel>Cronograma do dia</MetaLabel>
                    <span className="meta-label hidden md:inline">Arraste para o lado →</span>
                </div>

                <div className="overflow-x-auto scrollbar-hide pl-[5vw] md:pl-[8vw]">
                    <div className="flex gap-[1px] bg-[hsl(var(--border))] min-w-max pr-[5vw] md:pr-[8vw]">
                        {schedule.map((s, i) => (
                            <motion.div
                                key={s.time}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: i * 0.1 }}
                                className="group bg-background w-[340px] md:w-[420px] p-8 md:p-10 flex flex-col min-h-[440px] hover:bg-[hsl(var(--secondary))]/40 transition-colors duration-500"
                            >
                                <div className="flex items-start justify-between mb-auto">
                                    <span
                                        className="font-display italic text-[hsl(var(--primary))] leading-none"
                                        style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)' }}
                                    >
                                        {s.time}
                                    </span>
                                    <span className="meta-label">0{i + 1}</span>
                                </div>

                                <div className="mt-10">
                                    <h3 className="font-display italic text-3xl md:text-4xl mb-3 leading-tight">
                                        {s.title}
                                    </h3>
                                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
                                        {s.description}
                                    </p>

                                    <div className="border-t border-[hsl(var(--border))] pt-4 space-y-2">
                                        <div className="meta-label text-[hsl(var(--foreground))]">{s.place}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {s.address}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Map + CTA */}
            <section className="px-[5vw] md:px-[8vw]">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="aspect-[4/3] relative overflow-hidden border border-[hsl(var(--border))]">
                        <iframe
                            title="Localização"
                            src="https://www.openstreetmap.org/export/embed.html?bbox=-46.6933%2C-23.5805%2C-46.6733%2C-23.5605&layer=mapnik"
                            className="w-full h-full grayscale contrast-[1.1] opacity-80"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    </div>

                    <div>
                        <MetaLabel className="mb-6">Como chegar</MetaLabel>
                        <h2 className="font-display italic text-4xl md:text-6xl mb-6 leading-[0.95]">
                            Espaço Luz
                        </h2>
                        <p className="text-[hsl(var(--muted-foreground))] leading-[1.7] mb-8 max-w-md">
                            Um refúgio arquitetônico em meio ao Alto de Pinheiros, com capela histórica,
                            jardins íntimos e salão para 200 convidados. Estacionamento com valet disponível.
                        </p>

                        <div className="space-y-4 mb-10 max-w-md">
                            <InfoRow label="Endereço" value="Rua das Oliveiras, 120" />
                            <InfoRow label="Bairro" value="Alto de Pinheiros, São Paulo" />
                            <InfoRow label="Estacionamento" value="Valet incluso" />
                        </div>

                        <button className="group inline-flex items-center gap-4 border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-6 py-4 hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all">
                            <Plus className="w-4 h-4" />
                            <span className="meta-label">Adicionar ao calendário</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function InfoBlock({ icon: Icon, label, value }) {
    return (
        <div className="border-t border-[hsl(var(--border))] pt-5">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="w-4 h-4 text-[hsl(var(--accent))]" />
                <span className="meta-label">{label}</span>
            </div>
            <div className="font-display italic text-2xl">{value}</div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-baseline justify-between gap-6 py-3 border-b border-[hsl(var(--border))]">
            <span className="meta-label">{label}</span>
            <span className="text-[hsl(var(--foreground))]">{value}</span>
        </div>
    );
}