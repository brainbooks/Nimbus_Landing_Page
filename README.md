# Nimbus

React + Vite project restored from `App.jsx`, `Landing.jsx`, and `landing.css`.
The original dark/cyan visual style, content, and decorative animations are retained.
Hero spacing, section heading styles, and stat-card hover effects include layout fixes.
Tailwind CSS 3 generates the utility styles already used in the JSX.

## Run locally

Use Node.js 20.19+ or 22.12+ (newer releases also work).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. On Windows PowerShell, use `npm.cmd`
instead of `npm` if script execution is disabled.

## Build

```sh
npm run build
npm run preview
```

Deploy the generated `dist` folder to a static host.

## Files

- `main.jsx`: React entry point.
- `App.jsx`: renders the recovered landing page.
- `Landing.jsx`: original page sections and interactive effects.
- `landing.css`: landing design styles and responsive layout fixes.
- `index.css`: Tailwind directives and its base reset.
- `vite.config.js`, `tailwind.config.js`, `postcss.config.js`: build setup.

## Connect your cloud app

All three cloud buttons (Access Cloud, Get Started, and Launch Nimbus) navigate
directly to `https://cloudnimbus.in`. No `.env` file or server configuration is
needed. This website can live in its own repository and be hosted separately
from your main cloud application. To change the destination, edit `openCloud`
in `Landing.jsx`.

Icons retain the original Iconify integration and load from its public API.
The stylesheet names Inter with system-font fallbacks; no original font assets
were supplied.
