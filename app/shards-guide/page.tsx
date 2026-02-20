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
  Snowflake,
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
  { label: "Shards Guide", href: "/shards-guide" },
  { label: "Blog", href: "/#blog" },
  { label: "Map", href: "/#map" },
  { label: "Join", href: "/#join" },
];

const TOC_ITEMS: TocItem[] = [
  { id: "getting-started", label: "Getting Started", level: 1 },
  { id: "available-shards", label: "Available Shards", level: 1 },
  { id: "passive-abilities", label: "Passive Abilities", level: 1 },
  { id: "tier-1-abilities", label: "Tier 1 Abilities", level: 1 },
  { id: "tier-2-abilities", label: "Tier 2 Abilities", level: 1 },
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
    description: "Stealth and detection specialist.",
    passive: "Swift Sneak III — Move faster while sneaking (applied to leggings).",
    tier1: {
      name: "Sonic Pulse",
      cooldown: "30s",
      range: "10 blocks",
      description:
        "Reveals all nearby enemies with the Glowing effect for 10 seconds. Perfect for detecting hidden enemies or finding players in dark areas.",
    },
    tier2: {
      name: "Abyss Call",
      cooldown: "50s",
      range: "8 blocks",
      description:
        "Applies Darkness, Slowness III, and Mining Fatigue II to all enemies within 8 blocks. Disorient and disable multiple enemies in close quarters.",
    },
  },
  {
    id: "health",
    name: "Health",
    icon: Heart,
    color: "text-red-400",
    borderColor: "border-red-500/40",
    bgColor: "bg-red-500/10",
    description: "Healing and survivability focus.",
    passive: "+2 Hearts + Regeneration I — Gain 2 extra hearts (4 HP) and constant health regeneration.",
    tier1: {
      name: "Life Surge",
      cooldown: "40s",
      description:
        "Instantly heals you to maximum health. Emergency healing in combat or after taking damage.",
    },
    tier2: {
      name: "Resistance",
      cooldown: "60s",
      description:
        "Grants yourself Resistance II and Fire Resistance for 15 seconds. Tank damage during combat or when entering dangerous situations.",
    },
  },
  {
    id: "sky",
    name: "Sky",
    icon: Wind,
    color: "text-cyan-400",
    borderColor: "border-cyan-500/40",
    bgColor: "bg-cyan-500/10",
    description: "Mobility and aerial combat.",
    passive: "Fall Damage Immunity — Take no damage from falling any distance.",
    tier1: {
      name: "Skybound Leap",
      cooldown: "15s",
      description:
        "Launches you forward at high speed with a powerful leap. Quick escape, chase down enemies, or traverse terrain rapidly.",
    },
    tier2: {
      name: "Wind Dominion",
      cooldown: "60s",
      range: "12 blocks",
      description:
        "Grants yourself Speed III and Strength II for 10 seconds while pulling all enemies within 12 blocks toward you. Control enemy positioning and gain combat buffs.",
    },
  },
  {
    id: "earth",
    name: "Earth",
    icon: Mountain,
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    bgColor: "bg-amber-500/10",
    description: "Defensive and grounded abilities.",
    passive: "No passive — Earth shard has no passive ability.",
    tier1: {
      name: "Earth Ability",
      cooldown: "Server-configured",
      description:
        "Earth shard Tier 1 ability details are server-configured. Check with admins for current values.",
    },
    tier2: {
      name: "Earth Ability",
      cooldown: "Server-configured",
      description:
        "Earth shard Tier 2 ability details are server-configured. Check with admins for current values.",
    },
  },
  {
    id: "lightning",
    name: "Lightning",
    icon: Zap,
    color: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    bgColor: "bg-yellow-500/10",
    description: "Speed and electrical attacks.",
    passive: "Speed I + Haste I — Move faster and mine/attack faster.",
    tier1: {
      name: "Shock Bolt",
      cooldown: "20s",
      range: "8 blocks",
      description:
        "Strikes all enemies within 8 blocks with lightning, dealing 6 damage and applying Weakness. Powerful offensive ability that also disables enemies temporarily.",
    },
    tier2: {
      name: "Thunderstorm",
      cooldown: "60s",
      range: "12 blocks",
      description:
        "Unleashes 5 lightning strikes over time in a 12-block radius, each dealing 8 damage with 40% hit chance. Area denial and massive AoE damage.",
    },
  },
  {
    id: "hell",
    name: "Hell",
    icon: Flame,
    color: "text-orange-400",
    borderColor: "border-orange-500/40",
    bgColor: "bg-orange-500/10",
    description: "Fire damage and summoning.",
    passive: "Fire Resistance — Immunity to fire and lava damage.",
    tier1: {
      name: "Cursed Horde",
      cooldown: "50s",
      range: "10 blocks",
      description:
        "Summons 3 skeletons to fight for you (30 seconds) and weakens nearby enemies (Weakness I + Slowness II for 10 seconds). Summon allies in combat and debilitate enemies.",
    },
    tier2: {
      name: "Infernal Ring",
      cooldown: "60s",
      range: "5 blocks",
      description:
        "Creates a 5-block radius ring of fire that knocks back enemies (force 2.0), sets them on fire (5 seconds), and deals additional damage over time (0.4 HP/tick). Create space and deal sustained fire damage.",
    },
  },
  {
    id: "arctic",
    name: "Arctic",
    icon: Snowflake,
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/10",
    description: "Ice control and crowd control.",
    passive: "Speed on Ice — Gain speed boost when standing on ice or packed ice.",
    tier1: {
      name: "Frostbite",
      cooldown: "30s",
      range: "8 blocks",
      description:
        "Deals 8 damage to all enemies within 8 blocks and applies slowness (Slowness I + Weakness I) and freezing for 9 seconds. Crowd control tool for group combat.",
    },
    tier2: {
      name: "Ice Domain",
      cooldown: "30s",
      range: "8 blocks",
      description:
        "Converts all water to ice within an 8-block sphere for 10 seconds, creating an ice arena. Control the battlefield and create icy terrain.",
    },
  },
  {
    id: "shadow",
    name: "Shadow",
    icon: Eye,
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    bgColor: "bg-violet-500/10",
    description: "Stealth and teleportation.",
    passive: "Strength I — Deal increased melee damage.",
    tier1: {
      name: "Phase Step",
      cooldown: "20s",
      description:
        "Teleports you to the last enemy you hit in combat. Must have recently damaged an enemy. Chase fleeing enemies or close distance in combat.",
    },
    tier2: {
      name: "Umbral Veil",
      cooldown: "30s",
      range: "10 blocks",
      description:
        "Grants yourself Invisibility for 10 seconds and applies Darkness + Blindness to enemies within 10 blocks. Stealth engagement or escape while blinding enemies.",
    },
  },
  {
    id: "nature",
    name: "Nature",
    icon: Leaf,
    color: "text-green-400",
    borderColor: "border-green-500/40",
    bgColor: "bg-green-500/10",
    description: "Healing and area control.",
    passive: "Regeneration on Plants — Heal when standing on grass or plant blocks.",
    tier1: {
      name: "Vine Snare",
      cooldown: "30s",
      range: "8 blocks",
      description:
        "Roots enemies in place with extreme slowness (Slowness XI + Jump Boost -5) and poisons them (Poison II) for 10 seconds. Lock down enemies completely, preventing escape.",
    },
    tier2: {
      name: "Verdant Domain",
      cooldown: "40s",
      range: "10 blocks",
      description:
        "Creates a 10-block healing zone for 15 seconds that grants you Regeneration III, heals trusted allies (+0.5 HP/tick), and pulls non-trusted enemies inward. Control an area with healing and crowd control.",
    },
  },
];

