"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Sparkles,
  Heart,
  RotateCcw,
  MapPin,
  Settings,
  Database,
  Wrench,
  FlaskConical,
  Shield,
  Users,
  Terminal,
  Timer,
  Hourglass,
  Gem,
  Apple,
  ExternalLink,
  MessageCircle,
  Box,
} from "lucide-react";
import Link from "next/link";

// ========================================
// TYPES
// ========================================

interface TocItem {
  id: string;
  label: string;
  level: number;
}

interface CommandData {
  command: string;
  description: string;
  permission?: string;
}

interface ConfigRow {
  key: string;
  def: string;
  desc: string;
}

// ========================================
// CONSTANTS
// ========================================

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Stats", href: "/#stats" },
  { label: "Leaderboards", href: "/#leaderboards" },
  { label: "Plugins", href: "/plugins" },
  { label: "Changelog", href: "/shards-changelog" },
  { label: "Blog", href: "/#blog" },
  { label: "Map", href: "/#map" },
  { label: "Join", href: "/#join" },
];

const TOC_ITEMS: TocItem[] = [
  { id: "how-it-works", label: "How It Works", level: 1 },
  { id: "starting", label: "Starting a Ritual", level: 1 },
  { id: "rules", label: "Ritual Rules", level: 1 },
  { id: "commands", label: "Commands", level: 1 },
  { id: "configuration", label: "Configuration", level: 1 },
  { id: "integration", label: "Integration", level: 1 },
  // TEMP — remove with the Testing section after validation
  { id: "testing", label: "Testing (temp)", level: 1 },
];

const RECIPE = [
  { icon: Apple, name: "Enchanted Golden Apple", amount: 4, color: "text-yellow-400" },
  { icon: Box, name: "Heavy Core", amount: 2, color: "text-stone-300" },
  { icon: Users, name: "Player Head", amount: 3, color: "text-amber-300" },
  { icon: Gem, name: "Diamond Block", amount: 5, color: "text-cyan-300" },
];

const ADMIN_COMMANDS: CommandData[] = [
  { command: "/pedestal set", description: "Turn the block you're looking at into a Reinforced Deepslate pedestal (numbered).", permission: "shardsrebirth.admin" },
  { command: "/pedestal delete <id>", description: "Remove a pedestal by number (refused if it's hosting an active ritual).", permission: "shardsrebirth.admin" },
  { command: "/pedestal list", description: "List all pedestals by number.", permission: "shardsrebirth.admin" },
  { command: "/rebirth speed <multiplier>", description: "Scale ritual timings — applies to the live ritual immediately. Testing lever.", permission: "shardsrebirth.admin" },
  { command: "/rebirth stop", description: "Stop the active ritual.", permission: "shardsrebirth.admin" },
  { command: "/rebirth status", description: "Show the active ritual's pedestal, elapsed/total, participants and speed.", permission: "shardsrebirth.admin" },
];

const RITUAL_CONFIG: ConfigRow[] = [
  { key: "duration-seconds", def: "900", desc: "Total ritual length (15 min)." },
  { key: "life-grant-seconds", def: "[480, 900]", desc: "When each life is granted, from start (8 & 15 min). Count = per-player cap." },
  { key: "radius", def: "12", desc: "Half-width of the square area (25×25 ⇒ 12 blocks each way)." },
  { key: "vertical-radius", def: "6", desc: "Vertical tolerance above/below the pedestal that still counts as inside." },
  { key: "max-players", def: "4", desc: "Max players a ritual heals (first N to enter claim the slots)." },
  { key: "tick-interval", def: "10", desc: "Ticks between scans / particle renders / milestone checks." },
  { key: "default-speed", def: "1.0", desc: "Time multiplier (1.0 = real time). Override live with /rebirth speed." },
];

const RECIPE_CONFIG: ConfigRow[] = [
  { key: "items", def: "(map)", desc: "Material → amount required on the pedestal to start." },
  { key: "settle-delay-ticks", def: "15", desc: "Wait after a drop before tallying what's resting on the pedestal." },
  { key: "detect-radius", def: "1.6", desc: "Horizontal distance from the pedestal that counts as 'on' it." },
];

const PARTICLE_CONFIG: ConfigRow[] = [
  { key: "enabled", def: "true", desc: "Toggle the vortex particles." },
  { key: "colors", def: "(5 colors)", desc: "Colours cycled around the vortex (named or #RRGGBB)." },
  { key: "points-per-ring", def: "60", desc: "Particles drawn per ring each pass." },
  { key: "rings", def: "4", desc: "Concentric rings from the centre out to the radius." },
  { key: "size", def: "1.4", desc: "Particle scale." },
  { key: "column-height", def: "8", desc: "Height of the rising central column." },
];

