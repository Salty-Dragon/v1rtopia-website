"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  Flag,
  RotateCcw,
  Moon,
  MessageCircle,
  ChevronRight,
  ArrowRight,
  Box,
} from "lucide-react";
import Link from "next/link";

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

interface PluginCard {
  name: string;
  tagline: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badge: string;
  accent: string;
  border: string;
}

const PLUGINS: PluginCard[] = [
  {
    name: "Shards SMP",
    tagline: "The core plugin",
    description:
      "9 shards with passives and two tiers of abilities, plus the lives and trust systems that define combat on v1rtopia.",
    href: "/shards-guide",
    icon: Sparkles,
    badge: "Core",
    accent: "text-green-400",
    border: "border-green-500/30 hover:border-green-400/60",
  },
  {
    name: "Shards CTF",
    tagline: "Event · Capture the Flag",
    description:
      "One-flag Capture the Flag. Keep your gear and shard abilities, grab the neutral flag, and run it to your base to score.",
    href: "/ctf-guide",
    icon: Flag,
    badge: "Event",
    accent: "text-cyan-400",
    border: "border-cyan-500/30 hover:border-cyan-400/60",
  },
  {
    name: "The Rebirth Ritual",
    tagline: "Event · Life-granting",
    description:
      "Offer rare items on a pedestal to open a vortex. Stand within it and be reborn with extra lives over the ritual's run.",
    href: "/rebirth-guide",
    icon: RotateCcw,
    badge: "Event",
    accent: "text-purple-400",
    border: "border-purple-500/30 hover:border-purple-400/60",
  },
  {
    name: "Blood Moon",
    tagline: "Event · Server-ending",
    description:
      "Three chosen rise as the Blood Moon. Sacrifice players on the ritual pedestals to turn them, grow stronger with every kill, and end the world — unless the Leader falls first.",
    href: "/bloodmoon-guide",
    icon: Moon,
    badge: "Event",
    accent: "text-red-400",
    border: "border-red-500/30 hover:border-red-400/60",
  },
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

// ========================================
// MAIN PAGE
// ========================================

export default function PluginsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 vignette pointer-events-none" />
      <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      <Navbar />

      {/* Header */}
      <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gray-500 text-sm mb-6"
          >
            <a href="/" className="hover:text-green-400 transition-colors">Home</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">Plugins</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
              <Box className="w-3.5 h-3.5" />
              Custom Plugins &amp; Guides
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-green-400 text-glow">Plugins</h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              The custom plugins that power v1rtopia — the core Shards SMP and the timed events that
              run alongside it. Pick one for its full guide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cards */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {PLUGINS.map((plugin, i) => {
            const Icon = plugin.icon;
            return (
              <motion.div
                key={plugin.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Link href={plugin.href} className="block h-full group">
                  <div className={cn("glass rounded-2xl p-6 border h-full flex flex-col transition-colors", plugin.border)}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className={cn("w-6 h-6", plugin.accent)} />
                      </div>
                      <span className={cn("text-xs font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10", plugin.accent)}>
                        {plugin.badge}
                      </span>
                    </div>
                    <h2 className={cn("text-xl font-bold", plugin.accent)}>{plugin.name}</h2>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mt-0.5 mb-3">{plugin.tagline}</p>
                    <p className="text-gray-400 text-sm leading-relaxed flex-1">{plugin.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-sm font-medium text-gray-300 group-hover:text-green-400 transition-colors">
                      Read the guide
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
