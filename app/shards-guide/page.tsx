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
  Zap,
  Heart,
  Wind,
  Mountain,
  Flame,
  Eye,
  Leaf,
  Sparkles,
  Shield,
  Users,
  Terminal,
  ListOrdered,
  ExternalLink,
  MessageCircle,
  ArrowUp,
  Box,
  Waves,
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

interface ShardData {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  passive: string;
  tier1: {
    name: string;
    cooldown: string;
    range?: string;
    description: string;
  };
  tier2: {
    name: string;
    cooldown: string;
    range?: string;
    description: string;
  };
}

interface CommandData {
  command: string;
  aliases?: string;
  description: string;
  permission?: string;
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
  { id: "getting-started", label: "Getting Started", level: 1 },
  { id: "available-shards", label: "Available Shards", level: 1 },
  { id: "passive-abilities", label: "Passive Abilities", level: 1 },
  { id: "tier-1-abilities", label: "Ability 1", level: 1 },
  { id: "tier-2-abilities", label: "Ability 2", level: 1 },
  { id: "life-system", label: "Life System", level: 1 },
  { id: "trust-system", label: "Trust System", level: 1 },
  { id: "commands", label: "Commands", level: 1 },
  { id: "quick-reference", label: "Quick Reference", level: 1 },
];