// ========================================
// UTILITY
// ========================================

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ========================================
// COMPONENTS
// ========================================

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-green-500/20 glow-green-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <motion.div
              className="text-2xl font-bold text-green-400 text-glow cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              v1rtopia
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                className={cn(
                  "transition-colors",
                  link.href === "/plugins"
                    ? "text-green-400 font-medium"
                    : "text-gray-300 hover:text-green-400"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <motion.a
              href="/#discord"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-[#5865F2] text-white font-medium hover:bg-[#4752C4] transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Discord</span>
            </motion.a>
            <motion.a
              href="/#store"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg border border-green-500/50 text-green-400 font-medium hover:bg-green-500/10 transition-colors"
            >
              Store
            </motion.a>
            <button
              className="md:hidden p-2 text-gray-300 hover:text-green-400"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-green-500/20"
          >
            <div className="px-4 py-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-2 rounded-lg transition-colors",
                    link.href === "/plugins"
                      ? "text-green-400 bg-green-500/10"
                      : "text-gray-300 hover:text-green-400 hover:bg-white/5"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function TableOfContents({
  activeSection,
  onSectionClick,
}: {
  activeSection: string;
  onSectionClick: (id: string) => void;
}) {
  return (
    <nav aria-label="Table of contents">
      <div className="mb-4 flex items-center gap-2 text-green-400 font-semibold text-sm uppercase tracking-wider">
        <BookOpen className="w-4 h-4" />
        <span>Contents</span>
      </div>
      <ul className="space-y-1">
        {TOC_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSectionClick(item.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                activeSection === item.id
                  ? "bg-green-500/20 text-green-400 border-l-2 border-green-400"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1.5 rounded-md text-gray-400 hover:text-green-400 hover:bg-white/10 transition-colors shrink-0"
      aria-label="Copy command"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-3">
      {Icon && (
        <span className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-green-400" />
        </span>
      )}
      <span>{children}</span>
    </h2>
  );
}

function CommandRow({ cmd, showPermission }: { cmd: CommandData; showPermission?: boolean }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <code className="text-green-400 font-mono text-sm bg-green-500/10 px-2 py-1 rounded whitespace-nowrap">
            {cmd.command}
          </code>
          <CopyButton text={cmd.command} />
        </div>
      </td>
      <td className="py-3 px-4 text-gray-400 text-sm">{cmd.description}</td>
      {showPermission && (
        <td className="py-3 px-4">
          <code className="text-amber-400 font-mono text-xs bg-amber-500/10 px-2 py-1 rounded">
            {cmd.permission}
          </code>
        </td>
      )}
    </tr>
  );
}

function ConfigTable({ title, rows }: { title: string; rows: ConfigRow[] }) {
  return (
    <>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="glass border border-green-500/20 rounded-2xl overflow-x-auto mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Key</th>
              <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Default</th>
              <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4"><code className="font-mono text-sm text-white">{row.key}</code></td>
                <td className="py-3 px-4"><code className="font-mono text-sm text-green-400">{row.def}</code></td>
                <td className="py-3 px-4 text-gray-400 text-sm">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ========================================
// MAIN PAGE
// ========================================

export default function RebirthGuidePage() {
  const [activeSection, setActiveSection] = useState("how-it-works");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
    setMobileTocOpen(false);
  }, []);

  useEffect(() => {
    const sectionIds = TOC_ITEMS.map((t) => t.id);
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 vignette pointer-events-none" />
      <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      <Navbar />

      {/* Page header */}
      <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gray-500 text-sm mb-6"
          >
            <a href="/" className="hover:text-green-400 transition-colors">Home</a>
            <ChevronRight className="w-3 h-3" />
            <a href="/plugins" className="hover:text-green-400 transition-colors">Plugins</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">Rebirth Ritual</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
              <RotateCcw className="w-3.5 h-3.5" />
              Event Mode · Operator Guide
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-green-400 text-glow">
              The Rebirth Ritual
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              A timed life-granting event. Offer rare items on a pedestal to open a vortex —
              stand within it and be reborn with extra lives.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-green-500/40 text-green-300 text-sm font-medium glow-green-sm">
              <Box className="w-3.5 h-3.5 text-green-400" />
              Minecraft 1.21.11 (Java Edition) · runs alongside ShardsSMPv2
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="w-full glass border border-green-500/20 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-gray-300 hover:border-green-500/50 transition-colors"
            aria-expanded={mobileTocOpen}
            aria-controls="mobile-toc"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-400" />
              <span>Table of Contents</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-green-400 transition-transform", mobileTocOpen && "rotate-180")} />
          </button>
          <AnimatePresence>
            {mobileTocOpen && (
              <motion.div
                id="mobile-toc"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 glass border border-green-500/20 rounded-xl p-4 overflow-hidden"
              >
                <TableOfContents activeSection={activeSection} onSectionClick={scrollToSection} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 glass border border-green-500/20 rounded-2xl p-5">
              <TableOfContents activeSection={activeSection} onSectionClick={scrollToSection} />
            </div>
          </aside>

          <article className="flex-1 min-w-0 space-y-20">

            {/* ── How It Works ── */}
            <section id="how-it-works" className="scroll-mt-24">
              <SectionHeading icon={RotateCcw}>How It Works</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  An admin marks a <strong className="text-white">pedestal</strong> (a Reinforced
                  Deepslate block). Players gather a recipe of rare items and drop them on it — when
                  all of them are present, a <strong className="text-white">25×25 vortex</strong> of
                  particles erupts and the Rebirth Ritual begins.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Heart, title: "Reborn over time", desc: "Players standing inside the vortex are slowly granted lives — up to 2 each." },
                    { icon: Hourglass, title: "Two milestones", desc: "The first life is granted at 8 minutes, the second at 15 minutes (the ritual's end)." },
                    { icon: Users, title: "Up to 4 souls", desc: "A ritual heals at most 4 players — the first 4 to step into the vortex claim the slots." },
                    { icon: Sparkles, title: "One at a time", desc: "Only a single ritual can be active server-wide. Each lasts 15 minutes." },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-green-400" />
                      </span>
                      <div>
                        <span className="text-white font-medium text-sm">{title}</span>
                        <p className="text-gray-400 text-sm mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">
                    <strong>Step outside and you&apos;re out.</strong> Leaving the vortex permanently
                    forfeits any lives you haven&apos;t yet earned from that ritual — returning
                    doesn&apos;t restore your eligibility.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Starting a Ritual ── */}
            <section id="starting" className="scroll-mt-24">
              <SectionHeading icon={MapPin}>Starting a Ritual</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">1. Place a pedestal (admin)</h3>
                  <p className="text-gray-400 text-sm">
                    Look at a block and run <code className="text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded">/pedestal set</code>.
                    It becomes a numbered Reinforced Deepslate pedestal, saved to <code className="font-mono">pedestals.yml</code>.
                    You can have several; they&apos;re identified by number in commands.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">2. Offer the recipe</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Drop all of these onto the pedestal (any players can contribute). Once the full set
                    is resting on it, exactly the recipe is consumed and the ritual begins — extra items
                    are left untouched.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {RECIPE.map(({ icon: Icon, name, amount, color }) => (
                      <div key={name} className="glass border border-white/10 rounded-2xl p-4 text-center space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Icon className={cn("w-6 h-6", color)} />
                        </div>
                        <div className="text-2xl font-bold text-white">×{amount}</div>
                        <div className="text-gray-400 text-xs leading-tight">{name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Ritual Rules ── */}
            <section id="rules" className="scroll-mt-24">
              <SectionHeading icon={Timer}>Ritual Rules</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Rule</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Behaviour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { r: "Duration", v: "15 minutes." },
                      { r: "Concurrency", v: "Only one ritual active at a time, server-wide." },
                      { r: "Area", v: "25×25 centred on the pedestal (≈12-block radius), with a vertical tolerance." },
                      { r: "Who's healed", v: "The first 4 players to enter the vortex claim the heal slots." },
                      { r: "Lives per player", v: "Maximum of 2 — one at 8 minutes, one at 15 minutes." },
                      { r: "Eligibility", v: "Continuous presence required; leaving the radius forfeits remaining grants permanently." },
                      { r: "Lives cap", v: "Grants clamp to the SMP's configured maximum — a player already at the cap gains nothing." },
                    ].map(({ r, v }) => (
                      <tr key={r} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white font-medium text-sm w-48">{r}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Commands ── */}
            <section id="commands" className="scroll-mt-24">
              <SectionHeading icon={Terminal}>Commands</SectionHeading>
              <div className="glass border border-amber-500/20 rounded-2xl p-5 mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <code className="text-amber-400 font-mono text-sm">shardsrebirth.admin</code>
                  <span className="text-xs text-gray-500">· default: OP</span>
                </div>
                <p className="text-gray-400 text-sm">All Rebirth commands are admin-only. <code className="font-mono">/pedestal set</code> must be run in-game (it reads the block you&apos;re looking at).</p>
              </div>
              <div className="glass border border-amber-500/20 rounded-2xl overflow-x-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Command</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Description</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Permission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ADMIN_COMMANDS.map((cmd) => (
                      <CommandRow key={cmd.command} cmd={cmd} showPermission />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Configuration ── */}
            <section id="configuration" className="scroll-mt-24">
              <SectionHeading icon={Settings}>Configuration</SectionHeading>
              <p className="text-gray-400 mb-8">
                <code className="text-green-400 font-mono text-sm bg-green-500/10 px-1.5 py-0.5 rounded">config.yml</code>{" "}
                holds ritual behaviour; pedestals live in <code className="font-mono">pedestals.yml</code> (managed by
                commands). Reload by restarting the plugin.
              </p>
              <ConfigTable title="ritual:" rows={RITUAL_CONFIG} />
              <ConfigTable title="recipe:" rows={RECIPE_CONFIG} />
              <ConfigTable title="particles:" rows={PARTICLE_CONFIG} />
            </section>

            {/* ── Integration ── */}
            <section id="integration" className="scroll-mt-24">
              <SectionHeading icon={Database}>Integration</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Rebirth hard-depends on <strong className="text-white">ShardsSMPv2</strong> and grants
                  lives through its public <code className="font-mono">ShardsLivesService</code> SPI —
                  it never writes the lives table directly.
                </p>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-blue-200 text-sm">
                    Every grant funnels through the core&apos;s single lives choke point — clamped to the
                    cap, persisted, and audited in <code className="font-mono">lives_log</code> under the{" "}
                    <code className="font-mono">EVENT</code> reason. Rebirth keeps no database of its own.
                  </p>
                </div>
                <p className="text-gray-400 text-sm">
                  If the core is mid-reload and the SPI is briefly unavailable, the ritual still runs —
                  it just skips the life reward rather than failing.
                </p>
              </div>
            </section>

            {/* ════════════ TEMP TESTING SECTION — remove this <section> + its TOC entry ════════════ */}
            <section id="testing" className="scroll-mt-24">
              <SectionHeading icon={FlaskConical}>Testing <span className="text-amber-400 text-base font-normal">(temporary)</span></SectionHeading>
              <div className="glass border-2 border-dashed border-amber-500/50 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <FlaskConical className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-200 text-sm">
                    <strong>Internal — delete this section after validation.</strong> Goal: prove a ritual
                    starts from a drop, grants lives at the milestones, and that leaving forfeits eligibility.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Quick run</h3>
                  <ol className="space-y-2 text-gray-400 text-sm list-decimal list-inside">
                    <li>Speed it up first: <code className="font-mono text-green-400">/rebirth speed 60</code> (15 min ⇒ ~15 s; milestones at ~8 s and ~15 s).</li>
                    <li>Look at a block and run <code className="font-mono text-green-400">/pedestal set</code>.</li>
                    <li>Drop the recipe on it: 4× enchanted golden apple, 2× heavy core, 3× player head, 5× diamond block.</li>
                    <li>Confirm the vortex appears and you get the start broadcast.</li>
                    <li>Stand inside — watch for the join message, then the two life-grant messages.</li>
                    <li>Step out before a milestone and confirm the forfeit message + no further grants.</li>
                    <li>Check <code className="font-mono text-green-400">/rebirth status</code> mid-ritual; <code className="font-mono text-green-400">/rebirth stop</code> to cancel.</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Verify the grant landed</h3>
                  <p className="text-gray-400 text-sm mb-2">Lives are audited in the core DB (creds in <code className="font-mono">ShardsSMPv2/config.yml</code>):</p>
                  <pre className="bg-black/60 border border-white/10 rounded-xl p-4 overflow-x-auto text-sm font-mono text-blue-300 leading-relaxed">
{`SELECT uuid, delta, new_value, reason, created_at
  FROM lives_log WHERE reason = 'EVENT' ORDER BY id DESC LIMIT 10;`}
                  </pre>
                  <p className="text-gray-400 text-sm mt-2">Expect one <code className="font-mono">EVENT</code> row per life granted (clamped at the cap).</p>
                </div>
              </div>
            </section>
            {/* ════════════ END TEMP TESTING SECTION ════════════ */}

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass border border-green-500/30 rounded-2xl p-8 text-center space-y-4 glow-green-sm"
            >
              <h3 className="text-2xl font-bold text-white">
                Gather the offering and be <span className="text-green-400 text-glow">reborn</span>.
              </h3>
              <p className="text-gray-400">Explore the rest of the server&apos;s plugins.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href="/plugins"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-bold transition-colors glow-green flex items-center gap-2"
                >
                  <Box className="w-4 h-4" />
                  All Plugins
                </motion.a>
                <motion.a
                  href="/#join"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-xl border border-green-500/50 text-green-400 font-bold hover:bg-green-500/10 transition-colors flex items-center gap-2"
                >
                  Join v1rtopia
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              </div>
            </motion.div>
          </article>
        </div>
      </div>
    </main>
  );
}
