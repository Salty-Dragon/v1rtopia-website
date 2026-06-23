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
  Moon,
  Crown,
  Users,
  Swords,
  Sparkles,
  Skull,
  Droplet,
  Heart,
  Trophy,
  Settings,
  Database,
  FlaskConical,
  Shield,
  Terminal,
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
  { id: "roles", label: "Roles & Buffs", level: 1 },
  { id: "sacrifice", label: "The Blood Sacrifice", level: 1 },
  { id: "outcome", label: "Winning & Losing", level: 1 },
  { id: "commands", label: "Commands", level: 1 },
  { id: "configuration", label: "Configuration", level: 1 },
  { id: "integration", label: "Integration", level: 1 },
  // TEMP — remove with the Testing section after validation
  { id: "testing", label: "Testing (temp)", level: 1 },
];

const ADMIN_COMMANDS: CommandData[] = [
  { command: "/bloodmoon start", description: "Begin an event, picking the Blood team at random from online players (needs event.min-online).", permission: "shardsbloodmoon.admin" },
  { command: "/bloodmoon start <leader> <sub...>", description: "Stage an explicit Blood team — first name is the Leader, the rest are Subordinates (all must be online).", permission: "shardsbloodmoon.admin" },
  { command: "/bloodmoon stop", description: "End the event immediately with no winner and no prize, fully reverting everyone.", permission: "shardsbloodmoon.admin" },
  { command: "/bloodmoon info", description: "Show the active event: roles, kill counts, survivors left, active sacrifices, the ritual speed and whether kill-conversion is on.", permission: "shardsbloodmoon.admin" },
  { command: "/bloodmoon ritual speed <n>", description: "Set the sacrifice time multiplier live (e.g. 60 → a 15-min ritual finishes in ~15s). Great for content/testing.", permission: "shardsbloodmoon.admin" },
  { command: "/bloodmoon conversion <true|false>", description: "Toggle live whether Blood kills convert their victim into a Minion. false = kills are ordinary PvP deaths (no conversion). With no argument, reports the current state. Sacrifices always convert regardless. Resets to the config default when an event ends.", permission: "shardsbloodmoon.admin" },
  { command: "/bloodmoon set <player> <role>", description: "Reassign a player mid-event: Leader, Subordinate, Minion, or Normal (release them back to a survivor — the 'undo an unfair kill' lever).", permission: "shardsbloodmoon.admin" },
  { command: "/bloodmoon reload", description: "Reload config.yml and messages.yml.", permission: "shardsbloodmoon.admin" },
];

const EVENT_CONFIG: ConfigRow[] = [
  { key: "min-online", def: "4", desc: "Random /bloodmoon start refuses unless at least this many players are online." },
  { key: "subordinate-count", def: "2", desc: "Subordinates picked alongside the single Leader (total Blood team = 1 + this)." },
  { key: "kill-converts", def: "true", desc: "When a Blood member kills a normal player, convert the victim into a Minion? false = kills stay ordinary PvP deaths. Toggle live with /bloodmoon conversion; resets to this default when an event ends." },
];

const LEADER_CONFIG: ConfigRow[] = [
  { key: "max-hearts", def: "20", desc: "Leader max health on start (20 = 40 HP), via an attribute modifier." },
  { key: "grant-blood-shard", def: "true", desc: "Give the Leader the real core Blood Shard on start (core /shard)." },
  { key: "blood-shard-name", def: "blood", desc: "The /shard name granted to the Leader (and cleared on revert)." },
  { key: "damage-per-kill", def: "0.10", desc: "Outgoing-damage bonus per kill (+10%), additive." },
  { key: "max-damage-bonus", def: "1.0", desc: "Cap on the kill damage bonus (+100%)." },
  { key: "passive-ladder", def: "(list)", desc: "One permanent positive effect per kill, walking this list (speed, strength, regeneration, resistance)." },
];

const SUB_CONFIG: ConfigRow[] = [
  { key: "max-hearts", def: "15", desc: "Subordinate max health on start (15 = 30 HP)." },
  { key: "damage-per-kill", def: "0.05", desc: "Subordinates scale damage too, but at half the Leader's rate — and gain NO passive ladder." },
  { key: "max-damage-bonus", def: "0.5", desc: "Cap on the subordinate kill damage bonus (+50%)." },
];

