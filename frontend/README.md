# NexusAI Frontend

This folder contains the React + Next.js dashboard for NexusAI.

## Purpose

- Enterprise monitoring dashboard
- AI assistant workspace
- Incident management UI
- Repository insights and code review reports

## Stack

- Next.js
- React
- TypeScript
- TailwindCSS
- Static export for GitHub Pages and containerized local hosting

## Docker

The frontend Docker image builds the static Next.js export and serves it with Nginx.

```bash
docker compose up --build frontend
```

The dashboard is available at `http://localhost:3000`.

## Next Steps

1. Wire API requests through the gateway.
2. Add live service health and data-layer status polling.
3. Introduce charting for service trends and incident timelines.
