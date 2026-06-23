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
  Swords,
  Sun,
  Flame,
  RefreshCw,
  Crown,
  Users,
  Sparkles,
  MapPin,
  Heart,
  Trophy,
  Settings,
  Database,
  FlaskConical,
  Shield,
  Terminal,
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
  { id: "factions", label: "Factions & Captains", level: 1 },
  { id: "inversion", label: "Inversion", level: 1 },
  { id: "duel", label: "The Captain Duel", level: 1 },
  { id: "claim", label: "The Mythic Claim", level: 1 },
  { id: "outcome", label: "Winning", level: 1 },
  { id: "commands", label: "Commands", level: 1 },
  { id: "configuration", label: "Configuration", level: 1 },
  { id: "integration", label: "Integration", level: 1 },
  // TEMP — remove with the Testing section after validation
  { id: "testing", label: "Testing (temp)", level: 1 },
];

const ADMIN_COMMANDS: CommandData[] = [
  { command: "/celestials start", description: "Begin a war, splitting online players evenly into Angels and Demons with a random Captain on each side (needs event.min-online).", permission: "shardscelestials.admin" },
  { command: "/celestials start <angel> <demon>", description: "Stage explicit Captains — first name leads the Angels, second the Demons; everyone else is split evenly at random.", permission: "shardscelestials.admin" },
  { command: "/celestials duel", description: "Lock the rosters and call the final Captain duel. Both Captains must be online; inversion stops and only a Captain's death now matters.", permission: "shardscelestials.admin" },
  { command: "/celestials stop", description: "End the war immediately with no winner — both Captains keep their mythics and nothing relocates.", permission: "shardscelestials.admin" },
  { command: "/celestials info", description: "Show the active war: faction counts, both Captains, the duel state, and how many mythics are awaiting a claimant.", permission: "shardscelestials.admin" },
  { command: "/celestials set <player> <role>", description: "Reassign a participant mid-war: Angel, Demon, AngelCaptain or DemonCaptain. A captain reassign moves the mythic and demotes the old captain.", permission: "shardscelestials.admin" },
  { command: "/celestials claim cancel | give <player>", description: "Resolve a waiting mythic: 'cancel' removes it from its pedestal; 'give <player>' hands it straight to a player.", permission: "shardscelestials.admin" },
  { command: "/celestials reload", description: "Reload config.yml and messages.yml.", permission: "shardscelestials.admin" },
];

const EVENT_CONFIG: ConfigRow[] = [
  { key: "min-online", def: "4", desc: "Random /celestials start refuses unless at least this many players are online." },
];

const ANGEL_CONFIG: ConfigRow[] = [
  { key: "shard-name", def: "angelic", desc: "Core /shard granted to the Angel Captain (and relocated to a pedestal on their death)." },
  { key: "shard-model-data", def: "1020", desc: "CustomModelData of the shard item shown on the claim pedestal (angelic_shard in the pack)." },
  { key: "captain-hearts", def: "15", desc: "Angel Captain max health in hearts (15 = 30 HP). Members are left at vanilla." },
  { key: "team-color", def: "WHITE", desc: "Scoreboard / nametag / glow colour for Angels." },
  { key: "captain-glow", def: "true", desc: "The Angel Captain glows (white) so they're findable for the duel." },
];

const DEMON_CONFIG: ConfigRow[] = [
  { key: "shard-name", def: "devil", desc: "Core /shard granted to the Demon Captain (and relocated on their death)." },
  { key: "shard-model-data", def: "1022", desc: "CustomModelData of the shard item on the pedestal (devil_token in the pack)." },
  { key: "captain-hearts", def: "15", desc: "Demon Captain max health in hearts (15 = 30 HP)." },
  { key: "team-color", def: "RED", desc: "Scoreboard / nametag / glow colour for Demons." },
  { key: "captain-glow", def: "true", desc: "The Demon Captain glows (red)." },
];

