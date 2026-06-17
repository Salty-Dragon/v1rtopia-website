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
    id: "v1-2-0",
    version: "Version 1.2.0",
    subtitle: '"Items & Security"',
    date: "February 17 – March 2, 2026",
    summary:
      "A huge update introducing new consumable items, overhauling the death/drop system, and closing multiple shard duplication exploits. 20 pull requests focused on new features, item security, and polish.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎉 New Features">
          <ChangeItem title="Reroller Shard" prs="PRs #112, #119">
            <li>🎲 New consumable item that randomly changes your equipped shard</li>
            <li>Preserves your current tier level — if you&apos;re Tier 2, your new shard will also be Tier 2</li>
            <li>Uses a fun 3.5-second spinning armor stand animation to reveal your new shard</li>
            <li>Available via <code>/giveshard &lt;player&gt; Reroller</code></li>
          </ChangeItem>
          <ChangeItem title="Repair Kit" prs="PRs #135, #136">
            <li>🔧 New consumable item that restores your lives to 5</li>
            <li>Right-click to use — consumed on activation</li>
            <li>No effect if you already have 5 or more lives</li>
            <li>Can be freely dropped, traded, and moved in inventory</li>
            <li>Available via <code>/giveshard &lt;player&gt; Repair Kit</code></li>
          </ChangeItem>
          <ChangeItem title="Player Info Commands" prs="PR #113">
            <li>📊 <code>/shard myshard</code> — View your equipped shard type, tier, and abilities</li>
            <li>❤️ <code>/shard lives</code> — Check your current lives with color-coded health status (green ≥5, yellow 3-4, red &lt;3)</li>
          </ChangeItem>
          <ChangeItem title="Admin Clear Command" prs="PR #115">
            <li>🧹 <code>/shard clear &lt;player&gt;</code> — Admin-only command to clear another player&apos;s shard</li>
            <li>Works for both online and offline players</li>
            <li>Configurable permission via <code>command-permissions.shard_clear</code> (defaults to OP-only)</li>
          </ChangeItem>
          <ChangeItem title="Death Drop System" prs="PRs #114, #118, #126–130">
            <li>💀 25% chance to drop an upgrade shard on death — your tier resets to 1 if dropped</li>
            <li>Regular shards never drop on death — they&apos;re automatically re-equipped on respawn</li>
            <li>Upgrade and Reroller shards can be dropped and traded freely</li>
            <li>Complete rework ensures no shard duplication through death mechanics</li>
          </ChangeItem>
        </ChangeSection>

        <ChangeSection icon={Wrench} title="🛠️ Bug Fixes & Improvements">
          <ChangeItem title="Shard Duplication/Stacking Exploits" prs="PR #132">
            <li>🔒 Fixed F-key swap exploit allowing shards to be moved to main hand</li>
            <li>🔒 Fixed hopper extraction/insertion of restricted shards</li>
            <li>🔒 Fixed shift-click into containers bypassing protections</li>
            <li>🔒 Regular shards now have max stack size of 1, preventing stacking</li>
            <li>9 new exploit prevention handlers added</li>
          </ChangeItem>
          <ChangeItem title="Admin Command Fixes" prs="PRs #133, #134">
            <li>🔧 Fixed <code>/shard clear</code> and <code>/shards_clear_all</code> leaving stale passive effect cache</li>
            <li>🔧 Added admin bypass mechanism for inventory protections during clear operations</li>
            <li>🔧 Fixed F-key swap handler checking wrong hand — restricted shards in offhand are now properly detected</li>
          </ChangeItem>
          <ChangeItem title="Command Fixes" prs="PR #131">
            <li>🚫 Blocked <code>/kits</code> command that was bypassing the configurable <code>/kit</code> access control</li>
            <li>Players are now directed to use <code>/kit</code> instead</li>
          </ChangeItem>
          <ChangeItem title="/giveshard Multi-Word Names" prs="PR #136">
            <li>🔧 Fixed <code>/giveshard</code> failing for shard names with spaces (e.g., &quot;Repair Kit&quot;)</li>
            <li>Tab completion now properly supports multi-word shard names</li>
          </ChangeItem>
          <ChangeItem title="Ice Domain Water Freezing" prs="PRs #117, #124">
            <li>❄️ Ice Domain now properly freezes water inside the dome</li>
            <li>Water placed by players via bucket inside an active dome is also frozen</li>
            <li>Fixed incorrect block reference in bucket event handler</li>
          </ChangeItem>
          <ChangeItem title="Umbral Veil Terrain Fixes" prs="PRs #116, #122, #123">
            <li>🌑 Fixed vertical escape by adding Y-coordinate containment checks</li>
            <li>Fixed veil forming at bottom of mountains instead of around the player</li>
            <li>Per-column ground detection prevents floating walls on uneven terrain</li>
          </ChangeItem>
          <ChangeItem title="Stone Fortress Terrain Fixes" prs="PRs #110, #109">
            <li>🏰 Fixed vertical gaps between walls and roof on uneven terrain</li>
            <li>Walls now extend dynamically to connect with roof at all terrain heights</li>
          </ChangeItem>
          <ChangeItem title="Frostbite CC Nerf" prs="PR #111">
            <li>❄️ Slowness reduced from IV to I</li>
            <li>Weakness reduced from II to I</li>
            <li>Base duration reduced from 12s to 9s</li>
          </ChangeItem>
          <ChangeItem title="Reroller Tier Preservation" prs="PR #119">
            <li>🎲 Fixed reroller resetting tier to 1 instead of preserving current tier</li>
          </ChangeItem>
          <ChangeItem title="Invisibility Fix" prs="PR #107">
            <li>👻 Regular invisibility potions no longer hide equipment like the Shadow Shard abilities do</li>
            <li>Vanilla Minecraft behavior restored for normal potions</li>
          </ChangeItem>
          <ChangeItem title="Documentation" prs="PRs #120, #125">
            <li>📖 Fixed starting lives documentation: 6 → 5 (matching code)</li>
            <li>📖 Documented upgrade shard IDs in README</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "v1-1-0",
    version: "Version 1.1.0",
    subtitle: '"The Balance Overhaul"',
    date: "February 9–12, 2026",
    summary:
      "A massive balance rework across every shard, driven by armor meta analysis (diamond armor + Protection III). 25 pull requests retuning abilities, adding new passives, overhauling visual effects, and polishing gameplay.",
    content: (
      <>
        <ChangeSection icon={Scale} title="⚖️ Balance Changes">
          <ChangeItem title="Lightning Shard" prs="PRs #84, #98">
            <li>⚡ Thunder Dash: ability disable duration 10s → 5s, cooldown 20s → 30s</li>
            <li>⚡ Thunder Dash: fixed bug where it reset existing cooldowns on targets</li>
            <li>⚡ Thunderstorm: base damage 5 → 20 (effective ~2 hearts vs armored players)</li>
            <li>⚡ Passive: Speed I → Speed II</li>
          </ChangeItem>
          <ChangeItem title="Shadow Shard" prs="PR #85">
            <li>🌑 Phase Step: cooldown 20s → 25s, max range 15 → 12 blocks</li>
            <li>🌑 Umbral Veil: duration 20s → 12s, prison size 16×16 → 12×12, barrier height 5 → 3, blindness 5s → 3s</li>
          </ChangeItem>
          <ChangeItem title="Health Shard" prs="PR #86">
            <li>❤️ Life Surge: cooldown 30s → 40s</li>
          </ChangeItem>
          <ChangeItem title="Nature Shard" prs="PR #87">
            <li>🌿 Vine Snare: slowness amplifier 10 → 7, root duration 7s → 5s, cooldown 30s → 35s</li>
            <li>🌿 Verdant Domain: duration 15s → 12s, pull strength 0.3 → 0.2, healing per tick 0.5 → 0.35</li>
          </ChangeItem>
          <ChangeItem title="Sky Shard" prs="PR #88">
            <li>🌤️ Wind Dominion: removed Strength II buff, now grants only Speed III and enemy pull</li>
          </ChangeItem>
          <ChangeItem title="Hell Shard" prs="PRs #89, #100, #101">
            <li>🔥 New passive: +15% damage against burning targets</li>
            <li>🔥 Cursed Horde: added fire mechanics (6 HP burst + 10s fire + 1 HP/s periodic burn)</li>
            <li>🔥 Cursed Horde: Weakness effect reduced from II to I</li>
            <li>🔥 Fixed summoned skeletons attacking their summoner and trusted players</li>
          </ChangeItem>
          <ChangeItem title="Earth Shard" prs="PR #90">
            <li>🪨 New passive: Natural Armor (+2 armor points)</li>
            <li>🪨 Boulder Throw: cooldown 40s → 50s, damage 20 → 25, speed +30%, 2×2 formation with knockback and Slowness II</li>
            <li>🪨 Stone Fortress: cooldown 60s → 50s, duration 12s → 15s, added Speed II, Absorption III → IV</li>
          </ChangeItem>
          <ChangeItem title="Arctic Shard" prs="PR #99">
            <li>❄️ Frostbite: weakness effect duration reduced from 12s to 5s</li>
            <li>❄️ Ice Domain: changed from 8×8×5 box to 9×9 hemispherical dome with block break protection</li>
          </ChangeItem>
        </ChangeSection>

        <ChangeSection icon={Gift} title="🎉 New Features">
          <ChangeItem title="Umbral Veil Overhaul" prs="PRs #94, #95, #96, #97">
            <li>🌑 Complete visual rework: removed red glowing blocks, added dark particle walls with alternating pattern</li>
            <li>🌑 Added barrier roof to prevent escape via flying/elytra/pillaring</li>
            <li>🌑 Complete invisibility: fire effects and arrows hidden via packet interception</li>
            <li>🌑 Optimized for 40-player concurrency with spatial chunk filtering (~95% fewer checks)</li>
          </ChangeItem>
          <ChangeItem title="Earth Shard Improvements" prs="PRs #102, #105">
            <li>🏰 Stone Fortress blocks are now unbreakable during the 8-second duration</li>
            <li>🏰 Ground-adaptive placement — fortress seals properly on any terrain</li>
          </ChangeItem>
          <ChangeItem title="Ice Domain Improvements" prs="PR #106">
            <li>❄️ Dome size increased from 9×9 to 24×24 blocks (7× area coverage)</li>
            <li>❄️ Added 5-block downward extension to prevent escape gaps on slopes</li>
          </ChangeItem>
          <ChangeItem title="Database Statistics System" prs="PR #83">
            <li>📊 5 new database tables for tracking player stats, shard usage, ability usage, combat logs, and daily metrics</li>
            <li>📊 10 leaderboard query methods for kills, K/D ratio, experience, playtime, and more</li>
            <li>📊 Designed for website integration and analytics</li>
          </ChangeItem>
          <ChangeItem title="Balance Analysis Documentation" prs="PR #79">
            <li>📋 Comprehensive shard balance analysis accounting for diamond armor + Protection III meta</li>
            <li>📋 Damage recalculation tables showing effective damage after ~85% armor reduction</li>
          </ChangeItem>
        </ChangeSection>

        <ChangeSection icon={Wrench} title="🛠️ Bug Fixes">
          <ChangeItem title="Resource Pack" prs="PRs #80, #92, #93">
            <li>🎨 Migrated to Minecraft 1.21.4+ item declaration system (<code>minecraft:range_dispatch</code>)</li>
            <li>🎨 Fixed custom model data format for numeric values</li>
            <li>🎨 Added missing <code>index</code> property for range_dispatch configuration</li>
          </ChangeItem>
          <ChangeItem title="Trust System" prs="PR #91">
            <li>🤝 Fixed GLOWING effect misclassified as beneficial (was revealing trusted players)</li>
            <li>🤝 Added trust validation to Cursed Horde fire damage and periodic effects</li>
          </ChangeItem>
          <ChangeItem title="Umbral Veil Escape Fixes" prs="PR #104">
            <li>🌑 Closed 4-block gap between barrier walls and roof</li>
          </ChangeItem>
          <ChangeItem title="Ice Domain Sphere" prs="PR #108">
            <li>❄️ Changed from hemisphere to fully enclosed sphere</li>
            <li>❄️ Added rising animation that lifts trapped players 3 blocks over 1 second</li>
          </ChangeItem>
        </ChangeSection>

        <ChangeSection icon={Sparkles} title="🔧 Technical Changes">
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Thread safety: replaced <code className="text-green-300 bg-green-500/10 px-1 rounded text-xs">HashMap</code> with <code className="text-green-300 bg-green-500/10 px-1 rounded text-xs">ConcurrentHashMap</code> across all manager classes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Player shard caching eliminates ~480K database queries per minute (40 players)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Async database operations for death/kill/join event handlers
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Spatial chunk filtering for Umbral Veil movement checks
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Null safety improvements across passive effects, life system, and cooldown managers
            </li>
          </ul>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "v1-0-3",
    version: "Version 1.0.3",
    subtitle: '"Arctic Balance"',
    date: "February 8, 2026",
    summary: "A focused balance patch for the Arctic Shard's Ice Domain ability.",
    content: (
      <>
        <ChangeSection icon={Scale} title="⚖️ Balance Changes">
          <ChangeItem title="Arctic Shard – Ice Domain" prs="">
            <li>❄️ Reduced cooldown from 50 seconds to 30 seconds for improved usability</li>
            <li>Added unit test to verify cooldown value</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "v1-0-2",
    version: "Version 1.0.2",
    subtitle: '"The Great Refinement"',
    date: "February 5–6, 2026",
    summary:
      "A monumental two-day sprint with 27 pull requests! This update brings trust systems, permissions customization, Arctic/Earth shard abilities, comprehensive bug fixes, and player documentation.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎉 New Features">
          <ChangeItem title="Trust System" prs="PRs #28, #32, #33, #34">
            <li>🤝 Implemented player trust system with <code>/shard trust &lt;player&gt;</code> and <code>/shard untrust &lt;player&gt;</code> commands</li>
            <li>Players can now designate trusted allies who won&apos;t be affected by their harmful abilities</li>
            <li>Trust protection blocks damage and negative effects while allowing beneficial effects</li>
            <li>Fixed 5+ abilities that were improperly validating trust relationships</li>
            <li>Comprehensive trust validation across all 12 damage/crowd control abilities</li>
          </ChangeItem>
          <ChangeItem title="Earth Shard – Stone Fortress Ability" prs="PRs #50, #51">
            <li>🏰 Earth Shard Tier 2 ability now fully implemented</li>
            <li>Creates a 6x6x5 protective stone fortress with full roof coverage</li>
            <li>Grants Resistance II (reduced from IV for balance) and Absorption II for 12 seconds</li>
            <li>Structure auto-despawns after 8 seconds</li>
            <li>60 second cooldown</li>
          </ChangeItem>
          <ChangeItem title="Nature Shard Passive Enhancement" prs="PR #51">
            <li>🌿 Regeneration now applies dynamically when standing on grass/plants</li>
            <li>Effect instantly removes when stepping off nature blocks</li>
            <li>Event-driven system (no more timed checks) for better performance</li>
          </ChangeItem>
          <ChangeItem title="Player Guide" prs="PR #39">
            <li>📖 Added comprehensive PLAYER_GUIDE.md with complete documentation</li>
            <li>Covers all 27 abilities (9 shards × 3 abilities each)</li>
            <li>Includes cooldowns, damage values, ranges, and effect details</li>
            <li>Command reference with aliases and permissions</li>
            <li>Quick reference organized by ability type</li>
          </ChangeItem>
          <ChangeItem title="Automatic Shard Assignment" prs="PR #31">
            <li>✨ New players automatically receive a random shard on first login</li>
            <li>Beautiful 3.5-second animated armor stand selection display</li>
            <li>Smooth rotation and cycling through available shards</li>
            <li>Shard auto-equipped to offhand with passive effects applied</li>
          </ChangeItem>
          <ChangeItem title="Gamemode & Permissions System" prs="PRs #29, #35, #36, #37, #38">
            <li>🎮 Configurable <code>/gamemode</code> and <code>/gm</code> access for regular players</li>
            <li>Server owners can now allow players to use gamemode (survival/creative only)</li>
            <li>Boolean config values now supported in command-permissions</li>
            <li>Removed hard-coded permission nodes for <code>giveshard</code>, <code>shard_energy_give</code>, and <code>shards_clear_all</code></li>
            <li>Plugin.yml permission overrides enable config-based permission control</li>
          </ChangeItem>
          <ChangeItem title="Admin Commands" prs="PRs #27, #29, #46">
            <li>⚡ <code>/shard_energy_give &lt;player&gt; &lt;amount&gt;</code> — Grant lives to players</li>
            <li>🧹 <code>/shards_clear_all</code> — Clears all shards from offhand slots</li>
            <li>Both commands now respect config-based permissions</li>
          </ChangeItem>
        </ChangeSection>

        <ChangeSection icon={Wrench} title="🛠️ Bug Fixes & Improvements">
          <ChangeItem title="Shadow Shard" prs="PR #52">
            <li>🎯 Phase Step now has a 15-block maximum teleport distance</li>
            <li>Prevents exploiting for extreme long-range teleportation</li>
            <li>Error message displays if target is too far away</li>
          </ChangeItem>
          <ChangeItem title="Shard Display" prs="PR #52">
            <li>📜 Fixed tier 2 shards incorrectly showing &quot;Tier: 1&quot; in item lore</li>
            <li>Tier display now reads from database and updates properly when upgrading</li>
          </ChangeItem>
          <ChangeItem title="Shard Equipping & Duplication" prs="PRs #43, #45, #46, #48">
            <li>🔧 Fixed shard duplication bugs when using <code>/giveshard</code></li>
            <li>Shards now properly destroy old shard instead of moving it</li>
            <li>Auto-equip on login now uses offhand instead of main hand</li>
            <li><code>/shards_clear_all</code> now correctly clears equipped shards from offhand</li>
            <li>Proper database persistence and passive effect application on auto-equip</li>
          </ChangeItem>
          <ChangeItem title="Arctic Shard" prs="PRs #41, #44, #47">
            <li>❄️ Fixed Frostbite and Ice Domain null safety issues</li>
            <li>Fixed IllegalArgumentException in particle spawning for Frostbite and FrostNova</li>
            <li>Fixed Speed II flickering when standing on ice (passive now stable)</li>
            <li>Missing entity effects now properly applied</li>
          </ChangeItem>
          <ChangeItem title="Resource Pack" prs="PRs #40, #49">
            <li>🎨 Fixed pack.mcmeta to use correct pack_format 75 with version range for 1.21.11</li>
            <li>Fixed model files incorrectly referencing vanilla items (<code>minecraft:</code> namespace removed)</li>
            <li>Added placeholder textures for 6 legacy shards (celestial, chaos, shadow, sky, time, void)</li>
            <li>Shards now properly display custom textures instead of vanilla items</li>
          </ChangeItem>
          <ChangeItem title="Health Shard" prs="PR #30">
            <li>❤️ Fixed heart accumulation via consistent AttributeModifier UUID</li>
            <li>Health bonus now applies correctly without stacking issues</li>
          </ChangeItem>
        </ChangeSection>

        <ChangeSection icon={Sparkles} title="🔧 Technical Changes">
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Enhanced TrustManager with <code className="text-green-300 bg-green-500/10 px-1 rounded text-xs">canDamage()</code> and <code className="text-green-300 bg-green-500/10 px-1 rounded text-xs">canApplyEffect()</code> methods
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Automatic effect classification (12 negative, 20 beneficial)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Event-driven passive effect systems (Arctic ice speed, Nature regeneration)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Improved animation system with armor stands for shard selection
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Better item management in offhand with proper cleanup
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">•</span>
              Database query optimization with async operations
            </li>
          </ul>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "v1-0-0",
    version: "Version 1.0.0",
    subtitle: '"Documentation & Polish"',
    date: "February 4, 2026",
    summary:
      "The final touches before launch! This version focused on making the plugin player-friendly with clear documentation.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎉 What's New">
          <ChangeItem title="Player-Friendly Documentation" prs="">
            <li>Complete overhaul of the changelog to be accessible for players, not just developers</li>
            <li>Clear explanations of all abilities, systems, and features</li>
            <li>Removed technical jargon and replaced with easy-to-understand descriptions</li>
            <li><strong>Previous Technical Changelog</strong>: Replaced developer-centric changelog with this player-friendly version</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "v0-4-0",
    version: "Version 0.4.0",
    subtitle: '"The Refinement Update"',
    date: "February 3, 2026",
    summary:
      "A day dedicated to polishing the player experience! Seven improvements and bug fixes to make gameplay smoother.",
    content: (
      <>
        <ChangeSection icon={Wrench} title="🛠️ Improvements & Fixes">
          <ChangeItem title="Offhand System Overhaul" prs="">
            <li>🤚 Shards must now be equipped in your offhand slot to work</li>
            <li>🔒 Can&apos;t move shards to other slots while equipped</li>
            <li>💪 All abilities and passive effects require the shard in offhand</li>
            <li>This prevents accidental shard drops and ensures consistent gameplay</li>
          </ChangeItem>
          <ChangeItem title="Better Cooldown Display" prs="">
            <li>⏱️ New horizontal A1/A2 cooldown format in action bar</li>
            <li>🐛 Fixed bug where multiple abilities used quickly would show wrong cooldowns</li>
            <li>Much cleaner and easier to read during combat!</li>
          </ChangeItem>
          <ChangeItem title="Shard Configuration" prs="">
            <li>⚙️ Server owners can now enable/disable specific shards</li>
            <li>🎮 Customize which shards are available on your server</li>
          </ChangeItem>
          <ChangeItem title="Ability Fixes" prs="">
            <li>🌿 <strong>Nature Shard</strong>: Fixed Vine Snare launching players into the sky (now properly roots them)</li>
            <li>🔥 <strong>Hell Shard</strong>: Skeletons no longer attack each other</li>
            <li>🔥 <strong>Hell Shard</strong>: Increased skeleton health to make them more effective</li>
            <li>🔥 <strong>Hell Shard</strong>: Skeletons now bypass enemy fire resistance</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "v0-3-0",
    version: "Version 0.3.0",
    subtitle: '"The Resource Pack Update"',
    date: "February 2, 2026",
    summary:
      "One critical fix to make custom textures work properly for all players.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎨 What's New">
          <ChangeItem title="Custom Texture Fixes" prs="">
            <li>🖼️ Updated resource pack format to be compatible with Minecraft 1.21.11</li>
            <li>🎯 Standardized texture namespace for consistency</li>
            <li>✨ All shards now display their beautiful custom textures correctly</li>
            <li>Players joining the server will see unique visuals for each shard type</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "v0-2-0",
    version: "Version 0.2.0",
    subtitle: '"The Enhancement Update"',
    date: "February 1, 2026",
    summary:
      "Major improvements to stability, visuals, and progression! Six updates in one day.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎮 What's New">
          <ChangeItem title="Shard Tier System" prs="">
            <li>📈 Shards now have tiers! Start with Tier 1, upgrade to unlock Tier 2 abilities</li>
            <li>🔓 Upgrade your shards to access more powerful abilities</li>
            <li>Each tier grants access to different abilities</li>
          </ChangeItem>
          <ChangeItem title="Beautiful Custom Textures" prs="">
            <li>✨ Every shard now has its own unique custom texture</li>
            <li>🎨 Download the resource pack when you join to see them</li>
            <li>Each shard type looks visually distinct in your inventory</li>
          </ChangeItem>
          <ChangeItem title="Technical Improvements" prs="">
            <li>⚡ Updated to Paper API 1.21.11 for better performance</li>
            <li>🔧 Fixed command system to work properly with new Paper version</li>
            <li>🗄️ Fixed database connection issues with MariaDB</li>
            <li>📖 Updated README with current plugin information</li>
          </ChangeItem>
        </ChangeSection>
      </>
    ),
  },
  {
    id: "v0-1-0",
    version: "Version 0.1.0",
    subtitle: '"The Foundation"',
    date: "January 26, 2026",
    summary:
      "The very first day! This is where it all began. Four major pull requests built the entire foundation of the plugin.",
    content: (
      <>
        <ChangeSection icon={Gift} title="🎮 What's New For Players">
          <p className="text-gray-400 text-sm mb-4">
            This was the day the entire plugin came to life! Everything you see in the plugin today was built on this foundation.
          </p>
          <ChangeItem title="The Shard System" prs="">
            <p className="text-gray-400 text-sm mb-2">
              Magic has arrived! You can now collect and equip magical shards that grant you incredible powers. Each shard gives you three types of abilities:
            </p>
            <li>🌟 <strong>Passive Power</strong>: Always active while you hold the shard in offhand</li>
            <li>⚔️ <strong>Tier 1 Ability</strong>: Your primary power (use <code>/ability1</code> or <code>/a1</code>)</li>
            <li>💫 <strong>Tier 2 Ability</strong>: Ultimate power unlocked through upgrades (use <code>/ability2</code> or <code>/a2</code>)</li>
          </ChangeItem>
          <ChangeItem title="The Life System" prs="">
            <p className="text-gray-400 text-sm mb-2">Your journey now has stakes! Every player starts with <strong>6 lives</strong>:</p>
            <li>💀 Die in PvP? Lose a life</li>
            <li>⚔️ Defeat another player? Gain a life</li>
            <li>🩹 Below 3 lives? Your abilities get weaker (50% effectiveness) and you&apos;ll have the Weakness effect</li>
          </ChangeItem>
          <ChangeItem title="The Eight Core Shards" prs="">
            <p className="text-gray-400 text-sm mb-2">All eight core shards were implemented with their unique passive effects and active abilities:</p>
            <li>⚡ <strong>Echo Shard</strong> — Master of sound and darkness. Passive: Swift Sneak III. Tier 1: Sonic Pulse (30s). Tier 2: Abyss Call (50s).</li>
            <li>❤️ <strong>Health Shard</strong> — Healing and protection. Passive: +2 hearts + Regeneration. Tier 1: Life Surge (40s). Tier 2: Resistance (60s).</li>
            <li>⚡ <strong>Lightning Shard</strong> — Power of storms. Passive: Speed + Haste. Tier 1: Shock Bolt (20s). Tier 2: Thunderstorm (60s).</li>
            <li>🔥 <strong>Hell Shard</strong> — Forces of darkness. Passive: Fire immunity. Tier 1: Cursed Horde (50s). Tier 2: Infernal Ring (60s).</li>
            <li>🌤️ <strong>Sky Shard</strong> — Control wind and sky. Passive: Fall damage immunity. Tier 1: Skybound Leap (15s). Tier 2: Wind Dominion (60s).</li>
            <li>❄️ <strong>Arctic Shard</strong> — Master of ice. Passive: Speed on ice. Tier 1: Frostbite (50s). Tier 2: Ice Domain (50s).</li>
            <li>🌑 <strong>Shadow Shard</strong> — Walk in darkness. Passive: Permanent Strength. Tier 1: Phase Step (20s). Tier 2: Umbral Veil (30s).</li>
            <li>🌿 <strong>Nature Shard</strong> — Power of plants. Passive: Regeneration on grass. Tier 1: Vine Snare (30s). Tier 2: Verdant Domain (40s).</li>
          </ChangeItem>
          <ChangeItem title="Five Legacy Shards" prs="">
            <li>🪨 Earth Shard — Mining and defense powers</li>
            <li>⭐ Celestial Shard — Divine abilities</li>
            <li>🕳️ Void Shard — Void manipulation</li>
            <li>⏰ Time Shard — Control over time</li>
            <li>🎲 Chaos Shard — Unpredictable effects</li>
          </ChangeItem>
          <ChangeItem title="Database System" prs="">
            <li>All your progress is saved! Your equipped shard, tier, stats, and lives are stored in a database so you never lose your progress.</li>
          </ChangeItem>
          <ChangeItem title="Ability & Cooldown System" prs="">
            <li>Complete ability execution framework with proper cooldowns</li>
            <li>Action bar displays showing remaining cooldown time</li>
            <li>Life system integration affecting ability strength</li>
            <li>30 unique abilities implemented across all shards</li>
          </ChangeItem>
          <ChangeItem title="Commands" prs="">
            <li><code>/ability1</code> (or <code>/a1</code>) — Use your shard&apos;s Tier 1 ability</li>
            <li><code>/ability2</code> (or <code>/a2</code>) — Use your shard&apos;s Tier 2 ability (requires upgraded shard)</li>
            <li><code>/giveshard &lt;player&gt; &lt;shard&gt;</code> — Admins can give shards to players</li>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/30 text-amber-400 text-sm font-medium mb-6">
            <Sword className="w-4 h-4" />
            <span>Shards V1 — Legacy Archive</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🗡️ <span className="text-green-400 text-glow">Changelog</span>{" "}
            <span className="text-amber-400">(V1)</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            This is the historical changelog for <strong className="text-gray-200">Shards V1</strong>.
            Shards has since been completely rewritten — see the{" "}
            <Link href="/shards-changelog" className="text-green-400 hover:text-green-300 underline">
              current Shards V2 changelog
            </Link>{" "}
            for what&apos;s live today.
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
          <p className="text-gray-400 text-sm mb-5">Since the beginning of development, we&apos;ve built:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Lines of Code", value: "10,000+", desc: "crafted to bring magic to your server" },
              { label: "Java Files", value: "90+", desc: "containing all the plugin logic" },
              { label: "Unique Shards", value: "16", desc: "each with their own abilities and powers (including 3 special items)" },
              { label: "Unique Abilities", value: "30", desc: "across Tier 1 and Tier 2 powers" },
              { label: "Passive Effects", value: "9", desc: "that activate automatically when you equip a shard" },
              { label: "Total Files", value: "170+", desc: "including resource packs with custom textures" },
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
            Thank you for following the development of the Shards SMP Plugin! From a single foundation
            day on January 26th to the polished version you see today, this plugin has been crafted
            with care.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Development Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📅 Development Timeline</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { date: "January 26", note: "Foundation built (4 PRs)" },
                  { date: "February 1", note: "Enhancements & upgrades (6 PRs)" },
                  { date: "February 2", note: "Visual polish (1 PR)" },
                  { date: "February 3", note: "Gameplay refinement (7 PRs)" },
                  { date: "February 4", note: "Documentation & release (2 PRs)" },
                  { date: "February 5–6", note: "The Great Refinement (27 PRs)" },
                  { date: "February 8", note: "Arctic Balance (1 PR)" },
                  { date: "February 9–12", note: "The Balance Overhaul (25 PRs)" },
                  { date: "February 14 – March 2", note: "Items & Security (20 PRs)" },
                ].map(({ date, note }) => (
                  <li key={date} className="flex items-start gap-3">
                    <span className="text-green-400 font-mono text-xs shrink-0 mt-0.5 w-36">{date}:</span>
                    <span className="text-gray-400">{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Total Effort */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">💪 Total Effort</h3>
              <ul className="space-y-3">
                {[
                  "100+ merged pull requests",
                  "Over 10,000 lines of code",
                  "30 unique magical abilities",
                  "16 distinct shard types (including 3 special items)",
                  "Countless hours of testing and balancing",
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
