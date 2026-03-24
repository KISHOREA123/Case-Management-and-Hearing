import React from 'react';
import { Link } from 'react-router-dom';
import {
    Gavel,
    Shield,
    Clock,
    Users,
    CheckCircle2,
    BarChart3,
    Calendar,
    Briefcase,
    FileText,
    Bell,
    Scale,
    ArrowRight,
    Star,
    Lock,
    AlarmClock
} from 'lucide-react';

const features = [
    {
        icon: <Briefcase className="w-6 h-6" />,
        title: 'Smart Case Management',
        desc: 'Centralize every detail — documents, timelines, hearings, and communications — in one structured workspace.',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10 border-blue-400/20'
    },
    {
        icon: <Calendar className="w-6 h-6" />,
        title: 'Hearing Scheduler',
        desc: 'Never miss a court date. Auto-schedule hearings, receive reminders, and track status changes in real-time.',
        color: 'text-violet-400',
        bg: 'bg-violet-400/10 border-violet-400/20'
    },
    {
        icon: <Users className="w-6 h-6" />,
        title: 'Client Portal',
        desc: 'Clients get their own secure view — case updates, shared documents, and invoices without any extra back-and-forth.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10 border-emerald-400/20'
    },
    {
        icon: <FileText className="w-6 h-6" />,
        title: 'Invoice & Billing',
        desc: 'Professionally generate, send, and track invoices. Separate billing for petitioner and defender clients.',
        color: 'text-orange-400',
        bg: 'bg-orange-400/10 border-orange-400/20'
    },
    {
        icon: <AlarmClock className="w-6 h-6" />,
        title: 'Deadline Tracker',
        desc: 'Set case deadlines, get automatic daily reminders, and catch overdue tasks before they become problems.',
        color: 'text-red-400',
        bg: 'bg-red-400/10 border-red-400/20'
    },
    {
        icon: <Lock className="w-6 h-6" />,
        title: 'Role-Based Access',
        desc: 'Granular permission controls for Admin, Lawyer, and Client roles. Every user sees exactly what they need.',
        color: 'text-pink-400',
        bg: 'bg-pink-400/10 border-pink-400/20'
    },
];

