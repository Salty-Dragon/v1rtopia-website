"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Users,
  TrendingUp,
  Pickaxe,
  Skull,
  DollarSign,
  Clock,
  Coins,
  MapPin,
  Trophy,
  Calendar,
  ChevronRight,
  Zap,
  Globe,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

// ========================================
// CONSTANTS & MOCK DATA
// ========================================

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Stats", href: "#stats" },
  { label: "Leaderboards", href: "#leaderboards" },
  { label: "Blog", href: "#blog" },
  { label: "Map", href: "#map" },
  { label: "Join", href: "#join" },
];

const MOCK_STATS = [
  { label: "Players Online", value: "47", icon: Users, color: "text-green-400" },
  { label: "Total Players", value: "12,394", icon: TrendingUp, color: "text-blue-400" },
  { label: "Blocks Mined", value: "8.4M", icon: Pickaxe, color: "text-amber-400" },
  { label: "Mob Kills", value: "234K", icon: Skull, color: "text-red-400" },
  { label: "Richest Player", value: "$4.2M", icon: DollarSign, color: "text-yellow-400" },
  { label: "Server Uptime", value: "99.8%", icon: Clock, color: "text-cyan-400" },
];

const LEADERBOARD_TABS = ["Playtime", "Balance", "Kills", "Blocks Mined"];

const MOCK_LEADERBOARDS = {
  Playtime: [
    { rank: 1, username: "xXNoobSlayerXx", value: "847h", avatar: "NS" },
    { rank: 2, username: "BuilderPro", value: "723h", avatar: "BP" },
    { rank: 3, username: "MineKing", value: "698h", avatar: "MK" },
    { rank: 4, username: "CraftMaster", value: "654h", avatar: "CM" },
    { rank: 5, username: "DiamondHunter", value: "612h", avatar: "DH" },
  ],
  Balance: [
    { rank: 1, username: "Richie_Rich", value: "$4.2M", avatar: "RR" },
    { rank: 2, username: "MoneyBags", value: "$3.8M", avatar: "MB" },
    { rank: 3, username: "TradeLord", value: "$3.1M", avatar: "TL" },
    { rank: 4, username: "EconomyKing", value: "$2.9M", avatar: "EK" },
    { rank: 5, username: "ShopOwner", value: "$2.5M", avatar: "SO" },
  ],
  Kills: [
    { rank: 1, username: "PvPGod", value: "2,847", avatar: "PG" },
    { rank: 2, username: "SwordMaster", value: "2,134", avatar: "SM" },
    { rank: 3, username: "Assassin_X", value: "1,923", avatar: "AX" },
    { rank: 4, username: "WarriorZ", value: "1,756", avatar: "WZ" },
    { rank: 5, username: "FighterKing", value: "1,645", avatar: "FK" },
  ],
  "Blocks Mined": [
    { rank: 1, username: "MiningGod", value: "847K", avatar: "MG" },
    { rank: 2, username: "Excavator", value: "756K", avatar: "EX" },
    { rank: 3, username: "DigDeep", value: "698K", avatar: "DD" },
    { rank: 4, username: "StoneBreaker", value: "645K", avatar: "SB" },
    { rank: 5, username: "CaveExplorer", value: "612K", avatar: "CE" },
  ],
};

const FEATURES = [
  {
    title: "Custom Economy",
    description: "Player-driven markets, shops, and trading system",
    icon: Coins,
  },
  {
    title: "Player Warps",
    description: "Set up your own warp points and share with the community",
    icon: MapPin,
  },
  {
    title: "Quests & Events",
    description: "Weekly challenges and seasonal competitions",
    icon: Trophy,
  },
  {
    title: "Seasonal Resets",
    description: "Fresh starts with exclusive rewards each season",
    icon: Calendar,
  },
];

const BLOG_POSTS = [
  {
    version: "v1.2.4",
    title: "Winter Update - New Biomes & Mobs",
    excerpt: "Explore the frozen tundra with new custom mobs and winter-themed builds...",
    date: "2024-01-15",
  },
  {
    version: "v1.2.3",
    title: "Economy Rebalance & New Shops",
    excerpt: "Major economy changes to improve market stability and player trading...",
    date: "2024-01-08",
  },
  {
    version: "v1.2.2",
    title: "PvP Arena Overhaul",
    excerpt: "Complete redesign of the PvP arena with new game modes and rewards...",
    date: "2024-01-01",
  },
];

// ========================================
// UTILITY COMPONENTS
// ========================================

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Toast notification
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-6 right-6 z-50 glass border border-green-500/30 rounded-xl px-6 py-4 flex items-center gap-3 glow-green-sm"
    >
      <Check className="w-5 h-5 text-green-400" />
      <span className="text-white font-medium">{message}</span>
    </motion.div>
  );
}

// ========================================
// MAIN COMPONENTS
// ========================================