const SHARDS: ShardData[] = [
  {
    id: "echo",
    name: "Echo",
    icon: Sparkles,
    color: "text-purple-400",
    borderColor: "border-purple-500/40",
    bgColor: "bg-purple-500/10",
    description: "Detection and warden-style sonic power.",
    passive:
      "Resistance I + Night Vision — Permanent Resistance I and Night Vision while held. Right-click a held Sculk Shrieker to eat one (45s item cooldown, 15% chance of Strength for 15s).",
    tier1: {
      name: "Echolocate",
      cooldown: "60s",
      range: "30 blocks",
      description:
        "Untrusted players within 30 blocks are marked with Glowing (visible through walls) and Darkness for 30 seconds. Anyone within 8 blocks is additionally frozen in place for 3 seconds — locked even in mid-air.",
    },
    tier2: {
      name: "Sonic Shriek",
      cooldown: "75s",
      range: "20 blocks",
      description:
        "Fires a warden-style sonic beam dealing true damage, fuelled by your Sound Meter — up to 5 hearts at full charge, 3.5 at 75%+, 2.5 below. The meter fills from sounds you and nearby players make.",
    },
  },
  {
    id: "health",
    name: "Health",
    icon: Heart,
    color: "text-red-400",
    borderColor: "border-red-500/40",
    bgColor: "bg-red-500/10",
    description: "Lifesteal and survivability.",
    passive: "Regeneration I — Permanent Regeneration I while the shard is held.",
    tier1: {
      name: "Health Drain",
      cooldown: "120s",
      range: "20 blocks",
      description:
        "Drains health from untrusted players within 20 blocks for 10 seconds, and steals 2 hearts from your last-hit target — they drop to 8 hearts and you rise to 12 for the duration.",
    },
    tier2: {
      name: "Overheal",
      cooldown: "180s",
      description:
        "Grants bonus max health for 15 seconds, scaled by time since last use: up to 20 hearts if 5+ minutes have passed, 14–16 hearts if used more recently. Refused (no cooldown burned) if used under 2 minutes ago.",
    },
  },
  {
    id: "sky",
    name: "Sky",
    icon: Wind,
    color: "text-cyan-400",
    borderColor: "border-cyan-500/40",
    bgColor: "bg-cyan-500/10",
    description: "Mobility and aerial control.",
    passive:
      "No Fall Damage + Faze — Take no fall damage, and a 10% chance to fully negate an incoming melee hit (faze straight through it).",
    tier1: {
      name: "Sky Dash",
      cooldown: "120s",
      description:
        "A long forward dash on a cloud trail, plus a shorter bonus dash (second charge unlocks at +3 lives). Pure mobility — and you never take fall damage from the landing.",
    },
    tier2: {
      name: "Skyfall",
      cooldown: "~5 min charge",
      description:
        "Charges a Pressure Meter over roughly 5 minutes. At full charge you launch upward and slam down — untrusted players caught in the slam take 3.5–4.5 hearts.",
    },
  },
  {
    id: "earth",
    name: "Earth",
    icon: Mountain,
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    bgColor: "bg-amber-500/10",
    description: "Underground control and depth-scaled damage.",
    passive:
      "Earthly Grasp — Your melee damage scales with how deep you are: +5% below Y 60, +7% below Y 0, +10% below Y −50.",
    tier1: {
      name: "Driller",
      cooldown: "120s",
      description:
        "Swim freely through the ground for 10 seconds in the direction you look — up, down, or sideways — carving a self-restoring tunnel as you go. Passing beneath an untrusted player freezes them for 8 seconds (dragged into the earth if grounded, locked in place if airborne), able only to eat golden apples.",
    },
    tier2: {
      name: "Boulder Throw",
      cooldown: "180s",
      description:
        "Summon 3 boulders that orbit you, partially shielding you (5% chance to absorb a hit). Each cast hurls one along your aim for 2 hearts of true damage; the cooldown starts only once all three are thrown.",
    },
  },
  {
    id: "lightning",
    name: "Lightning",
    icon: Zap,
    color: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    bgColor: "bg-yellow-500/10",
    description: "Speed and storm strikes.",
    passive: "Speed I — Permanent Speed I while the shard is held.",
    tier1: {
      name: "Dash",
      cooldown: "100s / charge",
      range: "15–20 blocks",
      description:
        "Dash forward 15–20 blocks on a lightning trail (1 charge at +2 lives, 2 at +3). Untrusted players hit in the path take 2.5 hearts and a 10-second ability lockout.",
    },
    tier2: {
      name: "Thunderstorm",
      cooldown: "180s",
      range: "30 blocks",
      description:
        "Summon a storm for 10 seconds: lightning strikes random untrusted players within 30 blocks 3 times for 1–2.5 hearts each, and you gain Speed II.",
    },
  },
  {
    id: "scorch",
    name: "Scorch",
    icon: Flame,
    color: "text-orange-400",
    borderColor: "border-orange-500/40",
    bgColor: "bg-orange-500/10",
    description: "Fire control and burning rage (reworked Hell shard).",
    passive:
      "Fire Resistance + On-Fire Damage — Permanent Fire Resistance, plus +20% outgoing damage while you are on fire.",
    tier1: {
      name: "Fire Wave",
      cooldown: "120s",
      range: "6 blocks",
      description:
        "Erupt a wave of fire around you (radius 6): everyone caught is ignited — including you, since you're fire-immune — and untrusted players are knocked back. Staying lit powers your damage passive.",
    },
    tier2: {
      name: "Black Flame",
      cooldown: "180s",
      description:
        "For 25 seconds your fire turns black and cannot be extinguished by water, rain, or other players. A Rage Meter fills as you land melee hits (and a little when you take them), scaling your outgoing damage up to +50% at full rage.",
    },
  },
  {
    id: "shadow",
    name: "Shadow",
    icon: Eye,
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    bgColor: "bg-violet-500/10",
    description: "Assassination and area denial.",
    passive: "Strength I — Permanent Strength I while the shard is held.",
    tier1: {
      name: "Shadowstep",
      cooldown: "120s",
      range: "25 blocks",
      description:
        "Teleport behind your last-hit untrusted player (within 25 blocks, always to safe ground) and blind them for 8 seconds. Refused with no cooldown if there's no valid target.",
    },
    tier2: {
      name: "Shadow Domain",
      cooldown: "180s",
      range: "25-block dome",
      description:
        "Raise a 25-block dome of dark blocks for 15 seconds. Untrusted players inside are blinded; you gain Strength II, Haste II, and a purple glow.",
    },
  },
  {
    id: "nature",
    name: "Nature",
    icon: Leaf,
    color: "text-green-400",
    borderColor: "border-green-500/40",
    bgColor: "bg-green-500/10",
    description: "Poison, snares, and zoning.",
    passive: "Poison Touch — 10% chance to poison an untrusted player on each melee hit.",
    tier1: {
      name: "Vine Grapple",
      cooldown: "120s",
      description:
        "Fire a ray-traced vine. Hit an untrusted player to pull, poison, and freeze them in place a moment later (often mid-air); hit a wall or ceiling to swing or reel yourself toward it for traversal.",
    },
    tier2: {
      name: "Grove Prison",
      cooldown: "180s",
      range: "~20-block ring",
      description:
        "Summon a ~20-block ring of leaf walls for 20 seconds. Untrusted players inside cannot throw wind charges, and touching the walls inflicts Poison II.",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    icon: Waves,
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/10",
    description: "Aquatic zoning and pressure.",
    passive:
      "Conduit Power + Dolphin's Grace — Permanent underwater breathing, vision, and faster mining underwater, plus a swim-speed boost while held.",
    tier1: {
      name: "Riptide Zone",
      cooldown: "120s",
      range: "15 blocks",
      description:
        "Drop a churning water zone at your feet for 10 seconds. Untrusted players inside take armour-bypassing drowning damage every second and are weighed down with Mining Fatigue and Hunger.",
    },
    tier2: {
      name: "Hydro Beam",
      cooldown: "180s",
      range: "25 blocks",
      description:
        "Fire a pressurized water beam that stops at the first wall. Every untrusted player it passes through takes 4.5–5 hearts of true damage and is knocked back hard.",
    },
  },
];

const PLAYER_COMMANDS: CommandData[] = [
  { command: "/ability1", aliases: "/a1", description: "Use your shard's Ability 1 (unlocks at +2 lives)." },
  { command: "/ability2", aliases: "/a2", description: "Use your shard's Ability 2 (unlocks at +3 lives)." },
  { command: "/trust <player>", description: "Protect a player from your abilities." },
  { command: "/untrust <player>", description: "Remove a player from your trust list." },
  { command: "/trustlist", description: "View who you trust (and who trusts you)." },
  { command: "/withdraw <amount>", description: "Convert your own lives into Extra Life items (1:1)." },
  { command: "/shard <name>", description: "Give yourself the named shard (if enabled by admins)." },
];

const ADMIN_COMMANDS: CommandData[] = [
  { command: "/shard <name> [player]", description: "Give a shard to a player.", permission: "Configurable (default: OP)" },
  { command: "/livesset <player> <value>", description: "Set a player's lives (−3 to +3, clamped and audited).", permission: "Configurable (default: OP)" },
  { command: "/shard_type_clear <name>", description: "Remove a shard type from all players (online & offline).", permission: "Configurable (default: OP)" },
  { command: "/shard_clear_player <player>", description: "Remove any shard from a single player.", permission: "Configurable (default: OP)" },
  { command: "/shards reload", description: "Reload config, messages, and shard kits.", permission: "OP" },
  { command: "/shards info [player]", description: "Debug: shard, lives, cooldowns, meters, trust counts.", permission: "OP" },
  { command: "/shards cooldown clear <player> [ability]", description: "Clear a player's ability cooldowns (testing aid).", permission: "OP" },
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
    <h2
      className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-3"
    >
      {Icon && (
        <span className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-green-400" />
        </span>
      )}
      <span>{children}</span>
    </h2>
  );
}