const SACRIFICE_CONFIG: ConfigRow[] = [
  { key: "duration-seconds", def: "900", desc: "How long a sacrifice must survive to succeed (15 min)." },
  { key: "entity-health", def: "60.0", desc: "HP pool of the head-entity that defenders chip down to fail the sacrifice." },
  { key: "detect-radius", def: "1.6", desc: "How close a dropped head must rest to a pedestal top to count." },
  { key: "settle-delay-ticks", def: "15", desc: "Debounce after a head drop before sweeping pedestals." },
  { key: "concurrent", def: "true", desc: "Allow several sacrifices on different pedestals at once." },
  { key: "boss-bar-color", def: "RED", desc: "Colour of each sacrifice's countdown boss bar." },
  { key: "float-height", def: "2.0", desc: "Blocks the head floats above the pedestal top." },
  { key: "health-text-offset", def: "3.0", desc: "Blocks the floating HP text sits above the head." },
  { key: "rotate-degrees-per-tick", def: "4.0", desc: "How fast the head spins (per visual tick)." },
  { key: "default-ritual-speed", def: "1.0", desc: "Starting time multiplier; override live with /bloodmoon ritual speed." },
  { key: "glow", def: "true", desc: "Red glow outline on the head-entity." },
];

const VISUALS_CONFIG: ConfigRow[] = [
  { key: "pulse-interval-ticks", def: "5", desc: "Visual ticks between the dark-red pulse bursts from the head." },
  { key: "pulse-particle-count", def: "16", desc: "Dark-red dust points per pulse ring." },
  { key: "beam-height", def: "30.0", desc: "Height (blocks) of the bright-red success beam before it bursts in the sky." },
];

const END_CONFIG: ConfigRow[] = [
  { key: "revert-blood-members", def: "true", desc: "On win OR loss, clear converted members' buffs/teams/nametags. false = keep the Blood identity as a trophy." },
  { key: "remove-leader-shard", def: "true", desc: "Strip the Leader's Blood Shard on revert." },
  { key: "prize.broadcast", def: "(text)", desc: "Server-wide message on a Blood win; <leader> is substituted." },
  { key: "prize.commands", def: "(list)", desc: "Console commands run on a Blood win; <leader> is substituted (the configurable reward)." },
];

