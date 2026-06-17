# v1rtopia Website

A dark, cinematic Minecraft community website built with Next.js, featuring real-time server stats, leaderboards, and more.

## Features

- 🎮 **Dark Cinematic Design** - Premium black & green aesthetic with subtle glow effects
- 📊 **Live Server Stats** - Real-time player count, TPS, and server status
- 🏆 **Leaderboards** - Track top players across multiple categories
- 📝 **Blog/Updates** - Latest server updates and patch notes
- 🎨 **Smooth Animations** - Framer Motion powered microinteractions
- 📱 **Fully Responsive** - Optimized for all devices

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Salty-Dragon/v1rtopia-website.git

# Navigate to project directory
cd v1rtopia-website

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
v1rtopia-website/
├── app/
│   ├── page.tsx          # Main homepage component
│   ├── leaderboards/     # Full leaderboards page (all stat dimensions)
│   ├── data/v1/          # Same-origin stats API route handlers (see "Stats API")
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles & utilities
├── lib/
│   ├── api.ts            # Browser client for /data/v1 (with mock fallback)
│   ├── stats-queries.ts  # Server-only cached SQL over shards_v2
│   ├── db.ts             # mysql2 pool + UUID helpers
│   └── formatters.ts     # Display helpers
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## Features Overview

### Homepage Sections

1. **Sticky Navbar** - Responsive navigation with Discord & Store buttons
2. **Hero Section** - Cinematic landing with IP copy & live server status
3. **Stats Grid** - 6 animated stat cards showing server metrics
4. **Leaderboards** - Tabbed interface showing top players
5. **Features Showcase** - Custom economy, warps, quests, & resets
6. **Blog Preview** - Latest 3 updates with version tags
7. **CTA Section** - Final call-to-action with join buttons
8. **Footer** - Site links and legal information

### Design Highlights

- Grid background with subtle texture
- Scanline and vignette effects
- Glassmorphism panels
- Green glow accents
- Smooth scroll animations
- Hover microinteractions
- Toast notifications

## Customization

All mock data can be found in `app/page.tsx` as constants:
- `NAV_LINKS` - Navigation menu items
- `MOCK_STATS` - Server statistics
- `MOCK_LEADERBOARDS` - Player leaderboard data
- `FEATURES` - Feature cards
- `BLOG_POSTS` - Update posts

## Configuration

### Environment Variables

The application supports configuration via environment variables. You can use a `.env` file for application-specific variables, but note that the `PORT` variable must be set in your shell environment.

Create a `.env` file in the root directory based on `.env.example`:

```bash
# Copy the example file
cp .env.example .env
```

Available environment variables (in `.env`):

- **`DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD`** — connection to the
  ShardsSMPv2 stats database (`shards_v2`), read server-side by the `/data/v1` route handlers.
- **`NEXT_PUBLIC_API_URL`** — optional override for the stats API base. By default the stats
  API is served **same-origin** under `/data/v1`, so the browser uses relative paths and this
  is left unset.

The HTTP port is pinned to **3002** in `package.json` (`next dev -p 3002` / `next start -p 3002`)
so it sits behind the nginx `/ → :3002` proxy. (Next's default 3000 is used by the admin panel,
and nginx reserves `/api` for the legacy stats service on `:3001` — hence the V2 API lives at
`/data/v1`, not `/api`.)

## Stats API (`/data/v1`)

Read-only JSON endpoints served by this app's route handlers (`app/data/v1/`), querying
`shards_v2` via `lib/stats-queries.ts` (cached ~30s). Consumed by the homepage, the
`/leaderboards` page, and the Discord stats bot.

- `GET /data/v1/stats/server` — server totals
- `GET /data/v1/leaderboards/<metric>?limit=` — `metric` ∈ kills, kd, deaths, playtime,
  mob_kills, blocks_broken, blocks_placed, damage_dealt, damage_taken
- `GET /data/v1/shards` · `GET /data/v1/shards/<shard>/top?limit=`
- `GET /data/v1/abilities?limit=`
- `GET /data/v1/players/<uuid>` · `GET /data/v1/players?name=<name>`
- `GET /data/v1/health`

## Deployment

### nginx Reverse Proxy

For production deployments with nginx as a reverse proxy, see the detailed configuration guide:

📄 **[nginx Configuration Guide](docs/nginx.md)**

The guide includes:
- Complete nginx reverse proxy setup
- SSL/HTTPS configuration with Let's Encrypt
- WebSocket support for real-time features
- Static asset caching
- Load balancing for multiple instances
- Rate limiting and security headers

### Production Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your production settings
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```

4. **Configure nginx** (see [docs/nginx.md](docs/nginx.md))

5. **Set up process manager (optional but recommended):**
   ```bash
   # Using PM2 (this deployment runs as the `website` process)
   pm2 start npm --name website -- run start
   pm2 save
   ```

### Other Deployment Options

- **Vercel**: This Next.js application can be deployed to Vercel with zero configuration
- **Docker**: Create a Dockerfile for containerized deployments
- **Cloud Platforms**: Deploy to AWS, Google Cloud, Azure, or other cloud providers

## License

This project is licensed under the ISC License.

## Disclaimer

This website is not affiliated with Mojang Studios or Microsoft.