const COSMETIC_CONFIG: ConfigRow[] = [
  { key: "particles-enabled", def: "true", desc: "Ambient faction-coloured particles around members (white for Angels, red for Demons)." },
  { key: "captain-particles", def: "false", desc: "Captains already emit their mythic's own aura while holding the shard, so ours are skipped by default." },
  { key: "tick-interval", def: "10", desc: "Ticks between particle emissions." },
  { key: "member-particle-count", def: "6", desc: "Faction dust particles per emission around each member." },
  { key: "particle-size", def: "1.0", desc: "Particle scale." },
];

const DUEL_CONFIG: ConfigRow[] = [
  { key: "teleport-captains-together", def: "false", desc: "On /celestials duel, teleport the two Captains to each other for the finale." },
];

const CLAIM_CONFIG: ConfigRow[] = [
  { key: "claim-radius", def: "2.0", desc: "A player within this many blocks of the pedestal claims the waiting mythic." },
  { key: "marker-float-height", def: "1.5", desc: "Blocks the floating claim marker sits above the pedestal top." },
  { key: "glow", def: "true", desc: "Faction-coloured glow outline on the claim marker." },
  { key: "skip-active-ritual-pedestals", def: "true", desc: "Avoid relocating onto a pedestal a Rebirth ritual is currently using." },
];