const COSMETIC_CONFIG: ConfigRow[] = [
  { key: "particles-enabled", def: "true", desc: "Toggle the red blood-mist around Blood members." },
  { key: "tick-interval", def: "10", desc: "Ticks between particle emissions." },
  { key: "member-particle-count", def: "8", desc: "Red dust particles per emission around each member." },
  { key: "leader-multiplier", def: "3", desc: "The Leader emits this multiple of the member count." },
  { key: "particle-size", def: "1.2", desc: "Particle scale." },
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

export default function BloodMoonGuidePage() {
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
            <span className="text-gray-300">Blood Moon</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
              <Moon className="w-3.5 h-3.5" />
              Event Mode · Operator Guide
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-red-400 text-glow">
              Blood Moon
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Three players rise as the Blood Moon. Their goal is to end the world — sacrificing
              survivors on the ritual pedestals to turn them, growing stronger with every kill.
              Slay the Leader and the world endures.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-green-500/40 text-green-300 text-sm font-medium glow-green-sm">
              <Box className="w-3.5 h-3.5 text-green-400" />
              Minecraft 1.21.11 (Java Edition) · runs alongside ShardsSMPv2 &amp; ShardsRebirth
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
              <SectionHeading icon={Moon}>How It Works</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  An admin starts a Blood Moon. <strong className="text-white">Three players</strong> are
                  chosen — one <strong className="text-red-400">Leader</strong> and two{" "}
                  <strong className="text-red-400">Subordinates</strong>. Together they are Team Blood Moon,
                  and their goal is to <strong className="text-white">end the server</strong> by converting
                  everyone else.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Crown, title: "The Leader rises", desc: "Gains the real Blood Shard, 20 hearts, and grows stronger with every kill." },
                    { icon: Droplet, title: "Blood Sacrifices", desc: "Throw a player's head onto a Rebirth pedestal to begin a 15-minute ritual to turn them." },
                    { icon: Swords, title: "Every kill feeds them", desc: "Blood members deal more damage with each kill; the Leader also gains permanent passives." },
                    { icon: Skull, title: "The slain rise", desc: "Anyone killed by the Blood Moon is bound as a Minion — they respawn in survival on the Blood team. Admins can toggle this off so kills stay ordinary PvP." },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-red-400" />
                      </span>
                      <div>
                        <span className="text-white font-medium text-sm">{title}</span>
                        <p className="text-gray-400 text-sm mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <Moon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">
                    <strong>The world falls</strong> when no survivor is left standing — but the moment the{" "}
                    <strong>Leader is slain</strong>, the Blood Moon ends and everyone is restored.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Roles & Buffs ── */}
            <section id="roles" className="scroll-mt-24">
              <SectionHeading icon={Users}>Roles &amp; Buffs</SectionHeading>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    icon: Crown, tag: "[L]", name: "Leader", hearts: "20 ❤",
                    points: ["Holds the real Blood Shard", "+10% damage per kill (up to +100%)", "One permanent passive per kill", "Emits the heaviest blood-mist"],
                  },
                  {
                    icon: Swords, tag: "[S]", name: "Subordinate", hearts: "15 ❤",
                    points: ["Keeps their own shard", "+5% damage per kill (up to +50%)", "No passive ladder", "Two of them per event"],
                  },
                  {
                    icon: Skull, tag: "", name: "Minion", hearts: "20 ❤",
                    points: ["Turned by a kill or a sacrifice", "On Team Blood Moon", "No buffs at all", "Bright-red name, no tag"],
                  },
                ].map(({ icon: Icon, tag, name, hearts, points }) => (
                  <div key={name} className="glass border border-red-500/20 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-red-400" />
                      </span>
                      <span className="text-xs font-mono px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-300">{hearts}</span>
                    </div>
                    <h3 className="text-lg font-bold text-red-400">
                      {tag && <span className="font-mono">{tag} </span>}{name}
                    </h3>
                    <ul className="space-y-1.5">
                      {points.map((p) => (
                        <li key={p} className="text-gray-400 text-sm flex items-start gap-2">
                          <Droplet className="w-3.5 h-3.5 text-red-400/70 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-3 text-gray-300 leading-relaxed text-sm">
                <p>
                  Blood members share a team identity: <strong className="text-red-400">bright-red nametags</strong>,
                  red names in chat, and a <code className="font-mono">[L]</code> / <code className="font-mono">[S]</code> tag
                  before the Leader and Subordinates. Red blood-mist trails every member, heaviest on the Leader.
                </p>
                <p className="text-gray-400">
                  The stronger-per-kill effect is applied by the event itself — an escalating outgoing-damage
                  multiplier (and, for the Leader, a stacking ladder of positive potion effects). Max health is set
                  with an attribute modifier and cleanly removed when the event ends.
                </p>
              </div>
            </section>

            {/* ── The Blood Sacrifice ── */}
            <section id="sacrifice" className="scroll-mt-24">
              <SectionHeading icon={Droplet}>The Blood Sacrifice</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  Sacrifices take place on <strong className="text-white">The Rebirth Ritual&apos;s pedestals</strong> —
                  the same altars an admin builds with <code className="text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded">/pedestal set</code>.
                  A Blood member drops a player&apos;s <strong className="text-white">head</strong> onto a pedestal; that
                  head&apos;s owner becomes the target.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Droplet, title: "Throw a head", desc: "Drop \"V1rtopia's head\" on a pedestal → a \"V1rtopia Blood Sacrifice\" begins." },
                    { icon: Timer, title: "15-minute ritual", desc: "The head floats above the altar, slowly spinning with a red glow, its HP floating overhead and a countdown boss bar everyone can see." },
                    { icon: Swords, title: "Destroy it to stop it", desc: "Any non-Blood player (including the target) can attack the head-entity. Destroy it before the timer and the sacrifice FAILS." },
                    { icon: Skull, title: "Survive and convert", desc: "If the head survives the full 15 minutes, a beam erupts into the sky, the world hears “{player} has joined the Blood Moon!”, and the target becomes a Minion." },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-red-400" />
                      </span>
                      <div>
                        <span className="text-white font-medium text-sm">{title}</span>
                        <p className="text-gray-400 text-sm mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">
                    <strong>Blood members defend the sacrifice</strong> — they can&apos;t damage the head-entity
                    themselves, so it becomes a tug-of-war: survivors race to the altar, the Blood Moon holds the line.
                    Several sacrifices can run on different pedestals at once.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <Sparkles className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
                  <p className="text-purple-200 text-sm">
                    <strong>Pure spectacle.</strong> Dark-red particles pulse from the head all ritual long. Success
                    fires a beam skyward into an explosion with a screen title; a failed ritual ends the pulse with a
                    “sacrifice has failed!” title. Tune the float height, spin speed, glow, beam and pulse in config.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Winning & Losing ── */}
            <section id="outcome" className="scroll-mt-24">
              <SectionHeading icon={Trophy}>Winning &amp; Losing</SectionHeading>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass border border-red-500/30 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-bold text-red-400">The Blood Moon wins</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    When no surviving player is left in play — everyone has been turned into a Minion, whether by a
                    sacrifice or by being cut down in combat — the world falls. The <strong className="text-white">Leader
                    claims the prize</strong>: a fully configurable set of console commands (items, effects, broadcasts — your call).
                  </p>
                </div>
                <div className="glass border border-green-500/30 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-bold text-green-400">The world endures</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    The instant the <strong className="text-white">Leader is defeated</strong>, Team Blood Moon loses.
                    The event ends and everyone is restored — by default converted members lose the Blood identity and
                    are mortal again. (Wrongly turned someone? <code className="font-mono">/bloodmoon set &lt;player&gt; Normal</code>
                    releases them mid-event.)
                  </p>
                </div>
              </div>
              <div className="mt-4 glass border border-blue-500/20 rounded-2xl p-5 flex items-start gap-3">
                <Heart className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-200 text-sm">
                  While a Blood Moon runs, <strong>SMP lives are paused for everyone</strong> — no death costs a life
                  or triggers penalties. The event runs its own death rules and cleanly restores the server when it ends.
                  A Blood member who was <strong>offline when the event ended</strong> is scrubbed the next time they log
                  in, so bonus hearts, passives and the red nametag never follow anyone into a later session.
                </p>
              </div>
            </section>

            {/* ── Commands ── */}
            <section id="commands" className="scroll-mt-24">
              <SectionHeading icon={Terminal}>Commands</SectionHeading>
              <div className="glass border border-amber-500/20 rounded-2xl p-5 mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <code className="text-amber-400 font-mono text-sm">shardsbloodmoon.admin</code>
                  <span className="text-xs text-gray-500">· default: OP</span>
                </div>
                <p className="text-gray-400 text-sm">All Blood Moon commands are admin-only. There are no player-facing commands — survivors and Blood members act in-world.</p>
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
                holds every gameplay number; all text lives in <code className="font-mono">messages.yml</code> (MiniMessage).
                Reload both with <code className="font-mono">/bloodmoon reload</code>.
              </p>
              <ConfigTable title="event:" rows={EVENT_CONFIG} />
              <ConfigTable title="leader:" rows={LEADER_CONFIG} />
              <ConfigTable title="subordinate:" rows={SUB_CONFIG} />
              <ConfigTable title="sacrifice:" rows={SACRIFICE_CONFIG} />
              <ConfigTable title="visuals:" rows={VISUALS_CONFIG} />
              <ConfigTable title="cosmetics:" rows={COSMETIC_CONFIG} />
              <ConfigTable title="end: / prize:" rows={END_CONFIG} />
            </section>

            {/* ── Integration ── */}
            <section id="integration" className="scroll-mt-24">
              <SectionHeading icon={Database}>Integration</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Blood Moon hard-depends on <strong className="text-white">ShardsSMPv2</strong> and integrates only
                  through its public <code className="font-mono">EventPolicy</code> SPI — it never touches the core&apos;s
                  internals. While active it force-allows Blood-vs-survivor combat (overriding <code className="font-mono">/trust</code>),
                  protects Blood teammates from each other, and exempts every death from the lives system.
                </p>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <RotateCcwInline />
                  <p className="text-purple-200 text-sm">
                    It soft-depends on <strong>The Rebirth Ritual</strong> for its altars, reading them through a small
                    read-only <code className="font-mono">PedestalLocator</code> service so pedestals are defined in one
                    place. If Rebirth isn&apos;t installed, the event still runs — there are just no pedestals to sacrifice on.
                  </p>
                </div>
                <p className="text-gray-400 text-sm">
                  The Leader&apos;s Blood Shard is the real core Mythic shard, granted through the core&apos;s own{" "}
                  <code className="font-mono">/shard</code> command and removed on revert.
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
                    <strong>Internal — delete this section after validation.</strong> Goal: prove the team is picked,
                    a sacrifice converts (and can be failed) with its visuals, kills turn survivors into Minions, and
                    both win and loss paths fully revert the server.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Quick run</h3>
                  <ol className="space-y-2 text-gray-400 text-sm list-decimal list-inside">
                    <li>Make sure a Rebirth pedestal exists: look at a block and run <code className="font-mono text-green-400">/pedestal set</code>.</li>
                    <li>Start it: <code className="font-mono text-green-400">/bloodmoon start</code> (random) or <code className="font-mono text-green-400">/bloodmoon start Leader Sub1 Sub2</code>.</li>
                    <li>Speed the ritual up for testing: <code className="font-mono text-green-400">/bloodmoon ritual speed 60</code> (15 min ⇒ ~15 s). No config edit/reload needed.</li>
                    <li>Confirm the Leader gets the Blood Shard + red nametag, and the start broadcast fires.</li>
                    <li>As a Blood member, drop a survivor&apos;s player head on the pedestal — confirm the head floats, spins, glows red, shows HP overhead, and pulses; the countdown boss bar appears.</li>
                    <li>Fail path: have a non-Blood player destroy the head-entity before the timer → confirm the pulse stops and the &quot;sacrifice has failed!&quot; title shows.</li>
                    <li>Success path: let it run out → confirm the beam + sky explosion, the &quot;joined the Blood Moon!&quot; title, and the target becomes a red, tag-less Minion.</li>
                    <li>Have a Blood member kill a survivor → confirm the victim respawns in survival as a Minion (red name) and the killer&apos;s kill count rises.</li>
                    <li>Conversion toggle: <code className="font-mono text-green-400">/bloodmoon conversion false</code>, then have a Blood member kill a survivor → confirm the victim stays normal (no Minion conversion) while the killer&apos;s kills still rise; <code className="font-mono text-green-400">/bloodmoon conversion true</code> restores conversion. (Sacrifices should still convert either way.)</li>
                    <li>Offline revert: turn a player into a Minion, have them log off, then <code className="font-mono text-green-400">/bloodmoon stop</code>. Start a fresh event and have them log back in → confirm they have NO bonus hearts, passives or red nametag left over.</li>
                    <li>Wrong target? <code className="font-mono text-green-400">/bloodmoon set &lt;player&gt; Normal</code> should release them back to a survivor; try <code className="font-mono text-green-400">/bloodmoon set &lt;player&gt; Leader</code> too (old Leader is demoted).</li>
                    <li>Check <code className="font-mono text-green-400">/bloodmoon info</code> for roles/kills/survivors/speed.</li>
                    <li>Loss: kill the Leader → confirm the event ends and buffs/nametags clear. Win: turn everyone → confirm the prize commands run.</li>
                    <li><code className="font-mono text-green-400">/bloodmoon stop</code> mid-event should revert everyone with no prize.</li>
                  </ol>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">
                    Watch the revert closely — no lingering max-health, potion passives, scoreboard teams, or leftover
                    head-entities/HP displays after the event ends. That clean restore is the whole contract for an event plugin.
                  </p>
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
                Rise with the <span className="text-red-400 text-glow">Blood Moon</span>.
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

// Small inline icon used in the Integration callout (kept local to avoid another import alias).
function RotateCcwInline() {
  return (
    <svg className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
