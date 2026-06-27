"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  MessageCircle,
  ChevronRight,
  Hammer,
  Gem,
  Sparkles,
  Radio,
  AlertTriangle,
  Terminal,
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

interface Fragment {
  numeral: string;
  passive: string;
}

const FRAGMENTS: Fragment[] = [
  { numeral: "I", passive: "Your shard ability cooldowns are reduced by 5%." },
  { numeral: "II", passive: "Your potion effects last 5% longer." },
  { numeral: "III", passive: "Your damage output is increased by 5%." },
  { numeral: "IV", passive: "5% chance to freeze a player you hit." },
  { numeral: "V", passive: "5% chance to cheat death — heal back to full, like a totem." },
  { numeral: "VI", passive: "5% chance to shove enemies away when you drop below 4.5 hearts." },
  { numeral: "VII", passive: "5% chance to gain enchanted-golden-apple effects when below 3 hearts." },
  { numeral: "VIII", passive: "Your maximum health is increased by 5%." },
];

interface CommandData {
  command: string;
  description: string;
}

const ADMIN_COMMANDS: CommandData[] = [
  { command: "/ambermace start", description: "Scatter the 8 Amber Fragments across the dimensions and begin the hunt." },
  { command: "/ambermace stop", description: "End the hunt — remove any still-loose fragments and end an active carrier broadcast." },
  { command: "/ambermace info", description: "Show whether a hunt is running and how long any carrier broadcast has left." },
  { command: "/ambermace give <player> <1-8>", description: "Hand a specific Amber Fragment to a player (testing/recovery)." },
  { command: "/ambermace reload", description: "Reload config.yml and messages.yml." },
  { command: "/fragment place <1-8> [x y z] [world]", description: "Place a tracked fragment at a spot — defaults to your location; coordinates accept ~ relative notation; world accepts a name or overworld/nether/end." },
  { command: "/fragment locate [1-8]", description: "Report the coordinates and dimension of every tracked fragment (pass a number to filter to one)." },
];

// ========================================
// UTILITY
// ========================================

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ========================================
// NAVBAR
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
                  className="block px-4 py-2 rounded-lg text-gray-300 hover:text-green-400 hover:bg-white/5 transition-colors"
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

function SectionHeading({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-amber-400" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-amber-400">{children}</h2>
    </div>
  );
}

// ========================================
// MAIN PAGE
// ========================================