function ShardCard({ shard }: { shard: ShardData }) {
  const Icon = shard.icon;
  const passiveName = shard.passive.split(" — ")[0];
  const passiveDesc = shard.passive.split(" — ").slice(1).join(" — ");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "glass rounded-2xl p-6 border space-y-4",
        shard.borderColor
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-xl border flex items-center justify-center",
            shard.bgColor,
            shard.borderColor
          )}
        >
          <Icon className={cn("w-6 h-6", shard.color)} />
        </div>
        <h3 className={cn("text-xl font-bold", shard.color)}>{shard.name}</h3>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{shard.description}</p>
      {passiveName !== "No passive" && (
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-500" />
          <span>
            <span className="text-gray-300 font-mono">{passiveName}</span>
            {passiveDesc && ` — ${passiveDesc}`}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function AbilityCard({
  shard,
  tier,
}: {
  shard: ShardData;
  tier: "tier1" | "tier2";
}) {
  const ability = shard[tier];
  const Icon = shard.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("glass rounded-2xl border overflow-hidden", shard.borderColor)}
    >
      {/* Header */}
      <div
        className={cn(
          "px-6 py-4 flex items-center justify-between border-b",
          shard.bgColor,
          shard.borderColor
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("w-5 h-5", shard.color)} />
          <span className={cn("font-bold", shard.color)}>{shard.name}</span>
        </div>
        <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded-md font-mono">
          CD: {ability.cooldown}
        </span>
      </div>

      {/* Ability body */}
      <div className="px-6 py-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold text-white">{ability.name}</span>
          {ability.range && (
            <span className="text-xs text-gray-500 font-mono">⦿ {ability.range}</span>
          )}
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{ability.description}</p>
      </div>
    </motion.div>
  );
}

function CommandRow({ cmd, showPermission }: { cmd: CommandData; showPermission?: boolean }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <code className="text-green-400 font-mono text-sm bg-green-500/10 px-2 py-1 rounded">
            {cmd.command}
          </code>
          <CopyButton text={cmd.command} />
        </div>
      </td>
      {cmd.aliases !== undefined && (
        <td className="py-3 px-4">
          <code className="text-gray-400 font-mono text-xs">{cmd.aliases}</code>
        </td>
      )}
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

// ========================================
// MAIN PAGE
// ========================================

export default function ShardsGuidePage() {
  const [activeSection, setActiveSection] = useState("getting-started");
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
            <span className="text-gray-300">Shards Guide</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              In Active Development
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-green-400 text-glow">
              Shards SMP
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Complete player guide for the Shards SMP plugin. Learn about every shard,
              ability, the life &amp; trust systems, and all available commands.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-green-500/40 text-green-300 text-sm font-medium glow-green-sm" aria-label="Supported Minecraft version">
              <Box className="w-3.5 h-3.5 text-green-400" />
              Minecraft 1.21.11 (Java Edition)
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
                <TableOfContents
                  activeSection={activeSection}
                  onSectionClick={scrollToSection}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 glass border border-green-500/20 rounded-2xl p-5">
              <TableOfContents
                activeSection={activeSection}
                onSectionClick={scrollToSection}
              />
            </div>
          </aside>

          {/* Main content */}
          <article className="flex-1 min-w-0 space-y-20">

          {/* ── Getting Started ── */}
            <section id="getting-started" className="scroll-mt-24">
              <SectionHeading icon={BookOpen}>
                Getting Started
              </SectionHeading>

              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20" role="note" aria-label="Server version requirement">
                  <Box className="w-5 h-5 text-green-400 shrink-0" aria-hidden="true" />
                  <p className="text-green-200 text-sm">
                    <strong>Server Version:</strong> Minecraft 1.21.11 (Java Edition)
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-200 text-sm">
                    <strong>Note:</strong> Shards SMP is currently in active development. This guide
                    will change often — always check Discord for the latest balance updates.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">What are Shards?</h3>
                  <p className="text-gray-400">
                    Shards are magical items that grant you unique abilities and powers. Each shard provides:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-400 text-sm">
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400 shrink-0" />
                      <span><strong className="text-white">Passive Ability</strong> — Always-active effect; unlocks at <strong className="text-white">+1 life</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span><strong className="text-white">Ability 1</strong> — Activated with <code className="text-green-400 font-mono bg-green-500/10 px-1 rounded">/ability1</code>; unlocks at <strong className="text-white">+2 lives</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      <span><strong className="text-white">Ability 2</strong> — Activated with <code className="text-green-400 font-mono bg-green-500/10 px-1 rounded">/ability2</code>; unlocks at <strong className="text-white">+3 lives</strong></span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Unlocking Your Powers</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Your shard's powers are gated by your <strong className="text-white">lives</strong> (see the Life System below).
                    Lives range from −3 to +3, and each tier above zero unlocks more of your kit:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                    <li>At <strong className="text-white">+1 life</strong> your <strong className="text-white">passive</strong> turns on.</li>
                    <li>At <strong className="text-white">+2 lives</strong> you unlock <code className="text-green-400 font-mono bg-green-500/10 px-1 rounded">/ability1</code>.</li>
                    <li>At <strong className="text-white">+3 lives</strong> you unlock <code className="text-green-400 font-mono bg-green-500/10 px-1 rounded">/ability2</code>.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">How to Use Shards</h3>
                  <ol className="space-y-3 text-gray-400 text-sm">
                    {[
                      { step: "1", text: "Get a Shard — Hold a shard item; you can carry one at a time, and its powers work from either hand." },
                      { step: "2", text: "Climb your lives — Reach +1 for your passive, +2 for Ability 1, +3 for Ability 2 (kill players, or use Extra Life items)." },
                      { step: "3", text: "Use Ability 1 — Type /ability1 or /a1 in chat once you're at +2 lives." },
                      { step: "4", text: "Use Ability 2 — Type /ability2 or /a2 once you're at +3 lives." },
                      { step: "5", text: "Check Cooldowns — Your action bar shows cooldowns, charges, and meters; reusing an ability tells you the time remaining." },
                    ].map(({ step, text }) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {step}
                        </span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            {/* ── Available Shards ── */}
            <section id="available-shards" className="scroll-mt-24">
              <SectionHeading icon={Sparkles}>
                Available Shards
              </SectionHeading>

              <div className="space-y-6">
                <p className="text-gray-400">
                  The server features <strong className="text-white">8 playable shards</strong>. Each one
                  has a passive plus two activated abilities that unlock as you climb your lives
                  (passive at +1, Ability 1 at +2, Ability 2 at +3).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {SHARDS.map((shard) => (
                    <ShardCard key={shard.id} shard={shard} />
                  ))}
                </div>

                {/* More shards note */}
                <div className="glass border border-white/10 rounded-2xl p-5 space-y-3">
                  <h3 className="text-white font-semibold">More Shards Coming</h3>
                  <p className="text-gray-400 text-sm">
                    Additional shards are in development and will appear here as they're released.
                    Keep an eye on the <a href="/shards-changelog" className="text-green-400 hover:text-green-300 underline">changelog</a> and Discord for new kits and balance updates.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Passive Abilities ── */}
            <section id="passive-abilities" className="scroll-mt-24">
              <SectionHeading icon={Shield}>
                Passive Abilities
              </SectionHeading>
              <p className="text-gray-400 mb-8">
                Each shard's passive unlocks at <strong className="text-white">+1 life</strong> and is then{" "}
                <strong className="text-white">always active</strong> while the shard is held — no activation,
                and it can't be toggled off.
              </p>
              <div className="glass border border-green-500/20 rounded-2xl overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Shard</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Passive Effect</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHARDS.map((shard) => {
                      const [name, ...rest] = shard.passive.split(" — ");
                      const Icon = shard.icon;
                      return (
                        <tr key={shard.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Icon className={cn("w-4 h-4", shard.color)} />
                              <span className={cn("font-medium text-sm", shard.color)}>
                                {shard.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="font-mono text-sm text-white">{name}</code>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">{rest.join(" — ") || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Ability 1 ── */}
            <section id="tier-1-abilities" className="scroll-mt-24">
              <SectionHeading icon={Zap}>
                Ability 1
              </SectionHeading>
              <p className="text-gray-400 mb-4">
                Activated with{" "}
                <code className="text-green-400 font-mono text-sm bg-green-500/10 px-1.5 py-0.5 rounded">/ability1</code>{" "}
                (alias <code className="text-gray-400 font-mono text-sm">/a1</code>) —{" "}
                <strong className="text-white">unlocks at +2 lives</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHARDS.map((shard) => (
                  <AbilityCard key={shard.id} shard={shard} tier="tier1" />
                ))}
              </div>
            </section>

            {/* ── Ability 2 ── */}
            <section id="tier-2-abilities" className="scroll-mt-24">
              <SectionHeading icon={Sparkles}>
                Ability 2
              </SectionHeading>
              <p className="text-gray-400 mb-4">
                Activated with{" "}
                <code className="text-green-400 font-mono text-sm bg-green-500/10 px-1.5 py-0.5 rounded">/ability2</code>{" "}
                (alias <code className="text-gray-400 font-mono text-sm">/a2</code>) — your most powerful ability,{" "}
                <strong className="text-white">unlocks at +3 lives</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHARDS.map((shard) => (
                  <AbilityCard key={shard.id} shard={shard} tier="tier2" />
                ))}
              </div>
            </section>

            {/* ── Life System ── */}
            <section id="life-system" className="scroll-mt-24">
              <SectionHeading icon={Heart}>
                Life System
              </SectionHeading>

              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  Lives are the heart of Shards. They range from <strong className="text-white">−3 to +3</strong>,
                  everyone starts at <strong className="text-white">0</strong>, and they both unlock your shard's
                  powers <em>and</em> debuff you when they go negative. Lives persist across deaths, relogs, and restarts.
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">Starting Lives</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Everyone begins at <strong className="text-white">0</strong>, on a scale of
                      <strong className="text-white"> −3 to +3</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUp className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-semibold">Gain a Life</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Kill a player and, if you're below +3, you take <strong className="text-white">+1 life</strong>.
                      Extra Life items also grant +1.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <SkullIcon className="w-5 h-5 text-red-400" />
                      <span className="text-white font-semibold">Lose a Life</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Any death — PvP <em>or</em> environment/mob — costs
                      <strong className="text-white"> −1 life</strong> (floored at −3).
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Lives Ladder</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Every life threshold is re-checked on each change and on respawn. Going up unlocks your kit;
                    going below zero stacks debuffs.
                  </p>
                  <div className="space-y-2">
                    {[
                      { lives: "+3", effect: "Ability 2 unlocked (plus everything below)", color: "text-green-400" },
                      { lives: "+2", effect: "Ability 1 unlocked", color: "text-green-400" },
                      { lives: "+1", effect: "Passive unlocked", color: "text-green-400" },
                      { lives: "0", effect: "Baseline — nothing unlocked, no debuffs", color: "text-gray-400" },
                      { lives: "−1", effect: "Grace step — still no debuffs", color: "text-gray-400" },
                      { lives: "−2", effect: "Slowness I (while at this level)", color: "text-orange-400" },
                      { lives: "−3", effect: "Slowness I + Weakness I (debuffs stack downward)", color: "text-red-400" },
                    ].map(({ lives, effect, color }) => (
                      <div
                        key={lives}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <code className={cn("font-mono font-bold text-sm w-12 shrink-0 text-center", color)}>{lives}</code>
                        <span className="text-gray-400 text-sm">{effect}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Trading Lives</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Extra Life", desc: "A tradeable item that grants +1 life when consumed (capped at +3). When a +3 player is killed by another +3 player, they drop one at the death spot — the only way lives leave your account in combat.", color: "text-green-400" },
                      { label: "/withdraw <n>", desc: "Convert your own lives into Extra Life items 1:1 (down to 0 by default). A full inventory blocks the whole withdraw.", color: "text-blue-400" },
                      { label: "Repair Kit", desc: "Craftable and usable only while you're at 0 lives or below — grants +1 to help you climb back out of the debuff zone.", color: "text-amber-400" },
                    ].map(({ label, desc, color }) => (
                      <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className={cn("font-semibold text-sm w-32 shrink-0", color)}>{label}</span>
                        <span className="text-gray-400 text-sm">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-3">
                    Kills between trusted players are inert by default — no life is lost, gained, or dropped — so you can't farm friends.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Trust System ── */}
            <section id="trust-system" className="scroll-mt-24">
              <SectionHeading icon={Users}>
                Trust System
              </SectionHeading>

              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  The Trust System lets you protect friendly players from <strong className="text-white">your</strong>{" "}
                  abilities. Use{" "}
                  <code className="text-green-400 font-mono text-sm bg-green-500/10 px-1.5 py-0.5 rounded">
                    /trust &lt;player&gt;
                  </code>{" "}
                  to add someone to your trust list. Trust is <strong className="text-white">directional</strong>:
                  trusting someone shields them from your abilities, but does <em>not</em> shield you from theirs
                  unless they trust you back.
                </p>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">What Trust Does</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    When you trust a player, they gain the following protections from your abilities:
                  </p>
                  <div className="space-y-2">
                    {[
                      { icon: "✅", label: "Damage Immunity", desc: "Trusted players take no damage from your offensive abilities." },
                      { icon: "✅", label: "Negative Effect Immunity", desc: "Trusted players are immune to harmful status effects (poison, slowness, weakness, darkness, blindness, etc.)." },
                      { icon: "✅", label: "Beneficial Effects", desc: "Trusted players can still receive healing and positive buffs from you." },
                    ].map(({ icon, label, desc }) => (
                      <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-lg shrink-0">{icon}</span>
                        <div>
                          <span className="text-white font-medium text-sm">{label}</span>
                          <p className="text-gray-400 text-sm mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Trust Commands</h3>
                  <div className="space-y-2">
                    {[
                      { cmd: "/trust <player>", desc: "Add a player to your trust list (offline players allowed)." },
                      { cmd: "/untrust <player>", desc: "Remove a player from your trust list." },
                      { cmd: "/trustlist", desc: "View who you trust — and who trusts you." },
                    ].map(({ cmd, desc }) => (
                      <div
                        key={cmd}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <code className="text-green-400 font-mono text-sm">{cmd}</code>
                          <CopyButton text={cmd} />
                        </div>
                        <span className="text-gray-400 text-sm sm:text-right">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-3">
                    Only abilities are gated by trust — ordinary sword and bow damage between trusted players still lands.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-blue-300 font-semibold text-sm mb-2">Strategic Use</h4>
                  <ul className="space-y-1 text-blue-200/70 text-sm list-disc list-inside">
                    <li>Trust your team so your AoE abilities don't catch them — e.g. Scorch's Fire Wave or Lightning's Thunderstorm.</li>
                    <li>Coordinate group fights without locking down or poisoning your own allies.</li>
                    <li>Remember it's one-directional: both of you must trust each other for mutual protection.</li>
                    <li>Trusted kills are inert, so you can't trade lives with a friend.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ── Commands ── */}
            <section id="commands" className="scroll-mt-24">
              <SectionHeading icon={Terminal}>
                Commands
              </SectionHeading>

              {/* Player commands */}
              <h3 className="text-xl font-semibold text-white mb-4">Player Commands</h3>
              <div className="glass border border-green-500/20 rounded-2xl overflow-x-auto mb-10">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Command</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Aliases</th>
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

              {/* Admin commands */}
              <h3 className="text-xl font-semibold text-white mb-4">Admin Commands
                <span className="ml-3 text-sm font-normal text-gray-500">(OP/Permission Required)</span>
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
                    {ADMIN_COMMANDS.map((cmd) => (
                      <CommandRow key={cmd.command} cmd={cmd} showPermission />
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-xs">
                Command permissions can be configured by admins in{" "}
                <code className="font-mono">config.yml</code> to allow all players or restrict to OPs.
              </p>
            </section>

            {/* ── Quick Reference ── */}
            <section id="quick-reference" className="scroll-mt-24">
              <SectionHeading icon={ListOrdered}>
                Quick Reference
              </SectionHeading>

              {/* Cooldown tiers */}
              <h3 className="text-lg font-semibold text-white mb-4">Cooldown Tiers</h3>
              <div className="glass border border-green-500/20 rounded-2xl overflow-x-auto mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Tier</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Abilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tier: "Short (60–75s)", abilities: "Echolocate (60s), Sonic Shriek (75s)" },
                      { tier: "Medium (100–120s)", abilities: "Dash (100s/charge), Health Drain, Fire Wave, Vine Grapple, Shadowstep, Sky Dash, Driller (120s)" },
                      { tier: "Long (180s)", abilities: "Thunderstorm, Overheal, Black Flame, Grove Prison, Shadow Domain, Boulder Throw" },
                      { tier: "Meter-charged", abilities: "Sonic Shriek (Sound), Skyfall (Pressure, ~5 min), Black Flame (Rage)" },
                    ].map(({ tier, abilities }) => (
                      <tr key={tier} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <code className="text-green-400 font-mono text-sm">{tier}</code>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{abilities}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Category cards */}
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {[
                  {
                    title: "Damage Abilities",
                    color: "border-red-500/20",
                    items: [
                      "Echo - Sonic Shriek: up to 5♥ true damage (A2)",
                      "Lightning - Thunderstorm: 3× 1–2.5♥ AoE (A2)",
                      "Sky - Skyfall: 3.5–4.5♥ slam (A2)",
                      "Lightning - Dash: 2.5♥ + lockout on path (A1)",
                    ],
                  },
                  {
                    title: "Crowd Control",
                    color: "border-blue-500/20",
                    items: [
                      "Nature - Vine Grapple: pull + poison + stun (A1)",
                      "Echo - Echolocate: glow + darkness + close stun (A1)",
                      "Earth - Driller: bury untrusted players for 8s (A1)",
                      "Nature - Grove Prison: leaf ring + wind-charge lock (A2)",
                    ],
                  },
                  {
                    title: "Mobility",
                    color: "border-cyan-500/20",
                    items: [
                      "Sky - Sky Dash: long + short dash, no fall damage (A1)",
                      "Lightning - Dash: 15–20 block dash (A1)",
                      "Shadow - Shadowstep: teleport behind your target (A1)",
                      "Nature - Vine Grapple: swing/reel to walls & ceilings (A1)",
                    ],
                  },
                  {
                    title: "Sustain & Zoning",
                    color: "border-green-500/20",
                    items: [
                      "Health - Health Drain: lifesteal aura + 2♥ steal (A1)",
                      "Health - Overheal: up to 20♥ max health (A2)",
                      "Scorch - Black Flame: rage-scaled damage, +50% (A2)",
                      "Shadow - Shadow Domain: blind dome + self buffs (A2)",
                    ],
                  },
                ].map(({ title, color, items }) => (
                  <div key={title} className={cn("glass rounded-2xl border p-5 space-y-3", color)}>
                    <h4 className="text-white font-semibold">{title}</h4>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-gray-400 text-sm">
                          <ChevronRight className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* AoE range table */}
              <h3 className="text-lg font-semibold text-white mb-4">Area of Effect Ranges</h3>
              <div className="glass border border-green-500/20 rounded-2xl overflow-x-auto mb-10">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Range</th>
                      <th className="py-3 px-4 text-left text-green-400 font-semibold text-sm">Abilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { range: "Close (6–8 blocks)", abilities: "Fire Wave (6), Echolocate stun (8)" },
                      { range: "Medium (15–20 blocks)", abilities: "Dash (15–20), Health Drain (20), Sonic Shriek (20), Grove Prison ring (~20)" },
                      { range: "Long (25–30 blocks)", abilities: "Shadowstep (25), Shadow Domain dome (25), Echolocate (30), Thunderstorm (30)" },
                    ].map(({ range, abilities }) => (
                      <tr key={range} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <code className="text-green-400 font-mono text-sm">{range}</code>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{abilities}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass border border-green-500/30 rounded-2xl p-8 text-center space-y-4 glow-green-sm"
              >
                <h3 className="text-2xl font-bold text-white">
                  Ready to pick your <span className="text-green-400 text-glow">Shard</span>?
                </h3>
                <p className="text-gray-400">
                  Join the server now and start your journey.
                </p>
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
                    href="/#discord"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Discord
                  </motion.a>
                </div>
              </motion.div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}

// Skull icon — inline SVG since it's only used here
function SkullIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M8 20v2h8v-2" />
      <path d="m12.5 17-.5-1-.5 1h1z" />
      <path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
    </svg>
  );
}
