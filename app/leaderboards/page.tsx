"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import {
  fetchLeaderboard,
  fetchShards,
  fetchAbilities,
  type LeaderboardEntry,
  type LeaderboardType,
  type ShardStat,
  type AbilityStat,
} from "@/lib/api";
import {
  formatNumber,
  formatPlaytime,
  formatWithCommas,
  getAvatarInitials,
} from "@/lib/formatters";

interface Metric {
  label: string;
  type: LeaderboardType;
  format: (value: number) => string;
}

const METRICS: Metric[] = [
  { label: "PvP Kills", type: "kills", format: (v) => formatWithCommas(v) },
  { label: "K/D Ratio", type: "kd", format: (v) => v.toFixed(2) },
  { label: "Deaths", type: "deaths", format: (v) => formatWithCommas(v) },
  { label: "Playtime", type: "playtime", format: (v) => formatPlaytime(v) },
  { label: "Mob Kills", type: "mob_kills", format: (v) => formatWithCommas(v) },
  { label: "Blocks Mined", type: "blocks_broken", format: (v) => formatNumber(v) },
  { label: "Blocks Placed", type: "blocks_placed", format: (v) => formatNumber(v) },
  { label: "Damage Dealt", type: "damage_dealt", format: (v) => formatWithCommas(Math.round(v)) },
  { label: "Damage Taken", type: "damage_taken", format: (v) => formatWithCommas(Math.round(v)) },
];

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function rankBadgeClass(rank: number) {
  if (rank === 1) return "bg-yellow-500 text-black";
  if (rank === 2) return "bg-gray-300 text-black";
  if (rank === 3) return "bg-amber-700 text-white";
  return "bg-gray-700 text-gray-300";
}

export default function LeaderboardsPage() {
  return (
    <main className="min-h-screen bg-[#0a0e0a] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <Trophy className="w-8 h-8 text-green-400" />
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="text-green-400 text-glow">Leaderboards</span>
          </h1>
        </div>

        <PlayerLeaderboards />
        <ShardsSection />
        <AbilitiesSection />
      </div>
    </main>
  );
}

function PlayerLeaderboards() {
  const [metricIndex, setMetricIndex] = useState(0);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const metric = METRICS[metricIndex];

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await fetchLeaderboard(metric.type, 25);
      if (!mounted) return;
      if (res.error || !res.data) {
        setError(res.error ?? "Failed to load leaderboard");
        setEntries([]);
      } else {
        setError(null);
        setEntries(res.data.data);
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [metric.type]);

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-white">Top Players</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {METRICS.map((m, i) => (
          <button
            key={m.type}
            onClick={() => setMetricIndex(i)}
            className={
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 " +
              (i === metricIndex
                ? "bg-green-500 text-black glow-green"
                : "glass border border-green-500/20 text-gray-300 hover:border-green-500/50")
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="glass border border-green-500/30 rounded-2xl p-4 sm:p-6 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-400 py-12">{error}</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No data yet.</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.uuid}
              className={
                "flex items-center gap-4 p-3 sm:p-4 rounded-xl transition-all duration-200 " +
                (entry.rank <= 3
                  ? "bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30"
                  : "bg-white/5 hover:bg-white/10")
              }
            >
              <div
                className={
                  "w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 " +
                  rankBadgeClass(entry.rank)
                }
              >
                {entry.rank}
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold shrink-0">
                {getAvatarInitials(entry.username)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{entry.username}</div>
                <div className="text-xs text-gray-400">
                  {entry.current_shard ? titleCase(entry.current_shard) : "No shard"}
                  {" · "}
                  {entry.pvp_kills}K / {entry.pvp_deaths}D
                </div>
              </div>
              <div className="text-green-400 font-bold text-lg shrink-0">
                {metric.format(entry.value)}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ShardsSection() {
  const [shards, setShards] = useState<ShardStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchShards().then((res) => {
      if (!mounted) return;
      if (res.data) setShards(res.data.data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-white">Shards</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      </section>
    );
  }
  if (shards.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-white">Shard Popularity</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shards.map((shard) => (
          <div
            key={shard.shard_type}
            className="glass border border-green-500/20 rounded-xl p-5 hover:border-green-500/50 transition-all duration-200"
          >
            <div className="text-lg font-bold text-green-400 mb-3">{titleCase(shard.shard_type)}</div>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-gray-400">Players</dt>
              <dd className="text-right text-white">{shard.players}</dd>
              <dt className="text-gray-400">PvP Kills</dt>
              <dd className="text-right text-white">{formatWithCommas(shard.pvp_kills)}</dd>
              <dt className="text-gray-400">Ability Uses</dt>
              <dd className="text-right text-white">{formatWithCommas(shard.ability_uses)}</dd>
              <dt className="text-gray-400">Playtime</dt>
              <dd className="text-right text-white">{formatPlaytime(shard.playtime_minutes)}</dd>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function AbilitiesSection() {
  const [abilities, setAbilities] = useState<AbilityStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchAbilities(20).then((res) => {
      if (!mounted) return;
      if (res.data) setAbilities(res.data.data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-white">Abilities</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      </section>
    );
  }
  if (abilities.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-white">Most-Used Abilities</h2>
      <div className="glass border border-green-500/30 rounded-2xl p-4 sm:p-6 space-y-2">
        {abilities.map((ability, i) => (
          <div
            key={ability.ability_key}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-700 text-gray-300 flex items-center justify-center font-bold text-sm shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium">{ability.ability_key}</div>
              <div className="text-xs text-gray-400">
                {titleCase(ability.shard_type)} · {ability.unique_users} player
                {ability.unique_users === 1 ? "" : "s"}
              </div>
            </div>
            <div className="text-green-400 font-bold text-lg shrink-0">
              {formatWithCommas(ability.total_uses)} uses
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
