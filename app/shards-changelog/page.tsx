"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Menu,
  X,
  BookOpen,
  MessageCircle,
  ExternalLink,
  ArrowUp,
  Sword,
  BarChart3,
  Gift,
  Wrench,
  Scale,
  Sparkles,
  Waves,
} from "lucide-react";
import Link from "next/link";

// ========================================
// TYPES
// ========================================

interface VersionEntry {
  id: string;
  version: string;
  subtitle: string;
  date: string;
  summary: string;
  content: React.ReactNode;
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

const VERSIONS: VersionEntry[] = [
  {
    id: "dragon-egg",
    version: "Dragon Egg",
    subtitle: '"A Dragon\'s Hoard"',
    date: "June 2026",
    summary:
      "Slaying the Ender Dragon now drops a Dragon Egg — a relic that empowers you while it's carried: every shard cooldown is halved and your beneficial potions last 20% longer.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🐉 The Dragon Egg Relic">
          <ChangeItem title="Carry It, Reap The Rewards" prs="">
            <li>🥚 <strong>Every Ender Dragon kill now drops a Dragon Egg</strong> (not just the first) — so the relic is repeatably obtainable</li>
            <li>⏱️ <strong>Faster shards</strong> — while the egg is in your inventory, every shard ability cooldown starts at <strong>half length</strong>, so your powers recharge twice as fast</li>
            <li>✨ <strong>Longer buffs</strong> — beneficial potion effects you gain last <strong>20% longer</strong> (harmful effects are never extended)</li>
            <li>🎒 The egg <strong>must be in your inventory</strong> (hotbar, storage, or offhand) for the perks to apply</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "ocean-release",
    version: "Ocean Shard",
    subtitle: '"Tides Rising"',
    date: "June 2026",
    summary:
      "The Ocean Shard is now playable — its full kit goes live: a Conduit Power passive, the Riptide Zone, and the Hydro Beam. Its final in-game texture is still on the way.",
    content: (
      <>
        <ChangeSection icon={Waves} title="🌊 Ocean Is Live">
          <ChangeItem title="The Ocean Kit" prs="">
            <li>🫧 <strong>Passive</strong> — Conduit Power + Dolphin&apos;s Grace: underwater breathing, vision, faster underwater mining, and a swim-speed boost</li>
            <li>🌀 <strong>Riptide Zone (A1)</strong> — drop a 15-block water zone for 10s; untrusted players inside take armour-bypassing drowning damage each second plus Mining Fatigue and Hunger</li>
            <li>💥 <strong>Hydro Beam (A2)</strong> — a pressurized water beam that stops at the first wall, dealing 4.5–5 hearts of true damage and heavy knockback to everyone it passes through</li>
            <li>🎨 The kit is fully live; only its final custom texture is still in the works</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "v2-0-0",
    version: "Version 2.0",
    subtitle: '"The Rewrite"',
    date: "June 2026",
    summary:
      "Shards has been rebuilt from the ground up as a production-grade plugin. A brand-new lives system, fully reworked shard kits, directional trust, native stat tracking, and a foundation built for performance, stability, and safety.",
    content: (
      <>
        <ChangeSection icon={Sparkles} title="✨ The Big Picture">
          <p className="text-gray-400 text-sm mb-4">
            ShardsSMPv2 is a complete rewrite of the original plugin. V1 grew into spaghetti; V2 exists to
            fix that — every system was redesigned around the live server: never blocking the main thread,
            all gameplay numbers config-driven, and every harmful effect routed through a single trust gate.
          </p>
          <ChangeItem title="Built for Production" prs="">
            <li>🧱 Paper 1.21.11 on Java 21, async database layer (HikariCP + MariaDB), zero main-thread DB calls</li>
            <li>✅ 116 automated tests passing on every build</li>
            <li>🔄 Fresh start — V2 begins everyone from scratch (no V1 data import)</li>
          </ChangeItem>
        </ChangeSection>

        <ChangeSection icon={Gift} title="🎉 What's New For Players">
          <ChangeItem title="New Lives System" prs="">
            <p className="text-gray-400 text-sm mb-2">
              Lives now run from <strong>−3 to +3</strong> (everyone starts at 0) and gate your entire kit:
            </p>
            <li>🔓 <strong>+1</strong> unlocks your passive, <strong>+2</strong> unlocks Ability 1, <strong>+3</strong> unlocks Ability 2</li>
            <li>⚠️ <strong>−2</strong> applies Slowness, <strong>−3</strong> adds Weakness on top</li>
            <li>💀 Any death — PvP or environment — costs a life; kills grant one (if you&apos;re below +3)</li>
            <li>🎁 Extra Life items, <code>/withdraw</code>, and a Repair Kit let you trade and recover lives</li>
          </ChangeItem>
          <ChangeItem title="Reworked Shards" prs="">
            <p className="text-gray-400 text-sm mb-2">
              Nine playable shards, each with a passive and two activated abilities — all redesigned:
            </p>
            <li>🔥 <strong>Hell is now Scorch</strong> — fire control with a rage-fuelled Black Flame</li>
            <li>🪨 <strong>Earth</strong> is fully realized — depth-scaled damage, a burrowing Driller, and orbiting boulders</li>
            <li>⚡ Lightning, ❤️ Health, 🌑 Shadow, ⚡ Echo, 🌤️ Sky, and 🌿 Nature all rebuilt with new abilities and charge meters</li>
            <li>🌊 <strong>Ocean</strong> is now playable too — full kit live, with only its final texture still on the way</li>
          </ChangeItem>
          <ChangeItem title="Directional Trust" prs="">
            <li>🤝 <code>/trust</code>, <code>/untrust</code>, <code>/trustlist</code> — trusting a player shields them from <em>your</em> abilities</li>
            <li>↔️ Trust is one-directional; both players must trust each other for mutual protection</li>
            <li>🛡️ Every harmful ability checks the trust gate (and WorldGuard PvP regions) before it lands</li>
          </ChangeItem>
          <ChangeItem title="Stats On The Website" prs="">
            <li>📊 V2 records PvP kills/deaths, mob kills, blocks, damage, playtime, and ability use into MySQL</li>
            <li>🏆 Powers the v1rtopia.com leaderboards and the Discord stats bot</li>
          </ChangeItem>
          <ChangeItem title="New Commands" prs="">
            <li><code>/ability1</code> / <code>/a1</code> and <code>/ability2</code> / <code>/a2</code> — activate your abilities</li>
            <li><code>/shard &lt;name&gt; [player]</code>, <code>/livesset</code>, <code>/shard_type_clear</code>, <code>/shard_clear_player</code>, <code>/shards reload</code></li>
          </ChangeItem>
        </ChangeSection>

        <ChangeSection icon={Scale} title="⚖️ Design Principles">
          <ChangeItem title="No Magic Numbers" prs="">
            <li>Every cooldown, radius, damage value, and duration is a config key in <code>config.yml</code> / <code>shards/&lt;shard&gt;.yml</code></li>
          </ChangeItem>
          <ChangeItem title="Fail Safe" prs="">
            <li>Config or database errors disable the plugin loudly rather than corrupting player data</li>
            <li>Unloaded trust data blocks harm by default — never the other way around</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "m8",
    version: "Milestone 8",
    subtitle: '"Hardening & Stats"',
    date: "June 16, 2026",
    summary:
      "Compatibility and release hardening: WorldGuard region gating, anticheat-friendly movement, a real-block dome rework, unbreakable domain walls, and native gameplay stats feeding the website.",
    content: (
      <>
        <ChangeSection icon={Wrench} title="🛠️ Compatibility & Hardening">
          <ChangeItem title="WorldGuard Region Gating" prs="">
            <li>🚧 Harmful ability effects are now blocked where <code>pvp:deny</code> applies — at the caster&apos;s or the target&apos;s location</li>
            <li>Soft dependency; degrades to allow-all when WorldGuard isn&apos;t installed (self-buffs are never region-gated)</li>
          </ChangeItem>
          <ChangeItem title="Anticheat & Logging Review" prs="">
            <li>🛡️ All dashes and teleports use Vulcan-visible velocity/teleport so they don&apos;t trip the anticheat</li>
            <li>🧹 Ability visuals fire no loggable events, keeping CoreProtect history clean</li>
          </ChangeItem>
          <ChangeItem title="Dome Rework" prs="">
            <li>🏛️ Shadow Domain and Grove Prison now place real, restore-tracked blocks (snapped to ground, sealed on slopes)</li>
            <li>🔒 Domain walls can&apos;t be mined or blasted through, but you can still build against them; structures restore cleanly even after a crash</li>
          </ChangeItem>
        </ChangeSection>

        <ChangeSection icon={BarChart3} title="📊 Gameplay Stats">
          <ChangeItem title="V2-Native Stat Tracking" prs="">
            <li>Records PvP kills/deaths (lifetime + per-shard), mob kills, blocks broken/placed, damage dealt/taken, playtime, and per-ability use counts</li>
            <li>In-memory deltas flushed asynchronously in batched UPSERTs; event (CTF) deaths excluded by default</li>
            <li>Feeds the website&apos;s stats API, leaderboards page, and the Discord stats bot</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "m7",
    version: "Milestone 7",
    subtitle: '"Shards Wave 2"',
    date: "June 16, 2026",
    summary:
      "The second wave of shard kits: Scorch (the Hell rework), Nature, Sky, Earth, and a code-complete Ocean awaiting its texture.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎉 New Shards">
          <ChangeItem title="🔥 Scorch (Hell Rework)" prs="">
            <li>Passive: Fire Resistance + bonus damage while on fire</li>
            <li>Fire Wave (A1): AoE ignite + knockback · Black Flame (A2): unextinguishable fire with a rage meter scaling damage up to +50%</li>
          </ChangeItem>
          <ChangeItem title="🌿 Nature" prs="">
            <li>Passive: chance to poison on melee</li>
            <li>Vine Grapple (A1): ray-traced pull/swing + poison · Grove Prison (A2): leaf ring that locks out wind charges and poisons on contact</li>
          </ChangeItem>
          <ChangeItem title="🌤️ Sky" prs="">
            <li>Passive: no fall damage + a chance to faze through melee hits</li>
            <li>Sky Dash (A1): long + bonus short dash · Skyfall (A2): a Pressure-meter launch-and-slam</li>
          </ChangeItem>
          <ChangeItem title="🪨 Earth" prs="">
            <li>Passive: melee damage scales with how deep you are</li>
            <li>Driller (A1): burrow a self-restoring tunnel and bury players overhead · Boulder Throw (A2): orbiting boulders that shield then hurl for true damage</li>
          </ChangeItem>
          <ChangeItem title="🌊 Ocean (Coming Soon)" prs="">
            <li>Kit built and code-complete (Conduit Power passive, Riptide Zone, Hydro Beam) — ships disabled until its texture lands in the pack</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "m6",
    version: "Milestone 6",
    subtitle: '"Shards Wave 1"',
    date: "June 15, 2026",
    summary:
      "The first four shard kits land on top of a shared ability backbone — Lightning, Health, Shadow, and Echo.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎉 New Shards">
          <ChangeItem title="⚡ Lightning" prs="">
            <li>Speed passive · Dash (A1, charge-based) · Thunderstorm (A2, random strikes on untrusted players)</li>
          </ChangeItem>
          <ChangeItem title="❤️ Health" prs="">
            <li>Regeneration passive · Health Drain (A1, lifesteal aura + steal) · Overheal (A2, scaling bonus max health)</li>
          </ChangeItem>
          <ChangeItem title="🌑 Shadow" prs="">
            <li>Strength passive · Shadowstep (A1, teleport behind your target + blind) · Shadow Domain (A2, blinding dome + self buffs)</li>
          </ChangeItem>
          <ChangeItem title="⚡ Echo" prs="">
            <li>Resistance + Night Vision passive (eat a held Sculk Shrieker for a Strength chance)</li>
            <li>Echolocate (A1, glow + darkness + close stun) · Sonic Shriek (A2, Sound-meter true-damage beam)</li>
          </ChangeItem>
        </ChangeSection>
        <ChangeSection icon={Wrench} title="🛠️ Shared Backbone">
          <ChangeItem title="Reusable Ability Systems" prs="">
            <li>Passive service, timed boss-bar effects, a shared dash engine, temporary max-health, last-hit tracking, and an event-sourced charge-meter + boss-bar renderer</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "m5",
    version: "Milestone 5",
    subtitle: '"Ability Framework"',
    date: "June 15, 2026",
    summary:
      "The engine every shard plugs into: a lives-gated activation pipeline, persistent cooldowns, stuns, and the in-game HUD.",
    content: (
      <>
        <ChangeSection icon={Wrench} title="🛠️ Framework">
          <ChangeItem title="Activation Pipeline" prs="">
            <li>Shard / Ability / Passive interfaces with a 7-step pipeline (held-in-hand → lives unlock → lockout → cooldown/charges → activate)</li>
            <li>Only a successful activation consumes a cooldown</li>
          </ChangeItem>
          <ChangeItem title="Cooldowns & Lockouts" prs="">
            <li>Cooldowns persist through relog and restart; multi-charge abilities supported</li>
            <li>Ability lockout (stun) primitive for abilities like Lightning&apos;s Dash and Echo&apos;s Echolocate</li>
          </ChangeItem>
          <ChangeItem title="HUD" prs="">
            <li>Action-bar cooldown/charge readout with a ready alert, plus boss bars for timed effects and meters</li>
            <li>Commands-only activation: <code>/ability1</code> / <code>/a1</code>, <code>/ability2</code> / <code>/a2</code></li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "m4",
    version: "Milestone 4",
    subtitle: '"Lives System"',
    date: "June 14, 2026",
    summary:
      "The −3…+3 lives system, with a single audited mutation choke point, threshold unlocks and debuffs, and PvP transfer rules.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎉 Lives">
          <ChangeItem title="LivesService" prs="">
            <li>Range −3..+3, write-through persistence, an audit row per change, and threshold re-evaluation on every change</li>
            <li>Cumulative debuffs below zero, re-asserted so milk and other plugins can&apos;t strip them</li>
          </ChangeItem>
          <ChangeItem title="Death & Transfer Rules" prs="">
            <li>PvP kills transfer a life; two +3 players trading a kill drops an Extra Life item; environment deaths also cost a life</li>
            <li>Trusted kills are inert by default, preventing friendly farming</li>
          </ChangeItem>
          <ChangeItem title="Items & Commands" prs="">
            <li>Repair Kit (only usable at ≤ 0 lives), <code>/withdraw &lt;amount&gt;</code>, and <code>/livesset &lt;player&gt; &lt;value&gt;</code></li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "m3",
    version: "Milestone 3",
    subtitle: '"Item Framework"',
    date: "June 13, 2026",
    summary:
      "Shard items with tamper-proof identity and a strict lock — no drops, no containers, one per player, powers gated to either hand.",
    content: (
      <>
        <ChangeSection icon={Wrench} title="🛠️ Items">
          <ChangeItem title="Item Identity & Lock" prs="">
            <li>Items identified by persistent data (never names/lore) with a frozen custom-model contract for the resource pack</li>
            <li>One shard per player; free to move within your own inventory but no drops, containers, frames, or foreign pickup</li>
            <li>Kept on death and reissued on respawn; reconciled against the database on join</li>
          </ChangeItem>
          <ChangeItem title="Reroller, Repair Kit & Extra Life" prs="">
            <li>Reroller swaps you to a random enabled shard; Repair Kit and Extra Life items implemented</li>
            <li>Admin shard give/clear commands and an in-game Repair Kit recipe editor</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "m2",
    version: "Milestone 2",
    subtitle: '"Trust System"',
    date: "June 13, 2026",
    summary:
      "Directional, database-backed trust with a single enforcement gate that every harmful ability must pass through.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎉 Trust">
          <ChangeItem title="TrustService & TrustGate" prs="">
            <li>Directional trust, cached at login with optimistic writes; the gate fails safe (unloaded data blocks harm)</li>
            <li><code>/trust</code>, <code>/untrust</code>, <code>/trustlist</code> — offline targets supported, trustlist shows both directions</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "m1",
    version: "Milestone 1",
    subtitle: '"Core Platform"',
    date: "June 12, 2026",
    summary:
      "The foundation everything sits on: the config framework, the database layer, and a crash-safe player data lifecycle.",
    content: (
      <>
        <ChangeSection icon={Wrench} title="🛠️ Platform">
          <ChangeItem title="Config & Database" prs="">
            <li>Config framework (<code>config.yml</code>, <code>messages.yml</code>, <code>shards/*.yml</code>) with all-or-nothing reload</li>
            <li>HikariCP datasource with a versioned schema-migration runner and an async repository layer</li>
          </ChangeItem>
          <ChangeItem title="Player Data Lifecycle" prs="">
            <li>Load on pre-login (deny on failure), in-memory cache, dirty-flush task, save-and-evict on quit, bounded shutdown flush</li>
            <li>Graceful degradation when the database has an outage at runtime — no main-thread DB calls anywhere</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "m0",
    version: "Milestone 0",
    subtitle: '"Foundation"',
    date: "June 12, 2026",
    summary:
      "Project setup — specs, roadmap, and a buildable plugin skeleton targeting the live server's Paper version.",
    content: (
      <>
        <ChangeSection icon={Sparkles} title="✨ Groundwork">
          <ChangeItem title="Project Scaffold" prs="">
            <li>Full spec set + roadmap; Maven project on Java 21 / Paper API 1.21.11 with shaded dependencies and a test harness wired up</li>
            <li>Plugin skeleton builds against Paper 1.21.11; all artifacts stay within the repository (deployment is manual and owner-driven)</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
];

// ========================================
// UTILITY
// ========================================

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ========================================
// SUB-COMPONENTS
// ========================================

function ChangeSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-green-400 shrink-0" />
        <h4 className="text-base font-semibold text-white">{title}</h4>
      </div>
      <div className="space-y-4 pl-6">{children}</div>
    </div>
  );
}

function ChangeItem({
  title,
  prs,
  children,
}: {
  title: string;
  prs: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-gray-200">{title}</span>
        {prs && (
          <span className="text-xs text-green-400/70 font-mono bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
            {prs}
          </span>
        )}
      </div>
      <ul className="space-y-1 text-sm text-gray-400 pl-3 list-none">
        {children}
      </ul>
    </div>
  );
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
                  link.href === "/shards-changelog"
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
                    link.href === "/shards-changelog"
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

function VersionAccordion({
  entry,
  isOpen,
  onToggle,
}: {
  entry: VersionEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      id={entry.id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass border border-green-500/20 rounded-2xl overflow-hidden"
    >
      {/* Header / Summary */}
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-white/5 transition-colors group"
        aria-expanded={isOpen}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-white group-hover:text-green-300 transition-colors">
              {entry.version}{" "}
              <span className="text-green-400">{entry.subtitle}</span>
            </h2>
            <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
              {entry.date}
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed pr-2">{entry.summary}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-green-400" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-white/10 pt-5">
              {entry.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-40 p-3 rounded-xl glass border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors glow-green-sm"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ========================================
// MAIN PAGE
// ========================================

export default function ShardsChangelog() {
  const [openVersions, setOpenVersions] = useState<Record<string, boolean>>({});

  const toggleVersion = useCallback((id: string) => {
    setOpenVersions((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const scrollToVersion = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      // Auto-open the section when navigating via TOC
      setOpenVersions((prev) => ({ ...prev, [id]: true }));
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      <Navbar />
      <BackToTop />

      {/* Page Header */}
      <div className="pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/30 text-green-400 text-sm font-medium mb-6">
            <Sword className="w-4 h-4" />
            <span>ShardsSMP V2</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🗡️ <span className="text-green-400 text-glow">Changelog</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            The development log for <strong className="text-gray-200">Shards V2</strong> — a complete,
            production-grade rewrite. Follow it from the first foundation commit through every shard wave to
            today&apos;s live build.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Looking for the old history? Read the{" "}
            <Link href="/shards-changelog-v1" className="text-amber-400 hover:text-amber-300 underline">
              Shards V1 changelog
            </Link>
            .
          </p>
        </motion.div>

        {/* By The Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          id="by-the-numbers"
          className="glass border border-green-500/20 rounded-2xl p-6 md:p-8 mb-12 glow-green-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">📊 By The Numbers</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">What the V2 rewrite ships with:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Playable Shards", value: "8", desc: "each with a passive and two activated abilities" },
              { label: "Activated Abilities", value: "16", desc: "an Ability 1 and Ability 2 per shard" },
              { label: "Passive Effects", value: "8", desc: "always-on once you reach +1 life" },
              { label: "Automated Tests", value: "116", desc: "green on every build (mvn clean verify)" },
              { label: "Lives Range", value: "−3 to +3", desc: "gating unlocks and stacking debuffs" },
              { label: "Built On", value: "1.21.11", desc: "Paper / Java 21, async database layer" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-green-500/5 border border-green-500/10 rounded-xl p-4"
              >
                <div className="text-3xl font-bold text-green-400 text-glow mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-white mb-0.5">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main layout: TOC + Changelog */}
        <div className="flex gap-8 items-start">
          {/* Sticky TOC Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
            <div className="glass border border-green-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-green-400 font-semibold text-sm uppercase tracking-wider mb-4">
                <BookOpen className="w-4 h-4" />
                <span>Versions</span>
              </div>
              <nav aria-label="Version table of contents">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => {
                        const el = document.getElementById("by-the-numbers");
                        if (el) {
                          const top = el.getBoundingClientRect().top + window.scrollY - 80;
                          window.scrollTo({ top, behavior: "smooth" });
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all duration-200"
                    >
                      📊 By The Numbers
                    </button>
                  </li>
                  {VERSIONS.map((v) => (
                    <li key={v.id}>
                      <button
                        onClick={() => scrollToVersion(v.id)}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-green-300 hover:bg-white/5 transition-all duration-200"
                      >
                        <span className="font-semibold text-gray-300">{v.version}</span>
                        <br />
                        <span className="text-gray-500">{v.subtitle}</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => {
                        const el = document.getElementById("thank-you");
                        if (el) {
                          const top = el.getBoundingClientRect().top + window.scrollY - 80;
                          window.scrollTo({ top, behavior: "smooth" });
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all duration-200"
                    >
                      🎉 Thank You
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Changelog content */}
          <div className="flex-1 min-w-0 space-y-4">
            {VERSIONS.map((entry) => (
              <VersionAccordion
                key={entry.id}
                entry={entry}
                isOpen={!!openVersions[entry.id]}
                onToggle={() => toggleVersion(entry.id)}
              />
            ))}
          </div>
        </div>

        {/* Thank You Section */}
        <motion.div
          id="thank-you"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass border border-green-500/30 rounded-2xl p-8 glow-green-sm"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            🎉 <span className="text-green-400 text-glow">Thank You!</span>
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Thank you for following the rebuild of Shards! V2 was developed milestone by milestone — from the
            core platform and trust system through the lives system, the ability framework, and two full waves
            of shard kits — into the polished build that&apos;s live today.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Development Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📅 Development Timeline</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { date: "Milestone 0–1", note: "Foundation & core platform" },
                  { date: "Milestone 2", note: "Directional trust system" },
                  { date: "Milestone 3", note: "Item framework & shard lock" },
                  { date: "Milestone 4", note: "Lives system (−3…+3)" },
                  { date: "Milestone 5", note: "Ability framework & HUD" },
                  { date: "Milestone 6", note: "Shards wave 1 (4 kits)" },
                  { date: "Milestone 7", note: "Shards wave 2 (4 kits + Ocean)" },
                  { date: "Milestone 8", note: "Hardening, compatibility & stats" },
                ].map(({ date, note }) => (
                  <li key={date} className="flex items-start gap-3">
                    <span className="text-green-400 font-mono text-xs shrink-0 mt-0.5 w-28">{date}:</span>
                    <span className="text-gray-400">{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Total Effort */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">💪 The Rewrite</h3>
              <ul className="space-y-3">
                {[
                  "A from-scratch, production-grade rewrite",
                  "8 playable shards, 16 abilities, 8 passives",
                  "A −3…+3 lives system with audited transfers",
                  "116 automated tests, green on every build",
                  "Native stats powering the site & Discord bot",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-green-400 shrink-0 mt-0.5">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-gray-300 font-medium italic">
            May your shards be powerful and your lives be many! ⚔️✨
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
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
      </div>
    </main>
  );
}