const END_CONFIG: ConfigRow[] = [
  { key: "revert-members", def: "true", desc: "On a normal end (a Captain died), revert all members — clear buffs, teams, glow and nametags." },
  { key: "clear-captain-shards-on-stop", def: "false", desc: "On an admin /celestials stop (abort), also strip the Captains' shards? Default: they keep them." },
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

export default function CelestialsGuidePage() {
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
            <span className="text-gray-300">Celestials</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium">
              <Swords className="w-3.5 h-3.5" />
              Event Mode · Operator Guide
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-glow">
              <span className="text-white">😇 Angels</span>
              <span className="text-gray-500"> vs </span>
              <span className="text-red-400">Demons 😈</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Heaven and Hell go to war. The whole server is split into two sides, each led by a
              Captain wielding a mythic. Strike down your enemies to turn them — and when a Captain
              falls, the war ends and their mythic vanishes to a distant pedestal, waiting to be claimed.
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
              <SectionHeading icon={Swords}>How It Works</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  An admin starts the war. Everyone online is split <strong className="text-white">evenly</strong> into
                  two sides — the <strong className="text-white">Angels</strong> and the{" "}
                  <strong className="text-red-400">Demons</strong> — and each side is led by a single{" "}
                  <strong className="text-white">Captain</strong> who wields a real mythic.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Sun, title: "The Angels rise", desc: "The Angel Captain wields the Angelic Shard, glows white, and stands at 15 hearts.", color: "text-gray-100" },
                    { icon: Flame, title: "The Demons descend", desc: "The Demon Captain wields the Devil Token, glows red, and stands at 15 hearts.", color: "text-red-400" },
                    { icon: RefreshCw, title: "Every kill converts", desc: "Strike down an enemy and they switch sides — Angels redeem Demons, Demons corrupt Angels.", color: "text-amber-400" },
                    { icon: Swords, title: "It ends in a duel", desc: "If both Captains survive the melee, an admin calls the duel — the war ends the instant a Captain dies.", color: "text-amber-400" },
                  ].map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className={cn("w-4 h-4", color)} />
                      </span>
                      <div>
                        <span className="text-white font-medium text-sm">{title}</span>
                        <p className="text-gray-400 text-sm mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-200 text-sm">
                    When a <strong>Captain falls</strong>, the other side wins — and the fallen Captain&apos;s mythic
                    does <strong>not</strong> drop. It vanishes to a distant <strong>Rebirth pedestal</strong>, waiting
                    for someone bold enough to claim it.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Factions & Captains ── */}
            <section id="factions" className="scroll-mt-24">
              <SectionHeading icon={Users}>Factions &amp; Captains</SectionHeading>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="glass border border-white/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center">
                      <Sun className="w-5 h-5 text-gray-100" />
                    </span>
                    <span className="text-xs font-mono px-2 py-1 rounded-md bg-white/10 border border-white/20 text-gray-200">15 ❤</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-100"><Crown className="w-4 h-4 inline mb-1" /> Angel Captain</h3>
                  <ul className="space-y-1.5">
                    {["Wields the 😇 Angelic Shard (mythic)", "Cheat-death passive, star-beam A1, invulnerability A2", "15 hearts · glows white", "White nametag + the shard's own aura"].map((p) => (
                      <li key={p} className="text-gray-400 text-sm flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-gray-300/70 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass border border-red-500/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-red-400" />
                    </span>
                    <span className="text-xs font-mono px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-300">15 ❤</span>
                  </div>
                  <h3 className="text-lg font-bold text-red-400"><Crown className="w-4 h-4 inline mb-1" /> Demon Captain</h3>
                  <ul className="space-y-1.5">
                    {["Wields the 😈 Devil Token (mythic)", "Dark Cloak disguise A1, Devil Trigger flight + blast A2", "15 hearts · glows red", "Red nametag + the token's own aura"].map((p) => (
                      <li key={p} className="text-gray-400 text-sm flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-red-400/70 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-3 text-gray-300 leading-relaxed text-sm">
                <p>
                  Everyone else is a <strong className="text-white">rank-and-file</strong> Angel or Demon: an ordinary
                  player who simply has a side — a <strong className="text-white">white</strong> or{" "}
                  <strong className="text-red-400">red</strong> nametag and a trail of faction-coloured particles.
                  They carry no special stats; their power is in numbers, and in who they can convert.
                </p>
                <p className="text-gray-400">
                  The two mythics are the real core ShardsSMPv2 shards — the Angelic Shard and the Devil Token —
                  granted through the core&apos;s own <code className="font-mono">/shard</code> command. The Captains&apos;
                  15-heart cap is applied by the event with an attribute modifier and cleanly removed when the war ends.
                </p>
              </div>
            </section>

            {/* ── Inversion ── */}
            <section id="inversion" className="scroll-mt-24">
              <SectionHeading icon={RefreshCw}>Inversion</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  This is the heart of the war. <strong className="text-white">Strike down an enemy and you flip them
                  to your side.</strong> An Angel slain by a Demon is dragged below and respawns a Demon; a Demon slain
                  by an Angel is redeemed and respawns an Angel. The tide of the war is the tide of the battlefield.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: RefreshCw, title: "Cross-faction kills flip", desc: "Only kills across the divide convert — your victim respawns on your team, nametag and all." },
                    { icon: Shield, title: "No friendly fire", desc: "Two players on the same side cannot harm each other, regardless of /trust." },
                    { icon: Crown, title: "Captains are exempt", desc: "A Captain never inverts. When a Captain dies, the war ends instead — that's the whole game." },
                    { icon: Heart, title: "Lives are paused", desc: "No death in the war touches the SMP lives system — the event runs its own rules." },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-amber-400" />
                      </span>
                      <div>
                        <span className="text-white font-medium text-sm">{title}</span>
                        <p className="text-gray-400 text-sm mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── The Captain Duel ── */}
            <section id="duel" className="scroll-mt-24">
              <SectionHeading icon={Swords}>The Captain Duel</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-4 text-gray-300 leading-relaxed">
                <p>
                  If the melee grinds on and both Captains still stand, an admin calls{" "}
                  <code className="text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded">/celestials duel</code>{" "}
                  — <strong className="text-white">Final Judgement</strong>. The rosters lock (inversion stops), the
                  server is told the Captains must duel to the death, and only a Captain&apos;s fall now matters.
                </p>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <Swords className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-200 text-sm">
                    The duel doesn&apos;t have to be a 1v1 in an arena — it&apos;s simply the moment the war is decided
                    on the Captains alone. An optional config can teleport the two Captains together for a clean showdown.
                  </p>
                </div>
              </div>
            </section>

            {/* ── The Mythic Claim ── */}
            <section id="claim" className="scroll-mt-24">
              <SectionHeading icon={MapPin}>The Mythic Claim</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  When a Captain dies, the survivor <strong className="text-white">keeps</strong> their mythic — but the
                  fallen one&apos;s mythic is <strong className="text-white">not lost and does not drop</strong>. It is
                  spirited away to a random one of the world&apos;s <strong className="text-white">Rebirth pedestals</strong>{" "}
                  (the same altars built with <code className="text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded">/pedestal set</code>).
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: MapPin, title: "It waits on a pedestal", desc: "A glowing, floating marker of the mythic appears above a random pedestal, labelled with what it is." },
                    { icon: Sparkles, title: "Walk up to claim it", desc: "Any player who steps within the claim radius takes it — the real shard is granted to them on the spot." },
                    { icon: RefreshCw, title: "It outlives the war", desc: "The claim persists after the event ends and even survives a server restart — the marker re-appears until someone claims it." },
                    { icon: Shield, title: "First come, first served", desc: "There is exactly one bearer. The first to reach it wins the mythic; admins can also cancel or hand it out directly." },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-amber-400" />
                      </span>
                      <div>
                        <span className="text-white font-medium text-sm">{title}</span>
                        <p className="text-gray-400 text-sm mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <RotateCcwInline />
                  <p className="text-purple-200 text-sm">
                    Needs <strong>The Rebirth Ritual</strong> installed for its pedestals. With no pedestals available,
                    the war still resolves — the fallen mythic simply can&apos;t be relocated, and the server is told so.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Winning ── */}
            <section id="outcome" className="scroll-mt-24">
              <SectionHeading icon={Trophy}>Winning</SectionHeading>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass border border-white/20 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-gray-100" />
                    <h3 className="text-lg font-bold text-gray-100">Heaven prevails</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    The instant the <strong className="text-white">Demon Captain</strong> falls, the Angels hold the
                    field. The Angel Captain keeps the Angelic Shard; the Devil Token relocates to a pedestal to be claimed.
                  </p>
                </div>
                <div className="glass border border-red-500/30 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-bold text-red-400">Hell prevails</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    The instant the <strong className="text-white">Angel Captain</strong> falls, the Demons hold the
                    field. The Demon Captain keeps the Devil Token; the Angelic Shard relocates to a pedestal to be claimed.
                  </p>
                </div>
              </div>
              <div className="mt-4 glass border border-blue-500/20 rounded-2xl p-5 flex items-start gap-3">
                <Heart className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-200 text-sm">
                  Wrongly flipped someone or need to fix a Captain? <code className="font-mono">/celestials set &lt;player&gt; &lt;role&gt;</code>{" "}
                  reassigns anyone mid-war, and <code className="font-mono">/celestials stop</code> ends it cleanly with no
                  winner — everyone is restored and both Captains keep their mythics.
                </p>
              </div>
            </section>

            {/* ── Commands ── */}
            <section id="commands" className="scroll-mt-24">
              <SectionHeading icon={Terminal}>Commands</SectionHeading>
              <div className="glass border border-amber-500/20 rounded-2xl p-5 mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <code className="text-amber-400 font-mono text-sm">shardscelestials.admin</code>
                  <span className="text-xs text-gray-500">· default: OP</span>
                </div>
                <p className="text-gray-400 text-sm">All Celestials commands are admin-only. There are no player-facing commands — Angels and Demons fight it out in-world.</p>
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
                Reload both with <code className="font-mono">/celestials reload</code>.
              </p>
              <ConfigTable title="event:" rows={EVENT_CONFIG} />
              <ConfigTable title="angel:" rows={ANGEL_CONFIG} />
              <ConfigTable title="demon:" rows={DEMON_CONFIG} />
              <ConfigTable title="cosmetics:" rows={COSMETIC_CONFIG} />
              <ConfigTable title="duel:" rows={DUEL_CONFIG} />
              <ConfigTable title="claim:" rows={CLAIM_CONFIG} />
              <ConfigTable title="end:" rows={END_CONFIG} />
            </section>

            {/* ── Integration ── */}
            <section id="integration" className="scroll-mt-24">
              <SectionHeading icon={Database}>Integration</SectionHeading>
              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Celestials hard-depends on <strong className="text-white">ShardsSMPv2</strong> and integrates only
                  through its public <code className="font-mono">EventPolicy</code> SPI — it never touches the core&apos;s
                  internals. While active it force-allows cross-faction combat (overriding <code className="font-mono">/trust</code>),
                  protects same-faction team-mates from each other, and exempts every death from the lives system.
                </p>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <RotateCcwInline />
                  <p className="text-purple-200 text-sm">
                    It soft-depends on <strong>The Rebirth Ritual</strong> for the claim pedestals, reading them through a
                    small read-only <code className="font-mono">PedestalLocator</code> service so pedestals are defined in
                    one place. If Rebirth isn&apos;t installed, the war still runs — there are just no pedestals for a fallen
                    mythic to land on.
                  </p>
                </div>
                <p className="text-gray-400 text-sm">
                  The Angelic Shard and Devil Token are the real core Mythic shards, granted and stripped through the
                  core&apos;s own <code className="font-mono">/shard</code> command — so a claimed mythic is the genuine kit.
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
                    <strong>Internal — delete this section after validation.</strong> Goal: prove the even split + Captain
                    mythics, faction cosmetics, cross-faction inversion, the duel, a Captain death ending the war with the
                    mythic relocating + claimable, and a clean revert on stop.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Quick run</h3>
                  <ol className="space-y-2 text-gray-400 text-sm list-decimal list-inside">
                    <li>Make sure a Rebirth pedestal exists: look at a block and run <code className="font-mono text-green-400">/pedestal set</code>.</li>
                    <li>Start it: <code className="font-mono text-green-400">/celestials start</code> (random) or <code className="font-mono text-green-400">/celestials start AngelCap DemonCap</code>.</li>
                    <li>Confirm the even split, both Captains get their shard (😇 angelic / 😈 devil) + 15 hearts + the right glow, and members get white/red nametags + particles.</li>
                    <li>Inversion: have a Demon kill an Angel → the Angel respawns a Demon (and vice-versa). Confirm same-faction players can&apos;t hurt each other.</li>
                    <li>Check <code className="font-mono text-green-400">/celestials info</code> for faction counts, Captains and the duel state.</li>
                    <li>Call <code className="font-mono text-green-400">/celestials duel</code> → confirm the Final Judgement broadcast and that inversion stops.</li>
                    <li>Kill a Captain → confirm the win broadcast, that their shard does <em>not</em> drop, and a glowing claim marker appears on a pedestal.</li>
                    <li>Walk another player onto the pedestal → confirm they&apos;re granted the real mythic and the marker disappears.</li>
                    <li>Restart the server mid-claim → confirm the marker re-appears and is still claimable.</li>
                    <li><code className="font-mono text-green-400">/celestials stop</code> mid-war should revert everyone with no winner and no relocation.</li>
                  </ol>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">
                    Watch the revert closely — no lingering 15-heart cap, glow, scoreboard teams, or leftover claim markers
                    after the war ends. That clean restore is the whole contract for an event plugin.
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
                Choose your side in the <span className="text-amber-400 text-glow">Holy War</span>.
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

// Small inline icon used in the Rebirth callouts (kept local to avoid another import alias).
function RotateCcwInline() {
  return (
    <svg className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