const PLAYER_COMMANDS: CommandData[] = [
  { command: "/ability1", aliases: "/a1, /ab1", description: "Use your shard's Tier 1 ability." },
  { command: "/ability2", aliases: "/a2, /ab2", description: "Use your shard's Tier 2 ability (requires upgraded shard)." },
  { command: "/shard trust <player>", aliases: "/shardtrust trust", description: "Add a player to your trust list." },
  { command: "/shard untrust <player>", aliases: "/shardtrust untrust", description: "Remove a player from your trust list." },
  { command: "/shard list", aliases: "/shardtrust list", description: "View your trusted players (● online, ○ offline)." },
];

const ADMIN_COMMANDS: CommandData[] = [
  { command: "/giveshard <player> <shard>", description: "Give a shard item to a player.", permission: "Configurable (default: OP)" },
  { command: "/shard_energy_give <amount> <player>", description: "Give lives (energy) to a player.", permission: "Configurable (default: OP)" },
  { command: "/kit", description: "Access kits.", permission: "Configurable (default: OP)" },
  { command: "/shards_clear_all", description: "Remove shards from all players.", permission: "Configurable (default: OP)" },
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
                  link.href === "/shards-guide"
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
                    link.href === "/shards-guide"
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
  id,
  icon: Icon,
  children,
}: {
  id: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-3 scroll-mt-24"
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
              <SectionHeading id="getting-started" icon={BookOpen}>
                Getting Started
              </SectionHeading>

              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
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
                      <span><strong className="text-white">Passive Ability</strong> — Always-active effect when equipped</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span><strong className="text-white">Tier 1 Ability</strong> — Activated with <code className="text-green-400 font-mono bg-green-500/10 px-1 rounded">/ability1</code> — available immediately</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      <span><strong className="text-white">Tier 2 Ability</strong> — Activated with <code className="text-green-400 font-mono bg-green-500/10 px-1 rounded">/ability2</code> — unlocked after upgrading</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Shard Tiers</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    All shards start at <strong className="text-white">Tier 1</strong>. To unlock Tier 2 abilities:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                    <li>Obtain an <strong className="text-white">upgrade shard</strong> item (from admins or gameplay).</li>
                    <li>Use it on your equipped shard to upgrade it to Tier 2.</li>
                    <li>Once upgraded, you gain access to the more powerful <code className="text-green-400 font-mono bg-green-500/10 px-1 rounded">/ability2</code> command.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">How to Use Shards</h3>
                  <ol className="space-y-3 text-gray-400 text-sm">
                    {[
                      { step: "1", text: "Equip a Shard — Right-click a shard item to equip it (starts at Tier 1)." },
                      { step: "2", text: "Use Tier 1 Ability — Type /ability1 or /a1 in chat." },
                      { step: "3", text: "Upgrade to Tier 2 — Use an upgrade shard item to unlock Tier 2 abilities." },
                      { step: "4", text: "Use Tier 2 Ability — Type /ability2 or /a2 (only works after upgrade)." },
                      { step: "5", text: "Check Cooldowns — Try using an ability again; you'll be notified of remaining cooldown time." },
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
              <SectionHeading id="available-shards" icon={Sparkles}>
                Available Shards
              </SectionHeading>

              <div className="space-y-6">
                <p className="text-gray-400">
                  The server features <strong className="text-white">9 active shards</strong>. All
                  shards start at Tier 1 and can be upgraded to Tier 2 using an upgrade shard item.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {SHARDS.map((shard) => (
                    <ShardCard key={shard.id} shard={shard} />
                  ))}
                </div>

                {/* Legacy shards note */}
                <div className="glass border border-white/10 rounded-2xl p-5 space-y-3">
                  <h3 className="text-white font-semibold">Legacy Shards (Disabled by Default)</h3>
                  <p className="text-gray-400 text-sm">
                    The following shards exist but are <strong className="text-white">disabled by default</strong> and
                    may be enabled by server admins:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Celestial", "Void", "Time", "Chaos"].map((name) => (
                      <span
                        key={name}
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm font-mono"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Passive Abilities ── */}
            <section id="passive-abilities" className="scroll-mt-24">
              <SectionHeading id="passive-abilities" icon={Shield}>
                Passive Abilities
              </SectionHeading>
              <p className="text-gray-400 mb-8">
                These effects are <strong className="text-white">always active</strong> when you have
                a shard equipped. Passives do not need to be activated and cannot be toggled off.
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

            {/* ── Tier 1 Abilities ── */}
            <section id="tier-1-abilities" className="scroll-mt-24">
              <SectionHeading id="tier-1-abilities" icon={Zap}>
                Tier 1 Abilities
              </SectionHeading>
              <p className="text-gray-400 mb-4">
                Activated with{" "}
                <code className="text-green-400 font-mono text-sm bg-green-500/10 px-1.5 py-0.5 rounded">/ability1</code>{" "}
                (aliases: <code className="text-gray-400 font-mono text-sm">/a1</code>,{" "}
                <code className="text-gray-400 font-mono text-sm">/ab1</code>) — available on{" "}
                <strong className="text-white">all shards immediately</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHARDS.map((shard) => (
                  <AbilityCard key={shard.id} shard={shard} tier="tier1" />
                ))}
              </div>
            </section>

            {/* ── Tier 2 Abilities ── */}
            <section id="tier-2-abilities" className="scroll-mt-24">
              <SectionHeading id="tier-2-abilities" icon={Sparkles}>
                Tier 2 Abilities
              </SectionHeading>
              <p className="text-gray-400 mb-4">
                Activated with{" "}
                <code className="text-green-400 font-mono text-sm bg-green-500/10 px-1.5 py-0.5 rounded">/ability2</code>{" "}
                (aliases: <code className="text-gray-400 font-mono text-sm">/a2</code>,{" "}
                <code className="text-gray-400 font-mono text-sm">/ab2</code>) —{" "}
                <strong className="text-white">only available after upgrading</strong> your shard with
                an upgrade shard item.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHARDS.map((shard) => (
                  <AbilityCard key={shard.id} shard={shard} tier="tier2" />
                ))}
              </div>
            </section>

            {/* ── Life System ── */}
            <section id="life-system" className="scroll-mt-24">
              <SectionHeading id="life-system" icon={Heart}>
                Life System
              </SectionHeading>

              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  The Life System adds strategic depth and consequences to PvP combat.
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">Starting Lives</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Every player begins with <strong className="text-white">6 lives</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUp className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-semibold">Gain a Life</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Kill another player to earn <strong className="text-white">+1 life</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <SkullIcon className="w-5 h-5 text-red-400" />
                      <span className="text-white font-semibold">Lose a Life</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Die to another player and lose <strong className="text-white">−1 life</strong>.
                      Lives persist across restarts.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Low Life Penalty</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    When you drop <strong className="text-white">below 3 lives</strong>, you suffer
                    the following penalties:
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Ability Nerf",
                        desc: "All ability effects are reduced to 50% effectiveness — damage, healing, durations, and utility are all halved.",
                        color: "text-red-400",
                      },
                      {
                        label: "Weakness Effect",
                        desc: "A permanent Weakness effect is applied to you.",
                        color: "text-orange-400",
                      },
                      {
                        label: "Cooldowns Unchanged",
                        desc: "Ability cooldowns remain the same — only the effects are reduced.",
                        color: "text-gray-400",
                      },
                    ].map(({ label, desc, color }) => (
                      <div
                        key={label}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <span className={cn("font-semibold text-sm w-40 shrink-0", color)}>{label}</span>
                        <span className="text-gray-400 text-sm">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Trust System ── */}
            <section id="trust-system" className="scroll-mt-24">
              <SectionHeading id="trust-system" icon={Users}>
                Trust System
              </SectionHeading>

              <div className="glass border border-green-500/20 rounded-2xl p-6 space-y-6 text-gray-300 leading-relaxed">
                <p>
                  The Trust System allows you to protect friendly players from your abilities. Use{" "}
                  <code className="text-green-400 font-mono text-sm bg-green-500/10 px-1.5 py-0.5 rounded">
                    /shard trust &lt;player&gt;
                  </code>{" "}
                  to add someone to your trust list.
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
                      { cmd: "/shard trust <player>", desc: "Add a player to your trust list." },
                      { cmd: "/shard untrust <player>", desc: "Remove a player from your trust list." },
                      { cmd: "/shard list", desc: "View your trusted players (● online, ○ offline)." },
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
                    Alias: <code className="font-mono">/shardtrust</code> works the same as <code className="font-mono">/shard</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-blue-300 font-semibold text-sm mb-2">Strategic Use</h4>
                  <ul className="space-y-1 text-blue-200/70 text-sm list-disc list-inside">
                    <li>Trust your team members to avoid friendly fire.</li>
                    <li>Coordinate group fights without hurting allies.</li>
                    <li>Support allies with beneficial abilities like Nature's Verdant Domain.</li>
                    <li>Trust is personal and one-directional — manage it carefully.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ── Commands ── */}
            <section id="commands" className="scroll-mt-24">
              <SectionHeading id="commands" icon={Terminal}>
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
              <SectionHeading id="quick-reference" icon={ListOrdered}>
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
                      { tier: "Fast (15–20s)", abilities: "Skybound Leap (15s), Phase Step (20s), Shock Bolt (20s)" },
                      { tier: "Medium (30s)", abilities: "Sonic Pulse, Vine Snare, Umbral Veil, Ice Domain, Frostbite" },
                      { tier: "Medium-High (40s)", abilities: "Life Surge (40s), Verdant Domain (40s)" },
                      { tier: "Slow (50s)", abilities: "Abyss Call (50s), Cursed Horde (50s)" },
                      { tier: "Very Slow (60s)", abilities: "Resistance, Thunderstorm, Infernal Ring, Wind Dominion" },
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
                      "Arctic - Frostbite: 8 dmg + extreme CC (T1)",
                      "Lightning - Thunderstorm: 5×8 dmg AoE (T2)",
                      "Lightning - Shock Bolt: 6 dmg + weakness (T1)",
                      "Hell - Infernal Ring: fire dmg + knockback (T2)",
                    ],
                  },
                  {
                    title: "Crowd Control",
                    color: "border-blue-500/20",
                    items: [
                      "Nature - Vine Snare: complete root (Slowness XI + Jump -5)",
                      "Arctic - Frostbite: extreme slowness + freeze",
                      "Hell - Cursed Horde: weakness + slowness + skeletons",
                      "Echo - Abyss Call: darkness + slowness + mining fatigue",
                    ],
                  },
                  {
                    title: "Mobility",
                    color: "border-cyan-500/20",
                    items: [
                      "Sky - Skybound Leap: fast horizontal launch (15s CD)",
                      "Shadow - Phase Step: teleport to enemy (20s CD)",
                      "Sky - Wind Dominion: speed boost + enemy pull (60s CD)",
                    ],
                  },
                  {
                    title: "Healing & Detection",
                    color: "border-green-500/20",
                    items: [
                      "Health - Life Surge: full instant heal (40s CD)",
                      "Health - Resistance: damage reduction 15s (60s CD)",
                      "Nature - Verdant Domain: healing zone (40s CD)",
                      "Echo - Sonic Pulse: reveal enemies (glowing)",
                      "Shadow - Umbral Veil: invisibility + blind enemies",
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
                      { range: "Small (5 blocks)", abilities: "Infernal Ring" },
                      { range: "Medium (8 blocks)", abilities: "Sonic Pulse, Shock Bolt, Frostbite, Vine Snare, Abyss Call, Ice Domain" },
                      { range: "Large (10–12 blocks)", abilities: "Cursed Horde, Umbral Veil, Verdant Domain, Wind Dominion, Thunderstorm" },
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