export default function AmberMaceGuide() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 vignette pointer-events-none" />
      <div className="fixed inset-0 scanlines opacity-20 pointer-events-none" />

      <Navbar />

      {/* Header */}
      <section className="relative pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gray-500 text-sm mb-6"
          >
            <a href="/" className="hover:text-green-400 transition-colors">Home</a>
            <ChevronRight className="w-3 h-3" />
            <a href="/plugins" className="hover:text-green-400 transition-colors">Plugins</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">Amber Mace</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium">
              <Hammer className="w-3.5 h-3.5" />
              Event · Fragment Hunt
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-amber-400 text-glow">The Amber Mace</h1>
            <p className="text-xl text-gray-300">
              Eight Amber Fragments are hidden across the dimensions, each one quietly empowering
              whoever carries it. Gather all eight and forge the <strong className="text-amber-300">Amber
              Mace</strong> — a mythic weapon that paints a target on your back for the whole server.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-14">

        {/* Overview */}
        <section id="overview" className="scroll-mt-24">
          <SectionHeading icon={Sparkles}>How It Works</SectionHeading>
          <div className="glass border border-amber-500/20 rounded-2xl p-6 space-y-4 text-gray-300 leading-relaxed">
            <p>
              When the hunt begins, <strong className="text-white">8 Amber Fragments</strong> are
              scattered at random across the Overworld, the Nether and the End. Each fragment grants a
              small passive simply by sitting in your inventory — you don&apos;t have to hold it, just
              carry it. The more fragments you collect, the more they stack up.
            </p>
            <p>
              Once a single player holds all eight, they can craft the Amber Mace. The race is to gather
              them first — and to decide whether to hunt the fragments yourself or take them from
              someone who already has.
            </p>
          </div>
        </section>

        {/* Fragments */}
        <section id="fragments" className="scroll-mt-24">
          <SectionHeading icon={Gem}>The Eight Fragments</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FRAGMENTS.map((frag) => (
              <div
                key={frag.numeral}
                className="glass border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-amber-300 font-bold text-sm">{frag.numeral}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">Amber Fragment {frag.numeral}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{frag.passive}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-4">
            Passives apply only while the fragment is in your inventory — lose it and the perk stops.
          </p>
        </section>

        {/* Crafting */}
        <section id="crafting" className="scroll-mt-24">
          <SectionHeading icon={Hammer}>Forging the Mace</SectionHeading>
          <div className="glass border border-amber-500/20 rounded-2xl p-6 space-y-5 text-gray-300 leading-relaxed">
            <p>
              With all eight fragments in hand, craft the Amber Mace on a crafting table: place a{" "}
              <strong className="text-amber-300">Heavy Core</strong> in the centre and surround it with
              the <strong className="text-amber-300">8 Amber Fragments</strong> — one of each.
            </p>
            <div className="mx-auto w-fit">
              <div className="grid grid-cols-3 gap-2">
                {["I", "II", "III", "VIII", "core", "IV", "VII", "VI", "V"].map((cell, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-16 h-16 rounded-lg border flex items-center justify-center text-sm font-bold",
                      cell === "core"
                        ? "bg-orange-600/20 border-orange-400/50 text-orange-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    )}
                  >
                    {cell === "core" ? <Hammer className="w-6 h-6" /> : cell}
                  </div>
                ))}
              </div>
              <p className="text-center text-gray-500 text-xs mt-2">
                Heavy Core centre · any arrangement of the 8 fragments around it
              </p>
            </div>
            <p>
              The result is the full <strong className="text-amber-300">Amber Mace</strong> mythic — the
              same weapon found elsewhere on the server, with its supercharge passive and Amber Throw /
              Amber Smash abilities.
            </p>
          </div>
        </section>

        {/* Carrier window */}
        <section id="carrier" className="scroll-mt-24">
          <SectionHeading icon={Radio}>You&apos;re On The Map</SectionHeading>
          <div className="glass border border-amber-500/20 rounded-2xl p-6 space-y-4 text-gray-300 leading-relaxed">
            <p>
              Forging the mace lights you up. For the next <strong className="text-white">20
              minutes</strong>:
            </p>
            <div className="space-y-2">
              {[
                { label: "Broadcast", desc: "The mace holder's coordinates are announced to the whole server in chat every 2 minutes." },
                { label: "Amber glow", desc: "The holder gains an amber glowing outline, visible through walls, for the full duration." },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-sm w-28 shrink-0 text-amber-300">{label}</span>
                  <span className="text-gray-400 text-sm">{desc}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              The beacon follows the <em>mace</em>, not the crafter — if the mace changes hands, the
              broadcast and glow move with it.
            </p>
          </div>
        </section>

        {/* Warnings */}
        <section id="warnings" className="scroll-mt-24">
          <SectionHeading icon={AlertTriangle}>Dropping &amp; Stealing</SectionHeading>
          <div className="glass border border-red-500/20 rounded-2xl p-6 space-y-3 text-gray-300 leading-relaxed">
            <p>The mace can&apos;t hide. The whole server is told when it moves:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <span className="font-mono text-red-300 text-sm shrink-0">drop</span>
                <span className="text-gray-300 text-sm">&ldquo;Mace has been dropped!&rdquo;</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="font-mono text-amber-300 text-sm shrink-0">pickup</span>
                <span className="text-gray-300 text-sm">&ldquo;Amber Mace has been picked up by [Player]&rdquo;</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              So killing the carrier and taking the mace is always an option — but everyone will know
              you did it, and the spotlight passes straight to you.
            </p>
          </div>
        </section>

        {/* Admin commands */}
        <section id="commands" className="scroll-mt-24">
          <SectionHeading icon={Terminal}>Admin Commands</SectionHeading>
          <div className="glass border border-amber-500/20 rounded-2xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-3 px-4 text-left text-amber-400 font-semibold text-sm">Command</th>
                  <th className="py-3 px-4 text-left text-amber-400 font-semibold text-sm">Description</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_COMMANDS.map((cmd) => (
                  <tr key={cmd.command} className="border-b border-white/5 last:border-0">
                    <td className="py-3 px-4 font-mono text-amber-300 text-sm whitespace-nowrap align-top">{cmd.command}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{cmd.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-xs mt-3">Requires the <code className="text-gray-400">shardsambermace.admin</code> permission (OP by default).</p>
        </section>

      </div>
    </main>
  );
}
