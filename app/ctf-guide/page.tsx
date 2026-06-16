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
  Flag,
  Swords,
  MapPin,
  Settings,
  Database,
  Wrench,
  FlaskConical,
  Shield,
  Heart,
  Users,
  Terminal,
  Crosshair,
  Timer,
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
  { id: "arena-setup", label: "Building Arenas", level: 1 },
  { id: "commands", label: "Commands", level: 1 },
  { id: "configuration", label: "Configuration", level: 1 },
  { id: "integration", label: "Integration & Stats", level: 1 },
  { id: "troubleshooting", label: "Troubleshooting", level: 1 },
  // TEMP — remove with the Testing section after validation
  { id: "testing", label: "Testing (temp)", level: 1 },
];

const PLAYER_COMMANDS: CommandData[] = [
  { command: "/ctf", description: "Show the help / command list." },
  { command: "/ctf join <arena>", description: "Join an arena's lobby — you're auto-assigned to the smaller team." },
  { command: "/ctf leave", description: "Leave your current match or lobby." },
  { command: "/ctf list", description: "List all defined arenas." },
  { command: "/ctf info <arena>", description: "Show an arena's settings and live state." },
];

const MATCH_COMMANDS: CommandData[] = [
  { command: "/ctf start <arena>", description: "Force-start a waiting match (needs ≥ min-players per team).", permission: "shardsctf.admin" },
  { command: "/ctf stop <arena>", description: "Abort a running match. Not recorded to stats.", permission: "shardsctf.admin" },
  { command: "/ctf reload", description: "Reload config.yml, messages.yml and arenas.yml.", permission: "shardsctf.admin" },
];

const ARENA_COMMANDS: CommandData[] = [
  { command: "/ctf arena create <name>", description: "Begin a new arena draft.", permission: "shardsctf.admin" },
  { command: "/ctf arena edit <name>", description: "Load an existing arena back into a draft.", permission: "shardsctf.admin" },
  { command: "/ctf arena delete <name>", description: "Delete an arena (refused while a match runs in it).", permission: "shardsctf.admin" },
  { command: "/ctf arena save", description: "Validate and persist the current draft to arenas.yml.", permission: "shardsctf.admin" },
  { command: "/ctf arena set spawn <red|blue>", description: "Set a team's spawn to your location.", permission: "shardsctf.admin" },
  { command: "/ctf arena set base <red|blue>", description: "Set a team's base (scoring point) to your location.", permission: "shardsctf.admin" },
  { command: "/ctf arena set flag", description: "Set the neutral flag's centre to your location.", permission: "shardsctf.admin" },
  { command: "/ctf arena set bounds <1|2>", description: "Set play-area corner 1 or 2 to your location.", permission: "shardsctf.admin" },
  { command: "/ctf arena set captures <n>", description: "Captures needed to win (min 1).", permission: "shardsctf.admin" },
  { command: "/ctf arena set duration <seconds>", description: "Match length (min 30).", permission: "shardsctf.admin" },
  { command: "/ctf arena set capture-radius <blocks>", description: "Grab / score proximity radius (min 1.0).", permission: "shardsctf.admin" },
  { command: "/ctf arena set flag-return <seconds>", description: "Dropped-flag return timer (min 1).", permission: "shardsctf.admin" },
  { command: "/ctf arena set min-players <n>", description: "Min players per team to start (min 1).", permission: "shardsctf.admin" },
  { command: "/ctf arena set max-players <n>", description: "Max players per team (0 = unlimited).", permission: "shardsctf.admin" },
];

const MATCH_CONFIG: ConfigRow[] = [
  { key: "countdown-seconds", def: "5", desc: "Pre-match \"5…4…3…2…1…GO\" countdown." },
  { key: "spawn-protection-seconds", def: "3", desc: "Damage immunity on (re)spawn (0 = off)." },
  { key: "out-of-bounds-check-interval-ticks", def: "10", desc: "Bounds / flag-proximity scan rate (20 = 1s)." },
  { key: "hud-refresh-ticks", def: "20", desc: "Sidebar scoreboard + timer refresh rate." },
  { key: "keep-inventory-on-death", def: "true", desc: "Keep gear on death during a match." },
  { key: "auto-respawn", def: "true", desc: "Skip the death screen; respawn instantly at team spawn." },
  { key: "auto-start-players-per-team", def: "0", desc: "Auto-start once both teams reach this count (0 = manual only)." },
];

