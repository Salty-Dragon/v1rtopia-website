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

## License

This project is licensed under the ISC License.

## Disclaimer

This website is not affiliated with Mojang Studios or Microsoft.
