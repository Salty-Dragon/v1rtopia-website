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
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles & utilities
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

The application supports configuration via environment variables. Create a `.env` file in the root directory based on `.env.example`:

```bash
# Copy the example file
cp .env.example .env
```

Available environment variables:

- **`PORT`** - The port the Next.js application will listen on (default: 3000)

Example `.env` file:

```bash
PORT=3001
```

### Custom Port Configuration

You can run the application on a custom port by setting the `PORT` environment variable:

```bash
# Using .env file
echo "PORT=3001" > .env
npm run dev

# Or inline (Unix/macOS/Linux)
PORT=3001 npm run dev

# Or inline (Windows PowerShell)
$env:PORT=3001; npm run dev

# Or inline (Windows CMD)
set PORT=3001 && npm run dev
```

The application will be available at `http://localhost:3001` (or your configured port).

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
   # Using PM2
   npm install -g pm2
   pm2 start npm --name "v1rtopia" -- start
   pm2 startup
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