const ARENA_DEFAULTS: ConfigRow[] = [
  { key: "captures-to-win", def: "3", desc: "Score target." },
  { key: "match-duration-seconds", def: "600", desc: "Clock length (10 min)." },
  { key: "capture-radius", def: "6.0", desc: "Blocks to grab the flag / score at base." },
  { key: "flag-return-seconds", def: "15", desc: "Dropped-flag auto-return timer." },
  { key: "min-players-per-team", def: "1", desc: "Needed to start." },
  { key: "max-players-per-team", def: "0", desc: "0 = unlimited." },
];

const FLAG_CONFIG: ConfigRow[] = [
  { key: "carrier-glow", def: "true", desc: "Carrier glows in team colour (visible through walls)." },
  { key: "neutral-banner-color", def: "WHITE", desc: "DyeColor of the neutral banner at centre / when dropped." },
];

const REQUIRED_FIELDS = ["red-spawn", "blue-spawn", "red-base", "blue-base", "flag-spawn", "bounds (corners 1 & 2)"];

const BUILD_STEPS = [
  { cmd: "/ctf arena create <name>", text: "Start a draft." },
  { cmd: "/ctf arena set spawn red  ·  set spawn blue", text: "Stand on each team's spawn point and run the command there." },
  { cmd: "/ctf arena set base red  ·  set base blue", text: "Stand on each team's base — where they carry the flag to score." },
  { cmd: "/ctf arena set flag", text: "Stand at the flag centre (where the neutral flag spawns)." },
  { cmd: "/ctf arena set bounds 1  ·  set bounds 2", text: "Stand at two opposite corners to mark the play area." },
  { cmd: "/ctf arena save", text: "Validate and lock it in. Save refuses an incomplete draft and lists what's missing." },
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

      {/* Mobile Menu */}
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

function ConfigTable({ rows }: { rows: ConfigRow[] }) {
  return (
    <div className="glass border border-green-500/20 rounded-2xl overflow-x-auto">
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
              <td className="py-3 px-4">
                <code className="font-mono text-sm text-white">{row.key}</code>
              </td>
              <td className="py-3 px-4">
                <code className="font-mono text-sm text-green-400">{row.def}</code>
              </td>
              <td className="py-3 px-4 text-gray-400 text-sm">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========================================
// MAIN PAGE
// ========================================

export default function CtfGuidePage() {
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
      {/* Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 vignette pointer-events-none" />
      <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      <Navbar />

      {/* Page header */}
      <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gray-500 text-sm mb-6"
          >
            <a href="/" className="hover:text-green-400 transition-colors">
              Home
            </a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">CTF Guide</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
              <Flag className="w-3.5 h-3.5" />
              Event Mode · Operator Guide
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-green-400 text-glow">
              Shards CTF
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              One-flag Capture the Flag for the Shards SMP. Learn how the mode plays, how to build
              arenas, every command, and all the tunables.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-green-500/40 text-green-300 text-sm font-medium glow-green-sm" aria-label="Supported Minecraft version">
              <Box className="w-3.5 h-3.5 text-green-400" />
              Minecraft 1.21.11 (Java Edition) · runs alongside ShardsSMPv2
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body: sidebar + content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Mobile TOC toggle */}
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
            <ChevronDown
              className={cn(
                "w-4 h-4 text-green-400 transition-transform",
                mobileTocOpen && "rotate-180"
              )}
            />
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
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 glass border border-green-500/20 rounded-2xl p-5">
              <TableOfContents activeSection={activeSection} onSectionClick={scrollToSection} />
            </div>
          </aside>

          {/* Main content */}
          <article className="flex-1 min-w-0 space-y-20">

            {/* ── How It Works ── */}
            <section id="how-it-works" className="scroll-mt-24">
              <SectionHeading icon={Flag}>How It Works</SectionHeading>

              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  A single <strong className="text-white">neutral</strong> flag spawns at the{" "}
                  <strong className="text-white">centre</strong> of an arena. Either team —{" "}
                  <span className="text-red-400 font-semibold">RED</span> or{" "}
                  <span className="text-blue-400 font-semibold">BLUE</span> — can grab it and carry
                  it back to <strong className="text-white">their own base</strong> to score. First
                  team to the arena&apos;s <code className="text-green-400 font-mono bg-green-500/10 px-1 rounded">captures-to-win</code>{" "}
                  wins; if the clock runs out, the higher score wins (equal = draw).
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Swords, title: "Your own loadout", desc: "Players fight with their own gear and ShardsSMPv2 shard abilities — CTF gives no kit and strips nothing." },
                    { icon: Flag, title: "Carry the flag", desc: "The carrier wears the flag banner on their head and glows in their team colour (visible through walls)." },
                    { icon: Timer, title: "Drops & returns", desc: "A carrier who dies or leaves the bounds drops the flag where they fell; it returns to centre after a timer if nobody grabs it." },
                    { icon: Heart, title: "Isolated from the SMP", desc: "Match deaths never cost a real life or trigger penalties. Gear is kept, you respawn at your team spawn with brief protection." },
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

                <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <Crosshair className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-green-200 text-sm">
                    <strong>Out of bounds?</strong> Leaving the arena or falling into the void
                    teleports you safely back to your spawn — no damage.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Building Arenas ── */}
            <section id="arena-setup" className="scroll-mt-24">
              <SectionHeading icon={MapPin}>Building Arenas</SectionHeading>

              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-200 text-sm">
                    <strong>Do this in-game as an op.</strong> Arena geometry is captured from{" "}
                    <strong>where you are standing</strong>, so these commands can&apos;t be run from
                    console. Everything goes into an in-memory draft until you{" "}
                    <code className="font-mono">/ctf arena save</code>.
                  </p>
                </div>

                <ol className="space-y-3">
                  {BUILD_STEPS.map(({ cmd, text }, i) => (
                    <li key={cmd} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <code className="text-green-400 font-mono text-sm bg-green-500/10 px-1.5 py-0.5 rounded">{cmd}</code>
                        <p className="text-gray-400 text-sm mt-1">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Save requires all six points</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    <code className="font-mono">/ctf arena save</code> refuses an incomplete draft and
                    tells you what&apos;s missing. All points must be in the{" "}
                    <strong className="text-white">same world</strong>. Required:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {REQUIRED_FIELDS.map((f) => (
                      <span key={f} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-mono">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <Wrench className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-green-200 text-sm">
                    <strong>Editing later:</strong> <code className="font-mono">/ctf arena edit &lt;name&gt;</code>{" "}
                    loads an existing arena back into a draft so you can re-set points, then{" "}
                    <code className="font-mono">save</code> again.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Commands ── */}
            <section id="commands" className="scroll-mt-24">
              <SectionHeading icon={Terminal}>Commands</SectionHeading>

              {/* Permissions */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <div className="glass border border-green-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <code className="text-green-400 font-mono text-sm">shardsctf.play</code>
                    <span className="text-xs text-gray-500">· default: everyone</span>
                  </div>
                  <p className="text-gray-400 text-sm">Join / leave / view matches.</p>
                </div>
                <div className="glass border border-amber-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <code className="text-amber-400 font-mono text-sm">shardsctf.admin</code>
                    <span className="text-xs text-gray-500">· default: OP</span>
                  </div>
                  <p className="text-gray-400 text-sm">Build arenas &amp; run matches.</p>
                </div>
              </div>

              {/* Player commands */}
              <h3 className="text-xl font-semibold text-white mb-4">Player Commands</h3>
              <div className="glass border border-green-500/20 rounded-2xl overflow-x-auto mb-10">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Command</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAYER_COMMANDS.map((cmd) => (
                      <CommandRow key={cmd.command} cmd={cmd} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Match control */}
              <h3 className="text-xl font-semibold text-white mb-4">
                Match Control
                <span className="ml-3 text-sm font-normal text-gray-500">(shardsctf.admin)</span>
              </h3>
              <div className="glass border border-amber-500/20 rounded-2xl overflow-x-auto mb-10">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Command</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Description</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Permission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATCH_COMMANDS.map((cmd) => (
                      <CommandRow key={cmd.command} cmd={cmd} showPermission />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Arena building */}
              <h3 className="text-xl font-semibold text-white mb-4">
                Arena Building
                <span className="ml-3 text-sm font-normal text-gray-500">(shardsctf.admin · in-game only)</span>
              </h3>
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
                    {ARENA_COMMANDS.map((cmd) => (
                      <CommandRow key={cmd.command} cmd={cmd} showPermission />
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-xs">
                A match begins automatically when both teams reach{" "}
                <code className="font-mono">auto-start-players-per-team</code>, or when an op runs{" "}
                <code className="font-mono">/ctf start &lt;arena&gt;</code>.
              </p>
            </section>

            {/* ── Configuration ── */}
            <section id="configuration" className="scroll-mt-24">
              <SectionHeading icon={Settings}>Configuration</SectionHeading>
              <p className="text-gray-400 mb-8">
                <code className="text-green-400 font-mono text-sm bg-green-500/10 px-1.5 py-0.5 rounded">config.yml</code>{" "}
                holds runtime behaviour and the defaults a <em>brand-new</em> arena is created with.
                Per-arena geometry lives in <code className="font-mono">arenas.yml</code> (managed by
                commands — don&apos;t hand-edit). Run <code className="font-mono">/ctf reload</code> after changes.
              </p>

              <h3 className="text-lg font-semibold text-white mb-4">match:</h3>
              <div className="mb-8"><ConfigTable rows={MATCH_CONFIG} /></div>

              <h3 className="text-lg font-semibold text-white mb-4">arena-defaults:</h3>
              <div className="mb-8"><ConfigTable rows={ARENA_DEFAULTS} /></div>

              <h3 className="text-lg font-semibold text-white mb-4">flag:</h3>
              <ConfigTable rows={FLAG_CONFIG} />
            </section>

            {/* ── Integration & Stats ── */}
            <section id="integration" className="scroll-mt-24">
              <SectionHeading icon={Database}>Integration &amp; Stats</SectionHeading>

              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">ShardsSMPv2 integration</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    CTF hard-depends on <strong className="text-white">ShardsSMPv2</strong> and talks
                    to it only through the public <code className="font-mono">EventPolicy</code> SPI:
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Team-aware harm", desc: "In a match, ability harm between team-mates is denied (even without /trust) and between enemies is allowed (overriding /trust + region PvP flags). Outside matches, normal trust rules apply." },
                      { label: "Lives exemption", desc: "Players in a match are exempt from all SMP lives changes." },
                    ].map(({ label, desc }) => (
                      <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-green-400 font-semibold text-sm w-36 shrink-0">{label}</span>
                        <span className="text-gray-400 text-sm">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Statistics (MySQL)</h3>
                  <p className="text-gray-400 text-sm">
                    Stats reuse ShardsSMPv2&apos;s database pool via the{" "}
                    <code className="font-mono">ShardsDatabaseService</code> SPI — there&apos;s{" "}
                    <strong className="text-white">no DB config in CTF</strong>. CTF creates its own{" "}
                    <code className="font-mono">ctf_*</code> tables and writes off-thread. If the DB
                    is down, stats disable and matches still play.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-blue-200 text-sm">
                    <strong>What gets recorded:</strong> only naturally completed matches that
                    actually started — capture target hit, time up, or forfeit. Admin{" "}
                    <code className="font-mono">/ctf stop</code> and server shutdown are not recorded.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Troubleshooting ── */}
            <section id="troubleshooting" className="scroll-mt-24">
              <SectionHeading icon={Wrench}>Troubleshooting</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Symptom</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Likely cause / fix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { s: "\"Only players can use this command\"", f: "You ran an arena-build command from console — those need a player's location. Run them in-game." },
                      { s: "save says incomplete", f: "One of the six required points isn't set — the message lists which. Set it, then save again." },
                      { s: "\"world-mismatch\"", f: "You set points across different worlds. Place every spawn/base/flag/bounds in one world." },
                      { s: "Match won't start (\"not enough\")", f: "Each team needs ≥ min-players. Lower it via /ctf arena set min-players or add players." },
                      { s: "No stats rows appear", f: "DB unreachable (check the ShardsSMPv2 startup log), or the match was /ctf stop-ped / didn't complete naturally." },
                    ].map(({ s, f }) => (
                      <tr key={s} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-gray-300 text-sm">{s}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{f}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TEMP TESTING SECTION — remove this whole <section>, plus its      */}
            {/* TOC_ITEMS entry (id: "testing"), after validation is done.        */}
            {/* ════════════════════════════════════════════════════════════════ */}
            <section id="testing" className="scroll-mt-24">
              <SectionHeading icon={FlaskConical}>Testing <span className="text-amber-400 text-base font-normal">(temporary)</span></SectionHeading>

              <div className="glass border-2 border-dashed border-amber-500/50 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <FlaskConical className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-200 text-sm">
                    <strong>Internal — delete this section after validation.</strong> Goal: prove the
                    full gameplay loop end-to-end and confirm a <code className="font-mono">ctf_matches</code>{" "}
                    row is written. Needs 2 players (default min-players is 1, so a 1v1 works).
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">1. Build a quick test arena (in-game)</h3>
                  <pre className="bg-black/60 border border-white/10 rounded-xl p-4 overflow-x-auto text-sm font-mono text-green-300 leading-relaxed">
{`/ctf arena create testarena
# stand on each spot, then:
/ctf arena set spawn red
/ctf arena set spawn blue
/ctf arena set base red
/ctf arena set base blue
/ctf arena set flag        # the centre
/ctf arena set bounds 1    # one corner
/ctf arena set bounds 2    # opposite corner
/ctf arena set captures 1  # 1 capture = quick test
/ctf arena save`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">2. Run it</h3>
                  <ol className="space-y-2 text-gray-400 text-sm list-decimal list-inside">
                    <li>Sanity check: <code className="font-mono text-green-400">/ctf list</code> and <code className="font-mono text-green-400">/ctf info testarena</code></li>
                    <li>Both players: <code className="font-mono text-green-400">/ctf join testarena</code> (different teams)</li>
                    <li>Start: <code className="font-mono text-green-400">/ctf start testarena</code> — watch the countdown</li>
                    <li>Verify: flag banner on carrier&apos;s head, team-colour glow, sidebar score/timer, out-of-bounds teleport, death keeps gear &amp; costs no SMP life</li>
                    <li>Grab the centre flag, carry to <strong className="text-white">your own base</strong> → with <code className="font-mono">captures 1</code> the match ends immediately</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">3. Confirm the stats write</h3>
                  <p className="text-gray-400 text-sm mb-2">Creds are in <code className="font-mono">ShardsSMPv2/config.yml</code>.</p>
                  <pre className="bg-black/60 border border-white/10 rounded-xl p-4 overflow-x-auto text-sm font-mono text-blue-300 leading-relaxed">
{`SELECT id, arena, winner, red_score, blue_score, end_reason, duration_seconds, ended_at
  FROM ctf_matches ORDER BY id DESC LIMIT 1;
SELECT uuid, name, team, result, captures, grabs, kills, deaths
  FROM ctf_match_players WHERE match_id = (SELECT MAX(id) FROM ctf_matches);
SELECT name, matches, wins, captures FROM ctf_player_totals;`}
                  </pre>
                  <p className="text-gray-400 text-sm mt-2">
                    Expect one new <code className="font-mono">ctf_matches</code> row
                    (<code className="font-mono">end_reason = captures</code>), a per-player row, and updated totals.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">4. Edge paths &amp; cleanup</h3>
                  <ul className="space-y-1.5 text-gray-400 text-sm list-disc list-inside">
                    <li>Time-out: <code className="font-mono">duration 30</code>, let the clock run out → <code className="font-mono">end_reason = time</code></li>
                    <li>Forfeit: one whole team <code className="font-mono">/ctf leave</code> mid-match → <code className="font-mono">end_reason = forfeit</code></li>
                    <li><code className="font-mono">/ctf stop</code> mid-match → no row written (by design)</li>
                    <li>Clean up: <code className="font-mono">/ctf stop testarena</code> then <code className="font-mono">/ctf arena delete testarena</code></li>
                  </ul>
                </div>
              </div>
            </section>
            {/* ════════════════════ END TEMP TESTING SECTION ════════════════════ */}

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass border border-green-500/30 rounded-2xl p-8 text-center space-y-4 glow-green-sm"
            >
              <h3 className="text-2xl font-bold text-white">
                Ready to <span className="text-green-400 text-glow">capture the flag</span>?
              </h3>
              <p className="text-gray-400">Join the server and jump into an arena.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href="/#join"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-bold transition-colors glow-green flex items-center gap-2"
                >
                  Join v1rtopia
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="/shards-guide"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-xl border border-green-500/50 text-green-400 font-bold hover:bg-green-500/10 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Shards Guide
                </motion.a>
              </div>
            </motion.div>
          </article>
        </div>
      </div>
    </main>
  );
}