// Navbar
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  
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
          <motion.div
            className="text-2xl font-bold text-green-400 text-glow"
            whileHover={{ scale: 1.05 }}
          >
            v1rtopia
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="text-gray-300 hover:text-green-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <motion.a
              href="#discord"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-[#5865F2] text-white font-medium hover:bg-[#4752C4] transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Discord</span>
            </motion.a>
            <motion.a
              href="#store"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg border border-green-500/50 text-green-400 font-medium hover:bg-green-500/10 transition-colors"
            >
              Store
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// Hero Section
function HeroSection() {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCopyIP = async () => {
    await navigator.clipboard.writeText("play.v1rtopia.net");
    setCopied(true);
    setShowToast(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 scanlines opacity-30" />
      
      {/* Portal shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Title */}
          <motion.h1
            className="text-6xl sm:text-7xl md:text-8xl font-bold text-green-400 text-glow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            v1rtopia
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            A custom SMP built for grinders, builders, and legends.
          </motion.p>

          {/* IP Copy Module & Server Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mt-12"
          >
            {/* Copy IP Card */}
            <div className="glass border border-green-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <Globe className="w-4 h-4" />
                <span>Server IP</span>
              </div>
              <div className="text-2xl font-mono text-white font-bold">
                play.v1rtopia.net
              </div>
              <motion.button
                onClick={handleCopyIP}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-bold transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy IP
                  </>
                )}
              </motion.button>
            </div>

            {/* Server Status Card */}
            <div className="glass border border-green-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Server Status</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-white font-medium">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Players</span>
                  <span className="text-white font-medium">47 / 100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">TPS</span>
                  <span className="text-green-400 font-medium">19.8</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <Toast message="IP copied to clipboard!" onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}

// Stats Grid
function StatsSection() {

  return (
    <section id="stats" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
        >
          Server <span className="text-green-400 text-glow">Statistics</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="glass border border-green-500/20 rounded-2xl p-6 hover:border-green-500/50 hover:glow-green-sm transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={cn("w-8 h-8", stat.color)} />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-2 border-dashed border-green-500/20"
                  />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Leaderboard Section
function LeaderboardSection() {
  const [activeTab, setActiveTab] = useState(LEADERBOARD_TABS[0]);
  const leaderboardData = MOCK_LEADERBOARDS[activeTab as keyof typeof MOCK_LEADERBOARDS];

  return (
    <section id="leaderboards" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
        >
          Top <span className="text-green-400 text-glow">Players</span>
        </motion.h2>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {LEADERBOARD_TABS.map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all duration-300",
                activeTab === tab
                  ? "bg-green-500 text-black glow-green"
                  : "glass border border-green-500/20 text-gray-300 hover:border-green-500/50"
              )}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Leaderboard List */}
        <motion.div className="glass border border-green-500/30 rounded-2xl p-6 space-y-3">
          <AnimatePresence mode="wait">
            {leaderboardData.map((player, index) => (
              <motion.div
                key={`${activeTab}-${player.rank}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                  player.rank <= 3
                    ? "bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30 glow-green-sm"
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                {/* Rank Badge */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                    player.rank === 1 && "bg-yellow-500 text-black",
                    player.rank === 2 && "bg-gray-300 text-black",
                    player.rank === 3 && "bg-amber-700 text-white",
                    player.rank > 3 && "bg-gray-700 text-gray-300"
                  )}
                >
                  {player.rank}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold">
                  {player.avatar}
                </div>

                {/* Username */}
                <div className="flex-1">
                  <div className="text-white font-medium">{player.username}</div>
                </div>

                {/* Value */}
                <div className="text-green-400 font-bold text-lg">{player.value}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
        >
          Server <span className="text-green-400 text-glow">Features</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="glass border border-green-500/20 rounded-2xl p-6 hover:border-green-500/50 hover:glow-green-sm transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Blog Section
function BlogSection() {
  return (
    <section id="blog" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
        >
          Latest <span className="text-green-400 text-glow">Updates</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {BLOG_POSTS.map((post, index) => (
            <motion.div
              key={post.version}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="glass border border-green-500/20 rounded-2xl p-6 hover:border-green-500/50 hover:glow-green-sm transition-all duration-300 space-y-4 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm font-mono font-bold">
                  {post.version}
                </span>
                <span className="text-gray-500 text-sm">{post.date}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{post.title}</h3>
              <p className="text-gray-400 text-sm">{post.excerpt}</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <span>Read more</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl border border-green-500/50 text-green-400 font-medium hover:bg-green-500/10 transition-colors inline-flex items-center gap-2"
          >
            View all updates
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Call to Action
function CTASection() {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCopyIP = async () => {
    await navigator.clipboard.writeText("play.v1rtopia.net");
    setCopied(true);
    setShowToast(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="join" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass border border-green-500/30 rounded-3xl p-12 text-center space-y-8 glow-green relative overflow-hidden"
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 100% 100%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 0% 0%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Ready to enter{" "}
              <span className="text-green-400 text-glow">v1rtopia</span>?
            </motion.h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of players in the ultimate Minecraft SMP experience
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-black font-bold text-lg transition-colors glow-green"
              >
                Join Server
              </motion.button>

              <motion.button
                onClick={handleCopyIP}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl border border-green-500/50 text-green-400 font-bold text-lg hover:bg-green-500/10 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    IP Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy IP
                  </>
                )}
              </motion.button>

              <motion.a
                href="#discord"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-[#5865F2] text-white font-bold text-lg hover:bg-[#4752C4] transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Discord
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showToast && (
          <Toast message="IP copied to clipboard!" onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="relative border-t border-green-500/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold text-green-400 text-glow mb-4">
              v1rtopia
            </div>
            <p className="text-gray-400 text-sm">
              A custom Minecraft SMP built for grinders, builders, and legends.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-gray-400 hover:text-green-400 transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-bold mb-4">Community</h3>
            <div className="space-y-2">
              <a
                href="#discord"
                className="block text-gray-400 hover:text-green-400 transition-colors text-sm"
              >
                Discord
              </a>
              <a
                href="#store"
                className="block text-gray-400 hover:text-green-400 transition-colors text-sm"
              >
                Store
              </a>
              <a
                href="#map"
                className="block text-gray-400 hover:text-green-400 transition-colors text-sm"
              >
                Live Map
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-green-500/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} v1rtopia. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Not affiliated with Mojang Studios or Microsoft
          </p>
        </div>
      </div>
    </footer>
  );
}

// ========================================
// MAIN PAGE
// ========================================

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <LeaderboardSection />
      <FeaturesSection />
      <BlogSection />
      <CTASection />
      <Footer />
    </main>
  );
}