const stats = [
    { value: '100%', label: 'Secure & Encrypted' },
    { value: '3', label: 'Role-Based Portals' },
    { value: '24/7', label: 'Deadline Monitoring' },
    { value: '∞', label: 'Cases & Clients' },
];

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#09090b] text-white font-sans overflow-x-hidden">

            {/* — HEADER — */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-[#09090b]/80 border-b border-white/5 backdrop-blur-xl">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                        <Gavel className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">CMH</span>
                </Link>
                <nav className="flex items-center gap-8">
                    <a href="#features" className="hidden md:block text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
                    <a href="#benefits" className="hidden md:block text-sm text-zinc-400 hover:text-white transition-colors">Why CMH</a>
                    <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Login</Link>
                    <Link
                        to="/signup"
                        className="text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg transition-all shadow-lg shadow-primary/20"
                    >
                        Get Access
                    </Link>
                </nav>
            </header>

            <main className="flex-1 pt-16">

                {/* — HERO — */}
                <section className="relative flex flex-col items-center justify-center text-center min-h-[90vh] px-4 overflow-hidden">
                    {/* Background glow blobs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                    {/* Badge */}
                    <div className="relative inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6 text-sm text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Built for Modern Law Firms
                    </div>

                    <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 max-w-4xl">
                        Case Management,{' '}
                        <span className="bg-gradient-to-r from-primary via-violet-400 to-blue-400 bg-clip-text text-transparent">
                            Reimagined
                        </span>
                    </h1>

                    <p className="relative max-w-xl text-zinc-400 md:text-lg leading-relaxed mb-10">
                        CMH gives Admins, Lawyers, and Clients one unified platform — for managing cases, hearings, documents, deadlines, and billing with clarity.
                    </p>

                    <div className="relative flex items-center gap-4">
                        <Link
                            to="/login"
                            className="group inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3.5 rounded-xl transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02]"
                        >
                            Sign In to Dashboard
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
                        >
                            Create Account
                        </Link>
                    </div>

                    {/* Hero dashboard mockup */}
                    <div className="relative mt-20 w-full max-w-5xl">
                        <div className="rounded-2xl border border-white/10 bg-[#111113] shadow-2xl overflow-hidden">
                            {/* Fake browser bar */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#161618] border-b border-white/5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                <div className="mx-auto text-xs text-zinc-600 bg-[#1e1e20] rounded px-3 py-0.5">cmh.dashboard.app</div>
                            </div>
                            {/* Mock dashboard grid */}
                            <div className="grid grid-cols-4 gap-3 p-6">
                                {[
                                    { label: 'Active Cases', val: '24', color: 'text-blue-400' },
                                    { label: 'Hearings Today', val: '3', color: 'text-violet-400' },
                                    { label: 'Overdue Deadlines', val: '1', color: 'text-red-400' },
                                    { label: 'Pending Invoices', val: '8', color: 'text-orange-400' }
                                ].map((s, i) => (
                                    <div key={i} className="col-span-1 bg-[#1a1a1d] rounded-xl p-4 border border-white/5 text-left">
                                        <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                                        <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                                    </div>
                                ))}
                                <div className="col-span-3 bg-[#1a1a1d] rounded-xl p-4 border border-white/5 h-32 flex items-end gap-1">
                                    {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 72, 88].map((h, i) => (
                                        <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-primary/30 rounded-t-sm hover:bg-primary/50 transition-colors" />
                                    ))}
                                </div>
                                <div className="col-span-1 bg-[#1a1a1d] rounded-xl p-4 border border-white/5 h-32 flex flex-col justify-between">
                                    <p className="text-xs text-zinc-500">Case Status</p>
                                    <div className="space-y-1.5">
                                        {[['Active', 'bg-blue-400', '60%'], ['Closed', 'bg-zinc-600', '25%'], ['Pending', 'bg-orange-400', '15%']].map(([l, c, w]) => (
                                            <div key={l} className="flex items-center gap-2 text-xs">
                                                <div className={`w-2 h-2 rounded-full ${c}`} />
                                                <span className="text-zinc-400 flex-1">{l}</span>
                                                <span className="text-zinc-500">{w}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Glow under mockup */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-primary/20 blur-3xl rounded-full" />
                    </div>
                </section>

                {/* — STATS — */}
                <section className="py-16 px-4 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-4xl font-extrabold text-white mb-1">{s.value}</p>
                                <p className="text-sm text-zinc-500">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* — FEATURES — */}
                <section id="features" className="py-24 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-full px-4 py-1.5 mb-4">
                                <Star className="w-3 h-3" /> Platform Features
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                                Everything your firm needs
                            </h2>
                            <p className="text-zinc-400 max-w-xl mx-auto">
                                A complete suite of tools designed specifically for legal professionals — not a generic project management tool.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {features.map((f, i) => (
                                <div key={i} className="group p-6 rounded-2xl bg-[#111113] border border-white/5 hover:border-white/10 hover:-translate-y-1 transition-all duration-300">
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${f.bg}`}>
                                        <span className={f.color}>{f.icon}</span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* — BENEFITS — */}
                <section id="benefits" className="py-24 px-4 bg-[#0c0c0e]">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold rounded-full px-4 py-1.5 mb-6">
                                <CheckCircle2 className="w-3 h-3" /> Why CMH
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight mb-6">
                                Designed for{' '}
                                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                                    legal workflows
                                </span>
                            </h2>
                            <ul className="space-y-5">
                                {[
                                    { icon: <Shield className="w-4 h-4" />, text: 'Role-based access — Admin, Lawyer, and Client portals with permission controls', color: 'text-blue-400 bg-blue-400/10' },
                                    { icon: <Bell className="w-4 h-4" />, text: 'Automated deadline reminders and overdue case notifications', color: 'text-orange-400 bg-orange-400/10' },
                                    { icon: <Scale className="w-4 h-4" />, text: 'Full case lifecycle: from filing to invoice, everything tracked', color: 'text-violet-400 bg-violet-400/10' },
                                    { icon: <Clock className="w-4 h-4" />, text: 'Save hours every week on administrative tasks and follow-ups', color: 'text-emerald-400 bg-emerald-400/10' },
                                    { icon: <BarChart3 className="w-4 h-4" />, text: 'Visual dashboards for case statuses, upcoming hearings, and invoices', color: 'text-pink-400 bg-pink-400/10' },
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                            {item.icon}
                                        </div>
                                        <p className="text-zinc-300 leading-relaxed">{item.text}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual card stack */}
                        <div className="relative">
                            <div className="space-y-4">
                                {[
                                    { title: 'Case #HC-2024-089', sub: 'State vs. Defendant — Hearing in 2 days', badge: 'Active', badgeColor: 'bg-blue-400/10 text-blue-400' },
                                    { title: 'Deadline: File Motion', sub: 'Evidence Submission — Due tomorrow', badge: 'Urgent', badgeColor: 'bg-red-400/10 text-red-400' },
                                    { title: 'Invoice #INV-2024-047', sub: 'Petitioner billing — ₹45,000', badge: 'Sent', badgeColor: 'bg-emerald-400/10 text-emerald-400' },
                                    { title: 'Hearing Scheduled', sub: 'Court Room 4B — 10:30 AM March 15', badge: 'Confirmed', badgeColor: 'bg-violet-400/10 text-violet-400' },
                                ].map((card, i) => (
                                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl bg-[#111113] border border-white/5 transition-all hover:border-white/10 hover:-translate-x-1`} style={{ transitionDelay: `${i * 50}ms` }}>
                                        <div>
                                            <p className="font-semibold text-sm">{card.title}</p>
                                            <p className="text-xs text-zinc-500 mt-0.5">{card.sub}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${card.badgeColor}`}>{card.badge}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute -inset-4 bg-gradient-to-b from-transparent to-[#0c0c0e] pointer-events-none rounded-2xl opacity-30" />
                        </div>
                    </div>
                </section>

                {/* — ROLES — */}
                <section className="py-24 px-4">
                    <div className="max-w-5xl mx-auto text-center mb-14">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Three portals, one platform</h2>
                        <p className="text-zinc-400">Each role gets a tailored experience built for their specific needs.</p>
                    </div>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                        {[
                            { role: 'Admin', icon: <Shield className="w-8 h-8" />, color: 'from-blue-500 to-violet-600', desc: 'Full control over users, cases, hearings, lawyers, clients, permissions, and billing.', perks: ['User & role management', 'System-wide case overview', 'Invoice & payment tracking', 'Permission configuration'] },
                            { role: 'Lawyer', icon: <Scale className="w-8 h-8" />, color: 'from-violet-500 to-pink-600', desc: 'Manage assigned cases, schedule hearings, handle documents, and communicate with clients.', perks: ['Assigned case workspace', 'Hearing management', 'Client communication', 'Document handling'] },
                            { role: 'Client', icon: <Users className="w-8 h-8" />, color: 'from-emerald-500 to-teal-600', desc: 'View your case progress, download documents, check invoices, and communicate securely.', perks: ['Case status visibility', 'Document downloads', 'Invoice access', 'Secure messaging'] },
                        ].map((r, i) => (
                            <div key={i} className="group relative rounded-2xl border border-white/5 bg-[#111113] p-7 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${r.color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`} />
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${r.color} mb-5 shadow-lg`}>
                                    {r.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{r.role}</h3>
                                <p className="text-sm text-zinc-400 mb-5 leading-relaxed">{r.desc}</p>
                                <ul className="space-y-2">
                                    {r.perks.map((p, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-zinc-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* — CTA — */}
                <section className="py-24 px-4">
                    <div className="max-w-2xl mx-auto text-center relative">
                        <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl" />
                        <div className="relative p-12 bg-[#111113] border border-white/5 rounded-3xl">
                            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Gavel className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Sign in to your CMH dashboard or create a new account to begin managing your legal practice.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    to="/login"
                                    className="group inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl transition-all shadow-xl shadow-primary/20"
                                >
                                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-xl transition-all"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* — FOOTER — */}
            <footer className="border-t border-white/5 bg-[#09090b] py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                            <Gavel className="w-3 h-3 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-bold">CMH</span>
                        <span className="text-zinc-600 text-xs ml-2">© 2026 All rights reserved.</span>
                    </div>
                    <nav className="flex gap-6">
                        <a href="#features" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Features</a>
                        <a href="#benefits" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Why CMH</a>
                        <Link to="/login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Login</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
